import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLScalarType, Kind } from 'graphql';
import { typeDefs } from './typeDefs';
import { QueryResolvers } from './resolvers/query';
import { PaymentMutations } from './resolvers/payment';
import { ProposalQueries, ProposalMutations } from './resolvers/proposal';

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'ISO-8601 date-time string',
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    return String(value);
  },
  parseValue(value: unknown) {
    return new Date(value as string | number);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

const resolvers = {
  Date: DateScalar,
  Query: {
    ...QueryResolvers,
    ...ProposalQueries,
  },
  Mutation: {
    ...PaymentMutations,
    ...ProposalMutations,
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
