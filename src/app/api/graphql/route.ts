import { ApolloServer } from "@apollo/server";
import type { NextRequest } from 'next/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from "../../../../apollo";
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  
const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer);

  export async function GET(request:any) {
    return handler(request);
  }
  
  export async function POST(request:any) {
    return handler(request);
  }