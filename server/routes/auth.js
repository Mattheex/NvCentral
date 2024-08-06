import config from "../constants.js";
import jwt from "jsonwebtoken";
import express from "express";
import { request } from "../global.js";
import bcrypt from "bcrypt";

const router = express.Router();

export const getRights = async (account) => {
  /*const query = `
    PREFIX ac:   <http://ircan.org/account/>
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX s:    <http://ircan.org/schema/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sAc:  <http://ircan.org/schema/account/>
    PREFIX wac:  <http://www.w3.org/ns/auth/acl#>
    PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT ?modes WHERE {
      ?access a         wac:Authorization ;
             wac:agent ac:${account}.
      ?access wac:mode/rdfs:label ?modes.
    }`*/
  const query = `
    PREFIX : <http://ircan.org/account/>
    PREFIX sioc: <http://rdfs.org/sioc/ns#>
    PREFIX wac:     <http://www.w3.org/ns/auth/acl#>
    
    SELECT DISTINCT ?modes ?access WHERE {
        :${account} sioc:member_of*/wac:accessControl ?g.
        ?g wac:mode ?modes;
           wac:accessTo ?access.
                      
    }`;

  const data = await request(query, "query");
  /*const json = []


    for (let index = 0; index < Object.keys(data['modes']).length; index++) {
        json.push({
            modes: data['modes'][index], // Access using the key at the current index
            access: data['access'][index] // Access using the corresponding key
        });
    }*/

  if (!data.hasOwnProperty("modes")) {
    return [];
  }

  const json = data["modes"].map((key, index) => ({
    modes: key,
    access: data["access"][index],
  }));

  console.log(json);

  return json;
};

export const checkRightsData = async (node, account = "visitor") => {
  const query = `
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://ircan.org/account/>
    PREFIX sioc: <http://rdfs.org/sioc/ns#>
    PREFIX wac:     <http://www.w3.org/ns/auth/acl#>
    PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX data: <http://ircan.org/data/>
    
    SELECT DISTINCT ?modes ?node WHERE {
      :${account} sioc:member_of*/wac:accessControl ?g.
      ?g wac:mode ?modes.
        
      {
        ?g wac:accessTo ?access.
        ?node obo:NCIT_C42628|geno:status ?access.
      } UNION {
        ?g wac:accessTo ?node.
        FILTER(strstarts(str(?node), str(data:)) || strstarts(str(?node), str(:NvCentral)))
      }
    }`;

  const data = await request(query, "query");

  console.log(data);
  const modes = data["node"].findIndex(x => x === node);
  return modes;
};

router.get("/rights/:account", (req, res) => {
  getRights(req.params.account).then((data) => {
    res.json(data);
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `
    PREFIX ac:   <http://ircan.org/account/>
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX s:    <http://ircan.org/schema/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sAc:  <http://ircan.org/schema/account/>
    PREFIX wac:  <http://www.w3.org/ns/auth/acl#>
    PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>

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
