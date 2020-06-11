export interface Node {
  id: number;
  cluster: number;
  title: string;
}

export interface Link {
  source: number;
  target: number;
  value: number;
}

export interface Data {
  nodes: Node[];
  links: Link[];
}
