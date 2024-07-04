import express from 'express';
import {request} from "../global.js";
import config from "../constants.js";

const router = express.Router();

export const findID = async () => {
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

    let data = await request(query, 'query')
    if (!data.hasOwnProperty('max')) {
        return 0
    }

    return parseInt(data['max'][0]) + 1
}


export const JSONToSPARQL = (id, newData) => {
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
            nodeName: 'Lab',
            prefix: 'en:'
        },
        Status: {
            property: 'geno:status', NA: false,
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
        Ensembl_ID: {property: 's:hasEnsemblID',nodeType: 'obo:SO_0000704',nodeName:'Ensembl'},
        Genbank_ID: {property: 's:hasGenBankNumber',nodeType: 'obo:SO_0000704',nodeName:'GenBank'},
        Version: {
            property: 's:hasGenomeVersion',
            nodeType: 'owl:Class',
            subClassOf: 'obo:NCIT_C164815',
            prefix: 's:'
        },
        Date_: {
            property: 's:hasGenomeDate',
        },
        Details: {
            property: 's:hasGenomeDetails',
        },
        'Sub-localization': {
            property: 's:subLocated',
            nodeType: 'owl:Class',
            NA: true,
            subClassOf: 'obo:CARO_0000000',
            nodeName: 'Sub',
            prefix: 's:',
        },
        Cell_type: {
            property: 's:cellLocated',
            nodeType: 'owl:Class',
            subClassOf: 'obo:GO_0110165',
            nodeName: 'CellType',
            prefix: 's:',
            NA: true,
        },
        Region_type: {
            property: 's:regionLocated',
            nodeType: 'owl:Class',
            subClassOf: 'obo:UBERON_0000061',
            nodeName: 'RegionType',
            prefix: 's:',
            NA: true,
        },
        "Associated lines": {
            property: 'rdfs:seeAlso', NA: false,
        }
    };

    function nullCase(parentNode, type) {
        if (type.hasOwnProperty('nodeType')) {
            return `${parentNode} ${type.property} s:NA.\n`
        }
        return `${parentNode} ${type.property} \"NA\".\n`
    }

    const addProperty = (parentNode, inJson) => {
        let string = '';
        for (let key in inJson) {
            let item = inJson[key]
            if (item.hasOwnProperty('select')) {
                if (item.select) {
                    if (item.value === 'Autre') {
                        console.log(`${parentNode} ${json[key]['property']}`)
                        string += nullCase(parentNode, json[key])
                    } else {
                        string += parentNode + ' ' + json[key]['property'] + ' <' + item.value + ">.\n"
                    }
                } else {
                    if (item.value === '') {
                        console.log(`${parentNode} ${json[key]['property']}`)
                        string += nullCase(parentNode, json[key])
                    } else {
                        if (json[key].hasOwnProperty('nodeType')) {
                            let prefix = ':'
                            if (json[key].hasOwnProperty('prefix')) {
                                prefix = json[key]['prefix']
                            }
                            let nodeValue = '';
                            if (item.value !== null) {
                                nodeValue = item.value.replaceAll(/[^\x00-\x7F]/g, "").replaceAll(" ", "")
                            }
                            let newNode = prefix + json[key].nodeName + nodeValue + id;
                            json[key]['nodeID'] = newNode
                            if (parentNode !== null) {
                                string += parentNode + ' ' + json[key]['property'] + ' ' + newNode + ".\n"
                            }
                            string += newNode + ' rdf:type ' + json[key]['nodeType'] + '.\n';

                            if (item.value !== null) {
                                string += newNode + " rdfs:label \"" + item.value + "\".\n";
                            }
                            if (json[key].hasOwnProperty('subClassOf')) {
                                string += newNode + " rdfs:subClassOf " + json[key]['subClassOf'] + ".\n";
                            }
                        } else {
                            string += parentNode + ' ' + json[key]['property'] + " \"" + item.value + "\".\n"
                        }
                    }
                }
            } else {
                string += nullCase(parentNode, json[key])
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

    return `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <http://ircan.org/data/mutants/>
    PREFIX en:     <http://ircan.org/data/entities>
    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo:       <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX edam:      <http://edamontology.org/>
    PREFIX bao:       <http://www.bioassayontology.org/bao#>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX dcterms:   <http://purl.org/dc/terms/>
    PREFIX owl:   <http://www.w3.org/2002/07/owl#>
    INSERT DATA {
        ${addProperty(null, subJson(newData, ['Line_name']))}
        ${json.Line_name.nodeID} geno:id ${id}.
        ${addProperty(json.Line_name.nodeID, subJson(newData, ['Synonym_line_name', 'Line_type', 'Generation', 'Zygosity', 'Lab_of_origin', 'Title', 'Status']))}
        
        ${addProperty(json.Line_name.nodeID, subJson(newData, ['Exp', 'Charac']))}
        ${addProperty(json.Exp.nodeID, subJson(newData, ['Name', 'Molecular_tools', 'Vector_name', 'Construction_description', 'Mutation_type', 'Reagents_and_protocols', 'Vector_description']))}
    
        ${addProperty(json.Name.nodeID, subJson(newData, ['Sequence', 'Promoter', 'Locus_of_insertion', "Chromosome's_number", 'Mutated_region', 'Version',"Date_","Details", "Ensembl_ID", 'Genbank_ID', 'NvERTx_ID']))}
        
        ${addProperty(json.Charac.nodeID, subJson(newData, ['Line_type', 'Tag_type']))}
        
        ${addPhenotype(json.Tag_type.nodeID, subJson(newData, ['Phenotype']))}
        ${addProperty(json.Tag_type.nodeID, subJson(newData, ['Sub-localization', 'Cell_type', 'Region_type']))}
        
        ${addProperty(json.Title.nodeID, subJson(newData, ['Date', 'Creator', 'Source', 'Associated lines']))}
        ${json.Title.nodeID} rdfs:seeAlso ${json.Line_name.nodeID}.
    }`
}

router.post("/line/", async (req, res) => {

    console.log(req.body)
    throw 1 === 2
    const ID = findID()
    const query = JSONToSPARQL(ID, req.body)

    request(query, 'update').then(data => {
        console.log(data)
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
        Status: {
            nodeType: 'efo:EFO_0001742', internData: false,
            schemaData: true
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
            schemaData: true
        },
        Cell_type: {
            nodeType: 'obo:GO_0110165', internData: false,
            schemaData: true
        },
        Region_type: {
            nodeType: 'obo:UBERON_0000061', internData: false,
            schemaData: true
        },
        Version: {
            nodeType: 'obo:NCIT_C164815', internData: false,
            schemaData: true
        },
        "Publication": {
            nodeType: 'obo:NCIT_C48471', internData: true,
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
    PREFIX efo:       <http://www.ebi.ac.uk/efo/>
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
    } else {
        data = []
    }
    data.push({node: 'Autre', label: 'Autre'})
    //console.log(data)
    return data
}

/*router.get("/search/:value", async (req, res) => {
    const query = `
    PREFIX a: <http://ircan.org/data/mutants/>
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
})*/

/*router.get("/:field", async (req, res) => {
    AddExistingNodes(req.params.field, '').then((data => {
        res.json(data);
    }))
})

/*router.get("/add/:field/:value", async (req, res) => {
    AddExistingNodes(req.params.field, req.params.value).then((data => {
        res.json(data);
    }))
})*/

router.get("/", async (req, res) => {
    const json = JSON.parse(JSON.stringify(config.structJSON));
    json.Summary.Line_type = await AddExistingNodes('Line_type', '')
    json.Summary.Generation = await AddExistingNodes('Generation', '')
    json.Summary.Zygosity = await AddExistingNodes('Zygosity', '')
    json.Summary.Lab_of_origin = await AddExistingNodes('Lab_of_origin', '')
    json.Summary.Status = await AddExistingNodes('Status', '')
    json.Genetic_modifications.Tag_type = {
        type: 'text',
        collapse: {field: 'Line_type', value: 'http://ircan.org/schema/Reporter'}
    }
    json.Genetic_modifications.Molecular_tools = await AddExistingNodes('Molecular_tools', '')
    json.Genetic_modifications.Vector_description = 'textarea'
    json.Genetic_modifications.Construction_description = 'textarea'
    json.Genetic_modifications.Mutation_type = 'textarea'
    json.Genetic_modifications.Reagents_and_protocols = 'textarea'

    json.Phenotype.Select = {}
    json.Phenotype.Select.Phenotype = await AddExistingNodes('Stage', '')
    json.Phenotype.Select.Stage = await AddExistingNodes('Phenotype', '')

    for (const browsers of json.Genome.Browsers) {
        json.Genome[browsers.text + '_ID'] = 'num'
    }
    delete json.Genome.Browsers
    json.Genome.Version = await AddExistingNodes('Version', '')
    json.Genome.Date = 'date'

    json.Publication = {
        Publication: {
            value: await AddExistingNodes('Publication', ''),
            collapse: true
        },
        Title: {type: 'text', collapse: {field: 'Publication', value: 'Autre'}},
        Date: {type: 'date', collapse: {field: 'Publication', value: 'Autre'}},
        Creator: {type: 'text', collapse: {field: 'Publication', value: 'Autre'}},
        Source: {type: 'text', collapse: {field: 'Publication', value: 'Autre'}},
    }

    console.log(json)

    res.json(json);
})

export default router