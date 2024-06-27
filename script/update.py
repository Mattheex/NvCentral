from sys import setrecursionlimit

from SPARQLWrapper import SPARQLWrapper, TURTLE
from otsrdflib import OrderedTurtleSerializer
from rdflib import Graph, Namespace
from rdflib.namespace import RDF

# Define the SPARQL endpoint
sparql_endpoint = "http://localhost:3030/NvCentral/sparql"  # Replace with your SPARQL endpoint URL

setrecursionlimit(1000000)


def saveRDF(file, base, sparql_query):
    # Initialize the SPARQL wrapper
    sparql = SPARQLWrapper(sparql_endpoint)
    sparql.setQuery(sparql_query)
    sparql.setReturnFormat(TURTLE)

    # Execute the query and get results in Turtle format

    print("Execute query ...")
    results = sparql.query().convert()

    # Create an RDF graph

    print("Parse query ...")
    g = Graph()
    g.parse(data=results, format="turtle")

    namespaces = {
        'obo': "http://purl.obolibrary.org/obo/",
        'geno': "http://www.geneontology.org/formats/oboInOwl#",
        'bao': "http://www.bioassayontology.org/bao#",
        's': "http://ircan.org/schema/",
        'edam': "http://edamontology.org/",
        'data': "http://ircan.org/data/mutants/",
        'taxon': "http://purl.uniprot.org/taxonomy/",
        'account':"http://ircan.org/account/"
    }

    if file != "ontologies.ttl":
        print("Bind graph ...")
        for prefix, uri in namespaces.items():
            g.bind(prefix, Namespace(uri))

    print("Save graph ...")
    if file == "ontologies.ttl":
        g.serialize(destination=file, format="turtle")
    else:
        serializer = OrderedTurtleSerializer(g)
        serializer.class_order = [
            RDF.type
        ]
        with open(file, 'wb') as fp:
            serializer.serialize(fp, base=namespaces.get(base) if base else None)

    print(f"RDF data has been saved to {file}")


queries = {
    'data.ttl': {
        'namespace': 'data',
        'query': """
                PREFIX : <http://ircan.org/data/>
                CONSTRUCT {
                  ?x ?y ?z
                } WHERE {
                  FILTER (strstarts(str(?x), str(:)))
                  ?x ?y ?z.
                }
                """
    },
    'schema.ttl': {
        'namespace': 's',
        'query': """
                PREFIX s: <http://ircan.org/schema/>
                CONSTRUCT {
                  ?x ?y ?z
                } WHERE {
                  FILTER (strstarts(str(?x), str(s:)))
                  ?x ?y ?z.
                }
                """
    },
    'account.ttl': {
            'namespace': 'account',
            'query': """
                    PREFIX ac: <http://ircan.org/account/>
                    CONSTRUCT {
                      ?x ?y ?z
                    } WHERE {
                      FILTER (strstarts(str(?x), str(ac:)))
                      ?x ?y ?z.
                    }
                    """
        },
    'ontologies.ttl': {
        'namespace': None,
        'query': """
                PREFIX : <http://ircan.org/data/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX obo:       <http://purl.obolibrary.org/obo/>
                PREFIX geno:      <http://www.geneontology.org/formats/oboInOwl#>
                PREFIX up:        <http://purl.uniprot.org/core/>
                PREFIX edam:      <http://edamontology.org/>
                PREFIX bao:       <http://www.bioassayontology.org/bao#>
                PREFIX s:         <http://ircan.org/schema/>
                PREFIX dcterms:   <http://purl.org/dc/terms/>
                CONSTRUCT {
                  ?x ?y ?z
                } WHERE {
                  FILTER (!strstarts(str(?x), str(:)) && !strstarts(str(?x), str(s:)))
                  ?x ?y ?z.
                }
                """
    }
}

for file, data in queries.items():
    print(f'{file}...')
    saveRDF(f'Database/{file}', data['namespace'], data['query'])
