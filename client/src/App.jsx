import "./global.scss";
import "./App.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Header from "./components/header";
import NoMatch from "./components/no-match";

import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Main from "./layout/main";
import Home from "./components/Home";
import { AlertProvider, useAlert } from "./context/Alert";
import Stack from "react-bootstrap/Stack";
import { allFilters } from "./api/utils";
import { get, SearchOptions, post, URL } from "./api/service";
import Account from "./layout/Account";

function App() {
  return (
    <Stack className="App">
      <AlertProvider>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route path="/" element={<Home />} />
            <Route path="/transgenic" element={<Transgenic title={"transgenic"} />} />
            <Route path="/transgenic/:id" element={<Line section={"read"} />} />
            <Route path="/add/accept/:id" element={<Line section={"accept"} />} />
            <Route path="/add" element={<Add />} />
            <Route path="*" element={<NoMatch />} />
            <Route path="/all/:value?" element={<Transgenic title={"All Data"} />} />
            <Route path="/signIn" element={<Account />} />
            <Route path="/signUp" element={<Account />} />
            <Route path="/account/:id" element={<Account />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </AlertProvider>
    </Stack>
  );
}

function Transgenic({ title }) {
  const [options, setOptions] = useState(allFilters[title].options);
  const [selected, setSelected] = useState(allFilters[title].selected);
  const [results, setResults] = useState([{}]);
  const isInitialMount = useRef(true);
  const { showAlert } = useAlert();
  const params = useParams();
  let searchUrl = "";

  //console.log(title);

  const handleChange = useCallback(
    (field, value) => {
      if (field === "?Type" || field === "?field") {
        if (value.checked) {
          value = [...selected[field], value.value];
        } else {
          value = selected[field].filter((item) => item !== value.value);
        }
      }
      setSelected((selected) => ({ ...selected, ...{ [field]: value } }));
      //console.log(selected)
    },
    [selected]
  );

  const searchMutants = useCallback(() => {
    post(searchUrl, selected)
      .then((res) => {
        setResults(res.data);
      })
      .catch((err) => showAlert(err.message, "danger", err));
  }, [searchUrl, selected, showAlert]);

  const searchOptions = useCallback(() => {
    SearchOptions().then((res) => {
      setOptions((options) => {
        const newOptions = [...options];
        newOptions[6] = { ...options[6], options: res.data.lab_label };
        newOptions[7] = { ...options[7], options: res.data.cell_label };
        return newOptions;
      });
    });
  }, [setOptions]);

  const handleDelete = (key, value) => {
    console.log(`/add/deleted/${value}`);
    get(`/add/deleted/${value}`)
      .then(() => {
        searchMutants();
        showAlert("Successfully deleted", "success");
      })
      .catch((err) => showAlert(err.message, "danger", err));
  };

  useEffect(() => {
    if (title === "All Data") {
      searchUrl = "/search/all";
      if (isInitialMount.current) {
        isInitialMount.current = false; // Set to false after the first render
        if (params.value) {
          setSelected((selected) => ({
            ...selected,
            Value: params.value,
          }));
        }
        return;
      }
    } else {
      searchUrl = "/search/mutants";
      searchOptions();
    }
    searchMutants();
  }, [params.value, searchMutants, searchOptions, setSelected, title]);

  return (
    <Main
      section={"Options"}
      info={options}
      handleChangeMenu={handleChange}
      results={results}
      handleChangeTable={handleDelete}
      title={title}
    />
  );
}

function Line({ section }) {
  const [info, setInfo] = useState(allFilters.line);
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.textContent === "Accept") {
      get(`/add/accept/${id}`)
        .then(() => {
          navigate("/");
          showAlert("Successfully accepted", "success");
        })
        .catch((err) => showAlert(err.message, "danger", err));
    }
    if (e.target.textContent === "Delete") {
      get(`/add/deleted/${id}`)
        .then(() => {
          navigate("/");
          showAlert("Successfully deleted", "success");
        })
        .catch((err) => showAlert(err.message, "danger", err));
    }
  };

  useEffect(() => {
    let visibility;
    if (section === "read") {
      visibility = "Seen";
    } else {
      visibility = "Unseen";
    }
    get(`/get/line/${id}&${visibility}`).then((res) => setInfo(res.data));
  }, [id, setInfo, section]);

  return <Main section={section} info={info} handleChangeMenu={handleChange} />;
}

function Add() {
  const [info, setInfo] = useState(allFilters.add.info);
  const [inputAdd, setInputAdd] = useState(allFilters.add.input);

  useEffect(() => {
    get(`/add`).then((res) => setInfo(res.data));
  }, [setInfo]);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(inputAdd);

    const checkValues = (obj) => {
      for (let key in obj) {
        if (key === "Image") {
          continue;
        }
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

    if (inputAdd.Image !== "") {
      const formData = new FormData();
      formData.append("image", inputAdd.Image.file, "lines&" + inputAdd.Image.filename);

      post(URL.upload.img, formData, "multipart/form-data").catch((err) =>
        showAlert(err.message, "danger", err)
      );
    }

    console.log(inputAdd);
    post("/add/line", inputAdd)
      .then(() => {
        navigate("/");
        showAlert("Successfully added data", "success");
      })
      .catch((err) => showAlert(err.message, "danger", err));
  };

  return (
    <Main
      section={"Submit Data"}
      info={info}
      handleChangeMenu={handleSubmit}
      inputAdd={inputAdd}
      setInputAdd={setInputAdd}
    />
  );
}

export default App;
