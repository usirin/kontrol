import { describe, expect, it } from "vitest";
import { Registry, createService } from ".";

describe.skip("Service", () => {
  it("should work", () => {
    const service = createService({
      api: { sum: (a: number, b: number) => a + b },
    });

    expect(service.sum(1, 2)).toEqual(3);
  });
});

const createUserService = () => {
  const users = new Map<string, { id: string; name: string }>();
  return createService({
    api: {
      getUser: ({ id }: { id: string }) => Promise.resolve(users.get(id)),
      createUser: async (user: { id: string; name: string }) => {
        users.set(user.id, user);
        return Promise.resolve(user);
      },
      deleteUser: ({ id }: { id: string }) => {
        users.delete(id);
      },
      updateUser: (user: { id: string; name: string }) => {
        users.set(user.id, user);
        return user;
      },
    },
  });
};

const createPostService = () => {
  const posts = new Map<string, { id: string; userID: string; name: string }>();
  return createService({
    api: {
      getPost: ({ id }: { id: string }) => Promise.resolve(posts.get(id)),
      createPost: (post: { id: string; name: string; userID: string }) => {
        posts.set(post.id, post);
        return post;
      },
      deletePost: ({ id }: { id: string }) => {
        posts.delete(id);
      },
      updatePost: (post: { id: string; name: string; userID: string }) => {
        posts.set(post.id, post);
        return post;
      },
    },
  });
};

describe.skip("Registry", () => {
  it("should work", async () => {
    const registry = new Registry();

    const userService = createUserService();
    const postService = createPostService();

    registry.register(userService);
    registry.register(postService);

    ///
    //
    const userClient = registry.query<typeof userService>(userService.key);
    let user = await userClient.getUser({ id: "1" });

    expect(user).toEqual(undefined);

    await userClient.createUser({ id: "1", name: "John" });
    user = await userClient.getUser({ id: "1" });

    expect(user).toEqual({ id: "1", name: "John" });

    await registry.run({
      run: async (services) => {
        const client = services.get(userService.key) as typeof userService;
        client.deleteUser({ id: "1" });
        return Promise.resolve();
      },
    });

    expect(await userClient.getUser({ id: "1" })).toEqual(undefined);
  });
});
