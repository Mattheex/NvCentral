// test/add.test.js
//import sinon from 'sinon';
import {before, describe, it} from 'node:test';
import assert from 'node:assert';
import {request} from "../global.js";
import {findID, JSONToSPARQL} from "../routes/add.js";


describe('SPARQL Client Tests', function () {
    const jsons = {
        'all': {
            "Line_name": {"select": false, "value": "MHT"},
            "Synonym_line_name": {"select": false, "value": "Synonyme MHT"},
            "Line_type": {"select": true, "value": "http://ircan.org/schema/Reporter"},
            "Generation": {"select": false, "value": "F3"},
            "Zygosity": {"select": true, "value": "http://purl.obolibrary.org/obo/GENO_0000402"},
            "Lab_of_origin": {"select": true, "value": "http://ircan.org/data/entities/RentzschLab"},
            "Exp": {"select": false, "value": null},
            "Charac": {"select": false, "value": null},
            "Molecular_tools": {"select": true, "value": "http://purl.obolibrary.org/obo/FBcv_0003008"},
            "Vector_name": {"select": false, "value": "Vector poco"},
            "Name": {"select": false, "value": "POUPOI"},
            "Sequence": {"select": false, "value": "ABFSE"},
            "Promoter": {"select": false, "value": "Promoter45"},
            "NvERTx_ID": {"select": false, "value": "4.1235"},
            "Genome version": {},
            "Chromosome's_number": {"select": false, "value": "87"},
            "Locus_of_insertion": {"select": false, "value": "7"},
            "Mutated_region": {"select": false, "value": "96"},
            "Sub-localization": {"select": false, "value": "Cellular"},
            "Cell_type": {"select": false, "value": "Membrane"},
            "Region_type": {"select": false, "value": "Mesentery"},
            "Phenotype": [
                {
                    "stage": "http://ircan.org/schema/Lethality",
                    "phenotype": "http://ircan.org/schema/EmbryoStage",
                    "value": "56"
                },
                {
                    "stage": "http://ircan.org/schema/Fecundity",
                    "phenotype": "http://ircan.org/schema/AdultStage",
                    "value": "1"
                },
                {
                    "stage": "http://ircan.org/schema/Regeneration",
                    "phenotype": "http://ircan.org/schema/LarvalStage",
                    "value": "3"
                }
            ],
            "Publication": {"select": true, "value": "Autre"},
            "Status": {"select": true, "value": "http://ircan.org/schema/established"},
            "Tag_type": {"select": false, "value": "mORANGE"},
            "Vector_description": {"select": false, "value": "Vector description oui "},
            "Construction_description": {"select": false, "value": "construct"},
            "Mutation_type": {"select": false, "value": "mutate ouio"},
            "Supplementary_information": {"select": false, "value": "absence of machin"},
            "Version": {"select": true, "value": "http://ircan.org/schema/GenomeV1"},
            "Date_": {},
            "Details": {},
            "Ensembl_ID": {"select": false, "value": "45868"},
            "Genbank_ID":{},
            "Title": {"select": false, "value": "Bonne publi"},
            "Date": {"select": false, "value": "1999-04-23"},
            "Creator": {"select": false, "value": "MatMat"},
            "Source": {"select": false, "value": "nature.com"},
            "Reagents_and_protocols": {"select": false, "value": ""}
        }
    }
    const queries = (id) => {
        return {
            line: {
                query: `
                PREFIX : <http://ircan.org/data/mutants/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX en:     <http://ircan.org/data/entities> 
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                ?phen_label ?stage_label ?phen_type
                ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                WHERE {
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
                      geno:status/rdfs:label ?Status.
                }`,
                output: 7
            },
            exp: {
                query: `
                PREFIX : <http://ircan.org/data/mutants/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX en:     <http://ircan.org/data/entities> 
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                ?phen_label ?stage_label ?phen_type
                ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                WHERE {
                     ?line geno:id ${id};
                      obo:RO_0002354 ?exp.
                      
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
                }`,
                output: {'all': 6}
            },
            gene: {
                query: `
                PREFIX : <http://ircan.org/data/mutants/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX en:     <http://ircan.org/data/entities> 
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                ?phen_label ?stage_label ?phen_type
                ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                WHERE {
                     ?line geno:id ${id};
                      obo:RO_0002354 ?exp.
                      
                      ?exp obo:RO_0002234 ?gene.
                      
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
                }`,
                output: {'all': 12}
            },
            charac: {
                query: `
                PREFIX : <http://ircan.org/data/mutants/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX en:     <http://ircan.org/data/entities> 
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                ?phen_label ?stage_label ?phen_type
                ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                WHERE {
                     ?line geno:id ${id};
                      obo:RO_0000053 ?charac.
                      
                    ?charac obo:RO_0000053 ?phen.
                    optional{?charac obo:RO_0000086 s:Reporter.
                    ?phen rdfs:label ?Tag_type.}
                    optional {?charac obo:RO_0000086 s:Functional.
                    ?charac rdfs:label ?supp_info}
                }`,
                output: 1
            },
            location: {
                query: `
                PREFIX : <http://ircan.org/data/mutants/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX en:     <http://ircan.org/data/entities> 
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                ?phen_label ?stage_label ?phen_type
                ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                WHERE {
                     ?line geno:id ${id};
                      obo:RO_0000053 ?charac.
                      
                      ?charac obo:RO_0000053 ?phen.
                      
                      ?phen s:subLocated/rdfs:label ?sub_label;
                      s:cellLocated/rdfs:label ?cell_label;
                      s:regionLocated/rdfs:label ?region_label.
                }`,
                output: 3
            },
            publi: {
                query: `
                    PREFIX : <http://ircan.org/data/mutants/>
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX obo:       <http://purl.obolibrary.org/obo/>
                    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                    PREFIX up:        <http://purl.uniprot.org/core/>
                    PREFIX edam:      <http://edamontology.org/>
                    PREFIX bao:       <http://www.bioassayontology.org/bao#>
                    PREFIX s:         <http://ircan.org/schema/>
                    PREFIX en:     <http://ircan.org/data/entities> 
                    PREFIX dcterms:   <http://purl.org/dc/terms/>
                    SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                    ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                    ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                    ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                    ?phen_label ?stage_label ?phen_type
                    ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                    ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                    WHERE {
                         ?line geno:id ${id};
                          dcterms:source ?Publication.
                          
                          ?Publication rdfs:label ?Publication_title;
                          dcterms:date ?Publication_date;
                          dcterms:creator ?Publication_creator;
                          dcterms:source ?Publication_source;
                          rdfs:seeAlso/geno:id ?Publication_id;
                          rdfs:seeAlso/rdfs:label ?Publication_name.
                    }`,
                output: 6
            },
            phen: {
                query: `
                    PREFIX : <http://ircan.org/data/mutants/>
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX obo:       <http://purl.obolibrary.org/obo/>
                    PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                    PREFIX up:        <http://purl.uniprot.org/core/>
                    PREFIX edam:      <http://edamontology.org/>
                    PREFIX bao:       <http://www.bioassayontology.org/bao#>
                    PREFIX s:         <http://ircan.org/schema/>
                    PREFIX en:     <http://ircan.org/data/entities> 
                    PREFIX dcterms:   <http://purl.org/dc/terms/>
                    SELECT ?Line_name ?Synonym_line_name ?Line_type ?Lab_of_origin ?Zygosity ?Generation ?Status
                    ?Tag_type ?Molecular_tools ?Vector_name ?construction ?mutation_type ?reagents_and_protocols ?Vector_description
                    ?Gene_name ?Sequence ?Promoter ?Genome_version ?Genome_details ?Genome_date ?Ensembl_accession_number ?Genbank_accession_number ?NvERTx_ID
                    ?Chromosomes_number ?Locus_of_insertion ?Mutated_region
                    ?phen_label ?stage_label ?phen_type
                    ?Tag_type ?sub_label ?cell_label ?region_label ?supp_info
                    ?Publication_title ?Publication_date ?Publication_creator ?Publication_source ?Publication_id ?Publication_name
                    WHERE {
                          ?phenotypes rdf:type/rdfs:label ?phen_type;
                        rdfs:label ?phen_label;
                        obo:RO_0002092/rdfs:label ?stage_label.
                          {
                            SELECT ?phenotypes WHERE {
                              ?line geno:id ${id};
                                    obo:RO_0000053/obo:RO_0000053/obo:RO_0000053 ?phenotypes.
                    
                            }
                          }
                    }`,
                output: 3
            }
        }
    }
    before(async () => {
        const query = `
        PREFIX : <http://ircan.org/data/mutants>
        DELETE {?x ?y ?z} WHERE {
            FILTER(strstarts(str(?x), str(:)))
          ?x ?y ?z
        }`;

        await request(query, 'update')
    });

    it('new ID for data', async () => {
        assert.strictEqual(await findID(), 0)
        const query = `
        PREFIX : <http://ircan.org/data/mutants/>
        PREFIX obo: <http://purl.obolibrary.org/obo/>
        PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
        INSERT DATA {
           :test5 a obo:OBI_1000048;
                geno:id 5.    
          :test0 a obo:OBI_1000048;
                geno:id 0.
        }`
        await request(query, 'update')
        assert.strictEqual(await findID(), 6)
    })

    Object.keys(jsons).forEach((key) => {
        describe(`Tests input ${key}`, () => {
            const id = 2
            const q = queries(id)
            before(async () => {
                let query = JSONToSPARQL(id, jsons[key]);
                console.log(query)
                await request(query, 'update').catch((e) => console.log(Error(`ADD ERR ${e}`)))
            })
            Object.keys(q).forEach((node) => {
                it(`Get ${node} node`, async () => {
                    let data = await request(q[node].query, 'query')
                    let output = q[node].output;
                    if (typeof output === 'object') {
                        output = output[key]
                    }
                    assert.equal(Object.keys(data).length, output, JSON.stringify(data, null, 3))
                })
            })
        })
    })
});
