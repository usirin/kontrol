import { EventEmitter } from "node:events";
import type {
  Connection,
  TransportClient,
  TransportMessage,
  TransportServer,
} from "./module";

const dispatcher = new EventEmitter();

class MemoryConnection implements Connection {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  onMessage(handler: (message: TransportMessage) => void) {
    dispatcher.on("message", handler);
  }

  send(message: TransportMessage) {
    dispatcher.emit("message", message);
  }
}

class MemoryConnectionServer extends MemoryConnection {}
class MemoryConnectionClient extends MemoryConnection {}

export class MemoryTransportServer implements TransportServer {
  onConnection(handler: (connection: Connection) => void) {
    handler(new MemoryConnectionServer("server-connection"));
  }
}

export class MemoryTransportClient implements TransportClient {
  connect() {
    return new MemoryConnectionClient("client-connection");
  }
}
