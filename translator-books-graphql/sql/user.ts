import { DB } from "../postgres-init"


type SQLFunction = (db: DB, ...any) => any

export type User = {
  id: string,
  email: String,
  password?: string
}

export const isUser = (value: any): value is User => {
  return typeof value === "object" && Object.hasOwn(value, "id") && Object.hasOwn(value, "email")
}

export function assertsUser (value: any): asserts value is User {
  if (!isUser(value)) {
    throw Error (`value isn't type of User, value: ${JSON.stringify(value, null, 2)}`)
  }
}

export async function getUser(db: DB, email: Email) {
  const users = await db`
  select * from users where email = ${email} LIMIT 1
  `
  const user = users[0]
  assertsUser(user)
  return user
};

type Email = `${string}@${string}`

function isEmail(value: string):value is Email {
  return value.includes("@")
}

export function assertsEmail(value: any): asserts value is Email {
  if (!isEmail(value)) {
    throw Error("value isn't type of Email")
  }
}

export function assertsPassword(value: any): value is string {
  return typeof value === "string"
}

export async function isExistUser(db: DB, email: Email): Promise<boolean> {
  // exist句のsumcost(8.17), select limitのsumcost(8.16)
  const users = await db`
  select id from users where email = ${email} LIMIT 1
  `
  console.log('isExistUser', users, users?.length)
  return users?.length && users?.length > 0
}

export async function createUser(db: DB, email: Email, password: string) {
  // TODO: フロント側に出すために、アプリ側でエラーの対処を行うが、フロント側の実装はまだ行わない
  if (await isExistUser(db, email)) {
    throw Error("dupulicate User")
  }
  const users = await db`
  insert into users
   (email, password)
  values
   (${email}, ${password})
  returning email, id
  `
  const user = users[0]
  assertsUser(user)
  console.log('createUser', user);
  return user
}
