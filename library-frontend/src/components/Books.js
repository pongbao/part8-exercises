import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { VIEW_BOOKS } from "../queries";

const Books = (props) => {
  const [filter, setFilter] = useState(null);

  const result = useQuery(VIEW_BOOKS, {
    variables: { genre: filter },
  });

  useEffect(() => {
    result.refetch({ genre: filter });
  }, [filter, result]);

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  const books = result.data.allBooks;

  const filterBooks = (filter) => {
    setFilter(filter);
  };

  return (
    <div>
      <h2>books</h2>
      {filter && (
        <div>
          in genre <b>{filter}</b>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.genres.map((g) => (
        <button
          key={g}
          value={g}
          onClick={(event) => filterBooks(event.target.value)}
        >
          {g}
        </button>
      ))}
      <button onClick={() => filterBooks(null)}>all genres</button>
    </div>
  );
};

export default Books;
