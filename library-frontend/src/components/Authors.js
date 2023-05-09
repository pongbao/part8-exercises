import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Select from "react-select";

import { ALL_AUTHORS, UPDATE_AUTHOR } from "../queries";

const Authors = (props) => {
  const [name, setName] = useState("Select name from list");
  const [born, setBorn] = useState("");

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const result = useQuery(ALL_AUTHORS);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    updateAuthor({
      variables: { name: name.value, born: Number(born) },
    });

    setBorn("");
  };

  const options = authors.map((author) => {
    return { value: author.name, label: author.name };
  });

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>set birth year</h2>
      <form onSubmit={submit}>
        <Select defaultValue={name} onChange={setName} options={options} />
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
