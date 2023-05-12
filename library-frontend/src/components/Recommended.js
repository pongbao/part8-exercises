import { useQuery } from "@apollo/client";
import { VIEW_BOOKS } from "../queries";

const Recommended = (props) => {
  const result = useQuery(VIEW_BOOKS, {
    variables: { genre: props.genre },
    skip: !props.genre,
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  const books = result.data.allBooks;

  return (
    <div>
      <h2>books</h2>
      {props.genre && (
        <div>
          in genre <b>{props.genre}</b>
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
    </div>
  );
};

export default Recommended;
