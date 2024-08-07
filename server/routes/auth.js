import config from "../constants.js";
import jwt from "jsonwebtoken";
import express from "express";
import { request, checkRightsData } from "../global.js";
import bcrypt from "bcrypt";

const router = express.Router();

export const getRights = async (account, nodeLooking = null) => {
  const query = checkRightsData(account);
  const data = await request(query, "query");

  console.log(data);

  const {read, write, append, control, node } = data;

  if (nodeLooking !== null) {
    const index = node.indexOf(nodeLooking);
    return [
      read[index] === "true",
      write[index] === "true",
      append[index] === "true",
      control[index] === "true",
    ];
  }

  const json = data["node"].reduce(
    (acc, item, index) => ({
      ...acc,
      [item]: [
        read[index] === "true",
        write[index] === "true",
        append[index] === "true",
        control[index] === "true",
      ],
    }),
    {}
  );

  return json;
};

router.get("/rights/:account", (req, res) => {
  getRights(req.params.account).then((data) => {
    res.json(data);
  });
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
      console.log(data);
      if (Object.keys(data).length === 0) {
        res.status(401).json({ error: "Invalid credentials" });
      } else {
        let result = bcrypt.compareSync(password, data.password[0]);
        if (result) {
          const account = data["account"][0].split("/").pop();
          const token = jwt.sign({ node: account }, config.secretKEY);
          const rights = await getRights(account);
          console.log(rights);
          res.json({ token, username, rights });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      }
    })
    .catch((error) => console.log(error));
});

export default router;
