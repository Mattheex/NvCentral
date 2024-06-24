import matplotlib.pyplot as plt
import networkx as nx
from rdflib import Graph, Namespace

# Load Turtle graph
g = Graph()
g.parse("data.ttl", format="turtle")
g.parse("GENO.ttl", format="turtle")
g.parse("RO.ttl", format="turtle")
g.parse("response.ttl", format="turtle")

ns = Namespace("http://ircan/data/")

query = f"""
    PREFIX ns: <{ns}>
    SELECT ?s ?label2 ?o
    WHERE {{
        ?s ?p ?o .
        optional {{?p rdfs:label ?label}}
        bind(coalesce(?label, "type") as ?label2)
        FILTER (str(?s) = str(ns:Line1) || str(?s) = str(ns:Exp1))
    }}
"""
# Execute the query
results = g.query(query)

# Convert RDF data to NetworkX MultiDiGraph
graph = nx.MultiDiGraph()
for triple in results:
    subject, predicate, obj = triple
    graph.add_node(subject)
    graph.add_node(obj)
    graph.add_edge(subject, obj, key=predicate)

# Display as image
pos = nx.spring_layout(graph)
plt.figure(figsize=(10, 10))
nx.draw(graph, pos, with_labels=True, node_color="skyblue", node_size=2000, font_size=10, arrowsize=20)
plt.show()
