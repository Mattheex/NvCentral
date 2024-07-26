import Table from 'react-bootstrap/Table';
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";

function Results({title, results, routing, handleDelete}) {
    //console.log(results);
    return (
        <div className="container-fluid p-0 tableColor">
            <div
                className="d-flex flex-grow-1 justify-content-between p-3 border-bottom">
                <div className="h5 m-0">{title}</div>
                <div>{results.length} Results</div>
            </div>
            <div>
                <Table className="table table-striped">
                    <thead className="table-light">
                    <tr>
                        <th scope="col"></th>
                        {Object.keys(results[0]).map((key, index) => (
                            <th key={index} scope="col">{key}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>

                    {results.map((row, index) => (
                        <tr key={index}>
                            <td></td>
                            {Object.entries(row).map(([key, value], index) => {
                                if (typeof value === 'object') {
                                    return <td key={index} className="align-middle"><Link
                                        to={window.origin + '/' + routing[value.field] + '/' + value.link}>{value.label}</Link>
                                    </td>
                                }
                                if (key === 'Action') {
                                    return <td key={index} className="align-middle"><Button variant="danger"
                                                                                            value={value}
                                                                                            onClick={handleDelete}>Delete</Button>
                                    </td>
                                }
                                return <td key={index} className="align-middle">{value}</td>
                            })}
                        </tr>
                    ))}
                    </tbody>
                </Table>
                {Object.keys(results[0]).length === 0 && <div className="text-center">Nothing to display</div>}
            </div>
        </div>
    )
}

export default Results
