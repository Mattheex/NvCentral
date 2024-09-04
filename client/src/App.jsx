import "./global.scss";
import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import Menu from "./components/menu";
import Header from "./components/header";
import Table from "./components/table";
import NoMatch from "./components/no-match";

import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Main from "./components/main";
import axios from "axios";
import Home from "./components/Home";
import Label from "./components/Label";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { AlertProvider, useAlert } from "./context/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import Stack from "react-bootstrap/Stack";
import Container from "react-bootstrap/esm/Container";
import Option from "./components/Option";
import {
  addAccount,
  deleteAccount,
  getLabs,
  infoAccount,
  loginAccount,
  removeTeamAccount,
  teamAccount,
} from "./api/service";
import { useOnlineStatus } from "./api/store";

function App() {
  const routing = {
    OBI_1000048: "transgenic",
  };

  const [username, setUsername] = useState(null);

  return (
    <Stack className="App">
      <AlertProvider>
        <Routes>
          <Route path="/" element={<Header username={username} setUsername={setUsername} />}>
            <Route path="/" element={<Home routing={routing} />} />
            <Route path="/transgenic" element={<Transgenic routing={routing} />} />
            <Route path="/transgenic/:id" element={<Line section={"read"} />} />
            <Route path="/add/accept/:id" element={<Line section={"accept"} />} />
            <Route path="/add" element={<Add />} />
            <Route path="*" element={<NoMatch />} />
            <Route path="/all/:value" element={<SearchAll routing={routing} />} />
            <Route path="/signIn" element={<Account type={"In"} />} />
            <Route path="/signUp" element={<Account type={"Up"} />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </AlertProvider>
    </Stack>
  );
}

function Account({ type }) {
  const { showAlert } = useAlert();
  const [account, setAccount] = useState({ username: "", password: "", team: "",mail:"" });
  const [teams, setTeams] = useState([{}]);
  const [options, setOptions] = useState([]);
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setAccount((account) => ({ ...account, ...{ [field]: value } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "In") {
      loginAccount(account)
        .then((res) => {
          localStorage.setItem("token", res.data);
          if (state === null) {
            navigate("/");
          } else {
            navigate(state.prev);
          }
          showAlert("Successfully connected", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    } else if (type === "Up") {
      addAccount(account)
        .then((res) => {
          localStorage.setItem("token", res.data);
          if (state === null) {
            navigate("/");
          } else {
            navigate(state.prev);
          }
          showAlert("Account successfully created", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    }
  };

  const updateOption = useCallback(() => {
    getLabs()
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => console.log(err) || showAlert(err.message, "danger"));
  }, [showAlert]);

  const updateAccount = useCallback(() => {
    infoAccount()
      .then((res) => {
        if (res.data !== "no account") {
          setAccount((account) => ({ ...account, ...{ username: res.data.username } }));
        } else {
          setAccount((account) => ({ ...account, ...{ username: "" } }));
        }
      })
      .catch((err) => console.log(err) || showAlert(err.message, "danger"));
  }, [showAlert]);

  const updateTeam = useCallback(() => {
    teamAccount()
      .then((res) => setTeams(res.data))
      .catch((err) => console.log(err) || showAlert(err.message, "danger"));
  }, [showAlert]);

  const handleAccountManagement = (field, value) => {
    if (field === "Remove from team") {
      removeTeamAccount({ node: value })
        .then(() => {
          updateTeam();
          showAlert("Successfully removed from team", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    } else if (field === "Delete account") {
      deleteAccount({ node: value })
        .then(() => {
          updateTeam();
          showAlert("Successfully deleted", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    }
  };

  useEffect(() => {
    if (type === "In" || type === "Up") {
      updateOption();
    } else {
      updateTeam();
      updateAccount();
    }
    updateOption();
  }, [type, updateAccount, updateOption, updateTeam]);

  return (
    <Stack gap={3} className="align-items-center justify-content-center">
      <Card className="w-75 mt-4">
        <Card.Header>
          {type === "In" && "Sign In"}
          {type === "Up" && "Sign Up"}
          {useOnlineStatus("token") !== null && "Account Information"}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="m-3" as={Row}>
              <Form.Label column sm={2}>
                Username
              </Form.Label>
              <Col sm={10}>
                {useOnlineStatus("token") === null && (
                  <Label
                    type="text"
                    value={account["username"]}
                    k="username"
                    placeholder={"username"}
                    handleChange={handleChange}
                  />
                )}
                {useOnlineStatus("token") !== null && (
                  <Label placeholder={account.username} disabled={true} />
                )}
              </Col>
            </Form.Group>
            <Form.Group className="m-3" as={Row}>
              <Form.Label column sm={2}>
                Password
              </Form.Label>
              <Col sm={10}>
                {useOnlineStatus("token") === null && (
                  <Label
                    type="password"
                    value={account["password"]}
                    k="password"
                    placeholder={"password"}
                    handleChange={handleChange}
                  />
                )}
                {useOnlineStatus("token") !== null && (
                  <InputGroup>
                    <Label placeholder={"Type current password"} handleChange={handleChange} />
                    <Button variant="outline-primary">✓</Button>
                  </InputGroup>
                )}
              </Col>
            </Form.Group>

            {type === "Up" && (
              <Form.Group className="m-3" as={Row}>
                <Form.Label column sm={2}>
                  Email
                </Form.Label>
                <Col sm={10}>
                  <Label
                    type="email"
                    value={account["mail"]}
                    k="mail"
                    placeholder={"e-mail"}
                    handleChange={handleChange}
                  />
                </Col>
              </Form.Group>
            )}

            {type === "Up" && (
              <Form.Group className="m-3" as={Row}>
                <Form.Label column sm={2}>
                  Choose a team
                </Form.Label>
                <Col sm={10}>
                  <Option options={options} field={"team"} handleChange={handleChange} />
                </Col>
              </Form.Group>
            )}

            {useOnlineStatus("token") === null && (
              <Form.Group as={Row} className="m-3">
                <Col sm={4}>
                  <Button variant="primary" type="submit">
                    {type === "In" && "To connect"}
                    {type === "Up" && "Create an account"}
                  </Button>
                </Col>
              </Form.Group>
            )}
          </Form>
        </Card.Body>
      </Card>
      {useOnlineStatus("token") !== null && Object.keys(teams[0]).length !== 0 && (
        <Card className="w-75">
          <Card.Header>Manage Team</Card.Header>
          <Card.Body>
            <Table results={teams} handleChange={handleAccountManagement} />
          </Card.Body>
        </Card>
      )}
    </Stack>
  );
}

function SearchAll({ routing }) {
  const { value } = useParams();
  const [selected, setSelected] = useState({
    Value: value,
    "?Type": ["Mutants"],
  });
  const [results, setResults] = useState([{}]);
  const [options, setOptions] = useState([
    {
      type: "switch",
      label: "Mutants",
      field: "?Type",
      checked: true,
    },
  ]);

  const handleChange = (field, value) => {
    if (field === "?Type") {
      if (value.checked) {
        value = [...selected[field], value.value];
      } else {
        value = selected[field].filter((item) => item !== value.value);
      }
    }
    setSelected((selected) => ({ ...selected, ...{ [field]: value } }));
  };

  useEffect(() => {
    axios
      .post("/search/all", selected)
      .then((res) => setResults(res.data))
      .catch((error) => console.error("Error sending data:", error));
  }, [selected, setResults]);

  return (
    <div className="d-flex flex-row flex-grow-1">
      <Menu section={"Options"} types={options} handleChange={handleChange}></Menu>
      <Table title={"All"} results={results} routing={routing}></Table>
    </div>
  );
}

function Transgenic() {
  const [selected, setSelected] = useState({
    "?field": "http://purl.obolibrary.org/obo/OBI_1000048",
    "?Type": ["Reporter", "Functional", "Wild"],
  });

  const [results, setResults] = useState([{}]);
  const [options, setOptions] = useState([
    {
      type: "checkbox",
      label: "Reporter",
      field: "?Type",
      checked: true,
    },
    {
      type: "checkbox",
      label: "Functional",
      field: "?Type",
      checked: true,
    },
    {
      type: "checkbox",
      label: "Wild",
      field: "?Type",
      checked: true,
    },
    {
      type: "label",
      className: "mb-3 mt-3",
      placeholder: "Line name",
      field: "?Name",
    },
    {
      type: "label",
      className: "mb-3 mt-3",
      placeholder: "Gene name",
      field: "?gene_name",
    },
    {
      type: "label",
      className: "mb-3 mt-3",
      placeholder: "Tag name",
      field: "?Tag",
    },
    {
      type: "option",
      className: "mb-3 mt-3",
      field: "?Lab",
      options: [],
    },
    {
      type: "option",
      className: "mb-3 mt-3",
      field: "?cell_label",
      options: [],
    },
  ]);

  const { showAlert } = useAlert();

  const handleChange = useCallback((field, value) => {
    if (field === "?Type") {
      if (value.checked) {
        value = [...selected[field], value.value];
      } else {
        value = selected[field].filter((item) => item !== value.value);
      }
    }
    setSelected((selected) => ({ ...selected, ...{ [field]: value } }));
  },[selected]);

  const searchMutants = useCallback(() => {
    axios
      .post("/search/mutants", selected, {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setResults(res.data);
      })
      .catch((err) => console.log(err) || showAlert(err.message, "danger"));
  }, [selected, setResults, showAlert]);

  const handleDelete = async (e) => {
    const node = e.target.value;
    const { serverError } = await axios.post(`/add/deleted/${node}`);
    if (!serverError) {
      searchMutants();
    }
  };

  useEffect(() => {
    searchMutants();
  }, [searchMutants]);

  useEffect(() => {
    fetch("search/mutants/options").then((res) =>
      res.json().then((data) => {
        setOptions((options) => {
          const newOptions = [...options];
          newOptions[6] = { ...options[6], options: data.lab_label };
          newOptions[7] = { ...options[7], options: data.cell_label };
          return newOptions;
        });
      })
    );
  }, [setOptions]);

  return (
    <div className="d-flex flex-row flex-grow-1">
      <Menu section={"Options"} types={options} handleChange={handleChange} />
      <Container className="tableColor overflow-auto">
        <Stack direction="horizontal" className="justify-content-between p-3 border-bottom">
          <h5 className="m-0">Transgenic Lines</h5>
          <span>{results.length} Results</span>
        </Stack>
        {results[0].length === 0 && <div className="text-center">Nothing to display</div>}
        {results[0].length !== 0 && <Table results={results} handleChange={handleDelete} />}
      </Container>
    </div>
  );
}

function Line({ section }) {
  const [info, setInfo] = useState({
    Summary: {
      Line_ID: "",
      Line_name: "",
      Synonym_line_name: "",
      Line_type: "",
      Generation: "",
      Zygosity: "",
      Lab_of_origin: "",
      Status: "",
    },
    Genetic_modifications: {
      Tag_type: "",
      Molecular_tools: "",
      Vector_name: "",
      Vector_description: "",
      Construction_description: "",
      Mutation_type: "",
      Reagents_and_protocols: "",
    },
    Gene_information: {
      Name: "",
      Sequence: "",
      Promoter: "",
      "Ensembl accession number": "",
      Genbank_accession_number: "",
      NvERTx_ID: "",
    },
    Mutation: {
      "Chromosome's_number": "",
      Locus_of_insertion: "",
      Mutated_region: "",
    },
    Phenotype: {
      Other: {
        "Sub-localization": "",
        Cell_type: "",
        Region_type: "",
      },
      Timeline: {
        Title: ["Embryo stage", "Larval stage", "Metamorphosis", "Adult stage"],
      },
    },
    Genome: {
      "Genome browsers": [],
      "Genome version": "",
    },
    Publication: {
      Title: "",
      Date: "",
      Creator: "",
      Source: [],
      "Associated lines": "",
    },
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    e.preventDefault();
    console.log(e.target.textContent);
    if (e.target.textContent === "Accept") {
      axios
        .get(`/add/accept/${id}`)
        .then(() => {
          navigate("/");
          showAlert("Successfully accepted", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    }
    if (e.target.textContent === "Delete") {
      axios
        .get(`/add/deleted/${id}`)
        .then((res) => {
          navigate("/");
          showAlert("Successfully deleted", "success");
        })
        .catch((err) => console.log(err) || showAlert(err.message, "danger"));
    }
  };

  useEffect(() => {
    let visibility;
    if (section === "read") {
      visibility = "Seen";
    } else {
      visibility = "Unseen";
    }
    fetch(`/get/line/${id}&${visibility}`).then((res) => res.json().then(setInfo));
  }, [id, setInfo, section]);

  return <Main section={section} info={info} handleSubmit={handleChange}></Main>;
}

function Add() {
  const [info, setInfo] = useState({
    Summary: { Line_name: "", Line_type: [], Zygosity: [] },
    Phenotype: { Select: { Phenotype: [], Stage: [] }, Other: {} },
  });
  const [inputAdd, setInputAdd] = useState({
    Line_name: {},
    Synonym_line_name: {},
    Line_type: {},
    Generation: {},
    Zygosity: {},
    Lab_of_origin: {},
    Status: {},
    Exp: { select: false, value: null },
    Charac: { select: false, value: null },
    Tag_type: { select: false, value: null },
    Construction_description: {},
    Mutation_type: {},
    Reagents_and_protocols: {},
    Molecular_tools: {},
    Name: { select: false, value: null },
    Sequence: {},
    Promoter: {},
    "Ensembl accession number": {},
    Genbank_accession_number: {},
    Ensembl_ID: {},
    Genbank_ID: {},
    NvERTx_ID: {},
    "Chromosome's_number": {},
    Locus_of_insertion: {},
    Mutated_region: {},
    "Sub-localization": {},
    Cell_type: {},
    Region_type: {},
    Phenotype: [{}],
    Version: {},
    Date_: {},
    Details: {},
    Publication: {
      Publication: [],
      Collapse: {},
    },
  });

  useEffect(() => {
    fetch(`/add`).then((res) => res.json().then(setInfo));
  }, [setInfo]);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(inputAdd);

    const checkValues = (obj) => {
      for (let key in obj) {
        //console.log(key)
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (!checkValues(obj[key])) {
            return false;
          }
        } else if (
          key === "value" &&
          typeof obj[key] === "string" &&
          !obj[key].startsWith("http://") &&
          obj[key].length > 0
        ) {
          if (!/^[a-zA-Z0-9]+$/i.test(obj[key])) {
            console.log(obj[key]);
            return false;
          }
        }
      }
      return true;
    };

    if (!checkValues(inputAdd)) {
      showAlert("Some data contains non alphanumeric characters", "danger");
      console.log("bad values");
      return;
    }
    axios
      .post("/add/line", inputAdd, {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      })
      .then(() => {
        navigate("/");
        showAlert("Successfully added data", "success");
      })
      .catch((err) => console.error("Error sending data:", err) || showAlert(err.message, "danger"));
  };

  return (
    <Main
      section={"Submit Data"}
      info={info}
      handleSubmit={handleSubmit}
      inputAdd={inputAdd}
      setInputAdd={setInputAdd}
    ></Main>
  );
}

export default App;
