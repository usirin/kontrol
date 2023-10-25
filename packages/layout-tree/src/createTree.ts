import type { Node } from "./models/Node";
import { Tree } from "./models/Tree";

export const createTree = <T>(root: Node<T>) => {
  return new Tree<T>(root);
};
