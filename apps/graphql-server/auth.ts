import { Context } from './index';
import { User, assertsEmail, assertsPassword, createUser, getUser } from './sql/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getEnv } from './get_env';

import { IncomingMessage } from 'http';
import { DB } from './postgres-init';

const APP_USER_SECRET = getEnv("APP_USER_SECRET")
const AUTH_SECRET = getEnv("AUTH_SECRET")


type AuthPayLoad = {
    token: string,
    user: User
}
type AuthFunction = (parent, args, context: Context, info) => Promise<AuthPayLoad>

export const signup: AuthFunction = async (parent, args, context, info) => {
  let token: string, user: User;
  const plainPassword = args.password;
  const email = args.email;
  console.log('signup', email);
  try {
  assertsEmail(email);
  assertsPassword(plainPassword);
  const password = await bcrypt.hash(args.password, 10)
  user = await createUser(context.postgres, email, password)
  token = jwt.sign({userId: user.id}, APP_USER_SECRET)
  } catch (e) {
    console.log("signup: error", e)
  }
  return {
    token,
    user
  }
}

export const oauth: AuthFunction = async (parent, args, context, info) => {
  console.log({parent, args, context, info})
  const {name, email} = args
  try {
    assertsEmail(email);
  } catch (e) {

  }
  return {
    token: "",
    user: {
      "email": "hogehoge@gmail.com",
      "id": "hogehoge"
    }
  }
}

export const login: AuthFunction = async (parent, args, context, info) => {
  let token: string, user: User;
  const plainPassword = args.password;
  const email = args.email;
  try {
  assertsEmail(email);
  assertsPassword(plainPassword);
  user = await getUser(context.postgres, email)
  let valid = false;
  if (user.password) {
    valid = await bcrypt.compare(plainPassword, user.password)
  } else {
    throw Error ("user.password not inlcludes")
  }
  token = jwt.sign({userId: user.id}, APP_USER_SECRET)
  } catch (e) {
    console.log("signup: error", e)
  }
  return {
    token,
    user
  }
}

function isUser(value: any): value is User {
  return  typeof value === "object" && typeof value.id === "string" && typeof value.email === "string"
}

function isPayload(value: any): value is AuthPayLoad {
  return typeof value === "object" && isUser(value.user) && typeof value.token === "string"
}

function getTokenPayload(token): AuthPayLoad & {userId: string} {

  const result = jwt.verify(token, APP_USER_SECRET);
  if (isPayload(result)) {
    return {
      userId: "",
      ...result
    }
  }
}

async function getTokenGithubOauthPayload(token: string, db: DB): Promise<AuthPayLoad & {userId: string}> {

  const result = jwt.verify(token, AUTH_SECRET);
  if (typeof result === "object") {
    const email: string = result.email;
    let user: User;
    assertsEmail(email)
    try {
      user = await getUser(db, email);
    } catch (e) {
      console.log({user})
      const randomPassword = Math.random().toString(32).substring(2); // とりあえずinterfaceの整合性撮るために、パスワード入れる
      user = await createUser(db, email, randomPassword);
    }
    const token = jwt.sign({userId: user.id}, APP_USER_SECRET)
    return {
      userId: user.id,
      token,
      user
    }
  }
}
type OAuthType = 'GitHub'
export function getCurrentUserIdOauth(req: IncomingMessage, db: DB, oauthType: OAuthType = "GitHub") {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader
      const { userId } = getTokenGithubOauthPayload(token, db);
      return userId;
    }
  }

  throw new Error('Not authenticated');
}


export function getCurrentUserId(req: IncomingMessage, authToken?: string) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        throw new Error('No token found');
      }
      const { userId } = getTokenPayload(token);
      return userId;
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken);
    console.log('getUserId:authToken', userId)
    return userId;
  }

  throw new Error('Not authenticated');
}

export function assertshasedContextUserId(context: Context): asserts context is Context & {userId: string} {
  const userId = context.userId;
  if (!userId) {
    throw Error ("don't set currentUserId ")
  }
}