from SPARQLWrapper import SPARQLWrapper
from rdflib import Graph, Namespace, RDFS

# Step 1: Run the JAR file
jar_file_path = "corese-server-4.5.0.jar"
# server_process = subprocess.Popen(["java", "-jar", jar_file_path])

# Wait for some time to let the server start (adjust this according to your server startup time)
# time.sleep(2)

server_url = "http://localhost:8080/sparql"  # Replace port with the actual port your server is running on
sparql = SPARQLWrapper(server_url)
graph = Graph()

g = Graph()
g.parse("data.ttl")
sio = Namespace("http://semanticscience.org/resource/")
mesh = Namespace('http://purl.bioontology.org/ontology/MESH/')
uniprotKB = Namespace('http://purl.uniprot.org/uniprot/')
taxon = Namespace('http://purl.uniprot.org/taxonomy/')
up = Namespace('http://purl.uniprot.org/core/')
go = Namespace('http://purl.obolibrary.org/obo/GO_')
geno = Namespace('http://purl.obolibrary.org/obo/GENO_')
# Define the SPARQL query
query = f"""
    PREFIX mesh: <{mesh}>
    PREFIX uniprotKB: <{uniprotKB}>
    PREFIX taxon: <{taxon}>
    PREFIX go: <{go}>
    PREFIX geno: <{geno}>
    SELECT ?s ?p ?o
    WHERE {{
        ?s ?p ?o .
        FILTER (STRSTARTS(str(?o), str(mesh:)) || STRSTARTS(str(?o), str(taxon:)) || 
        STRSTARTS(str(?o), str(uniprotKB:)) || STRSTARTS(str(?o), str(go:)) || STRSTARTS(str(?o), str(geno:)))
    }}
"""
#FILTER (STRSTARTS(str(?o), str(mesh:)) || STRSTARTS(str(?o), str(uniprotKB:)) || STRSTARTS(str(?o), str(taxon:) ||
results = g.query(query)
queries = []
terms = []
for s, p, o in results:
    sub = g.qname(o)
    if sub not in terms:
        queries.append(f'{sub} ?p ?y')
        terms.append(sub)

print(queries)
for query in queries:
    sparql_query = f'''
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX vg: <http://biohackathon.org/resource/vg#>
    PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
    PREFIX uberon: <http://purl.obolibrary.org/obo/uo#>
    PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
    PREFIX sp: <http://spinrdf.org/sp#>
    PREFIX sio: <http://semanticscience.org/resource/>
    PREFIX schema: <http://schema.org/>
    PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
    PREFIX rh: <http://rdf.rhea-db.org/>
    PREFIX pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>
    PREFIX ps: <http://www.wikidata.org/prop/statement/>
    PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
    PREFIX patent: <http://data.epo.org/linked-data/def/patent/>
    PREFIX p: <http://www.wikidata.org/prop/>
    PREFIX orthodbGroup: <http://purl.orthodb.org/odbgroup/>
    PREFIX orthodb: <http://purl.orthodb.org/>
    PREFIX orth: <http://purl.org/net/orth#>
    PREFIX np: <http://nextprot.org/rdf#>
    PREFIX nextprot: <http://nextprot.org/rdf/entry/>
    PREFIX mnx: <https://rdf.metanetx.org/schema/>
    PREFIX mnet: <https://rdf.metanetx.org/mnet/>
    PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
    PREFIX lscr: <http://purl.org/lscr#>
    PREFIX lipidmaps: <https://www.lipidmaps.org/rdf/>
    PREFIX keywords: <http://purl.uniprot.org/keywords/>
    PREFIX insdcschema: <http://ddbj.nig.ac.jp/ontologies/nucleotide/>
    PREFIX insdc: <http://identifiers.org/insdc/>
    PREFIX identifiers: <http://identifiers.org/>
    PREFIX glyconnect: <https://purl.org/glyconnect/>
    PREFIX glycan: <http://purl.jp/bio/12/glyco/glycan#>
    PREFIX genex: <http://purl.org/genex#>
    PREFIX faldo: <http://biohackathon.org/resource/faldo#>
    PREFIX eunisSpecies: <http://eunis.eea.europa.eu/rdf/species-schema.rdf#>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX dc: <http://purl.org/dc/terms/>
    PREFIX chebislash: <http://purl.obolibrary.org/obo/chebi/>
    PREFIX chebihash: <http://purl.obolibrary.org/obo/chebi#>
    PREFIX cco: <http://rdf.ebi.ac.uk/terms/chembl#>
    PREFIX busco: <http://busco.ezlab.org/schema#>
    PREFIX bibo: <http://purl.org/ontology/bibo/>
    PREFIX allie: <http://allie.dbcls.jp/>
    PREFIX SWISSLIPID: <https://swisslipids.org/rdf/SLM_>
    PREFIX up: <http://purl.uniprot.org/core/>
    PREFIX go: <http://purl.obolibrary.org/obo/GO_>
    CONSTRUCT {{
        {query}
    }} WHERE {{
        optional {{
            SERVICE mesh:sparql {{
                {query}
            }}
        }}
        optional {{
            SERVICE <https://sparql.uniprot.org/sparql>  {{
                {query}
            }}
        }}
        optional {{
            SERVICE <https://rdf.geneontology.org/blazegraph/sparql> {{
                {query}
            }}
        }}
    }}'''

    """import requests

    file_path = '/path/to/your/file.txt'

    response = requests.request(url=server_url, data=sparql_query, method='POST')

    if response.status_code == 200:
        print("File uploaded successfully.")
        print(response.text)
    else:
        print("Failed to upload file. Status code:", response.status_code)"""


    # print(sparql_query)

    sparql.setQuery(sparql_query)
    sparql.setReturnFormat('turtle')

    # print(f"query OK")
    results = sparql.query()
    # print(results)
    results = results.convert()

    # print(f"request OK")

    # print(results)

    Rgraph = Graph()
    Rgraph.parse(data=results, format='turtle')
    for prefix, namespace in Rgraph.namespaces():
        graph.bind(prefix, namespace)

    # print(f"binding OK")

    for triple in Rgraph:
        print(triple[0])
        print(triple[1])
        if up in triple[0] and 'scientificName' in triple[1]:
            graph.add((triple[0], RDFS.label, triple[2]))
        graph.add(triple)

    print(f"{query} OK")

graph.serialize(destination="response.ttl")
