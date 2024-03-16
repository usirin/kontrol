import { describe, expect, it } from "vitest";
import { createEmitter } from "./emitter";

describe("emitter", () => {
  it("emits events", () => {
    const emitter = createEmitter();

    let count = 0;
    emitter.on("test", () => {
      count++;
    });

    emitter.emit("test", null);

    expect(count).toEqual(1);
  });
});
