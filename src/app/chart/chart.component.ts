import {Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Data, Link, Node} from "../types.model";

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {

  @ViewChild('graph')
  Graph: ElementRef;

  colors = ['red', 'blue', 'teal', 'hotpink']

  data: Data = {
    nodes: [
      { id: 1, cluster: 1, title: "Node 1" },
      { id: 2, cluster: 2, title: "Node 2" },
      { id: 3, cluster: 3, title: "Node 3" },
    ],
    links: [
      { source: 1, target: 2, value: 0.5 },
      { source: 2, target: 3, value: 1 },
    ]
  }
  i = 0;

  svg;
  linkForce;
  height;
  width;
  simulation;
  dragDrop;

  linksGroup;
  linkElements;
  nodesGroup;
  nodesElements;

  ts500;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
  }

  ngOnInit() {
    this.initGraph()
  }

  setupTransitions() {
    this.ts500 = this.svg.transition()
      .duration(1400)
      .ease(d3.easeCubic)
  }

  transition(ms) {
    return this.svg.transition()
      .duration(ms)
      .ease(d3.easeCubic)
  }

  initGraph() {
    this.height = +this.Graph.nativeElement.offsetHeight;
    this.width = +this.Graph.nativeElement.offsetWidth;

    this.svg = d3.select('svg')
      .attr('viewBox', [ -this.width / 2, -this.height / 2, this.width, this.height ])
      // .attr('ViewBox', [0, 0, this.width, this.height])

    this.setupTransitions()

    this.linkForce = d3.forceLink(this.data.links)
      .id(d => d.id)
      .strength(d => d.value)

    this.simulation = d3.forceSimulation(this.data.nodes)
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('Y', d3.forceY())

      // .force('center', d3.forceCenter(this.width / 2, this.height / 2))

    this.linksGroup = this.svg.append('g')
      .attr('class', 'links')

    this.nodesGroup = this.svg.append('g')
      .attr('class', 'nodes')

    this.dragDrop = d3.drag()
      .on('start', node => {
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', node => {
        this.simulation.alphaTarget(0.7).restart()
        node.fx = d3.event.x
        node.fy = d3.event.y
      })
      .on('end', node => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0)
        }
        node.fx = null
        node.fy = null
      })

    this.updateSimulation()
  }

  selectNode(selNode) {
    console.log(selNode)
    const neighbours = this.getFirstLevelNeighbours(selNode);
    console.log(neighbours)

    this.nodesElements
      .attr('opacity', d => neighbours.indexOf(d.id) > -1 ? 1 : 0.5)
    this.linkElements
      .attr('stroke', d => this.isNeighbourLink(selNode, d) ? 'black': '#eee')
  }

  getFirstLevelNeighbours(node) {
    return this.data.links.reduce((neighbours, link) => {
      if (link.target.id === node.id) {
        neighbours.push(link.source.id);
      } else if(link.source.id === node.id) {
        neighbours.push(link.target.id)
      }
      return neighbours
    }, [node.id])
  }

  isNeighbourLink(node, link) {
    return link.source.id === node.id || link.target.id === node.id;
  }

  updateGraph() {
    // SELECTING LINK ELEMENTS PRESENT IN THE GROUP
    // ----------------------------------------
    this.linkElements = this.linksGroup.selectAll('line')
      .data(this.data.links, d => d.target.id + d.source.id)
    // EXIT ELEMENT
    this.linkElements.exit().remove()
    // ENTER ELEMENT
    const linkEnter = this.linkElements
      .enter().append('line')
      .attr('stroke', 'hotpink');
    // MERGE EVENTS
    this.linkElements = linkEnter.merge(this.linkElements);

    // SELECTING NODE ELEMENTS PRESENT IN GROUP
    // ----------------------------------------
    this.nodesElements = this.nodesGroup.selectAll('circle')
      .data(this.data.nodes, d => d.id)
      .join(
        enter =>
          enter.append('circle')
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke', 'white')
            .attr('r', 5)
            .call(enter =>
              enter
                .transition(this.transition(500))
                  .attr('r', 7)
                  .attr('stroke', 'gold')
                .transition(this.transition(500))
                  .attr('r', 5)
                .attr('stroke', 'white')
                  .delay(100)),
        update =>
          update
            .attr('r', 5)
            .attr('fill', d => this.getNodeColor(d)),
        exit =>
          exit.remove()
      )
      .attr('stroke-width', 2)
      .call(this.dragDrop)
      .on('click', d => this.selectNode(d))
  }

  getNodeColor(node) {
    return this.colors[   node.cluster]
  }

  updateSimulation() {
    this.updateGraph()

    this.simulation
      .nodes(this.data.nodes)
      .on('tick', () => {
        this.nodesElements
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
        this.linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
      })
    console.log(this.data.links)
    this.simulation.force('link').links(this.data.links)
    this.simulation.alphaTarget(0.7).restart()
  }

  addNewLink() {
    this.i += 1;
    switch (this.i) {
      case 1:
        this.data.nodes.push({
          id: 4,
          cluster: 3,
          title: 'New node'
        })
        break;
      case 2:
        this.data.links.push({
          source: 3,
          target: 4,
          value: 0.2
        })
        break;
      case 3 :
        this.data.nodes.map(n => n.cluster = 1)
    }

    this.updateSimulation()
  }

}
