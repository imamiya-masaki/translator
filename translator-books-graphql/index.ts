import { createPostgresPool } from './postgres-init';
import { assertsNodeMode, getDBURL, getEnv } from './get_env';
import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { signup, login, getCurrentUserId } from './auth';
import { DB } from './postgres-init';
import { resolverCurrrentAddBook, resolverCurrrentGetBooks } from './sql/book';
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
  const typeDefs = `#graphql
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    # This "Book" type defines the queryable fields for every book in our data source.

    type UserBook {
      id: String!
      userId: String!
      title: String!
      description: String
    }

    input InputUserBook {
      title: String!
      description: String
    }

    type User {
      id: ID!
      email: String!
    }

    type AuthPayLoad {
      token: String
      user: User
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).

    type Query {
      books(limit: Int): [UserBook]
    }
    type Mutation {
      signup(email: String!, password: String!): AuthPayLoad
      login(email: String!, password: String!): AuthPayLoad
      addBook(book: InputUserBook!): UserBook
    }
  `;

  const books = [
      {
        title: 'The Awakening',
        author: 'Kate Chopin',
      },
      {
        title: 'City of Glass',
        author: 'Paul Auster',
      },
    ];

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