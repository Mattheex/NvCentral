import express from "express";
import { request, verifiyAccount, transporter } from "../global.js";
import config from "../constants.js";
import zlib from "zlib";

const router = express.Router();

export const findID = async () => {
  let query = ` 
    SELECT (MAX(?id) as ?max) WHERE {
      ?line a obo:OBI_1000048;
            geno:id ?id.
    }`;

  let data = await request(query, "query");
  if (!data.hasOwnProperty("max")) {
    return 0;
  }

  return parseInt(data["max"][0]) + 1;
};

export const JSONToSPARQL = (id, newData, account) => {
  const json = {
    Line_name: {
      nodeType: "obo:OBI_1000048",
      nodeName: "Line",
      NA: false,
      nodeID: "",
    },
    Synonym_line_name: {
      property: "obo:IAO_0000118",
      NA: false,
    },
    Line_type: {
      property: "obo:RO_0000086",
      NA: false,
    },
    Generation: {
      property: "obo:RO_0002350",
      NA: false,
      nodeType: "obo:NCIT_C88214",
      nodeName: "Generation",
      prefix: "en:",
    },
    Zygosity: {
      property: "obo:GENO_0000608",
      NA: false,
    },
    Lab_of_origin: {
      property: "obo:NCIT_C42628",
      NA: false,
      nodeType: "obo:OBI_0003250",
      nodeName: "Lab",
      prefix: "en:",
    },
    Status: {
      property: "geno:status",
      NA: false,
    },
    Exp: {
      property: "obo:RO_0002354",
      nodeType: "obo:OBI_0001154",
      nodeName: "Experience",
      NA: false,
      label: false,
      nodeID: "",
    },
    Tag_type: {
      property: "obo:RO_0000053",
      NA: true,
      nodeType: "bao:BAO_0170002",
      nodeName: "Tag",
      nodeID: "",
      label: true,
    },
    Molecular_tools: {
      property: "obo:RO_0004009",
      NA: false,
      nodeType: "obo:FBcv_0003007",
      nodeName: "MolecularTool",
    },
    Vector_name: {
      property: "obo:RO_0004009",
      NA: false,
      nodeType: "obo:SO_0000755",
      nodeName: "Vector",
    },
    Vector_description: {
      property: "s:vectorDescription",
    },
    Construction_description: {
      property: "s:constructionDescription",
    },
    Mutation_type: {
      property: "s:mutationType",
    },
    Reagents_and_protocols: {
      property: "s:reagentsAndProtocols",
    },
    Name: {
      property: "obo:RO_0002234",
      nodeType: "obo:SO_0000704",
      nodeName: "Gene",
      NA: false,
      nodeID: "",
      label: true,
    },
    Sequence: {
      property: "obo:BAO_0002817",
      NA: true,
      nodeType: "obo:SO_0000104",
      nodeName: "Sequence",
    },
    Promoter: {
      property: "obo:BFO_0000051",
      NA: true,
      nodeType: "obo:SO_0000167",
      nodeName: "Promoter",
    },
    Locus_of_insertion: {
      property: "obo:RO_0002231",
      NA: true,
      nodeType: "obo:SO_0000179",
      nodeName: "Locus",
    },
    "Ensembl accession number": {
      property: "s:hasEnsemblID",
      NA: true,
      nodeType: "edam:data_2610",
      nodeName: "Ensembl",
    },
    Genbank_accession_number: {
      property: "s:hasGenBankNumber",
      NA: true,
      nodeType: "obo:SO_0000704",
      nodeName: "GenBank",
    },
    NvERTx_ID: {
      property: "s:hasNvERTxID",
      NA: true,
      nodeType: "obo:SO_0000704",
      nodeName: "NvERTxID",
    },
    "Genome version": {
      property: "s:hasGenomeVersion",
      NA: true,
      nodeType: "obo:SO_0000704",
      nodeName: "GenomeVersion",
    },
    "Chromosome's_number": {
      property: "obo:BFO_0000050",
      NA: true,
      nodeType: "obo:SO_0000340",
      nodeName: "Chromosome",
    },
    Mutated_region: {
      property: "obo:RO_0002525",
      NA: true,
      nodeType: "obo:SO_0001148",
      nodeName: "MutatedRegion",
    },
    Charac: {
      property: "obo:RO_0000053",
      nodeType: "obo:OBI_0600043",
      nodeName: "Characteristic",
      NA: false,
      nodeID: "",
    },
    Phenotype: {
      property: "obo:RO_0000053",
      nodeName: "Phenotype",
    },
    "Genome browsers": {
      property: "obo:RO_0000053",
      NA: true,
      nodeName: "Browsers",
    },
    Title: {
      property: "dcterms:source",
      NA: false,
      nodeType: "obo:NCIT_C48471",
      nodeName: "Publication",
      nodeID: "",
    },
    Date: {
      property: "dcterms:date",
      NA: false,
    },
    Creator: {
      property: "dcterms:creator",
      NA: false,
    },
    Source: {
      property: "dcterms:source",
      NA: false,
    },
    Ensembl_ID: { property: "s:hasEnsemblID", nodeType: "obo:SO_0000704", nodeName: "Ensembl" },
    Genbank_ID: { property: "s:hasGenBankNumber", nodeType: "obo:SO_0000704", nodeName: "GenBank" },
    Version: {
      property: "s:hasGenomeVersion",
      nodeType: "owl:Class",
      subClassOf: "obo:NCIT_C164815",
      prefix: "s:",
    },
    Date_: {
      property: "s:hasGenomeDate",
    },
    Details: {
      property: "s:hasGenomeDetails",
    },
    "Sub-localization": {
      property: "s:subLocated",
      nodeType: "owl:Class",
      NA: true,
      subClassOf: "obo:CARO_0000000",
      nodeName: "SubLocal",
      prefix: "s:",
    },
    Cell_type: {
      property: "s:cellLocated",
      nodeType: "owl:Class",
      subClassOf: "obo:GO_0110165",
      nodeName: "CellType",
      prefix: "s:",
      NA: true,
    },
    Region_type: {
      property: "s:regionLocated",
      nodeType: "owl:Class",
      subClassOf: "obo:UBERON_0036215",
      nodeName: "RegionType",
      prefix: "s:",
      NA: true,
    },
    "Associated lines": {
      property: "rdfs:seeAlso",
      NA: false,
    },
    Publication: {
      property: "dcterms:source",
      nodeType: "obo:NCIT_C48471 ",
      nodeName: "Publication",
      NA: true,
    },
  };

  function nullCase(parentNode, type) {
    if (type.hasOwnProperty("nodeType")) {
      return `${parentNode} ${type.property} s:NA.\n`;
    }
    return `${parentNode} ${type.property} \"NA\".\n`;
  }

  const addProperty = (parentNode, inJson) => {
    let string = "";
    for (let key in inJson) {
      let item = inJson[key];
      if (item.hasOwnProperty("select")) {
        if (item.select) {
          if (item.value === "Autre") {
            string += nullCase(parentNode, json[key]);
          } else {
            string += parentNode + " " + json[key]["property"] + " <" + item.value + ">.\n";
          }
        } else {
          if (item.value === "") {
            string += nullCase(parentNode, json[key]);
          } else {
            if (json[key].hasOwnProperty("nodeType")) {
              let prefix = "mut:";
              if (json[key].hasOwnProperty("prefix")) {
                prefix = json[key]["prefix"];
              }
              let nodeValue = "";
              if (item.value !== null) {
                nodeValue = item.value.replaceAll(/[^\x00-\x7F]/g, "").replaceAll(" ", "");
              }
              let newNode = prefix + json[key].nodeName + nodeValue + id;
              json[key]["nodeID"] = newNode;
              if (parentNode !== null) {
                string += parentNode + " " + json[key]["property"] + " " + newNode + ".\n";
              }
              string += newNode + " rdf:type " + json[key]["nodeType"] + ".\n";

              if (item.value !== null) {
                string += newNode + ' rdfs:label "' + item.value + '".\n';
              } else if (json[key].hasOwnProperty("label") && json[key]) {
                string += newNode + ' rdfs:label "NA".\n';
              }
              if (json[key].hasOwnProperty("subClassOf")) {
                string += newNode + " rdfs:subClassOf " + json[key]["subClassOf"] + ".\n";
              }
            } else {
              string += parentNode + " " + json[key]["property"] + ' "' + item.value + '".\n';
            }
          }
        }
      } else {
        string += nullCase(parentNode, json[key]);
      }
    }
    return string;
  };

  const addPhenotype = (parentNode, inJson) => {
    let string = "";
    for (let item of inJson["Phenotype"]) {
      let newNode =
        "mut:" +
        json["Phenotype"].nodeName +
        item.phenotype.split("/").slice(-1) +
        item.stage.split("/").slice(-1) +
        id;
      string += parentNode + " " + json["Phenotype"]["property"] + " " + newNode + ".\n";
      string += newNode + " rdf:type " + " <" + item.phenotype + ">.\n";
      string += newNode + " rdfs:label '" + item.value + "'.\n";
      string += newNode + " obo:RO_0002092 " + " <" + item.stage + ">.\n";
    }
    return string;
  };

  const subJson = (inJSon, keys) => {
    return keys.reduce((acc, key) => {
      if (inJSon.hasOwnProperty(key)) {
        acc[key] = inJSon[key];
      }
      return acc;
    }, {});
  };

  if (newData.hasOwnProperty("Title")) {
    addProperty(null, subJson(newData, ["Line_name"]));
    newData["Associated lines"] = {
      select: true,
      value:
        "http://ircan.org/data/mutants/" +
        json.Line_name.nodeID.substring(json.Line_name.nodeID.indexOf(":") + 1),
    };
    delete newData.Publication;
  } else if (newData.Publication.value === "Autre") {
    newData["Title"] = newData.Publication;
    delete newData.Publication;
  }

  if (newData.hasOwnProperty("Supplementary_information")) {
    newData["Tag_type"] = newData["Supplementary_information"];
    delete newData["Supplementary_information"];
  }

  const dateString = () => {
    const date_time = new Date();
    const date = ("0" + date_time.getDate()).slice(-2);
    const month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    const year = date_time.getFullYear();
    return year + "-" + month + "-" + date;
  };

  return `
    INSERT DATA {
        ${addProperty(null, subJson(newData, ["Line_name"]))}
        ${json.Line_name.nodeID} geno:id ${id}.
        ${addProperty(
          json.Line_name.nodeID,
          subJson(newData, [
            "Synonym_line_name",
            "Line_type",
            "Generation",
            "Zygosity",
            "Lab_of_origin",
            "Title",
            "Status",
          ])
        )}
        
        ${addProperty(json.Line_name.nodeID, subJson(newData, ["Exp", "Charac"]))}
        ${addProperty(
          json.Exp.nodeID,
          subJson(newData, [
            "Name",
            "Molecular_tools",
            "Vector_name",
            "Construction_description",
            "Mutation_type",
            "Reagents_and_protocols",
            "Vector_description",
          ])
        )}
    
        ${addProperty(
          json.Name.nodeID,
          subJson(newData, [
            "Sequence",
            "Promoter",
            "Locus_of_insertion",
            "Chromosome's_number",
            "Mutated_region",
            "Version",
            "Date_",
            "Details",
            "Ensembl_ID",
            "Genbank_ID",
            "NvERTx_ID",
          ])
        )}
        
        ${addProperty(json.Charac.nodeID, subJson(newData, ["Line_type", "Tag_type"]))}
        
        ${addPhenotype(json.Tag_type.nodeID, subJson(newData, ["Phenotype"]))}
        ${addProperty(
          json.Tag_type.nodeID,
          subJson(newData, ["Sub-localization", "Cell_type", "Region_type"])
        )}
        
        ${addProperty(json.Title.nodeID, subJson(newData, ["Date", "Creator", "Source", "Associated lines"]))}
        ${json.Line_name.nodeID} s:visibility s:Unseen.
        ${json.Line_name.nodeID} dcterms:creator ac:${account}.
        ${json.Line_name.nodeID} dcterms:created ${dateString()}^^xsd:Date.

        ac:${account}Access${json.Line_name.nodeID} a   wac:Authorization ;
                                                    wac:agent    ac:${account};
                                                    wac:mode     wac:Read, wac:Write;
                                                    wac:accessTo mut:${json.Line_name.nodeID}.

        ac:${account} wac:accessControl ac:${account}Access${json.Line_name.nodeID}.
    }`;
};

export const sendEmail = async (account, ID) => {
  const query = `
    SELECT ?mail WHERE {
        ac:${account} sioc:member_of/sAc:hasDirector/sioc:email ?mail.
    }`;

  let data = await request(query, "query");

  if (Object.keys(data).length !== 0) {
    const mailOptions = {
      from: "noreply.nvcentral@gmail.com",
      to: data["mail"][0],
      subject: "Please accept the submitted data from NvCentral",
      text: `Hello,\n\nPending acceptance http://localhost:3000/add/accept/${ID}\n\nKind regards,\nNvCentral`,
    };

    let status = transporter.sendMail(mailOptions);
    return status;
  }
  await changeVisibilityNode(ID);
  return "no director";
};

const queryDeleteDatabase = (id, query) => {
  query = query.replace("INSERT", "DELETE");
  const deflated = zlib.deflateSync(query).toString("hex");
  return `
    INSERT DATA {
        mut:DELETE${id} rdf:type schema:DeleteAction;
                     geno:id ${id};
                     rdfs:label "${deflated}".
    }`;
};

router.post("/line/", async (req, res) => {
  const account = verifiyAccount(req.headers["authorization"]);
  const ID = await findID();
  console.log(`ID ${ID}`);
  const query = JSONToSPARQL(ID, req.body, account);
  console.log(`Query ${query}`);
  const deleteQuery = queryDeleteDatabase(ID, query);
  console.log(`Compte ${account}`);
  sendEmail(account, ID).then((r) => console.log(r));
  request(query, "update")
    .then((data) => {
      console.log(data);
      console.log(deleteQuery);
      request(deleteQuery, "update")
        .then((data) => res.json(data))
        .catch((err) =>
          res.status(400).send({
            message: err,
          })
        );
    })
    .catch((err) => console.log(err));
});

export const changeVisibilityNode = (id) => {
  const query = `
    DELETE {
    ?line s:visibility s:Unseen.
    } INSERT {
    ?line s:visibility s:Seen.
    } WHERE {
    ?line geno:id ${id};
          s:visibility s:Unseen.
    }`;

  return request(query, "update");
};

router.get("/accept/:node", (req, res) => {
  const { node } = req.params;
  changeVisibilityNode(node)
    .then((data) => {
      console.log(data);
      res.send("Data has been accepted");
    })
    .catch((err) => console.log(err));
});

export const deleteNode = async (node) => {
  const selectQuery = `
    SELECT ?queryZip WHERE {
        ?node rdf:type schema:DeleteAction;
                     geno:id ${node};
                     rdfs:label ?queryZip.
    }`;
  const deleteQuery = `
    DELETE {
        ?node rdf:type schema:DeleteAction.
        ?node geno:id ${node}.
        ?node rdfs:label ?zip.
    } WHERE {
        ?node rdf:type schema:DeleteAction.
        ?node geno:id ${node}.
        ?node rdfs:label ?zip.
    }`;
  try {
    const selectData = await request(selectQuery, "query");
    const inflatedData = zlib.inflateSync(new Buffer.from(selectData["queryZip"][0], "hex")).toString();
    await request(inflatedData, "update");
    await request(deleteQuery, "update");
    return { success: true, message: "Data has been deleted" };
  } catch (err) {
    console.log(err);
    return { success: false, message: err.message || err };
  }
};

router.get("/deleted/:node", async (req, res) => {
  const { node } = req.params;
  const result = await deleteNode(node);
  console.log(result);
  if (result.success) {
    res.send(result.message);
  } else {
    console.log(result);
    res.status(400).send({
      message: result.message,
    });
  }
});

const AddExistingNodes = async (field, value) => {
  const json = {
    Line_type: {
      nodeType: "obo:NCIT_C25360",
      internData: false,
      schemaData: true,
    },
    Generation: {
      nodeType: "obo:NCIT_C88214",
      internData: true,
      schemaData: false,
    },
    Zygosity: {
      nodeType: "obo:GENO_0000391",
      internData: false,
      schemaData: false,
    },
    Lab_of_origin: {
      nodeType: "obo:OBI_0003250",
      internData: true,
      schemaData: false,
    },
    Status: {
      nodeType: "efo:EFO_0001742",
      internData: false,
      schemaData: true,
    },
    Molecular_tools: {
      nodeType: "obo:FBcv_0003007",
      internData: false,
      schemaData: false,
    },
    Stage: {
      nodeType: "obo:UBERON_0000105",
      internData: false,
      schemaData: true,
    },
    Phenotype: {
      nodeType: "obo:PATO_0000001",
      internData: false,
      schemaData: true,
    },
    "Sub-localization": {
      nodeType: "obo:CARO_0000000",
      internData: false,
      schemaData: true,
    },
    Cell_type: {
      nodeType: "obo:GO_0110165",
      internData: false,
      schemaData: true,
    },
    Region_type: {
      nodeType: "obo:UBERON_0036215",
      internData: false,
      schemaData: true,
    },
    Version: {
      nodeType: "obo:NCIT_C164815",
      internData: false,
      schemaData: true,
    },
    Publication: {
      nodeType: "obo:NCIT_C48471",
      internData: true,
      schemaData: false,
    },
  };

  if (!json.hasOwnProperty(field)) {
    return {};
  }

  let query = `
    SELECT * WHERE {
          ?node (rdf:type | rdfs:subClassOf) ${json[field].nodeType}.
          ?node rdfs:label ?label
          ${json[field].internData ? "FILTER(strstarts(str(?node), str(data:)))" : ""}
          ${json[field].schemaData ? "FILTER(strstarts(str(?node), str(s:)))" : ""}
          FILTER(regex(lcase(?label), lcase("${value}")))
    } ORDER BY (?label) LIMIT 20`;

  let data = await request(query, "query");

  if (Object.keys(data).length !== 0) {
    data = data.node.map((node, index) => ({ node: node, label: data.label[index] }));
  } else {
    data = [];
  }
  if (field === "Publication") {
    data.unshift({ node: "Autre", label: "Autre" });
  } else {
    data.push({ node: "Autre", label: "Autre" });
  }

  return data;
};

router.get("/", async (req, res) => {
  const json = JSON.parse(JSON.stringify(config.structJSON));
  json.Summary.Line_type = await AddExistingNodes("Line_type", "");
  json.Summary.Generation = await AddExistingNodes("Generation", "");
  json.Summary.Zygosity = await AddExistingNodes("Zygosity", "");
  json.Summary.Lab_of_origin = await AddExistingNodes("Lab_of_origin", "");
  json.Summary.Status = await AddExistingNodes("Status", "");
  json.Genetic_modifications.Tag_type = {
    type: "text",
    collapse: { field: "Line_type", value: "http://ircan.org/schema/Reporter" },
  };
  json.Genetic_modifications.Molecular_tools = await AddExistingNodes("Molecular_tools", "");
  json.Genetic_modifications.Vector_description = "textarea";
  json.Genetic_modifications.Construction_description = "textarea";
  json.Genetic_modifications.Mutation_type = "textarea";
  json.Genetic_modifications.Reagents_and_protocols = "textarea";

  json.Phenotype.Other["Sub-localization"] = await AddExistingNodes("Sub-localization", "");
  json.Phenotype.Other["Cell_type"] = await AddExistingNodes("Cell_type", "");
  json.Phenotype.Other["Region_type"] = await AddExistingNodes("Region_type", "");

  json.Phenotype.Select = {};
  json.Phenotype.Select.Phenotype = await AddExistingNodes("Stage", "");
  json.Phenotype.Select.Stage = await AddExistingNodes("Phenotype", "");

  for (const browsers of json.Genome.Browsers) {
    json.Genome[browsers.text + "_ID"] = "num";
  }
  delete json.Genome.Browsers;
  json.Genome.Version = await AddExistingNodes("Version", "");
  json.Genome.Date = "date";

  json.Publication = {
    Publication: {
      value: await AddExistingNodes("Publication", ""),
      collapse: true,
    },
    Title: { type: "text", collapse: { field: "Publication", value: "Autre" } },
    Date: { type: "date", collapse: { field: "Publication", value: "Autre" } },
    Creator: { type: "text", collapse: { field: "Publication", value: "Autre" } },
    Source: { type: "text", collapse: { field: "Publication", value: "Autre" } },
  };

  res.json(json);
});

export default router;
