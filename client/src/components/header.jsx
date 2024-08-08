import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, Outlet, useLocation } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";
import { useEffect, useState } from "react";
import { useAlert } from "../context/Alert";
import axios from "axios";
import { useOnlineStatus } from "../api/store";

function DropDown({ sub, field, append }) {
  return (
    <NavDropdown title={field} id="basic-nav-dropdown">
      <div className="d-flex p-2">
        {Object.entries(Object.entries(sub)).map(([index, [field, links]]) => (
          <div key={index} className={index !== sub.length - 1 ? "m-1 me-4" : "m-1"}>
            <p className="h7 fs-5 mb-0 me-4 text-nowrap">{field}</p>
            <hr className="dropdown-divider m-0" />
            {Object.entries(Object.entries(links)).map(
              ([index, [label, link]]) =>
                (label !== "Submit data" || (append && label === "Submit data")) && (
                  <NavDropdown.Item key={index} className="p-0 mt-2" as={Link} to={link}>
                    {label}
                  </NavDropdown.Item>
                )
            )}
          </div>
        ))}
      </div>
    </NavDropdown>
  );
}

function Header() {
  const { alert, showAlert } = useAlert();

  const token = useOnlineStatus("token");
  const [username, setUsername] = useState(null);
  const [rights, setRights] = useState({});

  useEffect(() => {
    function fetchData() {
      axios
        .post(
          `auth/info`,
          { node: "sAc:NvCentral" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        )
        .then((res) => {
          if (res.data !== "no account") {
            setUsername(res.data.username);
            setRights(res.data.rights);
          } else {
            setUsername(null);
            setRights({});
          }
        })
        .catch((err) => {
          console.log(err);
          setUsername(null);
          setRights({});
          showAlert(err.message, "danger");
        });
    }
    fetchData();
  }, [token, setUsername, setRights, showAlert]);

  const location = useLocation();
  const isHome = location.pathname === "/";
  const links = {
    Research: {
      Search: {
        Omics: "/omics",
        Mutants: "/transgenic",
      },
      Exploration: {
        RNAseq: "/rna",
        ATACseq: "/atac",
      },
    },
    Resources: {
      General: {
        Images: "/images",
        Publications: "/publications",
      },
      BLAST: {
        Ensembl: "/ensembl",
        NCBI: "/NCBI",
      },
    },
    About: {
      "Using NvCentral": {
        Glossary: "/glossary",
        "Submit data": "/add",
        "Reporting bug": "/bug",
        "Terms of Use": "/terms",
      },
      "About Us": {
        "About NvCentral": "/about",
        "Teams & Facilities": "/teams",
        "Contact Us": "/contact",
      },
    },
  };

  return (
    <div className="d-flex flex-column h-100 header">
      <Navbar
        className={isHome ? "bg-transparent fw-bold p-2" : "bg-primary fw-bold p-2"}
        style={{ position: "fixed", top: 0, zIndex: 2, width: "100%" }}
        variant="dark"
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="align-items-center">
            NvCentral
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="collapse navbar-collapse mb-lg-0 mb-2">
            {Object.entries(Object.entries(links)).map(([index, [label, sub]]) => (
              <DropDown key={index} sub={sub} field={label} append={rights.append} />
            ))}
          </Nav>
          <Nav className="ms-auto me-2">
            {username === null && (
              <Nav.Link as={Link} to={`/signIn`} state={{ prev: location.pathname }}>
                Log In
              </Nav.Link>
            )}
            {username !== null && (
              <NavDropdown title={username} id="basic-nav-dropdown">
                <NavDropdown.Item
                  className=""
                  as={Link}
                  onClick={() => {
                    localStorage.removeItem("token");
                  }}
                >
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <InputGroup
            className={isHome ? "" : "m-0"}
            style={{
              width: "initial",
              transition: "margin 1s ",
              marginRight: "-295px",
            }}
          >
            <Form.Control type="search" placeholder="Search" aria-label="Search" />
            <Button variant="success" component={Link} to={"/all"}>
              Search
            </Button>
          </InputGroup>
        </Container>
      </Navbar>
      {alert && (
        <Alert
          variant={alert.variant}
          className={"position-absolute z-3"}
          style={{ top: "20px", left: "20px" }}
        >
          {alert.message}
        </Alert>
      )}
      <Outlet />
      <Navbar className={isHome ? "bg-transparent fw-bold" : "bg-primary fw-bold"} variant="dark">
        <Nav className="d-flex justify-content-evenly flex-grow-1">
          <Nav.Link href="#genome">Images</Nav.Link>
          <Nav.Link href="#genome">Publication</Nav.Link>
          <Nav.Link href="#genome">Reporting bugs</Nav.Link>
          <Nav.Link href="#genome">Contact Us</Nav.Link>
        </Nav>
      </Navbar>
    </div>
  );
}

export default Header;
