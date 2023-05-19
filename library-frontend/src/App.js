import { useState, useEffect } from "react";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/Login";
import Recommended from "./components/Recommended";
import { BOOK_ADDED, VIEW_BOOKS } from "./queries";

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);
  const [genre, setGenre] = useState(null);

  const [bookAdded, setBookAdded] = useState(false);
  const result = useQuery(VIEW_BOOKS);

  const client = useApolloClient();

  useEffect(() => {
    if (token) {
      setPage("authors");
    } else {
      setPage("login");
    }
  }, [token]);

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      window.alert(`${addedBook.title} added`);
      updateCache(client.cache, { query: VIEW_BOOKS }, addedBook);
      setBookAdded(!bookAdded);
    },
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  if (!token) {
    return (
      <>
        <LoginForm
          setToken={setToken}
          setGenre={setGenre}
          show={page === "login"}
        />
      </>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => setPage("recommended")}>recommended</button>
        <button onClick={logout}>logout</button>
      </div>
      <Authors show={page === "authors"} />
      <Books show={page === "books"} bookAdded={bookAdded} />
      <NewBook show={page === "add"} />
      <Recommended show={page === "recommended"} genre={genre} />
    </div>
  );
};

export default App;
