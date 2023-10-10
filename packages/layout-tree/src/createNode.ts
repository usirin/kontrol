import type { Orientation } from "./constants";
import { Node } from "./models/Node";

interface CreateNodeArgs<T> {
  value: T;
  children?: Node[];
  orientation?: Orientation;
}

export const createNode = <T>({
  value,
  children,
  orientation,
}: CreateNodeArgs<T>) => {
  const node = new Node<T>(value, orientation);

  if (children) {
    node.attachChildren(children);
  }

  return node;
};
