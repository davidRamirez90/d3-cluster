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

  data: Data = {
    nodes: [
      { id: 1, cluster: 1, title: "Node 1" },
      { id: 2, cluster: 2, title: "Node 2" },
      { id: 3, cluster: 1, title: "Node 3" },
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
  grow;


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
            .attr('fill', d => d.cluster === 1 ? 'teal': 'hotpink')
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
            .attr('fill', d => d.cluster === 1 ? 'teal': 'hotpink'),
        exit =>
          exit.remove()
      )
      .attr('stroke-width', 2)
      .call(this.dragDrop)
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

  // updateGraph2() {
  //
  //   console.log(this.data)
  //
  //   this.link.selectAll('line')
  //     .data(this.data.links)
  //     .join(
  //       enter =>
  //         enter.append('line')
  //         .attr('x1', d => d.source.x)
  //         .attr('y1', d => d.source.y)
  //         .attr('x2', d => d.target.x)
  //         .attr('y2', d => d.target.y)
  //         .attr('stroke', 'hotpink'),
  //       update =>
  //         update
  //           .attr('x1', d => d.source.x)
  //           .attr('y1', d => d.source.y)
  //           .attr('x2', d => d.target.x)
  //           .attr('y2', d => d.target.y),
  //     )
  //
  //   this.node.selectAll('circle')
  //     .data(this.data.nodes)
  //     .join(
  //       enter =>
  //         enter.append('circle')
  //           .attr('r', 5)
  //           .attr('fill', 'teal'),
  //       update =>
  //         update
  //           .attr('cx', d => d.x)
  //           .attr('cy', d => d.y),
  //     )
  //
  //   this.simulation.on('tick', () => {
  //     this.link
  //       .attr('x1', d => d.source.x)
  //       .attr('y1', d => d.source.y)
  //       .attr('x2', d => d.target.x)
  //       .attr('y2', d => d.target.y)
  //
  //     this.node
  //       .attr('cx', d => d.x)
  //       .attr('cy', d => d.y)
  //   })
  //   return this.svg.node()
  // }

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
    // this.updateGraph()
  }

}
