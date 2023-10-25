import { beforeEach, describe, expect, it } from "vitest";
import { LegacyOrientation } from "./constants";
import { createNode } from "./createNode";
import { createTree } from "./createTree";
import type { Tree } from "./models/Tree";
import { split } from "./split";

describe("split", () => {
  it("returns the tree unchanged if there is not a node at given index", () => {
    const tree = createTree(createNode({ value: { id: "root" } }));
    const newTree = split(tree, 5, LegacyOrientation.Vertical);

    expect(newTree === tree).toBe(true);
  });

  it("splits an empty tree correctly", () => {
    const tree = createTree(createNode({ value: { id: "root" } }));
    const newTree = split(tree, 0, LegacyOrientation.Vertical);

    expect(newTree.root.children.length).toEqual(2);
    expect(newTree.root.children[0].parent).toBe(newTree.root);
    expect(newTree.root.children[1].parent).toBe(newTree.root);
  });

  describe("when root is vertically splitted", () => {
    let tree: Tree;
    beforeEach(() => {
      tree = createTree(
        createNode({
          value: { id: "root" },
          orientation: LegacyOrientation.Vertical,
          children: [
            createNode({ value: { id: 0 } }),
            createNode({ value: { id: 1 } }),
          ],
        }),
      );
    });

    it("should have 3 children under root if split orientation is vertical", () => {
      const newTree = split(tree, 0, LegacyOrientation.Vertical);
      expect((newTree.root.children[0].value as { id: number }).id).toBe(0);
      expect((newTree.root.children[1].value as { id: number }).id).toBe(0);
      expect((newTree.root.children[2].value as { id: number }).id).toBe(1);
    });

    it("should handle horizontal split", () => {
      const newTree = split(tree, 0, LegacyOrientation.Horizontal);

      expect(newTree.root.orientation).toBe(LegacyOrientation.Vertical);
      expect(newTree.root.children.length).toBe(2);
    });
  });

  it("should handle complex splits", () => {
    const tree = createTree(
      createNode({
        value: { id: "root" },
        orientation: LegacyOrientation.Vertical,
        children: [
          createNode({ value: { id: 0 } }),
          createNode({
            value: { id: "parent-0" },
            orientation: LegacyOrientation.Horizontal,
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

    const newTree = split(tree, 2, LegacyOrientation.Horizontal);
    expect(newTree.root.children[1].children.length).toBe(4);
  });
});
