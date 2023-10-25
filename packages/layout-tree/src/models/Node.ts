import type { LegacyOrientation } from "../constants";

export class Node<T = unknown> {
  public orientation: LegacyOrientation | null;
  public value: T;
  public parent: Node<T> | null;

  public children: Node<T>[] = [];

  constructor(value: T, orientation: LegacyOrientation | null = null) {
    this.orientation = orientation;
    this.value = value;
    this.parent = null;
  }

  public setParent(parent: Node<T>) {
    this.parent = parent;
  }

  public clone() {
    const cloned = new Node<T>(this.value, this.orientation);

    if (this.parent) {
      cloned.setParent(this.parent);
    }

    return cloned;
  }

  public attachChildren(children: Node<T>[]) {
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
