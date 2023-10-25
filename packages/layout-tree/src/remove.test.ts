import { describe, expect, it } from "vitest";
import { LegacyOrientation } from "./constants";
import { createNode } from "./createNode";
import { createTree } from "./createTree";
import { remove } from "./remove";

describe("remove", () => {
  describe("when there are more than 2 children", () => {
    it("works", () => {
      const tree = createTree<{ id: number | string }>(
        createNode({
          value: { id: "root" },
          orientation: LegacyOrientation.Vertical,
          children: [
            createNode({ value: { id: 0 } }),
            createNode({ value: { id: 1 } }),
            createNode({ value: { id: 2 } }),
          ],
        }),
      );

      const newTree = remove(tree, 1);
      expect(newTree.root.children.length).toEqual(2);
      expect(newTree.root.children[0].value).toEqual({ id: 0 });
      expect(newTree.root.children[1].value).toEqual({ id: 2 });
    });
  });

  describe("when there are 2 children", () => {
    it("should replace root with itself", () => {
      const tree = createTree(
        createNode({
          value: { id: "root" },
          orientation: LegacyOrientation.Vertical,
          children: [
            createNode({ value: { id: 0 } }),
            createNode({ value: { id: 1 } }),
          ],
        }),
      );

      const newTree = remove(tree, 1);
      expect(newTree.root.value).toEqual({ id: 0 });
    });

    it("should replace parent with itself", () => {
      const tree = createTree(
        createNode({
          value: { id: "root" },
          orientation: LegacyOrientation.Vertical,
          children: [
            createNode({
              value: { id: "0" },
              orientation: LegacyOrientation.Vertical,
              children: [
                createNode({ value: { id: "00" } }),
                createNode({ value: { id: "01" } }),
              ],
            }),
            createNode({ value: { id: "1" } }),
            createNode({ value: { id: "2" } }),
          ],
        }),
      );

      const newTree = remove(tree, 1);
      expect(newTree.root.children[0].value).toEqual({ id: "00" });
    });
  });
});
