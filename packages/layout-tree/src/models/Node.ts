import type { Orientation } from "../constants";

export class Node<T = unknown> {
  public orientation: Orientation | null;
  public meta: T;
  public parent: Node | null;

  public children: Node[] = [];

  constructor(meta: T, orientation: Orientation | null = null) {
    this.orientation = orientation;
    this.meta = meta;
    this.parent = null;
  }

  public setParent(parent: Node) {
    this.parent = parent;
  }

  public clone() {
    const cloned = new Node<T>(this.meta, this.orientation);

    if (this.parent) {
      cloned.setParent(this.parent);
    }

    return cloned;
  }

  public attachChildren(children: Node[]) {
    this.children = children.map((child) => {
      child.setParent(this);
      return child;
    });
  }

  public indexOf(child: Node) {
    return this.children.indexOf(child);
  }

  public removeChild(child: Node) {
    this.children = this.children.filter((c) => c !== child);
  }
}
