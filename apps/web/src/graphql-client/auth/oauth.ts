import { gql } from "qwik-graphql-client";

export const GET_CURRENT = gql`
  query current {
    id
    email
  }
`