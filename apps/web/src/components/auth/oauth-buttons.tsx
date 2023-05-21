import { component$ } from '@builder.io/qwik';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const OAuthButtons = component$(() => {
    const githubButton = (<a href="https://github.com/login/oauth/authorize?client_id=">Log in with GitHub</a>)
  return (
    <>
   {githubButton}
    </>
  );
});
