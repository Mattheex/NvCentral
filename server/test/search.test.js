// test/search.test.js
import { describe, it, before } from "node:test";
import assert from "node:assert";
import { request } from "../global.js";
import { searchData } from "../routes/search.js";
import { changeVisibilityNode, JSONToSPARQL } from "../routes/add.js";

const jsons = {
  all: {
    Line_name: { select: false, value: "MHT" },
    Synonym_line_name: { select: false, value: "Synonyme MHT" },
    Line_type: { select: true, value: "http://ircan.org/schema/Reporter" },
    Generation: { select: false, value: "F3" },
    Zygosity: {
      select: true,
      value: "http://purl.obolibrary.org/obo/GENO_0000402",
    },
    Lab_of_origin: {
      select: true,
      value: "http://ircan.org/data/entities/RentzschLab",
    },
    Exp: { select: false, value: null },
    Charac: { select: false, value: null },
    Molecular_tools: {
      select: true,
      value: "http://purl.obolibrary.org/obo/FBcv_0003008",
    },
    Vector_name: { select: false, value: "Vector poco" },
    Name: { select: false, value: "POUPOI" },
    Sequence: { select: false, value: "ABFSE" },
    Promoter: { select: false, value: "Promoter45" },
    NvERTx_ID: { select: false, value: "4.1235" },
    "Genome version": {},
    "Chromosome's_number": { select: false, value: "87" },
    Locus_of_insertion: { select: false, value: "7" },
    Mutated_region: { select: false, value: "96" },
    "Sub-localization": { select: false, value: "Cellular" },
    Cell_type: { select: false, value: "Membrane" },
    Region_type: { select: false, value: "Mesentery" },
    Phenotype: [
      {
        stage: "http://ircan.org/schema/Lethality",
        phenotype: "http://ircan.org/schema/EmbryoStage",
        value: "56",
      },
      {
        stage: "http://ircan.org/schema/Fecundity",
        phenotype: "http://ircan.org/schema/AdultStage",
        value: "1",
      },
      {
        stage: "http://ircan.org/schema/Regeneration",
        phenotype: "http://ircan.org/schema/LarvalStage",
        value: "3",
      },
    ],
    Publication: { select: true, value: "Autre" },
    Status: { select: true, value: "http://ircan.org/schema/established" },
    Tag_type: { select: false, value: "mORANGE" },
    Vector_description: { select: false, value: "Vector description oui " },
    Construction_description: { select: false, value: "construct" },
    Mutation_type: { select: false, value: "mutate ouio" },
    Supplementary_information: { select: false, value: "absence of machin" },
    Version: { select: true, value: "http://ircan.org/schema/GenomeV1" },
    Date_: {},
    Details: {},
    Ensembl_ID: { select: false, value: "45868" },
    Genbank_ID: {},
    Title: { select: false, value: "Bonne publi" },
    Date: { select: false, value: "1999-04-23" },
    Creator: { select: false, value: "MatMat" },
    Source: { select: false, value: "nature.com" },
    Reagents_and_protocols: { select: false, value: "" },
  },
  minimum: {
    Line_name: { select: false, value: "bgbgb" },
    Synonym_line_name: {},
    Line_type: { select: true, value: "http://ircan.org/schema/Functional" },
    Generation: {
      select: true,
      value: "http://ircan.org/data/entities/F0",
    },
    Zygosity: {
      select: true,
      value: "http://purl.obolibrary.org/obo/GENO_0000134",
    },
    Lab_of_origin: {
      select: true,
      value: "http://ircan.org/data/entities/RentzschLab",
    },
    Status: { select: true, value: "http://ircan.org/schema/published" },
    Exp: { select: false, value: null },
    Charac: { select: false, value: null },
    Tag_type: { select: false, value: "NA" },
    Construction_description: {},
    Mutation_type: {},
    Reagents_and_protocols: {},
    Molecular_tools: {
      select: true,
      value: "http://purl.obolibrary.org/obo/FBcv_0003008",
    },
    Name: { select: false, value: "gene34" },
    Sequence: {},
    Promoter: {},
    "Ensembl accession number": {},
    Genbank_accession_number: {},
    Ensembl_ID: {},
    Genbank_ID: {},
    NvERTx_ID: {},
    "Chromosome's_number": {},
    Locus_of_insertion: {},
    Mutated_region: {},
    "Sub-localization": {
      select: true,
      value: "http://ircan.org/schema/CellMembrane",
    },
    Cell_type: { select: true, value: "http://ircan.org/schema/Cnidocyte" },
    Region_type: { select: true, value: "http://ircan.org/schema/BodyWall" },
    Phenotype: [
      {
        stage: "http://ircan.org/schema/Developmental",
        phenotype: "http://ircan.org/schema/AdultStage",
        value: "",
      },
    ],
    Version: { select: true, value: "http://ircan.org/schema/GenomeV1" },
    Date_: {},
    Details: {},
    Publication: { select: true, value: "Autre" },
  },
};

describe("Search Client Tests", async function () {
  before(async () => {
    let query = `
        DELETE {?x ?y ?z} WHERE {
            FILTER(strstarts(str(?x), str(mut:)) || strstarts(str(?x), str(ac:)))
          ?x ?y ?z
        }`;

    await request(query, "update");

    Object.keys(jsons).forEach(async (key, id) => {
      const query = JSONToSPARQL(id, jsons[key]);
      await request(query, "update").catch((e) => console.log(Error(`ADD ERR ${e}`)));
      await changeVisibilityNode(id).catch((e) => console.log(Error(`CHANGE ERR ${e}`)));
    });

    query = `
        INSERT DATA {
            ac:AllGroup
                a                 sioc:Usergroup ;
                wac:accessControl ac:AllGroupAccess .

            ac:AllGroupAccess a wac:Authorization ;
                wac:agentClass ac:AllGroup ;
                wac:mode wac:Read ;
                wac:accessTo s:published .

            ac:Visitor a sioc:UserAccount ;
                sioc:member_of ac:AllGroup.

            ac:LabRottingerLab a sioc:Usergroup ;
                sioc:member_of ac:AllGroup ;
                sAc:hasDirector ac:EricRottinger ;
                wac:accessControl ac:LabRottingerLabAccessLabRottinger2, ac:AccessAppendNvCentral .

            ac:LabRottingerLabAccessLabRottinger2 a wac:Authorization ;
                wac:agent ac:LabRottingerLab ;
                wac:mode wac:Read ;
                wac:accessTo en:LabRottingerLab2 .

            ac:MatthieuFeraud a sioc:UserAccount ;
                sioc:member_of ac:LabRottingerLab ;
                foaf:accountName "RottingerTeam" ;
                sAc:password '$2b$12$SunmSi3OAkfcCeAY1tqCged3kgAO0o8egZQ5.VA50mI7mLxCIUZsi' ;
                wac:accessControl ac:MatthieuFeraudAccessLine1 .

            ac:MatthieuFeraudAccessLine1 a wac:Authorization ;
                wac:agent ac:MatthieuFeraud;
                wac:mode wac:Read, wac:Write ;
                wac:accessTo mut:LineMHT0 .

            ac:AccessReadNvCentral
                a            wac:Authorization ;
                wac:mode     wac:Read ;
                wac:accessTo sAc:NvCentral .

            ac:AccessAppendNvCentral
                a            wac:Authorization ;
                wac:mode     wac:Append ;
                wac:accessTo sAc:NvCentral .
        }`;

    await request(query, "update").catch((e) => console.log(Error(`ADD ERR ${e}`)));
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
  it("search tests", async () => {
    let res = await searchData("", "MatthieuFeraud");
    assert.strictEqual(res.length, 2, res);
    res = await searchData("", "Visitor");
    assert.strictEqual(res.length, 1, res);
  });
});
