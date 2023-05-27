import { ApolloClient, InMemoryCache } from "qwik-graphql-client";

export const client = new ApolloClient({
    uri: 'https://flyby-router-demo.herokuapp.com/',
    cache: new InMemoryCache(),
  });