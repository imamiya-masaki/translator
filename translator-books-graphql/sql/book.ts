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

type Args = {
    limit?: number
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

type InsertArgs = {
  book: InputUserBook
}

type ResolverBookFunction = (parent, args: Args, context: Context, info) => Promise<UserBook>
type ResolverAddBookFunction = (parent, args: InsertArgs, context: Context, info) => Promise<UserBook>
type ResolverBooksFunction = (parent, args: Args, context: Context, info) => Promise<UserBook[]>
type ResolverBookTypeFunction = ResolverBookFunction | ResolverBooksFunction

const getBooks = async(db: DB, userId: string, args: Args): Promise<UserBook[]> =>  {
  const books = await db`select * from user_books where user_id = ${userId} ${args.limit ? db`limit ${args.limit}`: db``}`
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

export const resolverCurrrentGetBooks: ResolverBooksFunction = async (parent, args: Args, context: Context, info) => {
  assertshasedContextUserId(context)
  const books = await getBooks(context.postgres, context.userId, args)
  return books
} 

export const resolverCurrrentAddBook: ResolverAddBookFunction = async (parent, args: InsertArgs, context: Context, info) => {
  console.log('resolverCurrrentAddBook', args)
  assertshasedContextUserId(context)
  const target: Omit<UserBook, "id"> = {...args.book, user_id: context.userId}
  const book = await insertBook(context.postgres, target)
  console.log('resolverCurrrentAddBook:book', book)
  return book
} 