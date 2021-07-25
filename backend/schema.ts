import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs } from '../backend/type-defs'
import { resolvers } from '../backend/resolvers'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})