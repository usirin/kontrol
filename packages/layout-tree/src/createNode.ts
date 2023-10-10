import type { Orientation } from "./constants";
import { Node } from "./models/Node";

interface CreateNodeArgs<T> {
  meta: T;
  children?: Node[];
  orientation?: Orientation;
}

export const createNode = <T>({
  meta,
  children,
  orientation,
}: CreateNodeArgs<T>) => {
  const node = new Node<T>(meta, orientation);

  if (children) {
    node.attachChildren(children);
  }

  return node;
};
