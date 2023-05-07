import { Context } from './index';
import { User, assertsEmail, assertsPassword, createUser, getUser } from './sql/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getEnv } from './get_env';

import { IncomingMessage } from 'http';

const APP_SECRET = getEnv("APP_SECRET")

type AuthPayLoad = {
    token: String,
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
  token = jwt.sign({userId: user.id}, APP_SECRET)
  } catch (e) {
    console.log("signup: error", e)
  }
  return {
    token,
    user
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
  token = jwt.sign({userId: user.id}, APP_SECRET)
  } catch (e) {
    console.log("signup: error", e)
  }
  return {
    token,
    user
  }
}

function getTokenPayload(token) {
  const result = jwt.verify(token, APP_SECRET);
  if (typeof result === "object") {
    return {
      userId: "",
      ...result
    }
  }
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