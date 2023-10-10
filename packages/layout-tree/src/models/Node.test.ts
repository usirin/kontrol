import { describe, it, expect } from "vitest";
import { Orientation } from "../constants";
import { Node } from "./Node";

describe("Node", () => {
  describe("setParent", () => {
    it("attaches itself to given parent", () => {
      const node = new Node({ a: "b" }, Orientation.Vertical);
      const parent = new Node({}, Orientation.Horizontal);

      node.setParent(parent);

      expect(node.parent).toEqual(parent);
    });
  });

  describe("clone", () => {
    it("clones given node", () => {
      const node = new Node({ a: "b" }, Orientation.Vertical);
      const cloned = node.clone();

      expect(node).toEqual(cloned);
    });
  });

  describe("attachChildren", () => {
    it("attaches children and set their parent", () => {
      const parent = new Node({ a: "b" }, Orientation.Vertical);

      parent.attachChildren([new Node({ id: 1 }), new Node({ id: 2 })]);

      expect((parent.children[0].value as { id: number }).id).toBe(1);
      expect((parent.children[1].value as { id: number }).id).toBe(2);
    });
  });

  describe("indexOf", () => {
    it("returns the index of given child", () => {
      const parent = new Node({ a: "b" }, Orientation.Vertical);

      const child1 = new Node({ id: 1 });
      const child2 = new Node({ id: 2 });

      parent.attachChildren([child1, child2]);

      expect(parent.indexOf(child1)).toEqual(0);
      expect(parent.indexOf(child2)).toEqual(1);
    });
  });
});
