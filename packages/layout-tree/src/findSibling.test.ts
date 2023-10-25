/* eslint-disable @typescript-eslint/no-non-null-assertion -- no need */
import { describe, expect, it } from "vitest";
import type { Node } from "./models/Node";
import { Direction, LegacyOrientation } from "./constants";
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
    value: { id: Infinity },
    orientation: LegacyOrientation.Vertical,
    children: [
      createNode({ value: { id: 0 } }),
      createNode({
        value: { id: -1 },
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

const p = createNode;
const n = <T>(meta: T) => createNode<T>({ value: meta });

const complexTree = createTree(
  p({
    value: { id: "_root" },
    orientation: LegacyOrientation.Horizontal,
    children: [
      p({
        value: { id: "0" },
        orientation: LegacyOrientation.Vertical,
        children: [
          n({ id: "00" }),
          p({
            value: { id: "01" },
            orientation: LegacyOrientation.Horizontal,
            children: [n({ id: "010" }), n({ id: "011" })],
          }),
        ],
      }),
      p({
        value: { id: "1" },
        orientation: LegacyOrientation.Vertical,
        children: [
          n({ id: "10" }),
          p({
            value: { id: "11" },
            orientation: LegacyOrientation.Horizontal,
            children: [
              p({
                value: { id: "110" },
                orientation: LegacyOrientation.Vertical,
                children: [n({ id: "1100" }), n({ id: "1101" })],
              }),
              n({ id: "111" }),
              p({
                value: { id: "112" },
                orientation: LegacyOrientation.Vertical,
                children: [
                  n({ id: "1120" }),
                  p({
                    value: { id: "1121" },
                    orientation: LegacyOrientation.Horizontal,
                    children: [n({ id: "11210" }), n({ id: "11211" })],
                  }),
                ],
              }),
            ],
          }),
          p({
            value: { id: "12" },
            orientation: LegacyOrientation.Horizontal,
            children: [
              n({ id: "120" }),
              p({
                value: { id: "121" },
                orientation: LegacyOrientation.Vertical,
                children: [n({ id: "1210" }), n({ id: "1211" })],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

describe("with relatively simple tree", () => {
  let node: Node<{ id: number }> | null;
  it("should return sibling of given direction", () => {
    node = getAt(simpleTree, 2);
    const sibling = findSibling(node!, Direction.Up);
    expect(sibling?.value.id).toEqual(1);
  });

  it("should return itself if there is no sibling of given direction", () => {
    node = getAt(simpleTree, 0);
    let sibling = findSibling(node!, Direction.Up);
    expect(sibling?.value.id).toEqual(0);
    sibling = findSibling(node!, Direction.Left);
    expect(sibling?.value.id).toEqual(0);
  });

  it("should handle a complex movement where parent orientation is different than direction", () => {
    node = getAt(simpleTree, 0);
    const sibling = findSibling(node!, Direction.Left);
    expect(sibling?.value.id).toEqual(0);
  });
  it("should choose relative index on ambigous finds", () => {
    node = getAt(simpleTree, 0);
    const sibling = findSibling(node!, Direction.Right);
    expect(sibling?.value.id).toEqual(1);
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
      expect(node?.value.id).toEqual("00");
    });
    it("moves to 10", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("10");
    });
    it("moves to 1100", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("1100");
    });
    it("moves to 00", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.value.id).toEqual("00");
    });
    it("moves to 010", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("010");
    });
    it("moves to 011", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("011");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("120");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("1210");
    });
    it("stays at to 1210", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("1210");
    });
    it("moves to 11211", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.value.id).toEqual("11211");
    });
    it("moves to 1120", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.value.id).toEqual("1120");
    });
    it("moves to 111", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.value.id).toEqual("111");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("1210");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.value.id).toEqual("120");
    });
    it("moves to 1101", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.value.id).toEqual("1101");
    });
    it("moves to 111", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("111");
    });
    it("moves to 1120", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("1120");
    });
    it("moves to 11210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("11210");
    });
    it("moves to 11211", () => {
      node = findSibling(node!, Direction.Down);
      expect(node?.value.id).toEqual("11211");
    });
    it("moves to 1210", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("1210");
    });
    it("moves to 1211", () => {
      node = findSibling(node!, Direction.Right);
      expect(node?.value.id).toEqual("1211");
    });
    it("moves to 120", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.value.id).toEqual("120");
    });
    it("moves to 011", () => {
      node = findSibling(node!, Direction.Up);
      expect(node?.value.id).toEqual("011");
    });
    it("moves to 00", () => {
      node = findSibling(node!, Direction.Left);
      expect(node?.value.id).toEqual("00");
    });
  });
});
