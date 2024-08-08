import config from "../constants.js";
import jwt from "jsonwebtoken";
import express from "express";
import { request, checkRightsData, verifiyAccount } from "../global.js";
import bcrypt from "bcrypt";

const router = express.Router();

export const getRights = async (account, nodeLooking = null) => {
  let filter = "";
  if (nodeLooking !== null) {
    filter = `FILTER(?node = ${nodeLooking})`;
  }
  const query = checkRightsData(account, filter);
  const data = await request(query, "query");

  for (const key in data) {
    if (key !== "node") {
      for (const [i, value] of data[key].entries()) {
        if (nodeLooking !== null) {
          data[key] = value === "true";
        } else {
          data[key][i] = value === "true";
        }
      }
    }
  }
  return data;
};

export const getUsername = async (account) => {
  const query = `
    SELECT ?username WHERE {
        ac:${account} foaf:accountName ?username.
    }`;
  const data = await request(query, "query");
  return data["username"];
};

router.post("/info", async (req, res) => {
  const { node } = req.body;
  const account = verifiyAccount(req.headers["authorization"]);
  if (account === "Visitor") {
    return res.json("no account");
  }
  const username = await getUsername(account).catch((err) => {
    console.log(err);
    res.status(400).send({
      message: err,
    });
  });
  const rights = await getRights(account, node).catch((err) => {
    console.log(err);
    res.status(400).send({
      message: err,
    });
  });

  if (username !== undefined && rights !== undefined) {
    res.json({ username, rights });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `
    SELECT ?id ?account ?password WHERE {
      ?account foaf:accountName '${username}';
               sAc:password     ?password.
    }`;

  request(query, "query")
    .then(async (data) => {
      if (Object.keys(data).length === 0) {
        res.status(401).json({ error: "Invalid username" });
      } else {
        const result = bcrypt.compareSync(password, data.password[0]);
        if (result) {
          const account = data["account"][0].split("/").pop();
          const token = jwt.sign({ node: account }, config.secretKEY);
          res.json(token);
        } else {
          res.status(401).json({ error: "Invalid password" });
        }
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

export default router;
