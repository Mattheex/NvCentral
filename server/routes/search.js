import {request, verifiyAccount} from "../global.js";
import express from 'express';
const router = express.Router();

const searchData = async (filter, token) => {
    const account = verifiyAccount(token)
    console.log(account)

    const query = `
    PREFIX : <http://ircan.org/data/mutants>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX up:        <http://purl.uniprot.org/core/>
    PREFIX s:         <http://ircan.org/schema/>
    PREFIX ac: <http://ircan.org/account/>
    PREFIX wac:     <http://www.w3.org/ns/auth/acl#>
    SELECT ?field ?ID ?Name ?Type ?Zygosity ?Generation ?Tag ?Tool ?Lab ?Status ?modes WHERE {
        ?access a         wac:Authorization ;
             wac:agent ac:${account}.
        
        {
            ?line rdf:type ?field;
                    obo:RO_0002354 ?exp;
                    rdfs:label ?Name;
                    geno:id ?ID;
                    geno:status ?accessTo;
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
            ?access wac:accessTo ?accessTo.
            ?line s:visibility s:Seen.
        } UNION {
            ?access wac:mode/rdfs:label ?modes.
        } 
    }`

    let data = await request(query, 'query')
    let rights = data['modes']
    delete data['modes']

    if (!rights.includes('read')){
        return {}
    }

    data = Object.entries(data).reduce((acc, [key, values]) => {
        values.forEach((value, index) => {
            acc[index] ||= {};
            acc[index][key] = value;
        });
        return acc;
    }, [{}]);

    if (Object.keys(data[0]).length !== 0) {
        for (let key in data) {
            let row = data[key];
            row['Name'] = {
                label: row['Name'],
                link: row['ID'],
                field: row['field'].split('/').pop()
            }
            if (rights.includes('write')){
                row['Action'] = row['ID']
            }
            delete row['ID'];
            delete row['field'];
        }
    }

    return data
}

router.post("search/all/", (req, res) => {
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

router.post("/omics", (req, res) => {
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

router.post("/mutants", (req, res) => {
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

    searchData(string, req.headers['authorization']).then((data => {
        res.json(data);
    })).catch(err => console.log(err));
})

router.get("/mutants/options", async (req, res) => {
    const query = `
    PREFIX : <http://ircan.org/data/mutants/>
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

export default router
