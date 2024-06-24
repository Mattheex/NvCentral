@echo off

start cmd /k "cd /d client & npm start"
start cmd /k "cd /d server & npm run dev"
start cmd /k "cd /d apache-jena-fuseki-5.0.0 & .\fuseki-server --update"
 
:: java  -jar .\corese-server-4.5.0.jar -l "Database/data.ttl" -l "Database/response.ttl" -l "Database/GENO.ttl" -l "Database/RO.ttl" -l "Database/NCICB.ttl" -l "Database/schema.ttl"