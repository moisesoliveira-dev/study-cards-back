export type FlowNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number;
  height?: number;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  label?: string;
  data?: Record<string, unknown>;
};

export interface FlowBoardProps {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export class FlowBoard {
  private constructor(private props: FlowBoardProps) {}

  static create(input: {
    userId: string;
    subjectId: string;
    name: string;
    nodes?: FlowNode[];
    edges?: FlowEdge[];
  }): FlowBoard {
    const now = new Date();
    return new FlowBoard({
      id: crypto.randomUUID(),
      userId: input.userId,
      subjectId: input.subjectId,
      name: input.name.trim() || 'Fluxograma',
      nodes: input.nodes ?? [],
      edges: input.edges ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: FlowBoardProps): FlowBoard {
    return new FlowBoard(props);
  }

  update(input: {
    name?: string;
    nodes?: FlowNode[];
    edges?: FlowEdge[];
  }): void {
    if (input.name !== undefined) {
      this.props.name = input.name.trim() || this.props.name;
    }
    if (input.nodes !== undefined) this.props.nodes = input.nodes;
    if (input.edges !== undefined) this.props.edges = input.edges;
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get subjectId() {
    return this.props.subjectId;
  }
  get name() {
    return this.props.name;
  }
  get nodes() {
    return this.props.nodes;
  }
  get edges() {
    return this.props.edges;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
