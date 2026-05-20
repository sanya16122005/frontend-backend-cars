# Практика 26 — GraphQL + Apollo Server

## Цель
Реализовать GraphQL API для каталога книг с использованием **Apollo Server**: типы `Book` и `Author` со связью «один-ко-многим», `Query`, `Mutation`, вложенные резолверы.

## Что реализовано

### Схема (SDL)
- `type Author { id, name, country, books: [Book!]! }`
- `type Book { id, title, year, genre, author: Author! }`
- `input CreateAuthorInput`, `input CreateBookInput` — input-типы для мутаций

### Query
| Поле | Описание |
|---|---|
| `books` | Все книги |
| `book(id)` | Книга по id |
| `authors` | Все авторы |
| `author(id)` | Автор по id |
| `booksByGenre(genre)` | Книги по жанру |

### Mutation
| Поле | Описание |
|---|---|
| `createAuthor(input)` | Создать автора |
| `createBook(input)` | Создать книгу (с проверкой существования автора) |
| `deleteBook(id)` | Удалить книгу, возвращает Boolean |

### Вложенные резолверы (связи между типами)
- `Author.books` — все книги этого автора (`books.filter(b => b.authorId === parent.id)`)
- `Book.author` — автор книги (`authors.find(a => a.id === parent.authorId)`)

## Как запустить
```bash
cd practice-26-graphql
npm install
npm start
```
Apollo Sandbox откроется по адресу **http://localhost:4000**.

## Примеры запросов (вставлять в Apollo Sandbox)

### 1. Получить всех авторов с их книгами
```graphql
query {
  authors {
    id
    name
    country
    books {
      title
      year
    }
  }
}
```

### 2. Получить книгу с информацией об авторе (с переменной)
```graphql
query GetBook($id: ID!) {
  book(id: $id) {
    title
    year
    genre
    author {
      name
      country
    }
  }
}
```
**Variables:**
```json
{ "id": "3" }
```

### 3. Книги по жанру
```graphql
query {
  booksByGenre(genre: "антиутопия") {
    title
    year
    author { name }
  }
}
```

### 4. Создать автора
```graphql
mutation {
  createAuthor(input: { name: "Антон Чехов", country: "Россия" }) {
    id
    name
  }
}
```

### 5. Создать книгу
```graphql
mutation CreateBook($input: CreateBookInput!) {
  createBook(input: $input) {
    id
    title
    author { name }
  }
}
```
**Variables:**
```json
{
  "input": {
    "title": "Палата №6",
    "year":  1892,
    "genre": "повесть",
    "authorId": "4"
  }
}
```

### 6. Удалить книгу
```graphql
mutation {
  deleteBook(id: "5")
}
```

## Файлы
| Файл | Назначение |
|---|---|
| `server.js`    | Схема + резолверы + запуск Apollo Server |
| `package.json` | Зависимости `@apollo/server` и `graphql` |

## Полезное
- Документация GraphQL: <https://graphql.org/learn/>
- Apollo Server: <https://www.apollographql.com/docs/apollo-server/>
