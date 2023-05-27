import { component$, Slot, useStyles$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import Header from '~/components/starter/header/header';
import Footer from '~/components/starter/footer/footer';

import styles from './styles.css?inline';
import { useAuthSession, useAuthSignout } from './plugin@auth';
import {
  GraphQLClientProvider,
  ApolloClient,
  InMemoryCache,
} from "qwik-graphql-client";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  const session = useAuthSession();
  const a = JSON.stringify(session, null, 2)
  const signout = useAuthSignout();
  useStyles$(styles);
  return (
    <>
    <GraphQLClientProvider
        clientGenerator$={() =>
            new ApolloClient({
            uri: 'http://localhost:4000/',
            cache: new InMemoryCache(),
          })
        }
      >
      <Header />
      <main>
        wiiii
        {a}
        <button onClick$={() => signout} ></button>
        <Slot />
      </main>
      <Footer />
      </GraphQLClientProvider>
    </>
  );
});
