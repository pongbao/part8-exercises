import { useState, useEffect } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/Login";
import Recommended from "./components/Recommended";
import { VIEW_BOOKS } from "./queries";

const App = () => {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);
  const [genre, setGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const result = useQuery(VIEW_BOOKS);

  const client = useApolloClient();

  useEffect(() => {
    if (token) {
      setPage("authors");
    } else {
      setPage("login");
    }
  }, [token]);

  useEffect(() => {
    if (!result.loading) {
      const fetchedGenres = [];
      result.data.allBooks.map((book) =>
        book.genres.map((genre) =>
          fetchedGenres.includes(genre) ? null : fetchedGenres.push(genre)
        )
      );
      setGenres(fetchedGenres);
    }
  }, [result]);

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
      <Books show={page === "books"} genres={genres} />
      <NewBook show={page === "add"} />
      <Recommended show={page === "recommended"} genre={genre} />
    </div>
  );
};

export default App;
