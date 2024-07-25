import Table from 'react-bootstrap/Table';
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";

function Results({title, results, rights, routing, handleDelete}) {
    console.log(results);

    const [deleteRight, setDeleteRight] = useState(false);
    const [readRight, setReadRight] = useState(true);

    useEffect(() => {
        const rights = localStorage.getItem('rights')
        if (rights !== null) {
            setReadRight(rights.includes('read'))
            setDeleteRight(rights.includes('write'))
        }
    }, []);

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
                        {deleteRight && <th>Action</th>}
                    </tr>
                    </thead>
                    <tbody>

                    {readRight && results.map((row, index) => (
                        <tr key={index}>
                            <td></td>
                            {Object.values(row).map((value, index) => {
                                if (typeof value === 'object') {
                                    return <td key={index} className="align-middle"><Link
                                        to={window.origin + '/' + routing[value.field] + '/' + value.link}>{value.label}</Link>
                                    </td>
                                }
                                return <td key={index} className="align-middle">{value}</td>
                            })}
                            {deleteRight && <td><Button variant="danger" onClick={handleDelete}>Delete</Button></td>}
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
