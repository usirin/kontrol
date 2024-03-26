import { describe, expect, it } from "vitest";
import { Module, ModuleClient, ModuleServer } from "./module";
import {
  MemoryTransportClient,
  MemoryTransportServer,
} from "./memory-transport";

const mod = new Module("calculator", {
  api: {
    sum: {
      handler: (a: number, b: number) => {
        const result = a + b;
        return result;
      },
    },
  },
});

describe("framework", () => {
  it("should work", async () => {
    const server = new ModuleServer(mod);
    server.serve(new MemoryTransportServer());

    const client = new ModuleClient("calculator");
    client.connect(new MemoryTransportClient());

    const result = await client.call("sum", 1, 2);

    expect(result).toBe(3);
  });
});
