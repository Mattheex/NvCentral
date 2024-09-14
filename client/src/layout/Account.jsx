import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "./../context/Alert";
import Stack from "react-bootstrap/Stack";
import Card from "react-bootstrap/Card";
import { useOnlineStatus } from "./../api/store";
import Label from "./../components/Label";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Option from "./../components/Option";
import Table from "../components/table";
import {
  getLabs,
  infoAccount,
  post,
  teamAccount,
  URL
} from "../api/service";

export default function Account({ type }) {
  const { showAlert } = useAlert();
  const [account, setAccount] = useState({ username: "", password: "", team: "", mail: "" });
  const [teams, setTeams] = useState([{}]);
  const [options, setOptions] = useState([]);
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleChange = useCallback(
    (field, value) => {
      setAccount((account) => ({ ...account, ...{ [field]: value } }));
    },
    [setAccount]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiCall = (url) => {
      post(url, account)
        .then((res) => {
          localStorage.setItem("token", res.data);
          if (state === null) {
            navigate("/");
          } else {
            navigate(state.prev);
          }
          showAlert("Successfully connected", "success");
        })
        .catch((err) => showAlert(err.message, "danger", err));
    };

    if (type === "In") {
      apiCall(URL.auth.loginAccount);
    } else if (type === "Up") {
      apiCall(URL.auth.addAccount);
    } else {
      localStorage.removeItem("token");
      if (state === null) {
        navigate("/");
      } else {
        navigate(state.prev);
      }
    }
  };

  const updateOption = useCallback(() => {
    getLabs()
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => showAlert(err.message, "danger", err));
  }, [showAlert, setOptions]);

  const updateAccount = useCallback(() => {
    infoAccount()
      .then((res) => {
        if (res.data !== "no account") {
          setAccount((account) => ({ ...account, ...{ username: res.data.username } }));
        } else {
          setAccount((account) => ({ ...account, ...{ username: "" } }));
        }
      })
      .catch((err) => showAlert(err.message, "danger", err));
  }, [showAlert, setAccount]);

  const updateTeam = useCallback(() => {
    teamAccount()
      .then((res) => setTeams(res.data))
      .catch((err) => showAlert(err.message, "danger", err));
  }, [showAlert, setTeams]);

  const handleAccountManagement = (field, value) => {
    const apiCall = (url) => {
      post(url, { node: value })
        .then(() => {
          updateTeam();
          showAlert("Successfully removed from team", "success");
        })
        .catch((err) => showAlert(err.message, "danger"));
    };
    if (field === "Remove from team") {
      apiCall(URL.auth.teamAccount);
    } else if (field === "Delete account") {
      apiCall(URL.auth.deleteAccount);
    }
  };

  useEffect(() => {
    if (type === "In" || type === "Up") {
      updateOption();
    } else {
      updateTeam();
      updateAccount();
    }
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

            <Form.Group as={Row} className="m-3">
              <Col sm={4}>
                <Button variant="primary" type="submit">
                  {type === "In" && "To connect"}
                  {type === "Up" && "Create an account"}
                  {useOnlineStatus("token") !== null && "Log out"}
                </Button>
              </Col>
            </Form.Group>
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
