import config from "./constants.js";
import jwt from "jsonwebtoken";
import SparqlClient from "sparql-http-client";
import nodemailer from "nodemailer";

export const client = new SparqlClient({
  endpointUrl: config.endpointUrl[process.env.NODE_ENV],
  user: config.user,
  password: process.env.secretKEY,
});

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.nvcentral@gmail.com",
    pass: process.env.smtpPass,
  },
});

export function request(query, type) {
  query = addPrefix(query);
  const stream = client.query.select(query, {
    headers: {
      "Content-Type": config.queryType[type],
    },
    operation: "postDirect",
  });
  const json = {};

  return new Promise((resolve, reject) => {
    stream.on("data", (row) => {
      for (const [key, value] of Object.entries(row)) {
        json[key] ||= [];
        json[key].push(value.value);
      }
    });

    stream.on("end", () => {
      resolve(json);
    });

    stream.on("error", (err) => {
      console.log(err);
      reject(err);
    });
  });
}

export function verifiyAccount(token) {
  let account;
  if (token == null) {
    account = "Visitor";
  } else {
    jwt.verify(token, process.env.secretKEY, (err, node) => {
      if (err) {
        return [{}];
      }
      account = node.node;
    });
  }

  return account;
}

export const checkRightsData = (account = "Visitor", filter = "") => {
  const query = `
      SELECT DISTINCT 
      (MAX(?Read) as ?read) 
      (MAX(?Write) as ?write) 
      (MAX(?Append) as ?append) 
      (MAX(?Control) as ?control)
      ?node 
      WHERE {
        ac:${account} sioc:member_of*/wac:accessControl ?g.
        
        {
          ?g wac:accessTo ?access.
          ?node obo:NCIT_C42628|geno:status ?access.
        } UNION {
          ?g wac:accessTo ?node.
          FILTER((strstarts(str(?node), str(data:)) || strstarts(str(?node), str(sAc:NvCentral))) && !strstarts(str(?node), str(en:)))
        }
          ${filter}

        BIND(EXISTS { ?g wac:mode wac:Read } AS ?Read)
        BIND(EXISTS { ?g wac:mode wac:Write } AS ?Write)
        BIND(EXISTS { ?g wac:mode wac:Append } AS ?Append)
        BIND(EXISTS { ?g wac:mode wac:Control } AS ?Control)
      } GROUP BY ?node`;

  return query;
};

const prefix = `
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ac: <http://ircan.org/account/>
    PREFIX sioc: <http://rdfs.org/sioc/ns#>
    PREFIX wac:     <http://www.w3.org/ns/auth/acl#>
    PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX data: <http://ircan.org/data/>
    PREFIX en: <http://ircan.org/data/entities/> 
    PREFIX mut: <http://ircan.org/data/mutants/>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sAc:  <http://ircan.org/schema/account/>
    PREFIX xs: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX dcterms:   <http://purl.org/dc/terms/>
    PREFIX bao:       <http://www.bioassayontology.org/bao#>
    PREFIX edam:      <http://edamontology.org/>
    PREFIX efo:       <http://www.ebi.ac.uk/efo/>
`;

const addPrefix = (query) => {
  return `
    ${prefix}
    ${query}`;
};
