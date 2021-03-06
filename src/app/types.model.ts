export interface Node {
  id: number;
  cluster: number;
  title: string;
}

export interface Link {
  source: any;
  target: any;
  value: number;
}

export interface Data {
  nodes: Node[];
  links: Link[];
}
