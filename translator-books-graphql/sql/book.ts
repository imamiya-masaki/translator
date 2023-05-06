import { assertshasedContextUserId } from '../auth';
import { DB } from '../postgres-init';
import { Context } from './../index';

/**
 *  type UserBook {
      id: String!
      userId: String!
      title: String!
      description: String
    }
 */

/**
 * 
 * create table user_books(
  "id" varchar(255) DEFAULT uuid_generate_v4(),
  "user_id" varchar(255),
  "title" text NOT NULL,
  "description" text,
  PRIMARY KEY ( user_id, id )
);
 */

type UserBook = {
    id: string,
    user_id: string,
    title: string,
    description?: string
}

const convertDBKey = (value: string[]) => {
  return value.map( v => {
    switch(v) {
      case "userId":
        return "user_id"
      default:
        return v
    }
  })
}

function assertsUserBooks(value: Array<object>): asserts value is UserBook[] {
  if (!value.every(v => Object.hasOwn(v, "title"))) {
    throw Error("typeof value isn't typeof UserBook[] ")
  }
}

/**
 *   input InputUserBook {
      title: String!
      description: String
    }
 */
type InputUserBook = {
  title: string,
  description?: string
}

type SelectCondition = {
  limit?: number,
  sort?: {
    variable: string,
    direction: "desc" | "asc"
  }
}

type InsertArgs = {
  book: InputUserBook
}

type ResolverBookFunction = (parent, args: {condition: SelectCondition}, context: Context, info) => Promise<UserBook>
type ResolverAddBookFunction = (parent, args: InsertArgs, context: Context, info) => Promise<UserBook>
type ResolverBooksFunction = (parent, args: {condition: SelectCondition}, context: Context, info) => Promise<UserBook[]>
type ResolverBookTypeFunction = ResolverBookFunction | ResolverBooksFunction

const dbSelect = async (db: DB, selectTemplate: string, userId: string, condition: SelectCondition) => {
  const selected = await db`${selectTemplate} where user_id = ${userId} ${condition.limit ? db`limit ${condition.limit}`: db``} ${condition.sort ? db`order by ${condition.sort.variable} ${condition.sort.direction}`: db``}`
  return selected
}

const getBooks = async(db: DB, userId: string, condition: SelectCondition): Promise<UserBook[]> =>  {
  const books = await dbSelect(db, "select * from user_books", userId, condition)
  assertsUserBooks(books)
  return books
};

const insertBook = async(db: DB, book: Omit<UserBook, "id">): Promise<UserBook> =>  {
  const targetBook = {
    title: book.title,
    description: book.description ?? "",
    user_id: book.user_id
  }
  const books = await db`
  insert into user_books
   ${ db(targetBook, "title", "description", "user_id") }
  returning id, user_id, title, description`
  assertsUserBooks(books)
  return books[0]
};

export const resolverCurrrentGetBooks: ResolverBooksFunction = async (parent, args, context, info) => {
  assertshasedContextUserId(context)
  const books = await getBooks(context.postgres, context.userId, args.condition)
  return books
} 

export const resolverCurrrentAddBook: ResolverAddBookFunction = async (parent, args, context, info) => {
  console.log('resolverCurrrentAddBook', args)
  assertshasedContextUserId(context)
  const target: Omit<UserBook, "id"> = {...args.book, user_id: context.userId}
  const book = await insertBook(context.postgres, target)
  console.log('resolverCurrrentAddBook:book', book)
  return book
} 