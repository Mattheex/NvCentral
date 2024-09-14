import axios from "axios";

export const post = (url, data = undefined) =>
  axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

export const get = (url, data = undefined) => axios.get(url);

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
  auth : {
    loginAccount : '/auth/login',
    addAccount : '/auth/add/account',
    teamAccount : "/auth/delete/teamAccount",
    deleteAccount : 'auth/delete/account'
  }
}