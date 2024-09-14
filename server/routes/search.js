import { request, verifiyAccount, checkRightsData } from "../global.js";
import express from "express";
const router = express.Router();

export const searchData = async (filter, account) => {
  console.log(account);

  let queryRights = checkRightsData(account);
  if (account === "Administrator"){
    queryRights = `BIND(true AS ?read).
                    BIND (true AS ?write)`
  }


  const query = `
    SELECT ?field ?ID ?Name ?Type ?Zygosity ?Generation ?Tag ?Tool ?Lab ?Status ?write WHERE {
        ?node rdf:type ?field;
                obo:RO_0002354 ?exp;
                rdfs:label ?Name;
                geno:id ?ID;
                geno:status/rdfs:label ?Status;
                obo:RO_0002354/obo:RO_0002234/rdfs:label ?gene_name;
                obo:RO_0000053/obo:RO_0000053 ?phen;
                obo:GENO_0000608/rdfs:label ?Zygosity;
                obo:RO_0000086/rdfs:label ?Type;
                obo:NCIT_C42628/rdfs:label ?Lab;
                obo:RO_0002350/rdfs:label ?Generation.
                
        ?phen rdfs:label ?Tag;
                s:cellLocated/rdfs:label ?cell_label.
    
        ?exp obo:RO_0004009 ?molecule_tool.
        ?molecule_tool (a | rdfs:subClassOf) obo:FBcv_0003007;
            rdfs:label ?Tool.
            
        ${filter}
        ?node s:visibility s:Seen.
        FILTER(?read = true)
        {
            ${queryRights}
        } 
    }`;

  let data = await request(query, "query");

  console.log(data)

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

  console.log(data);

  let json = [];

  if (Object.keys(data[0]).length !== 0) {
    for (let line in data) {
      let row = data[line];
      let temp = {};
      for (let key in row) {
        if (key === "write") {
          temp["Delete"] = {
            type: "btn",
            label: row[key] === "true",
            variant: "danger",
            value : row["ID"]
          };
        } else if (key === "Name") {
          temp[key] = {
            type: "link",
            label: row[key],
            link: row["ID"],
            field: row["field"].split("/").pop(),
          };
        } else if (key !== "ID" && key !== "field") {
          temp[key] = {
            type: "label",
            label: row[key],
          };
        }
      }
      json.push(temp);
    }
  }

  return json;
};

router.post("/all", (req, res) => {
  let string = "";
  const nodes = [
    "?Name",
    "?Type",
    "?Zygosity",
    "?Type",
    "?Lab",
    "?Generation",
    "?Tag",
    "?Tool",
  ];

  const routing = {
    "Mutants" : "obo:OBI_1000048"
  };

  if (req.body['?field'].length === 0) {
    res.json([])
  }


  for (let key in req.body) {
    if (key === "?field") {
      string += "FILTER (";
      string += req.body[key].map((value) => `${key} = ${routing[value]}`).join(" || ");
      string += ")\n";
    } else {
      string += "FILTER (";
      string += nodes.map((key) => `regex(${key}, '${req.body.Value}')`).join(" || ");
      string += ")\n";
    }
  }

  console.log(string)

  const account = verifiyAccount(req.headers["authorization"]);
  searchData(string, account)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});

router.post("/mutants", (req, res) => {
  let string = "";

  if (req.body['?field'].length === 0) {
    res.json([])
  }

  for (let key in req.body) {
    if (key === "?Type") {
      string += "FILTER (";
      string += req.body[key].map((value) => `${key} = '${value}'`).join(" || ");
      string += ")\n";
    } else if (key === "?field") {
      string += `FILTER (${key} = <${req.body[key]}>)\n`;
    } else {
      if (req.body[key] !== "" && (req.body[key] !== "Tous" || (key !== "?Lab" && key !== "?cell_label"))) {
        string += `FILTER (regex(${key}, '${req.body[key]}'))\n`;
      }
    }
  }


  const account = verifiyAccount(req.headers["authorization"]);
  searchData(string, account)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});

router.post("/mutants/options", async (req, res) => {
  const query = `
    SELECT ?lab_label ?cell_label WHERE {
      ?line obo:RO_0000053 ?charac;
            obo:RO_0000086/rdfs:label ?type_label;
            obo:NCIT_C42628/rdfs:label ?lab_label.

      ?charac obo:RO_0000053 ?phen;
              rdfs:label ?charac_label.
      
      ?phen rdfs:label ?phen_label;
            s:subLocated/rdfs:label ?sub_label;
            s:cellLocated/rdfs:label ?cell_label;
            s:regionLocated/rdfs:label ?region_label.
    }`;

  request(query, "query")
    .then((data) => {
      data["lab_label"] = ["Tous", ...new Set(data["lab_label"])];
      data["lab_label"] = data["lab_label"].map((node, _) => {
        return { node: node, label: node };
      });
      data["cell_label"] = ["Tous", ...new Set(data["cell_label"])];
      data["cell_label"] = data["cell_label"].map((node, _) => {
        return { node: node, label: node };
      });
      res.json(data);
    })
    .catch((err) => console.log(err));
});

export default router;
