

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

sparql_query = f'''
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
SELECT * WHERE {
  SERVICE <https://sparql.uniprot.org/sparql> {
    ?x a up:Protein.
    ?x rdfs:label ?label.
  }
} LIMIT 10'''

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
