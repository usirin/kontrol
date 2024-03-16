import { EventEmitter } from "events";
interface Service {
  name: string;
  url: string;
}

export type Registry = ReturnType<typeof createRegistry>;

function createRegistry() {
  const services: { [name: string]: Service } = {};

  return {
    services,
  };
}
