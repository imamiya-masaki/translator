import { component$, Slot, useStyles$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import Header from '~/components/starter/header/header';
import Footer from '~/components/starter/footer/footer';

import styles from './styles.css?inline';
import { useAuthSession, useAuthSignout } from './plugin@auth';


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
      <Header />
      <main>
        wiiii
        {a}
        <button onClick$={() => signout}></button>
        <Slot />
      </main>
      <Footer />
    </>
  );
});
