#!/bin/bash
#   Licensed to the Apache Software Foundation (ASF) under one or more
#   contributor license agreements.  See the NOTICE file distributed with
#   this work for additional information regarding copyright ownership.
#   The ASF licenses this file to You under the Apache License, Version 2.0
#   (the "License"); you may not use this file except in compliance with
#   the License.  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

set -e


# Read the secret from the Docker secret file
# if [ -f /run/secrets/key ]; then
#   ADMIN_PASSWORD="$(cat /run/secrets/key)"
# else
#   echo "Error: Secret not found!"
#   exit 1
# fi

if [ ! -f "$FUSEKI_BASE/shiro.ini" ] ; then
  # First time
  echo "###################################"
  echo "Initializing Apache Jena Fuseki"
  echo ""
  cp "$FUSEKI_HOME/shiro.ini" "$FUSEKI_BASE/shiro.ini"
  if [ -z "$ADMIN_PASSWORD" ] ; then
    ADMIN_PASSWORD=$(pwgen -s 15)
    echo "Randomly generated admin password:"
    echo ""
    echo "admin=$ADMIN_PASSWORD"
  fi
  echo ""
  echo "###################################"
fi

if [ -d "/fuseki-extra" ] && [ ! -d "$FUSEKI_BASE/extra" ] ; then
  ln -s "/fuseki-extra" "$FUSEKI_BASE/extra" 
fi

# $ADMIN_PASSWORD only modifies if ${ADMIN_PASSWORD}
# is in shiro.ini
if [ -n "$ADMIN_PASSWORD" ] ; then
  export ADMIN_PASSWORD
  envsubst '${ADMIN_PASSWORD}' < "$FUSEKI_BASE/shiro.ini" > "$FUSEKI_BASE/shiro.ini.$$" && \
    mv "$FUSEKI_BASE/shiro.ini.$$" "$FUSEKI_BASE/shiro.ini"
  export ADMIN_PASSWORD
fi

# fork 
exec "$@" &

TDB_VERSION=''
if [ ! -z ${TDB+x} ] && [ "${TDB}" = "2" ] ; then 
  TDB_VERSION='tdb2'
else
  TDB_VERSION='tdb'
fi

# Wait until server is up
echo "Waiting for Fuseki to finish starting up..."
until $(curl --output /dev/null --silent --head --fail http://localhost:3030); do
  sleep 1s
done

# Convert env to datasets
printenv | egrep "^FUSEKI_DATASET_" | while read env_var
do
    dataset=$(echo $env_var | egrep -o "=.*$" | sed 's/^=//g')
    echo "Creating dataset $dataset"
    curl -s 'http://localhost:3030/$/datasets'\
         -u admin:${ADMIN_PASSWORD}\
         -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'\
         --data "dbName=${dataset}&dbType=${TDB_VERSION}"
done

echo "${ADMIN_PASSWORD}"

curl -s 'http://localhost:3030/$/datasets'\
         -u admin:${ADMIN_PASSWORD}\
         -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'\
         --data "dbName=NvCentral&dbType=${TDB_VERSION}"



curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/account.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/schema.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/min-ontology.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/acl.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/data.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/entities.ttl \
  "http://localhost:3030/NvCentral/"

curl -X POST \
  -u admin:${ADMIN_PASSWORD}\
  -H "Content-Type: text/turtle" \
  --data-binary @/jena-fuseki/ns.rdf \
  "http://localhost:3030/NvCentral/"

echo "Fuseki is available :-)"
unset ADMIN_PASSWORD # Don't keep it in memory

# rejoin our exec
wait
