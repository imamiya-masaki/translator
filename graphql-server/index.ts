import { createPostgresPool } from './postgres-init';
import { assertsNodeMode, getDBURL, getEnv } from './get_env';
import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { signup, login, getCurrentUserId } from './auth';
import { DB } from './postgres-init';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { resolverCurrrentAddBook, resolverCurrrentGetBooks } from './sql/book';
import {join as pathJoin} from 'path';
export type Context = {
  postgres: DB,
  userId?: string
}

const main = async() => {
  const mode = getEnv("NODE_ENV");
  console.log('mode: ', mode);
  assertsNodeMode(mode);

  const dbURL = getDBURL(mode);

  // A schema is a collection of type definitions (hence "typeDefs")
  // that together define the "shape" of queries that are executed against
  // your data.

  console.log('typedef', pathJoin(__dirname, './schema.graphql'));
  const typeDefs = loadSchemaSync(pathJoin(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
  });

  // Resolvers define how to fetch the types defined in your schema.
  // This resolver retrieves books from the "books" array above.

  type Resolvers = ApolloServerOptions<BaseContext>["resolvers"]

  const resolvers: Resolvers = {
      Query: {
        books: resolverCurrrentGetBooks,
      },
      Mutation: {
        signup,
        login,
        addBook: resolverCurrrentAddBook
      }
    };

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    
  // Passing an ApolloServer instance to the `startStandaloneServer` function:
  //  1. creates an Express app
  //  2. installs your ApolloServer instance as middleware
  //  3. prepares your app to handle incoming requests
  
  const { url } = await startStandaloneServer(server, {
    context: async ({req, res}) => {
      const postgres = createPostgresPool(dbURL)
      let userId = undefined;
      if (req && req.headers.authorization) {
        userId = getCurrentUserId(req)
      }
      return {
        ...req,
        postgres,
        userId
      }
    },
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main()