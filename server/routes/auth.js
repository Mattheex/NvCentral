import config from "../constants.js";
import jwt from 'jsonwebtoken'
import express from 'express';
import {request} from "../global.js";
import bcrypt from 'bcrypt';

const router = express.Router();

export const getRights = async (account) => {
    const query = `
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
    }`

    const data = await request(query, 'query')

    if (!data.hasOwnProperty('modes')) {
        return []
    }

    return data['modes']
}

router.get('/rights/:account', (req, res) => {
    getRights(req.params.account).then(res => {
        res.json(res)
    })
})

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

    SELECT ?id ?account ?password WHERE {
      ?account foaf:accountName '${username}';
               sAc:password     ?password.
    }`

    request(query, 'query').then(async data => {
        console.log(data)
        if (Object.keys(data).length === 0) {
            res.status(401).json({error: 'Invalid credentials'})
        } else {
            let result = bcrypt.compareSync(password, data.password[0])
            if (result) {
                const account = data['account'][0].split('/').pop()
                const token = jwt.sign({node: account}, config.secretKEY)
                const rights = await getRights(account)
                console.log(rights)
                res.json({token, username, rights});
            } else {
                res.status(401).json({error: 'Invalid credentials'})
            }
        }
    }).catch(error => console.log(error))
})

export default router
