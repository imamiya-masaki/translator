set client_encoding = 'UTF8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table users(
  "id" varchar(255) DEFAULT uuid_generate_v4(),
  "email" text,
  "password" text,
  UNIQUE( "email" ),
  PRIMARY KEY ( "id" )
);

create table user_books(
  "id" varchar(255) DEFAULT uuid_generate_v4(),
  "user_id" varchar(255),
  "title" text NOT NULL,
  description text,
  PRIMARY KEY ( user_id, id )
);