import express from 'express';

const app = express();
import SparqlClient from 'sparql-http-client'
import cors from 'cors'


let endpointUrl = 'http://localhost:3030/NvCentral/sparql';
let user = 'admin'
let password = 'nemato'
let client = new SparqlClient({endpointUrl, user, password})
const queryType = {
    "query": "application/sparql-query",
    "update": "application/sparql-update"
}

app.use(express.json())
app.use(cors())

const structJSON = {
    Summary: {
        Line_ID: 'add',
        Line_name: "Line_name",
        Synonym_line_name: "Synonym_line_name",
        Line_type: "Line_type",
        Generation: "Generation",
        Zygosity: "Zygosity",
        Lab_of_origin: "Lab_of_origin"
    },
    Genetic_modifications: {
        Tag_type: "Tag_type",
        Molecular_tools: "Molecular_tools",
        Vector_name: "Vector_name",
        Vector_description: "Vector_description",
        Construction_description: 'construction',
        Mutation_type: 'mutation_type',
        Reagents_and_protocols: 'reagents_and_protocols',
    },
    Gene_information: {
        Name: 'Gene_name',
        Sequence: 'Sequence',
        Promoter: 'Promoter',
        "Ensembl accession number": 'Ensembl_accession_number',
        Genbank_accession_number: 'Genbank_accession_number',
        NvERTx_ID: 'NvERTx_ID'
    },
    Mutation: {
        "Chromosome's_number": "Chromosomes_number",
        Locus_of_insertion: "Locus_of_insertion",
        Mutated_region: "Mutated_region",
    },
    Phenotype: {
        Other: {
            'Sub-localization': 'sub_label',
            Cell_type: 'cell_label',
            Region_type: 'region_label',
        },
        Timeline: {
            Title: ["Embryo stage", "Larval stage", "Metamorphosis", "Adult stage"],
        }
    },
    Genome: {
        "Genome browsers": [{text: "Ensembl", link: "#"}],
        "Genome version": 'Genome_version'
    },
    Publication: {
        Title: 'Publication_title',
        Date: 'Publication_date',
        Creator: 'Publication_creator',
        Source: [{text: 'PubMed', link: 'Publication_source'}],
        "Associated lines": 'Publication_name'
    }
}

const searchData = async (filter) => {
    const query = `
    PREFIX : <http://ircan.org/data/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX s:         <http://ircan.org/schema/>
    SELECT ?field ?ID ?Name ?Type ?Zygosity ?Generation ?Tag ?Tool ?Lab WHERE {
      ?line rdf:type ?field;
            obo:RO_0002354 ?exp;
            rdfs:label ?Name;
            geno:id ?ID;
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
    }`

    let data = await request(query, 'query')


    let transposedArray = Object.entries(data).reduce((acc, [key, values]) => {
        values.forEach((value, index) => {
            acc[index] ||= {};
            acc[index][key] = value;
        });
        return acc;
    }, [{}]);

    if (Object.keys(transposedArray[0]).length !== 0) {
        for (let key in transposedArray) {
            let row = transposedArray[key];
            row['Name'] = {
                label: row['Name'],
                link: row['ID'],
                field: row['field'].split('/').pop()
            }
            delete row['ID'];
            delete row['field'];
        }
    }

    return transposedArray
}

app.post("/post/searchAll/", (req, res) => {
    let string = ''
    const nodes = [
        '?Name',
        '?Type',
        '?Zygosity',
        '?gene_name',
        '?Type',
        '?Lab',
        '?Generation',
        '?Tag',
        '?cell_label',
        '?Tool'
    ]

    string += 'FILTER ('
    string += nodes.map(key => `regex(${key}, '${req.body.Value}')`).join(' || ');
    string += ')\n';

    searchData(string).then((data => {
        res.json(data);
    })).catch(err => console.log(err));
})

app.post("/post/omics", (req, res) => {
    let string = ''
    for (let key in req.body) {
        if (key === '?field') {
            string += `FILTER (${key} = <${req.body[key]}>)\n`
        } else {
            string += `FILTER (regex(${key}, '${req.body[key]}'))\n`
        }
    }

    searchData(string).then((data => {
        res.json(data);
    })).catch(err => console.log(err));
})

app.post("/post/option", (req, res) => {
    let string = ''
    for (let key in req.body) {
        if (key === '?Type') {
            string += 'FILTER ('
            string += req.body[key].map(value => `${key} = '${value}'`).join(' || ');
            string += ')\n';
        } else if (key === '?field') {
            string += `FILTER (${key} = <${req.body[key]}>)\n`
        } else {
            if (req.body[key] !== '' && (req.body[key] !== 'Tous' || key !== '?Lab' && key !== '?cell_label')) {
                string += `FILTER (regex(${key}, '${req.body[key]}'))\n`
            }
        }
    }

    searchData(string).then((data => {
        res.json(data);
    })).catch(err => console.log(err));
})

app.get("/api/option", async (req, res) => {
    const query = `
    PREFIX : <http://ircan.org/data/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX s:         <http://ircan.org/schema/>
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

    request(query, 'query').then(data => {
        data['lab_label'] = ['Tous', ...new Set(data['lab_label'])]
        data['lab_label'] = data['lab_label'].map((node, _) => {
            return {node: node, label: node};
        });
        data['cell_label'] = ['Tous', ...new Set(data['cell_label'])]
        data['cell_label'] = data['cell_label'].map((node, _) => {
            return {node: node, label: node};
        });
        res.json(data);
    }).catch(err => console.log(err));
})

app.get("/line/:id", async (req, res) => {
    console.time("query");

    const query = `PREFIX : <http://ircan.org/data/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obo:       <http://purl.obolibrary.org/obo/>
PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
PREFIX up:        <http://purl.uniprot.org/core/>
PREFIX edam:      <http://edamontology.org/>
PREFIX bao:       <http://www.bioassayontology.org/bao#>
PREFIX s:         <http://ircan.org/schema/>
PREFIX dcterms:   <http://purl.org/dc/terms/>
SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation 
?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
?Gene_name ?Sequence ?Promoter ?Genome_version ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
?Chromosomes_number ?Locus_of_insertion ?Mutated_region
?phen_label ?stage_label ?phen_type
?Tag_type ?sub_label ?cell_label ?region_label 
?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
WHERE {
      {
     ?line geno:id ${req.params.id};
      obo:RO_0000053 ?charac;
      obo:RO_0002354 ?exp;
      rdfs:label ?Line_name;
      obo:IAO_0000118 ?Synonym_line_name;
      obo:GENO_0000608/rdfs:label ?Zygosity;
      obo:RO_0000086/rdfs:label ?Line_type;
      obo:NCIT_C42628/rdfs:label ?Lab_of_origin;
      obo:RO_0002350/rdfs:label ?Generation;
      dcterms:source ?Publication.

      ?exp obo:RO_0004009 ?tool;
      obo:RO_0002234 ?gene.

      ?tool (rdf:type | rdfs:subClassOf) obo:FBcv_0003007;
      rdfs:label ?Molecular_tools.

      optional {?line obo:RO_0002354/obo:RO_0004009 ?vector.
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
      s:hasEnsemblID/rdfs:label ?Ensembl_accession_number;
      s:hasGenBankNumber/rdfs:label ?Genbank_accession_number;
      s:hasNvERTxID/rdfs:label ?NvERTx_ID.

      ?charac obo:RO_0000053 ?phen.
      optional{?charac obo:RO_0000086 s:Reporter.
      ?phen rdfs:label ?Tag_type.}

      ?phen s:subLocated/rdfs:label ?sub_label;
      s:cellLocated/rdfs:label ?cell_label;
      s:regionLocated/rdfs:label ?region_label.

      ?Publication rdfs:label ?Publication_title;
      dcterms:date ?Publication_date;
      dcterms:creator ?Publication_creator;
      dcterms:source ?Publication_source;
      rdfs:seeAlso/geno:id ?Publication_id;
      rdfs:seeAlso/rdfs:label ?Publication_name.
  } UNION {
       ?phenotypes rdf:type/rdfs:label ?phen_type;
                    rdfs:label ?phen_label;
                    obo:RO_0002092/rdfs:label ?stage_label.
      {
        SELECT ?phenotypes WHERE {
          ?line geno:id ${req.params.id};
          		obo:RO_0000053/obo:RO_0000053/obo:RO_0000053 ?phenotypes.

        }
      }
  }
}`

    request(query, 'query').then(data => {
        console.timeEnd("query");
        console.time("formating");

        console.log(data)

        function loopThroughJSON(obj, newObj, path) {
            for (let key in obj) {
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    if (key === 'Timeline') {
                        newObj['Timeline'] = {}
                        newObj['Timeline']['Title'] = obj[key]['Title']
                        for (let i = 0; i < data['phen_type'].length; i++) {
                            newObj[key][data['phen_type'][i]] ||= []
                            newObj[key][data['phen_type'][i]].push({
                                data: data['phen_label'][i],
                                label: data['stage_label'][i]
                            })
                        }
                    } else {
                        newObj[key] = {}
                        loopThroughJSON(obj[key], newObj[key], path + '-' + key);
                    }
                } else if (Array.isArray(obj[key])) {
                    newObj[key] = []
                    loopThroughJSON(obj[key], newObj[key], path + '-' + key);
                } else {
                    let pathNew = path + '-' + key
                    if (pathNew.includes('Genome browsers') || pathNew.includes('Source-0-text')) {
                        newObj[key] = obj[key]
                    } else if (pathNew.includes('Associated lines')) {
                        const public_name = [...new Set(data[obj[key]])]
                        const public_id = [...new Set(data['Publication_id'])]
                        newObj[key] = public_name.map((text, index) => ({
                            text: text,
                            link: "http://localhost:3000/transgenic/" + public_id[index]
                        }))
                    } else if (pathNew.includes('Line_ID')) {
                        newObj[key] = req.params.id
                    } else if (data[obj[key]] !== undefined && data[obj[key]][0] !== '') {
                        newObj[key] = data[obj[key]][0]
                    }
                }
            }
            return newObj
        }

        data = loopThroughJSON(structJSON, {}, '')

        /*function deleteUndefinedKeys(obj, type) {
            for (let key in obj) {
                if (typeof obj[key] === 'object') {
                    if (Array.isArray(obj[key])) {
                        deleteUndefinedKeys(obj[key], 'array');
                        obj[key] = obj[key].filter(item => Object.keys(item).length !== 0)
                    } else {
                        deleteUndefinedKeys(obj[key], 'json');
                    }
                    if (type === 'json' && Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    }
                }
            }
        }
        deleteUndefinedKeys(newObj, 'json')*/

        const replace = (phen, options) => {
            for (let i = 0; i < phen.length; i++) {
                let found = false
                for (const key in options) {
                    if (phen[i]["data"] === key) {
                        phen[i]["number"] = options[key]
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    phen[i]["number"] = parseFloat(phen[i]["data"])
                }
                phen[i]['id'] = data['Phenotype']['Timeline']['Title'].indexOf(phen[i]['label'])
            }
            return phen
        }

        for (const superclass in data['Phenotype']['Timeline']) {
            if (superclass !== 'Title') {
                if (superclass === "Growth" || superclass === "Fecundity") {
                    replace(data['Phenotype']['Timeline'][superclass], {'NA': -1, 'No': 1})
                } else {
                    replace(data['Phenotype']['Timeline'][superclass], {'NA': -1, 'No': 0, 'Normal': 0})
                }
            }
        }
        console.timeEnd("formating");
        console.log(data)
        res.json(data);
    }).catch(err => console.log(err));
})

app.post("/post/add", async (req, res) => {
    let query = `
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX obo:       <http://purl.obolibrary.org/obo/>
    
    SELECT (MAX(?id) as ?max) WHERE {
      ?line a obo:OBI_1000048;
            geno:id ?id.
    }`

    let id = (await request(query, 'query'))['max'][0]
    id = parseInt(id) + 1

    const json = {
        Line_name: {
            nodeType: 'obo:OBI_1000048',
            nodeName: 'Line',
            NA: false,
            nodeID: ''
        },
        Synonym_line_name: {
            property: 'obo:IAO_0000118', NA: false
        },
        Line_type: {
            property: 'obo:RO_0000086', NA: false
        },
        Generation: {
            property: 'obo:RO_0002350', NA: false,
            nodeType: 'obo:NCIT_C88214',
            nodeName: 'Generation'
        },
        Zygosity: {
            property: 'obo:GENO_0000608', NA: false
        },
        Lab_of_origin: {
            property: 'obo:NCIT_C42628', NA: false,
            nodeType: 'obo:OBI_0003250',
            nodeName: 'Lab'
        },
        Exp: {
            property: 'obo:RO_0002354',
            nodeType: 'obo:OBI_0001154',
            nodeName: 'Experience',
            NA: false,
            label: false,
            nodeID: ''
        },
        Tag_type: {
            property: 'obo:RO_0000053', NA: true,
            nodeType: 'bao:BAO_0170002',
            nodeName: 'Tag',
            nodeID: ''
        },
        Molecular_tools: {
            property: 'obo:RO_0004009', NA: false,
            nodeType: 'obo:FBcv_0003007',
            nodeName: 'MolecularTool'
        },
        Vector_name: {
            property: 'obo:RO_0004009', NA: false,
            nodeType: 'obo:SO_0000755',
            nodeName: 'Vector'
        },
        Vector_description: {
            property: 's:vectorDescription',
        },
        Construction_description: {
            property: 's:constructionDescription',
        },
        Mutation_type: {
            property: 's:mutationType',
        },
        Reagents_and_protocols: {
            property: 's:reagentsAndProtocols'
        },
        Name: {
            property: 'obo:RO_0002234',
            nodeType: 'obo:SO_0000704',
            nodeName: 'Gene',
            NA: false,
            nodeID: ''
        },
        Sequence: {
            property: 'obo:BAO_0002817', NA: true,
            nodeType: 'obo:SO_0000104',
            nodeName: 'Sequence'
        },
        Promoter: {
            property: 'obo:BFO_0000051', NA: true,
            nodeType: 'obo:SO_0000167',
            nodeName: 'Promoter'
        },
        Locus_of_insertion: {
            property: 'obo:RO_0002231', NA: true,
            nodeType: 'obo:SO_0000179',
            nodeName: 'Locus'
        },
        "Ensembl accession number": {
            property: 's:hasEnsemblID', NA: true,
            nodeType: 'edam:data_2610',
            nodeName: 'Ensembl'
        },
        Genbank_accession_number: {
            property: 's:hasGenBankNumber', NA: true,
            nodeType: 'obo:SO_0000704',
            nodeName: 'GenBank'
        },
        NvERTx_ID: {
            property: 's:hasNvERTxID', NA: true,
            nodeType: 'obo:SO_0000704',
            nodeName: 'NvERTxID'
        },
        "Genome version": {
            property: 's:hasGenomeVersion', NA: true,
            nodeType: 'obo:SO_0000704',
            nodeName: 'GenomeVersion'
        },
        "Chromosome's_number": {
            property: 'obo:BFO_0000050', NA: true,
            nodeType: 'obo:SO_0000340',
            nodeName: 'Chromosome'
        },
        Mutated_region: {
            property: 'obo:RO_0002525', NA: true,
            nodeType: 'obo:SO_0001148',
            nodeName: 'MutatedRegion'
        },
        Charac: {
            property: 'obo:RO_0000053',
            nodeType: 'obo:OBI_0600043',
            nodeName: 'Characteristic',
            NA: false,
            nodeID: ''
        },
        Phenotype: {
            property: 'obo:RO_0000053', nodeName: 'Phenotype'
        },
        "Genome browsers": {
            property: 'obo:RO_0000053', NA: true,
            nodeName: 'Browsers'
        },
        Title: {
            property: 'dcterms:source', NA: false,
            nodeType: 'obo:NCIT_C48471',
            nodeName: 'Publication',
            nodeID: ''
        },
        Date: {
            property: 'dcterms:date', NA: false,
        },
        Creator: {
            property: 'dcterms:creator', NA: false,
        },
        Source: {
            property: 'dcterms:source', NA: false,
        },
        'Sub-localization': {
            property: 's:subLocated',
            NA: true,
        },
        Cell_type: {
            property: 's:cellLocated',
            NA: true,
        },
        Region_type: {
            property: 's:regionLocated',
            NA: true,
        },
        "Associated lines": {
            property: 'rdfs:seeAlso', NA: false,
        }
    };

    let test = {
        Line_name: {select: false, value: 'MHT'},
        Synonym_line_name: {select: false, value: 'mCherry line'},
        Line_type: {select: true, value: 'http://ircan.org/schema/Reporter'},
        Generation: {select: false, value: 'F0'},
        Zygosity: {
            select: true,
            value: 'http://purl.obolibrary.org/obo/GENO_0000135'
        },
        Lab_of_origin: {select: false, value: 'Rottinger Lab'},
        Exp: {select: false, value: ''},
        Charac: {select: false, value: ''},
        Tag_type: {select: false, value: 'Fluorescence Red'},
        Molecular_tools: {
            select: true,
            value: 'http://purl.obolibrary.org/obo/FBcv_0000146'
        },
        Vector_name: {select: false, value: 'pcrii'},
        Name: {select: false, value: 'Gene456'},
        Sequence: {select: false, value: 'AUGAUGAUGAUG'},
        Promoter: {},
        'Ensembl accession number': {},
        Genbank_accession_number: {},
        NvERTx_ID: {select: false, value: '165'},
        'Genome version': {},
        "Chromosome's_number": {},
        Locus_of_insertion: {select: false, value: '4'},
        Mutated_region: {},
        'Sub-localization': {},
        Cell_type: {select: true, value: 'http://purl.obolibrary.org/obo/CL_0000540'},
        Region_type: {select: true, value: 'http://purl.obolibrary.org/obo/GO_0043226'},
        Phenotype: [
            {
                stage: 'http://ircan.org/schema/EmbryoStage',
                phenotype: 'http://ircan.org/schema/Lethality',
                value: '0'
            },
            {
                stage: 'http://ircan.org/schema/LarvalStage',
                phenotype: 'http://ircan.org/schema/SwimPerturbation',
                value: 'No'
            },
            {
                stage: 'http://ircan.org/schema/Metamorphosis',
                phenotype: 'http://ircan.org/schema/PostGrowth',
                value: 'No'
            },
            {
                stage: 'http://ircan.org/schema/AdultStage',
                phenotype: 'http://ircan.org/schema/Regeneration',
                value: 'No'
            },
            {
                stage: 'http://ircan.org/schema/LarvalStage',
                phenotype: 'http://ircan.org/schema/Lethality',
                value: '0.1'
            },
            {
                stage: 'http://ircan.org/schema/AdultStage',
                phenotype: 'http://ircan.org/schema/Lethality',
                value: '100'
            },
            {
                stage: 'http://ircan.org/schema/Metamorphosis',
                phenotype: 'http://ircan.org/schema/PostGrowth',
                value: 'No'
            }
        ],
        Vector_description: {select: false, value: 'Bon vector'},
        Mutation_type: {select: false, value: 'ça a muté'},
        Reagents_and_protocols: {select: false, value: "j'ai fais ça ça et ça"},
        'Genome browsers': {select: false, value: 'Nvem2'},
        Title: {select: false, value: 'Publication de moi'},
        Date: {select: false, value: '2024-05-31'},
        Creator: {select: false, value: 'Me'},
        Source: {select: false, value: 'http://nature.com'},
        'Associated lines': {select: true, value: 'http://ircan.org/data/Line1'}
    }

    //let test = req.body

    const addProperty = (parentNode, inJson) => {
        let string = '';
        for (let key in inJson) {
            let item = inJson[key]
            if (item.hasOwnProperty('select')) {
                if (item.select) {
                    string += parentNode + ' ' + json[key]['property'] + ' <' + item.value + ">.\n"
                } else {
                    if (json[key].hasOwnProperty('nodeType')) {
                        let newNode = ":" + json[key].nodeName + item.value.replaceAll(/[^\x00-\x7F]/g, "").replaceAll(" ", "") + id;
                        json[key]['nodeID'] = newNode
                        if (parentNode !== null) {
                            string += parentNode + ' ' + json[key]['property'] + ' ' + newNode + ".\n"
                        }
                        string += newNode + ' rdf:type ' + json[key]['nodeType'] + '.\n';

                        if (!json[key].hasOwnProperty('label')) {
                            string += newNode + " rdfs:label \"" + item.value + "\".\n";
                        }
                    } else {
                        string += parentNode + ' ' + json[key]['property'] + " \"" + item.value + "\".\n"
                    }
                }
            } else if (json[key]['NA']) {
                if (parentNode !== null) {
                    string += parentNode + ' ' + json[key]['property'] + " s:NA.\n"
                }
            }
        }
        return string
    }

    const addPhenotype = (parentNode, inJson) => {
        let string = ''
        for (let item of inJson['Phenotype']) {
            let newNode = ":" + json['Phenotype'].nodeName + item.phenotype.split('/').slice(-1) + item.stage.split('/').slice(-1) + id
            string += parentNode + ' ' + json['Phenotype']['property'] + ' ' + newNode + ".\n";
            string += newNode + ' rdf:type ' + ' <' + item.phenotype + '>.\n'
            string += newNode + " rdfs:label '" + item.value + "'.\n";
            string += newNode + " obo:RO_0002092 " + ' <' + item.stage + '>.\n'
        }
        return string
    }

    const subJson = (inJSon, keys) => {
        return keys.reduce((acc, key) => {
            if (inJSon.hasOwnProperty(key)) {
                acc[key] = inJSon[key];
            }
            return acc;
        }, {});
    }

    query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <http://ircan.org/data/>
    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo:       <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX edam:      <http://edamontology.org/>
    PREFIX bao:       <http://www.bioassayontology.org/bao#>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX dcterms:   <http://purl.org/dc/terms/>
    INSERT DATA {
        ${addProperty(null, subJson(test, ['Line_name']))}
        ${json.Line_name.nodeID} geno:id ${id}.
        ${addProperty(json.Line_name.nodeID, subJson(test, ['Synonym_line_name', 'Line_type', 'Generation', 'Zygosity', 'Lab_of_origin', 'Title']))}
        
        ${addProperty(json.Line_name.nodeID, subJson(test, ['Exp', 'Charac']))}
        ${addProperty(json.Exp.nodeID, subJson(test, ['Name', 'Molecular_tools', 'Vector_name', 'Construction_description', 'Mutation_type', 'Reagents_and_protocols', 'Vector_description']))}
    
        ${addProperty(json.Name.nodeID, subJson(test, ['Sequence', 'Promoter', 'Locus_of_insertion', "Chromosome's_number", 'Mutated_region', 'Genome version', 'Ensembl accession number', 'Genbank_accession_number', 'NvERTx_ID']))}
        
        ${addProperty(json.Charac.nodeID, subJson(test, ['Line_type', 'Tag_type']))}
        
        ${addPhenotype(json.Tag_type.nodeID, subJson(test, ['Phenotype']))}
        ${addProperty(json.Tag_type.nodeID, subJson(test, ['Sub-localization', 'Cell_type', 'Region_type']))}

        ${addProperty(json.Title.nodeID, subJson(test, ['Date', 'Creator', 'Source', 'Associated lines']))}
    }`

    request(query, 'update').then(data => {
        res.json(data);
    }).catch(err => console.log(err));
})

const AddExistingNodes = async (field, value) => {
    const json = {
        Line_type: {
            nodeType: 'obo:MCO_0000383', internData: false,
            schemaData: true
        },
        Generation: {
            nodeType: 'obo:NCIT_C88214', internData: true,
            schemaData: false
        },
        Zygosity: {
            nodeType: 'obo:GENO_0000391', internData: false,
            schemaData: false
        },
        Lab_of_origin: {
            nodeType: 'obo:OBI_0003250', internData: true,
            schemaData: false
        },
        Molecular_tools: {
            nodeType: 'obo:FBcv_0003007', internData: false,
            schemaData: false
        },
        Stage: {
            nodeType: 'obo:UBERON_0000105', internData: false,
            schemaData: true
        },
        Phenotype: {
            nodeType: 'obo:PATO_0000001', internData: false,
            schemaData: true
        },
        'Sub-localization': {
            nodeType: 'obo:CARO_0000000', internData: false,
            schemaData: false
        },
        Cell_type: {
            nodeType: 'obo:UBERON_0000061', internData: false,
            schemaData: false
        },
        Region_type: {
            nodeType: 'obo:UBERON_0000061', internData: false,
            schemaData: false
        },
        "Associated lines": {
            nodeType: 'obo:OBI_1000048', internData: true,
            schemaData: false
        },
    };

    if (!json.hasOwnProperty(field)) {
        //res.json({})
        return {}
    }

    let query = `PREFIX a: <http://ircan.org/data/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo:       <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX edam:      <http://edamontology.org/>
    PREFIX bao:       <http://www.bioassayontology.org/bao#>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX dcterms:   <http://purl.org/dc/terms/>
    SELECT *
    WHERE {
          ?node (rdf:type | rdfs:subClassOf)+ ${json[field].nodeType}.
          ?node rdfs:label ?label
          ${json[field].internData ? 'FILTER(strstarts(str(?node), str(a:)))' : ''}
          ${json[field].schemaData ? 'FILTER(strstarts(str(?node), str(s:)))' : ''}
          FILTER(regex(lcase(?label), lcase("${value}")))
    } ORDER BY (?label) LIMIT 20`

    let data = await request(query, 'query')

    if (Object.keys(data).length !== 0) {
        data = data.node.map((node, index) => ({node: node, label: data.label[index]}));
        data.push({node: 'Autre', label: 'Autre'})
    } else {
        data = []
    }

    return data
}

app.get("/search/:value", async (req, res) => {
    const query = `
    PREFIX a: <http://ircan.org/data/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo:       <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX edam:      <http://edamontology.org/>
    PREFIX bao:       <http://www.bioassayontology.org/bao#>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX dcterms:   <http://purl.org/dc/terms/>
    SELECT ?id ?field ?label
    WHERE {
          ?node rdf:type ?field;
                geno:id ?id;
                rdfs:label ?label.
          FILTER(strstarts(str(?node), str(a:))).
          FILTER(regex(lcase(?label), lcase("${req.params.value}")))
    } ORDER BY (?label) LIMIT 5`;

    request(query, 'query').then(data => {
        console.log(data)
        if (Object.keys(data).length !== 0) {
            data = data.id.map((id, index) => ({
                id: id,
                label: data.label[index],
                field: data.field[index].split('/').pop()
            }));
        } else {
            data = []
        }

        res.json(data);
    }).catch(err => console.log(err));
})

app.get("/add/:field", async (req, res) => {
    AddExistingNodes(req.params.field, '').then((data => {
        res.json(data);
    }))
})

app.get("/add/:field/:value", async (req, res) => {
    AddExistingNodes(req.params.field, req.params.value).then((data => {
        res.json(data);
    }))
})

app.get("/add", async (req, res) => {
    const json = JSON.parse(JSON.stringify(structJSON));
    json.Summary.Line_type = await AddExistingNodes('Line_type', '')
    json.Summary.Generation = await AddExistingNodes('Generation', '')
    json.Summary.Zygosity = await AddExistingNodes('Zygosity', '')
    json.Summary.Lab_of_origin = await AddExistingNodes('Lab_of_origin', '')
    json.Genetic_modifications.Molecular_tools = await AddExistingNodes('Molecular_tools', '')
    json.Genetic_modifications.Vector_description = 'textarea'
    json.Genetic_modifications.Construction_description = 'textarea'
    json.Genetic_modifications.Mutation_type = 'textarea'
    json.Genetic_modifications.Reagents_and_protocols = 'textarea'
    json.Publication.Date = 'date'
    res.json(json);
})

const request = async (query, type) => {
    const stream = client.query.select(query, {
        headers: {
            "Content-Type": queryType[type],
        },
        operation: 'postDirect'
    })
    const json = {}


    return new Promise((resolve, reject) => {
        stream.on('data', row => {
            for (const [key, value] of Object.entries(row)) {
                json[key] ||= [];
                json[key].push(value.value);
            }
        })

        stream.on('end', () => {
            resolve(json)
        })

        stream.on('error', err => {
            reject(err)
        })
    })
}

app.listen(5000, () => console.log('Server is running on port 5000'));
