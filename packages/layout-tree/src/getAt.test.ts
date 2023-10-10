import { describe, expect, it } from "vitest";
import { Orientation } from "./constants";
import { createNode } from "./createNode";
import { createTree } from "./createTree";
import { getAt } from "./getAt";

const tree = createTree<{ id: string | number }>(
  createNode({
    value: { id: "root" },
    orientation: Orientation.Vertical,
    children: [
      createNode({ value: { id: 0 } }),
      createNode({
        value: { id: "parent-0" },
        orientation: Orientation.Horizontal,
        children: [
          createNode({ value: { id: 1 } }),
          createNode({ value: { id: 2 } }),
          createNode({ value: { id: 3 } }),
        ],
      }),
      createNode({ value: { id: 4 } }),
      createNode({ value: { id: 5 } }),
    ],
  }),
);

describe("getAt", () => {
  it("returns the node at given index", () => {
    const node = getAt(tree, 4);
    expect(node?.value.id).toEqual(4);
  });

  it("returns null when not found", () => {
    const node = getAt(tree, 10);
    expect(node).toEqual(null);
  });
});
