import type { Node } from "./models/Node";
import type { Tree } from "./models/Tree";

export const traverse = <T>(
  root: Node<T>,
  traverser: (node: Node<T>, index: number) => void,
) => {
  let index = 0;

  const traverseChildren = (node: Node<T>) => {
    node.children.forEach((child: Node<T>) => {
      traverseChildren(child);
    });
    traverser(node, index++);
  };

  traverseChildren(root);
};

export const getAt = <T>(tree: Tree<T>, index: number): Node<T> | null => {
  let leaf: Node<T> | null = null;

  let i = 0;
  traverse(tree.root, (node) => {
    if (node.children.length === 0) {
      if (i === index) {
        leaf = node;
      }
      i += 1;
    }
  });

  return leaf;
};
