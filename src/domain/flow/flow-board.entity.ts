export type FlowNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number;
  height?: number;
  parentId?: string;
  extent?: 'parent' | string;
  style?: Record<string, unknown>;
  expandParent?: boolean;
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

  /** Remove nodes/edges that reference a deleted card. Returns true if changed. */
  removeCardReferences(cardId: string): boolean {
    const nodeId = `card-${cardId}`;
    const removeIds = new Set<string>();

    for (const n of this.props.nodes) {
      if (n.type === 'groupNode') continue;
      const dataCardId = n.data?.cardId;
      if (n.id === nodeId || dataCardId === cardId || dataCardId === nodeId) {
        removeIds.add(n.id);
      }
    }

    if (!removeIds.size) {
      // Still scrub blockedSourceIds pointing at this card
      let scrubbed = false;
      this.props.nodes = this.props.nodes.map((n) => {
        const blocked = n.data?.blockedSourceIds;
        if (!Array.isArray(blocked) || !blocked.length) return n;
        const next = blocked.filter(
          (id) => id !== cardId && id !== nodeId,
        );
        if (next.length === blocked.length) return n;
        scrubbed = true;
        return {
          ...n,
          data: { ...n.data, blockedSourceIds: next },
        };
      });
      if (scrubbed) this.props.updatedAt = new Date();
      return scrubbed;
    }

    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const n of this.props.nodes) {
        if (n.parentId && removeIds.has(n.parentId) && !removeIds.has(n.id)) {
          removeIds.add(n.id);
          expanded = true;
        }
      }
    }

    this.props.nodes = this.props.nodes
      .filter((n) => !removeIds.has(n.id))
      .map((n) => {
        const blocked = n.data?.blockedSourceIds;
        if (!Array.isArray(blocked) || !blocked.length) return n;
        const next = blocked.filter(
          (id) =>
            id !== cardId &&
            id !== nodeId &&
            !removeIds.has(String(id)),
        );
        if (next.length === blocked.length) return n;
        return {
          ...n,
          data: { ...n.data, blockedSourceIds: next },
        };
      });

    this.props.edges = this.props.edges.filter(
      (e) => !removeIds.has(e.source) && !removeIds.has(e.target),
    );
    this.props.updatedAt = new Date();
    return true;
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
