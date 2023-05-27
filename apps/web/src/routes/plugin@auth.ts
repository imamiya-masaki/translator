import jwt, {type JwtPayload} from 'jsonwebtoken';
import { serverAuth$  } from '@builder.io/qwik-auth';
import GitHub from '@auth/core/providers/github';
import type { Provider } from '@auth/core/providers';
import { useQuery as graphQLUseQuery } from "qwik-graphql-client";
import { GET_CURRENT } from '~/graphql-client/auth/oauth';

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } = serverAuth$(
  ({ env }) => ({
    secret: env.get('AUTH_SECRET'),
    trustHost: true,
    jwt: {
      async encode({token, secret, maxAge}): Promise <string> {
        return jwt.sign({...token}, secret, {expiresIn: maxAge})
      },
      async decode({token, secret}): Promise<JwtPayload | null> {
        const result = jwt.verify(token ?? "", secret)
        const { loading, error, data } = graphQLUseQuery(GET_CURRENT)
        if (typeof result === "object") {
          return result 
        }
        return {loading, error, data}
      } 
    },
    providers: [
      GitHub({
        clientId: env.get('GITHUB_ID')!,
        clientSecret: env.get('GITHUB_SECRET')!,
      }),
    ] as Provider[],
    callbacks: {
      session: async ({session, token}) => {
        const accessToken = token
        return Promise.resolve({
          ...session,
          accessToken: accessToken
        })
      }
    }
  })
);