// Practice 26 — GraphQL API каталога книг на Apollo Server.
// Связь Author 1—N Book, Query, Mutation, вложенные резолверы.

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// ───── Схема (SDL) ────────────────────────────────────────
const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    country: String
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    year: Int!
    genre: String
    author: Author!
  }

  type Query {
    books:           [Book!]!
    book(id: ID!):   Book
    authors:         [Author!]!
    author(id: ID!): Author
    booksByGenre(genre: String!): [Book!]!
  }

  input CreateAuthorInput {
    name: String!
    country: String
  }

  input CreateBookInput {
    title: String!
    year: Int!
    genre: String
    authorId: ID!
  }

  type Mutation {
    createAuthor(input: CreateAuthorInput!): Author!
    createBook(input: CreateBookInput!):     Book!
    deleteBook(id: ID!):                     Boolean!
  }
`;

// ───── Данные в памяти ────────────────────────────────────
const authors = [
  { id: '1', name: 'Фёдор Достоевский',     country: 'Россия' },
  { id: '2', name: 'Джордж Оруэлл',         country: 'Великобритания' },
  { id: '3', name: 'Габриэль Гарсиа Маркес', country: 'Колумбия' }
];

const books = [
  { id: '1', title: 'Преступление и наказание', year: 1866, genre: 'роман',   authorId: '1' },
  { id: '2', title: 'Братья Карамазовы',         year: 1880, genre: 'роман',   authorId: '1' },
  { id: '3', title: '1984',                       year: 1949, genre: 'антиутопия', authorId: '2' },
  { id: '4', title: 'Скотный двор',               year: 1945, genre: 'антиутопия', authorId: '2' },
  { id: '5', title: 'Сто лет одиночества',        year: 1967, genre: 'роман',   authorId: '3' }
];

// ───── Резолверы ───────────────────────────────────────────
const resolvers = {
  Query: {
    books:        () => books,
    book:         (_, { id }) => books.find(b => b.id === id) || null,
    authors:      () => authors,
    author:       (_, { id }) => authors.find(a => a.id === id) || null,
    booksByGenre: (_, { genre }) => books.filter(b => b.genre === genre)
  },

  Mutation: {
    createAuthor: (_, { input }) => {
      const author = { id: String(authors.length + 1), ...input };
      authors.push(author);
      return author;
    },
    createBook: (_, { input }) => {
      const author = authors.find(a => a.id === input.authorId);
      if (!author) throw new Error(`Author ${input.authorId} not found`);
      const book = { id: String(books.length + 1), ...input };
      books.push(book);
      return book;
    },
    deleteBook: (_, { id }) => {
      const idx = books.findIndex(b => b.id === id);
      if (idx === -1) return false;
      books.splice(idx, 1);
      return true;
    }
  },

  // Вложенные резолверы: связи между типами
  Author: {
    books: (parent) => books.filter(b => b.authorId === parent.id)
  },
  Book: {
    author: (parent) => authors.find(a => a.id === parent.authorId)
  }
};

// ───── Запуск ──────────────────────────────────────────────
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`📚 GraphQL Sandbox: ${url}`);
