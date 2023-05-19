import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BOOK, VIEW_BOOKS } from "../queries";
import { updateCache } from "../App";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK, {
    // refetchQueries: [{ query: VIEW_BOOKS }],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
    update: (cache, response) => {
      updateCache(cache, { query: VIEW_BOOKS }, response.data.addBook);
      // cache.updateQuery({ query: VIEW_BOOKS }, ({ allBooks }) => {
      //   return {
      //     allBooks: allBooks.concat(response.data.addBook),
      //   };
      // });
    },
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    createBook({
      variables: { title, author, published: Number(published), genres },
    });

    setTitle("");
    setAuthor("");
    setPublished("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
