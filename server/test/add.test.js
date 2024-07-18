// test/add.test.js
import {before, describe, it} from 'node:test';
import assert from 'node:assert';
import {request} from "../global.js";
import {changeVisibilityNode, findID, JSONToSPARQL, sendEmail} from "../routes/add.js";


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
            "Genbank_ID": {},
            "Title": {"select": false, "value": "Bonne publi"},
            "Date": {"select": false, "value": "1999-04-23"},
            "Creator": {"select": false, "value": "MatMat"},
            "Source": {"select": false, "value": "nature.com"},
            "Reagents_and_protocols": {"select": false, "value": ""}
        },
        minimum: {
            Line_name: {select: false, value: 'bgbgb'},
            Synonym_line_name: {},
            Line_type: {select: true, value: 'http://ircan.org/schema/Functional'},
            Generation: {
                select: true,
                value: 'http://ircan.org/data/entities/F0'
            },
            Zygosity: {
                select: true,
                value: 'http://purl.obolibrary.org/obo/GENO_0000134'
            },
            Lab_of_origin: {select: true, value: 'http://ircan.org/data/entities/RentzschLab'},
            Status: {select: true, value: 'http://ircan.org/schema/established'},
            Exp: {select: false, value: null},
            Charac: {select: false, value: null},
            Tag_type: {select: false, value: 'NA'},
            Construction_description: {},
            Mutation_type: {},
            Reagents_and_protocols: {},
            Molecular_tools: {
                select: true,
                value: 'http://purl.obolibrary.org/obo/FBcv_0003008'
            },
            Name: {select: false, value: 'gene34'},
            Sequence: {},
            Promoter: {},
            'Ensembl accession number': {},
            Genbank_accession_number: {},
            Ensembl_ID: {},
            Genbank_ID: {},
            NvERTx_ID: {},
            "Chromosome's_number": {},
            Locus_of_insertion: {},
            Mutated_region: {},
            'Sub-localization': {select: true, value: 'http://ircan.org/schema/CellMembrane'},
            Cell_type: {select: true, value: 'http://ircan.org/schema/Cnidocyte'},
            Region_type: {select: true, value: 'http://ircan.org/schema/BodyWall'},
            Phenotype: [
                {
                    stage: 'http://ircan.org/schema/Developmental',
                    phenotype: 'http://ircan.org/schema/AdultStage',
                    value: ''
                }
            ],
            Version: {select: true, value: 'http://ircan.org/schema/GenomeV1'},
            Date_: {},
            Details: {},
            Publication: {select: true, value: 'Autre'}
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
                      geno:status/rdfs:label ?Status;
                      s:visibility s:Seen.
                }`,
                output: 7
            },
            search: {
                query: `
                PREFIX : <http://ircan.org/data/mutants>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo: <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX ac: <http://ircan.org/account/>
                PREFIX wac:     <http://www.w3.org/ns/auth/acl#>
                SELECT ?field ?ID ?Name ?Type ?Zygosity ?Generation ?Tag ?Tool ?Lab ?Status WHERE {
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
                            
                        ?line s:visibility s:Seen.
                }`,
                output: 10
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
                output: {'all': 6, 'minimum':4}
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
                output: 12
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
                output: {'all': 1, 'minimum':0}
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
                          
                          ?Publication rdfs:label ?Publication_title.
                          optional{?Publication dcterms:date ?Publication_date;
                          dcterms:creator ?Publication_creator;
                          dcterms:source ?Publication_source;
                          rdfs:seeAlso/geno:id ?Publication_id;
                          rdfs:seeAlso/rdfs:label ?Publication_name.}
                    }`,
                output: {'all': 6, 'minimum':1}
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
        PREFIX ac: <http://ircan.org/account/>
        DELETE {?x ?y ?z} WHERE {
            FILTER(strstarts(str(?x), str(:)) || strstarts(str(?x), str(ac:)))
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

    describe('Send email tests', () => {
        before(async () => {
            let query = `
            BASE <http://ircan.org/account/> 
            PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
            PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#> 
            PREFIX xs:      <http://www.w3.org/2001/XMLSchema#> 
            PREFIX foaf:    <http://xmlns.com/foaf/0.1/> 
            PREFIX wac:     <http://www.w3.org/ns/auth/acl#> 
            PREFIX s:       <http://ircan.org/schema/> 
            PREFIX mutants: <http://ircan.org/data/mutants/> 
            PREFIX owl:     <http://www.w3.org/2002/07/owl#>
            PREFIX sAc:     <http://ircan.org/schema/account/> 
            PREFIX geno:    <http://www.geneontology.org/formats/oboInOwl#> 
            INSERT DATA {
            
            sAc:password
                a          rdf:Property ;
                rdfs:label "has password" .
            
            sAc:director
                a          rdf:Property ;
                rdfs:label "has director" .
            
            <Administrator>
                a                foaf:Person ;
                foaf:accountName "admin" ;
                sAc:password     "$2b$12$LM.ZqyZzv7r6ankTnIKFweCi67DHNB9b2LB8LZdZwDaoblDSueEZK" ;
                foaf:name        "Admin User" .
            
            <Visitor>
                a         foaf:Person ;
                foaf:name "Visitor" .
            
            <EricRottinger>
                a                foaf:Person ;
                foaf:accountName "Rottinger" ;
                foaf:mbox        "matthieuferaud31@gmail.com" ;
                sAc:password     '$2b$12$8vIpFKlARJfvfX4FwvFt4OsZySTs0IB7qisdjNAEi/Cl/T/lPSK6q' ;
                foaf:name        "Admin User" .
            
            <LabRottingerLab>
                a                   foaf:Group ;
                foaf:member         <TeamMemberRottingerLabMatthieu> ;
                sAc:director        <EricRottinger> ;
                foaf:name           "Rottinger Lab" ;
                foaf:accountName    "RottingerTeam" ;
                sAc:password        '$2b$12$SunmSi3OAkfcCeAY1tqCged3kgAO0o8egZQ5.VA50mI7mLxCIUZsi' ;
                owl:equivalentClass mutants:LabRottingerLab2 .
            
            <TeamMemberRottingerLabMatthieu>
                a         foaf:Person ;
                foaf:name "Matthieu" .
            
            <AdminAccess>
                a            wac:Authorization ;
                wac:agent    <Administrator> ;
                wac:mode     wac:Read, wac:Write, wac:Append, wac:Control ;
                wac:accessTo s:established, s:genotyped, s:potentialMutants, s:injected, s:validated, s:sgRNAGeno, s:Initiated,
                             s:ToDo .
            
            <EricRottingerAccess>
                a            wac:Authorization ;
                wac:agent    <EricRottinger> ;
                wac:mode     wac:Read, wac:Write, wac:Append, wac:Control ;
                wac:accessTo s:established, s:genotyped, s:potentialMutants, s:injected, s:validated, s:sgRNAGeno, s:Initiated,
                             s:ToDo .
            
            <LabRottingerLabAccess>
                a              wac:Authorization ;
                wac:agentClass foaf:Group ;
                wac:agent      <LabRottingerLab> ;
                wac:mode       wac:Read ;
                wac:accessTo   s:established, s:genotyped, s:potentialMutants, s:injected, s:validated, s:sgRNAGeno, s:Initiated,
                               s:ToDo .
            
            <MemberRottingerLabMatthieuAccess>
                a            wac:Authorization ;
                wac:agent    <TeamMemberRottingerLabMatthieu> ;
                wac:mode     wac:Read, wac:Write, wac:Append, wac:Control ;
                wac:accessTo s:established, s:genotyped, s:potentialMutants, s:injected, s:validated, s:sgRNAGeno, s:Initiated,
                             s:ToDo .
            
            <VisitorAccess>
                a            wac:Authorization ;
                wac:agent    <Visitor> ;
                wac:mode     wac:Read ;
                wac:accessTo s:genotyped .

            }
            `
            //console.log(query)
            await request(query, 'update').catch((e) => console.log(Error(`ADD ERR ${e}`)))
        })
        it('send email nobody', async () => {
            const id = 2
            let account = 'Rottinger'
            let res = await sendEmail(account, id)
            assert.strictEqual(res, 'no director')
        })
        it('send email Director', async () => {
            const id = 2
            let account = 'LabRottingerLab'
            let res = await sendEmail(account, id)
            assert.strictEqual(res.response.includes('OK'), true)
        })
    })

    Object.keys(jsons).forEach((key,id) => {
        describe(`Tests input ${key}`, () => {
            const q = queries(id)
            before(async () => {
                let query = JSONToSPARQL(id, jsons[key]);
                //console.log(query)
                await request(query, 'update').catch((e) => console.log(Error(`ADD ERR ${e}`)))
            })
            Object.keys(q).forEach((node) => {
                it(`Get ${node} node`, async () => {
                    let data = await request(q[node].query, 'query')
                    let output = q[node].output;
                    if (typeof output === 'object') {
                        output = output[key]
                    }
                    if (node === 'line') {
                        assert.strictEqual(Object.keys(data).length, 0, JSON.stringify(data, null, 3))
                        await changeVisibilityNode(id)
                        data = await request(q[node].query, 'query')
                        output = q[node].output;
                    }
                    if (node === "search"){
                        assert.strictEqual(Object.keys(data.Name).length, id+1, JSON.stringify(data, null, 3))
                    } else {
                        assert.strictEqual(Object.keys(data).length, output, JSON.stringify(data, null, 3))
                    }
                })
            })
        })
    })
});
