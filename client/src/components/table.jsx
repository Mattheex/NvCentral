import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
//import TableHeader from "./Table/TableHeader";
import { routing } from "../../src/api/utils";

function TableHeader({ columns }) {
  return (
    <thead className="table-light">
      <tr>
        <th scope="col"></th>
        {columns.map((key, index) => (
          <th key={index} scope="col">
            {key}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Results({ results, handleChange }) {
  console.log(results);
  const columns = Object.keys(results[0]);
  return (
    <Table className="table table-striped">
      <TableHeader columns={columns} />
      <tbody>
        {results.map((row, index) => (
          <tr key={index}>
            <td></td>
            {Object.entries(row).map(([key, value], index) => (
              <td key={index} className={`align-middle`}>
                {value.type === "link" && (
                  <Link to={window.origin + "/" + routing[value.field] + "/" + value.link}>
                    {value.label}
                  </Link>
                )}
                {value.type === "btn" && value.label && (
                  <Button
                    className="mx-auto"
                    variant={value.variant}
                    onClick={(e) => handleChange(key, value.value)}
                  >
                    X
                  </Button>
                )}
                {value.type === "label" && value.label}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default Results;
