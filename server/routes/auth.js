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
        ac:${account} sioc:name ?username.
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
      ?account sioc:name '${username}';
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

router.post("/add/account", (req, res) => {
  const { username, password, mail, team } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  const query = `
    INSERT DATA {
      ac:${username} a sioc:UserAccount ;
                     sioc:member_of <${team}>;
                     sioc:name "${username}";
                     sioc:email "${mail}";
                     sAc:password "${hash}".

      <${team}> sioc:has_member ac:${username}.
    }`;

  request(query, "update")
    .then((data) => {
      const token = jwt.sign({ node: username }, config.secretKEY);
      res.json(token);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

router.post("/get/lab", (req, res) => {
  //const account = verifiyAccount(req.headers["authorization"]);

  const query = `
    SELECT ?node ?label WHERE {
      ?node a sioc:Usergroup, obo:OBI_0003250;
          rdfs:label ?label
    }`;

  request(query, "query")
    .then((data) => {
      data = Object.entries(data).reduce(
        (acc, [key, values]) => {
          values.forEach((value, index) => {
            acc[index] ||= {};
            acc[index][key] = value;
          });
          return acc;
        },
        [{}]
      );
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

router.post("/team", (req, res) => {
  const account = verifiyAccount(req.headers["authorization"]);

  const query = `
    SELECT ?account ?name ?mail WHERE {
      ?lab a sioc:Usergroup;
        sAc:hasDirector ac:${account};
        sioc:has_member ?account.

      ?account sioc:name ?name;
              sioc:email ?mail.

      FILTER(?account != ac:${account})
    }`;

  request(query, "query")
    .then((data) => {
      data = Object.entries(data).reduce(
        (acc, [key, values]) => {
          values.forEach((value, index) => {
            acc[index] ||= {};
            acc[index][key] = value;
          });
          return acc;
        },
        [{}]
      );

      if (Object.keys(data[0]).length !== 0) {
        for (let account of data) {
          const id = account["account"].split("/").pop();
          const token = jwt.sign({ node: id }, config.secretKEY);

          account["name"] = { type: "label", label: account["name"] };
          account["mail"] = { type: "label", label: account["mail"] };
          account["Remove from team"] = {
            type: "btn",
            label: true,
            variant: "warning",
            value: token,
          };
          account["Delete account"] = {
            type: "btn",
            label: true,
            variant: "danger",
            value: token,
          };
          delete account["account"];
        }
      }

      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

router.post("/delete/account", (req, res) => {
  const { node } = req.body;
  const account = verifiyAccount(req.headers["authorization"]);
  const member = verifiyAccount(node);

  const query = `
  DELETE {
    ac:${member} ?y ?z.
  }
  WHERE {
    ?lab sAc:hasDirector ac:${account};
        sioc:has_member ac:${member}.

    ac:${member} ?y ?z.
  }`;

  request(query, "update")
    .then(res.sendStatus(200))
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

router.post("/delete/teamAccount", (req, res) => {
  const { node } = req.body;
  const account = verifiyAccount(req.headers["authorization"]);
  const member = verifiyAccount(node);

  const query = `
  DELETE {
    ?lab sioc:has_member ac:${member}
  }
  WHERE {
    ?lab sAc:hasDirector ac:${account};
        sioc:has_member ac:${member}.
  }`;

  request(query, "update")
    .then(res.sendStatus(200))
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        message: error,
      });
    });
});

export default router;
