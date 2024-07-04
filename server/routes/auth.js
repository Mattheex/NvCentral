import config from "../constants.js";
import jwt from 'jsonwebtoken'
import express from 'express';
import {request} from "../global.js";

const router = express.Router();

router.post("/login", (req, res) => {
    const {username, password} = req.body;

    const query = `
    PREFIX ac:   <http://ircan.org/account/>
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX s:    <http://ircan.org/schema/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sAc:  <http://ircan.org/schema/account/>
    PREFIX wac:  <http://www.w3.org/ns/auth/acl#>
    PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT ?id ?account WHERE {
      ?account foaf:accountName '${username}';
               sAc:password     '${password}'.
    }`

    request(query, 'query').then(data => {
        if (Object.keys(data).length === 0) {
            res.status(401).json({error: 'Invalid credentials'})
        } else {
            const token = jwt.sign({node: data['account'][0].split('/').pop()}, config.secretKEY)
            res.json({token, username});
        }
    }).catch(error => console.log(error))
})

export default router
