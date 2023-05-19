const User = require("./models/user");
const Book = require("./models/book");
const Author = require("./models/author");

const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author) {
        if (!args.genre) {
          return Book.find({}).populate("author");
        } else {
          return Book.find({ genres: { $in: args.genre } }).populate("author");
        }
      } else {
        const author = await Author.findOne({ name: args.author });

        if (!args.genre) {
          return Book.find({ author: author._id }).populate("author");
        } else {
          return Book.find({
            author: author._id,
            genres: { $in: args.genre },
          }).populate("author");
        }
      }
    },
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: async () => await Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async (root) => {
      const author = await Author.findOne({ name: root.name });
      return Book.collection.countDocuments({ author: author._id });
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      try {
        let author;
        let book;
        const returnedAuthor = await Author.findOne({ name: args.author });

        if (!returnedAuthor) {
          author = new Author({ name: args.author });
          await author.save();
          book = new Book({ ...args, author: author._id });
        } else {
          book = new Book({ ...args, author: returnedAuthor._id });
        }

        const returnedBook = (await book.save()).populate("author");

        pubsub.publish("BOOK_ADDED", { bookAdded: returnedBook });

        return returnedBook;
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });

      if (!author) {
        return null;
      }

      const updatedAuthor = { born: args.setBornTo };

      return Author.findByIdAndUpdate(author._id, updatedAuthor, {
        new: true,
        runValidators: true,
        context: "query",
      });
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
        genre: user.favoriteGenre,
      };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
