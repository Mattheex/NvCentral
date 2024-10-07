import config from "../constants.js";

import express from "express";
import { request } from "../global.js";
const router = express.Router();

export const queryLine = (id, visibility) => `
    SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status ?Creator ?CreatorID ?Created ?img
    ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
    ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
    ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
    ?phen_label ?stage_label ?phen_type
    ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
    ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
    WHERE {
          {
         ?line geno:id ${id};
          obo:RO_0000053 ?charac;
          obo:RO_0002354 ?exp;
          rdfs:label ?Line_name;
          obo:IAO_0000118 ?Synonym_line_name;
          obo:GENO_0000608/rdfs:label ?Zygosity;
          obo:RO_0000086/rdfs:label ?Line_type;
          obo:NCIT_C42628/rdfs:label ?Lab_of_origin;
          obo:RO_0002350/rdfs:label ?Generation;
          dcterms:source ?Publication;
          geno:status/rdfs:label ?Status;
          dcterms:creator/sioc:name ?Creator;
          dcterms:creator ?CreatorID;
          dcterms:created ?Created.
          optional {?line foaf:depiction ?img}
    
          ?exp obo:RO_0004009 ?tool;
          obo:RO_0002234 ?gene.
          
          optional {?line obo:RO_0002354/obo:RO_0004009 ?vector.
          ?vector a obo:SO_0000755;
          rdfs:label ?Vector_name.}
    
          ?tool (rdf:type | rdfs:subClassOf) obo:FBcv_0003007;
          rdfs:label ?Molecular_tools.
    
          optional {?exp obo:RO_0004009 ?vector.
          ?vector a obo:SO_0000755;
          rdfs:label ?Vector_name.}
    
          optional{?exp s:constructionDescription ?construction}
          optional{?exp s:mutationType ?mutation_type}
          optional{?exp s:reagentsAndProtocols ?reagents_and_protocols}
          optional{?exp s:vectorDescription ?Vector_description}
    
          ?gene rdfs:label ?Gene_name;
          obo:BFO_0000050/rdfs:label ?Chromosomes_number;
          obo:RO_0002525/rdfs:label ?Mutated_region;
          obo:BAO_0002817/rdfs:label ?Sequence;
          obo:BFO_0000051/rdfs:label ?Promoter;
          obo:RO_0002231/rdfs:label ?Locus_of_insertion;
          s:hasGenomeVersion/rdfs:label ?Genome_version;
          s:hasGenomeDate ?Genome_date;
          s:hasGenomeDetails ?Genome_details;
          s:hasEnsemblID/rdfs:label ?Ensembl_accession_number;
          s:hasGenBankNumber/rdfs:label ?Genbank_accession_number;
          s:hasNvERTxID/rdfs:label ?NvERTx_ID.
         
          ?charac obo:RO_0000053 ?phen.
          optional{?charac obo:RO_0000086 s:Reporter.
          ?phen rdfs:label ?Tag_type.}
          optional {?charac obo:RO_0000086 s:Functional.
                    ?charac rdfs:label ?supp_info}
    
          ?phen s:subLocated/rdfs:label ?sub_label;
          s:cellLocated/rdfs:label ?cell_label;
          s:regionLocated/rdfs:label ?region_label.
    
          ?Publication rdfs:label ?Publication_title.
          optional{?Publication dcterms:date ?Publication_date;
          dcterms:creator ?Publication_creator;
          dcterms:source ?Publication_source;
          rdfs:seeAlso/geno:id ?Publication_id;
          rdfs:seeAlso/rdfs:label ?Publication_name.}
      } UNION {
           ?phenotypes rdf:type/rdfs:label ?phen_type;
                        rdfs:label ?phen_label;
                        obo:RO_0002092/rdfs:label ?stage_label.
          {
            SELECT ?phenotypes WHERE {
              ?line geno:id ${id};
                    obo:RO_0000053/obo:RO_0000053/obo:RO_0000053 ?phenotypes.
    
            }
          }
      }
    }`;

router.get("/line/:id&:visibility", async (req, res) => {
  //console.time("query");
  //console.log(req.params);

  request(queryLine(req.params.id, req.params.visibility), "query")
    .then((data) => {
      //console.timeEnd("query");
      //console.time("formating");

      //console.log(data);

      function loopThroughJSON(obj, newObj, path) {
        for (let key in obj) {
          if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            if (key === "Timeline") {
              newObj["Timeline"] = {};
              newObj["Timeline"]["Title"] = obj[key]["Title"];
              for (let i = 0; i < data["phen_type"].length; i++) {
                newObj[key][data["phen_type"][i]] ||= [];
                newObj[key][data["phen_type"][i]].push({
                  data: data["phen_label"][i],
                  label: data["stage_label"][i],
                });
              }
            } else {
              newObj[key] = {};
              loopThroughJSON(obj[key], newObj[key], path + "-" + key);
            }
          } else if (Array.isArray(obj[key])) {
            newObj[key] = [];
            loopThroughJSON(obj[key], newObj[key], path + "-" + key);
          } else {
            let pathNew = path + "-" + key;
            if (pathNew.includes("Browsers") && pathNew.includes("text")) {
              newObj[key] = obj[key];
            } else if (
              pathNew.includes("Browsers") &&
              pathNew.includes("link") &&
              data[obj[key]] !== undefined
            ) {
              if (pathNew.includes("0")) {
                newObj[key] = `https://www.ensembl.org/Multi/Search/Results?q=${data[obj[key]][0]}`;
              } else if (pathNew.includes("1")) {
                newObj[key] = `https://www.ncbi.nlm.nih.gov/gene/${data[obj[key]][0]}`;
              }
            } else if (pathNew.includes("Associated lines")) {
              const public_name = [...new Set(data[obj[key]])];
              const public_id = [...new Set(data["Publication_id"])];
              newObj[key] = public_name.map((text, index) => ({
                text: text,
                link: "http://localhost:3000/transgenic/" + public_id[index],
              }));
            } else if (pathNew.includes("Added by")) {
              newObj[key] = {
                text: data[obj[key]],
                link: "http://localhost:3000/account/" + data["CreatorID"][0].split("/").pop(),
              };
            } else if (pathNew.includes("Line_ID")) {
              newObj[key] = req.params.id;
            } else if (data[obj[key]] !== undefined && data[obj[key]][0] !== "") {
              newObj[key] = data[obj[key]][0];
            }
          }
        }
        return newObj;
      }

      data = loopThroughJSON(config.structJSON, {}, "");

      //console.log(data["Phenotype"]);

      const replace = (phen, superclass) => {
        for (let i = 0; i < phen.length; i++) {
          if (superclass === "Lethality") {
            phen[i]["number"] = parseFloat(phen[i]["data"]);
            phen[i]["data"] = parseFloat(phen[i]["data"]) + "%";
          } else {
            phen[i]["number"] = (parseInt(phen[i]["data"]) - 1) / 3;
          }
          phen[i]["id"] = data["Phenotype"]["Timeline"]["Title"].indexOf(phen[i]["label"]);
        }
        return phen;
      };

      for (const superclass in data["Phenotype"]["Timeline"]) {
        if (superclass !== "Title") {
          replace(data["Phenotype"]["Timeline"][superclass], superclass);
        }
      }
      //console.timeEnd("formating");
      //console.log(data);
      res.json(data);
    })
    .catch((err) => console.log(err));
});

router.get("/last/date", (req, res) => {
  const query = `
  SELECT ?Created WHERE {
    ?node dcterms:created ?Created.
  } ORDER BY DESC(?Created)`;

  request(query, "query")
    .then((data) => {      
      const date = data["Created"][0].split('-');
      const formattedDate =`${date[2]}/${date[1]}/${date[0]}`
      res.json(formattedDate);
    })
    .catch((err) => console.log(err));
});

export default router;
