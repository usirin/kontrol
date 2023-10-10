/* eslint-disable @typescript-eslint/no-non-null-assertion -- no need */
import { describe, expect, it } from "vitest";
import type { Node } from "./models/Node";
import { Direction, Orientation } from "./constants";
import { createNode } from "./createNode";
import { createTree } from "./createTree";
import { getAt } from "./getAt";
import { findSibling } from "./findSibling";

/*
  *---------*---------*---------*---------*
  |         |         |         |         |
  |         |    1    |         |         |
  |         |         |         |         |
  *         *---------*         *         *
  |         |         |         |         |
  |    0    |    2    |    4    |    5    |
  |         |         |         |         |
  *         *---------*         *         *
  |         |         |         |         |
  |         |    3    |         |         |
  |         |         |         |         |
  *---------*---------*---------*---------*
*/
const simpleTree = createTree(
  createNode({
    meta: { id: "root" },
    orientation: Orientation.Vertical,
    children: [
      createNode({ meta: { id: 0 } }),
      createNode({
        meta: { id: "parent-0" },
        orientation: Orientation.Horizontal,
        children: [
          createNode({ meta: { id: 1 } }),
          createNode({ meta: { id: 2 } }),
          createNode({ meta: { id: 3 } }),
        ],
      }),
      createNode({ meta: { id: 4 } }),
      createNode({ meta: { id: 5 } }),
    ],
  }),
);

const p = createNode;
const n = <T>(meta: T) => createNode<T>({ meta });

// interface Noodle {
//   key: string;
//   parent?: Noodle;
//   children: Noodle[];
// }

const complexTree = createTree(
  p({
    meta: { id: "_root" },
    orientation: Orientation.Horizontal,
    children: [
      p({
        meta: { id: "0" },
        orientation: Orientation.Vertical,
        children: [
          n({ id: "00" }),
          p({
            meta: { id: "01" },
            orientation: Orientation.Horizontal,
            children: [n({ id: "010" }), n({ id: "011" })],
          }),
        ],
      }),
      p({
        meta: { id: "1" },
        orientation: Orientation.Vertical,
        children: [
          n({ id: "10" }),
          p({
            meta: { id: "11" },
            orientation: Orientation.Horizontal,
            children: [
              p({
                meta: { id: "110" },
                orientation: Orientation.Vertical,
                children: [n({ id: "1100" }), n({ id: "1101" })],
              }),
              n({ id: "111" }),
              p({
                meta: { id: "112" },
                orientation: Orientation.Vertical,
                children: [
                  n({ id: "1120" }),
                  p({
                    meta: { id: "1121" },
                    orientation: Orientation.Horizontal,
                    children: [n({ id: "11210" }), n({ id: "11211" })],
                  }),
                ],
              }),
            ],
          }),
          p({
            meta: { id: "12" },
            orientation: Orientation.Horizontal,
            children: [
              n({ id: "120" }),
              p({
                meta: { id: "121" },
                orientation: Orientation.Vertical,
                children: [n({ id: "1210" }), n({ id: "1211" })],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);
// const jsonTree = [0, [1, 2, 3], 4, 5];

describe("with relatively simple tree", () => {
  let node: Node<{ id: number }> | null;
  it("should return sibling of given direction", () => {
    node = getAt(simpleTree, 2);
    const sibling = findSibling(node!, Direction.Up);
    expect(sibling?.meta.id).toEqual(1);
  });

  it("should return itself if there is no sibling of given direction", () => {
    node = getAt(simpleTree, 0);
    let sibling = findSibling(node!, Direction.Up);
    expect(sibling?.meta.id).toEqual(0);
    sibling = findSibling(node!, Direction.Left);
    expect(sibling?.meta.id).toEqual(0);
  });

  it("should handle a complex movement where parent orientation is different than direction", () => {
    node = getAt(simpleTree, 0);
    const sibling = findSibling(node!, Direction.Left);
    expect(sibling?.meta.id).toEqual(0);
  });
  it("should choose relative index on ambigous finds", () => {
    node = getAt(simpleTree, 0);
    const sibling = findSibling(node!, Direction.Right);
    expect(sibling?.meta.id).toEqual(1);
  });
});

/*
  *---------*---------*---------*---------*---------*
  |                   |                             |
  |                   |             010             |
  |                   |                             |
  *        00         *---------*---------*---------*
  |                   |                             |
  |                   |             011             |
  |                   |                             |
  *---------*---------*---------*---------*---------*
  |         |         |         |                   |
  |         |         |         |                   |
  |         |         |         |                   |
  *         *  1100   *  1101   *        120        *
  |         |         |         |                   |
  |         |         |         |                   |
  |         |         |         |                   |
  *   10    *---------*---------*---------*---------*
  |         |                   |         |         |
  |         |        111        |         |         |
  |         |                   |         |         |
  *         *---------*---------*  1210   *  1211   *
  |         |         |  11210  |         |         |
  |         |  1120   *---------*         |         |
  |         |         |  11211  |         |         |
  *---------*---------*---------*---------*---------*
*/
describe("with a complex tree", () => {
  describe("serial movements which will walk all the tree", () => {
    let node: Node<{ id: number }> | null;
    it("starts at 00", () => {
      node = getAt(complexTree, 0);
      expect(node?.meta.id).toEqual("00");
    });
    it("moves to 10", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("10");
    });
    it("moves to 1100", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("1100");
    });
    it("moves to 00", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.meta.id).toEqual("00");
    });
    it("moves to 010", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("010");
    });
    it("moves to 011", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("011");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("120");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("1210");
    });
    it("stays at to 1210", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("1210");
    });
    it("moves to 11211", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.meta.id).toEqual("11211");
    });
    it("moves to 1120", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.meta.id).toEqual("1120");
    });
    it("moves to 111", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.meta.id).toEqual("111");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("1210");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.meta.id).toEqual("120");
    });
    it("moves to 1101", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.meta.id).toEqual("1101");
    });
    it("moves to 111", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("111");
    });
    it("moves to 1120", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("1120");
    });
    it("moves to 11210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("11210");
    });
    it("moves to 11211", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.meta.id).toEqual("11211");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("1210");
    });
    it("moves to 1211", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.meta.id).toEqual("1211");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.meta.id).toEqual("120");
    });
    it("moves to 011", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.meta.id).toEqual("011");
    });
    it("moves to 00", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.meta.id).toEqual("00");
    });
  });
});
