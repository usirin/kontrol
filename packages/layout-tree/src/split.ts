import type { Orientation } from "./constants";
import { createNode } from "./createNode";
import { getAt } from "./getAt";
import { Tree } from "./models/Tree";
import type { Node } from "./models/Node";

export const split = (
  tree: Tree,
  index: number,
  orientation: Orientation,
): Tree => {
  const node = getAt(tree, index);
  if (!node) {
    return tree;
  }

  const clone = node.clone();

  if (node === tree.root) {
    const newRoot = createNode({ value: node.value, orientation });
    newRoot.attachChildren([node, clone]);
    return new Tree(newRoot);
  }

  const parent = node.parent;
  if (!parent) {
    throw new Error(`
      something is really wrong, somehow even though node is not
      the root node, it still does not have a parent. And this
      should not happen.
    `);
  }

  const childIndex = parent.children.indexOf(node);

  let toBeInserted: Node[];
  if (orientation !== parent.orientation) {
    const newParent = createNode({ value: node.value, orientation });
    newParent.attachChildren([node, clone]);
    toBeInserted = [newParent];
  } else {
    toBeInserted = [node, clone];
  }

  parent.children.splice(childIndex, 1, ...toBeInserted);

  return new Tree(tree.root);
};
