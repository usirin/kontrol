import type { Node } from "./Node";

export class Tree<T> {
  public root: Node<T>;

  constructor(root: Node<T>) {
    this.root = root;
  }
}
