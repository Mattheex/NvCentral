import axios from "axios";

export const post = (url, data = undefined, content = "application/json") =>
  axios.post(url, data, {
    headers: {
      "Content-Type": content,
      Authorization: localStorage.getItem("token"),
    },
  });

export const get = (url) => axios.get(url, { headers: { "Content-type": "application/json" } });

export const loginAccount = (data) => post("/auth/login", data);
export const addAccount = (data) => post("/auth/add/account", data);
export const getLabs = () => post("/auth/get/lab");
export const teamAccount = () => post("/auth/team");
export const removeTeamAccount = (data) => post("/auth/delete/teamAccount", data);
export const infoAccount = (data) => post("/auth/info", data);
export const deleteAccount = (data) => post("auth/delete/account", data);

export const SearchMutants = (data) => post("/search/mutants", data);
export const SearchOptions = () => post("search/mutants/options");

export const URL = {
  auth: {
    infoAccount: "/auth/info",
    rightsAccount: "/auth/info/rights",
    loginAccount: "/auth/login",
    addAccount: "/auth/add/account",
    editAccount: "/auth/edit/account",
    teamAccount: "/auth/delete/teamAccount",
    deleteAccount: "auth/delete/account",
  },
  upload: {
    img: "/upload/img",
  },
};
