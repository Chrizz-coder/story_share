import type { Context } from '../../context';

export const QueryResolvers = {
  hello: () => 'Hello, world!',
  me: (_parent: unknown, _args: unknown, ctx: Context) => {
    return ctx.viewer || null;
  },
};
