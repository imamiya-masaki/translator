import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { OAuthButtons } from '~/components/auth/oauth-buttons';

export default component$(() => {
  const location = useLocation();
  const url = new URL(location.url);
  const code = url.searchParams.get("code");
  return (
    <>
    <OAuthButtons />
    code: {code}
    </>
  );
});
