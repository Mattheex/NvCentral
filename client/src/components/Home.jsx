import Label from "./Label";
import Button from "react-bootstrap/Button";
import { useEffect, useRef, useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { get } from "../api/service";
import { routing } from "../api/utils";

function SearchResultList({ result, handleChange, routing }) {
  return (
    <ListGroup className="shadow rounded position-absolute z-2 mt-5" variant="flush">
      {result.map((item, key) => (
        <ListGroup.Item
          key={key}
          action
          as={Link}
          to={window.origin + "/" + routing[item.field] + "/" + item.id}
        >
          {item.label}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function Home() {
  const [result, setResult] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [lastData, setLastData] = useState("");
  const inputRef = useRef(null);

  const Search = (field, value) => {
    setInputValue(value);
    console.log(value);
    if (false && value.length > 0) {
      get(`/search/${value}`).then((res) => setResult(res.data));
    } else {
      setResult([]);
    }

    console.log(result);
  };

  const handleChange = (id, label) => {
    setInputValue(label);
    setResult([]);
  };

  const handleBlur = (e) => {
    if (e.relatedTarget === null || e.relatedTarget.className !== "list-group-item list-group-item-action") {
      //setResult([])
    }
  };

  useEffect(() => {
    get("/get/last/date")
      .then((res) => {
        setLastData(res.data);
      })
      .catch((err) => console.log(err));

    const listener = (event) => {
      if (event.code === "Enter") {
        event.preventDefault();
        inputRef.current?.click();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center tableColor home">
      <h6 style={{ position: "absolute", color: "white", top: "15px", right: "15px" }}>
        Last data : {lastData}
      </h6>
      <div className="d-flex flex-column w-50 h-50 shadow-lg p-5 justify-content-between">
        <Form className="d-flex">
          <Label
            className="me-2 shadow-lg"
            placeholder="MyHC1"
            type="search"
            handleChange={Search}
            value={inputValue}
            handleBlur={handleBlur}
          />
          {result.length > 0 && (
            <SearchResultList result={result} handleChange={handleChange} routing={routing} />
          )}
          <Button ref={inputRef} variant="success" as={Link} to={`/all/${inputValue}`}>
            Search
          </Button>
        </Form>
        <div>
          <Label className={"shadow-lg"} rows={3} placeholder={"BLAST sequence"} as={"textarea"} />
          <Button className="mt-2 shadow-lg" variant="success">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
