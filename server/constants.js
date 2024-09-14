export default {
    "endpointUrl": {
        development: "http://localhost:3030/NvCentral/",
        production: "http://localhost:3030/NvCentral/",
        test: "http://localhost:3030/NvCentralTest/",
    },
    "secretKEY": "nemato",
    "user": "admin",
    "queryType": {
        "query": "application/sparql-query",
        "update": "application/sparql-update"
    },
    "structJSON": {
        "Summary": {
            "Line_ID": "add",
            "Line_name": "Line_name",
            "Synonym_line_name": "Synonym_line_name",
            "Line_type": "Line_type",
            "Generation": "Generation",
            "Zygosity": "Zygosity",
            "Lab_of_origin": "Lab_of_origin",
            "Status": "Status",
            "Added by" : "Creator",
            "Date added" : "Created" 
        },
        "Genetic_modifications": {
            "Tag_type": "Tag_type",
            "Molecular_tools": "Molecular_tools",
            "Vector_name": "Vector_name",
            "Vector_description": "Vector_description",
            "Construction_description": "construction",
            "Mutation_type": "mutation_type",
            "Reagents_and_protocols": "reagents_and_protocols"
        },
        "Gene_information": {
            "Name": "Gene_name",
            "Sequence": "Sequence",
            "Promoter": "Promoter",
            "NvERTx_ID": "NvERTx_ID"
        },
        "Mutation": {
            "Chromosome's_number": "Chromosomes_number",
            "Locus_of_insertion": "Locus_of_insertion",
            "Mutated_region": "Mutated_region"
        },
        "Phenotype": {
            "Other": {
                "Sub-localization": "sub_label",
                "Cell_type": "cell_label",
                "Sub-body localization": "region_label",
                "Supplementary_information": "supp_info"
            },
            "Timeline": {
                "Title": [
                    "Embryo stage",
                    "Larval stage",
                    "Metamorphosis",
                    "Adult stage"
                ]
            }
        },
        "Genome": {
            "Browsers": [
                {
                    "text": "Ensembl",
                    "link": "Ensembl_accession_number"
                },
                {
                    "text": "Genbank",
                    "link": "Genbank_accession_number"
                }
            ],
            "Version": "Genome_version",
            "Date_": "Genome_date",
            "Details": "Genome_details"
        },
        "Publication": {
            "Title": "Publication_title",
            "Date": "Publication_date",
            "Creator": "Publication_creator",
            "Source": [
                {
                    "text": "PubMed",
                    "link": "Publication_source"
                }
            ],
            "Associated lines": "Publication_name"
        }
    }
}
