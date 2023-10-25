import {describe, expect, it} from "vitest";
import {LayoutTree} from "./LayoutTree.1";

describe("split", () => {
  it("splits an empty tree correctly", () => {
    const tree = new LayoutTree();
    expect(tree.root).toBe(tree.focused);

    expect(tree.split("vertical")).toBe(tree.focused);
    expect(tree.toJSON()).toEqual(
      expect.objectContaining({
        children: [
          expect.objectContaining({value: null}),
          expect.objectContaining({id: tree.focused.id, value: null}),
        ],
      }),
    );

    expect(tree.split("vertical")).toBe(tree.focused);
    expect(tree.toJSON()).toEqual(
      expect.objectContaining({
        children: [
          expect.objectContaining({value: null}),
          expect.objectContaining({value: null}),
          expect.objectContaining({id: tree.focused.id, value: null}),
        ],
      }),
    );

    expect(tree.split("horizontal")).toBe(tree.focused);
    expect(tree.toJSON()).toEqual(
      expect.objectContaining({
        children: [
          expect.objectContaining({value: null}),
          expect.objectContaining({value: null}),
          expect.objectContaining({
            children: [
              expect.objectContaining({value: null}),
              expect.objectContaining({id: tree.focused.id, value: null}),
            ],
          }),
        ],
      }),
    );

    expect(tree.flatten()).toEqual([null, null, null, null]);
  });
});
