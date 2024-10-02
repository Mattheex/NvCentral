import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "./../context/Alert";
import Stack from "react-bootstrap/Stack";
import Card from "react-bootstrap/Card";
import Label from "./../components/Label";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Option from "./../components/Option";
import Table from "../components/table";
import { getLabs, post, teamAccount, URL } from "../api/service";
import defaultUserImg from "../defaultUser.png";
import Image from "react-bootstrap/Image";

function LineForm({ label, value, type, field, options, handleChange }) {
  let left;
  let format = "text";

  if (options !== undefined && options.length !== 0) {
    left = <Option options={options} field={field} handleChange={handleChange} />;
  } else if (type === "In" || type === "Up" || (type === "Account" && field !== "team")) {
    if (field === "password") {
      format = "password";
    } else if (field === "mail") {
      format = "email";
    } else if (field === "pp") {
      format = "file";
    }
    left = <Label type={format} value={value} k={field} placeholder={field} handleChange={handleChange} />;
  } else if (type === "See" || type === "Account") {
    left = <Form.Control plaintext readOnly defaultValue={value} />;
  }

  return (
    <Form.Group className="m-3" as={Row}>
      <Form.Label column sm={2}>
        {label}
      </Form.Label>
      <Col sm={10}>{left}</Col>
    </Form.Group>
  );
}

export default function Account() {
  const { showAlert } = useAlert();
  const [account, setAccount] = useState({ username: "", password: "", team: "", mail: "", pp: "" });
  const [teams, setTeams] = useState([{}]);
  const [options, setOptions] = useState([]);
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  let type;
  if (pathname.split("/").pop() === "signIn") {
    type = "In";
  } else if (pathname.split("/").pop() === "signUp") {
    type = "Up";
  } else if (pathname.split("/").pop() !== "account") {
    type = "See";
  } else {
    type = "Account";
  }

  const handleChange = useCallback(
    (field, value) => {
      setAccount((account) => ({ ...account, ...{ [field]: value } }));
      console.log(account);
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
        .catch((err) => showAlert(err.response.data.message, "danger", err));
    };

    console.log(e.target.id);

    if (type === "In") {
      apiCall(URL.auth.loginAccount);
    } else if (type === "Up") {
      apiCall(URL.auth.addAccount);
    } else if (type === "Account" && e.nativeEvent.submitter.className.includes("primary")) {
      // Edit
      apiCall(URL.auth.editAccount);
    } else {
      // Log Out
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
      .catch((err) => showAlert(err.response.data.message, "danger", err));
  }, [showAlert, setOptions]);

  const updateAccount = useCallback(() => {
    post(URL.auth.infoAccount, { account: params.id })
      .then((res) => {
        console.log(res.data);
        if (res.data !== "no account") {
          setAccount((account) => ({
            ...account,
            ...{ username: res.data.username, mail: res.data.mail, team: res.data.team },
          }));
        } else {
          setAccount((account) => ({ ...account, ...{ username: "" } }));
        }
      })
      .catch((err) => showAlert(err.response.data.message, "danger", err));
  }, [params.id, showAlert]);

  const updateTeam = useCallback(() => {
    teamAccount()
      .then((res) => setTeams(res.data))
      .catch((err) => showAlert(err.response.data.message, "danger", err));
  }, [showAlert, setTeams]);

  const handleAccountManagement = (field, value) => {
    const apiCall = (url) => {
      post(url, { node: value })
        .then(() => {
          updateTeam();
          showAlert("Successfully removed from team", "success");
        })
        .catch((err) => showAlert(err.response.data.message, "danger"));
    };
    if (field === "Remove from team") {
      apiCall(URL.auth.teamAccount);
    } else if (field === "Delete account") {
      apiCall(URL.auth.deleteAccount);
    }
  };

  useEffect(() => {
    if (type === "Up") {
      updateOption();
    } else if (type === "See") {
      updateAccount();
    } else if (type === "Account") {
      updateAccount();
      updateTeam();
    }
  }, [type, updateAccount, updateOption, updateTeam]);

  return (
    <Stack gap={3} className="align-items-center justify-content-center">
      <Card className="w-75 mt-4">
        <Card.Header>
          {type === "In" && "Sign In"}
          {type === "Up" && "Sign Up"}
          {type !== "In" && type !== "Up" && "Account Information"}
        </Card.Header>
        <Card.Body>
          <Form className={type === "Account" && "w-75"} onSubmit={handleSubmit}>
            {type === "Account" && (
              <Image
                roundedCircle
                src={defaultUserImg}
                width="70"
                height="70"
                style={{
                  position: "absolute",
                  top: "65px",
                  right: "7%",
                }}
              />
            )}
            <LineForm
              label="Username"
              value={account.username}
              type={type}
              field="username"
              handleChange={handleChange}
            />
            {type !== "See" && (
              <LineForm
                label="Password"
                value={account.password}
                type={type}
                field="password"
                handleChange={handleChange}
              />
            )}
            {type !== "In" && (
              <>
                <LineForm
                  label="Email"
                  value={account.mail}
                  type={type}
                  field="mail"
                  handleChange={handleChange}
                />
                <LineForm
                  label="Lab"
                  value={account.team}
                  type={type}
                  field="team"
                  options={options}
                  handleChange={handleChange}
                />
              </>
            )}
            {type === "Up" && (
              <LineForm label="Photo" value={account.pp} type={type} field="pp" handleChange={handleChange} />
            )}
            {type !== "See" && (
              <Form.Group as={Row} sm={"auto"} className="m-3">
                <Col>
                  <Button id="basics" variant="primary" type="submit">
                    {type === "In" && "To connect"}
                    {type === "Up" && "Create an account"}
                    {type === "Account" && "Edit"}
                  </Button>
                </Col>
                {type === "Account" && (
                  <Col>
                    <Button id="logOut" variant="danger" type="submit">
                      Log out
                    </Button>
                  </Col>
                )}
              </Form.Group>
            )}
          </Form>
        </Card.Body>
      </Card>
      {type === "Account" && Object.keys(teams[0]).length !== 0 && (
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
