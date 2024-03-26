/* eslint-disable @typescript-eslint/no-unsafe-assignment -- cba */
import dnode from "dnode-protocol";

// eslint-disable-next-line @typescript-eslint/no-explicit-any --- bs
type BaseFunction = (...args: any[]) => any;

class Api<TMethods extends Record<string, { handler: BaseFunction }>> {
  constructor(public methods: TMethods) {}

  method<K extends keyof TMethods>(name: K) {
    return this.methods[name];
  }

  call<K extends keyof TMethods>(
    name: K,
    ...args: Parameters<TMethods[K]["handler"]>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- i know what i am doing
    return this.methods[name].handler(...args);
  }
}
type BaseApiDescription = Record<string, { handler: BaseFunction }>;

interface ModuleOptions<T> {
  api: T;
}

export class Module<TApiDesc extends BaseApiDescription> {
  public id: string;
  public api: Api<TApiDesc>;

  constructor(id: string, options: ModuleOptions<TApiDesc>) {
    this.id = id;
    this.api = new Api(options.api);
  }
}

interface TransportRequest<
  TMethod extends string = string,
  TArgs extends unknown[] = unknown[],
> {
  type: "request";
  id: string;
  method: TMethod;
  args: TArgs;
}

interface TransportResponse<TValue extends object = object> {
  type: "response";
  id: string;
  value: TValue;
}

export type TransportMessage = TransportRequest | TransportResponse;

export interface Connection {
  id: string;
  onMessage: (handler: (message: TransportMessage) => void) => void;
  send: (message: TransportMessage) => void;
}

export interface TransportServer {
  onConnection: (handler: (connection: Connection) => void) => void;
}

export class ModuleServer<T extends BaseApiDescription> {
  readonly module: Module<T>;
  readonly connections = new Map<string, Connection>();

  constructor(module: Module<T>) {
    this.module = module;
  }

  serve(transport: TransportServer) {
    transport.onConnection((connection) => {
      this.connections.set(connection.id, connection);

      connection.onMessage((message) => {
        console.log("server", message);

        if (message.type === "request") {
          const { id, method, args } = message;
          const value = this.module.api.call(
            method,
            ...(args as Parameters<T[string]["handler"]>),
          );
          connection.send({ id, type: "response", value });
        }
      });
    });
  }
}

export interface TransportClient {
  connect: () => Connection;
}

export class ModuleClient {
  readonly id: string;

  private connection: Connection | null = null;

  constructor(id: string) {
    this.id = id;
  }

  connect(transport: TransportClient) {
    this.connection = transport.connect();
  }

  async call(method: string, ...args: unknown[]) {
    const id = Date.now().toString();

    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Not connected"));
        return;
      }

      this.connection.onMessage((message) => {
        if (message.type === "response" && message.id === id) {
          resolve(message.value);
        }
      });

      this.connection.send({ id, type: "request", method, args });
    });
  }
}
