// test/auth.test.js
import { describe, it, before } from "node:test";
import assert from "node:assert";
import { checkRightsData } from "../routes/auth.js";
import { request } from "../global.js";

describe("Auth Client Tests", async function () {
  before(async () => {
    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xs: <http://www.w3.org/2001/XMLSchema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX wac: <http://www.w3.org/ns/auth/acl#>
        PREFIX s: <http://ircan.org/schema/>
        PREFIX mutants: <http://ircan.org/data/mutants/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX sAc: <http://ircan.org/schema/account/>
        PREFIX geno: <http://www.geneontology.org/formats/oboInOwl#>
        PREFIX sioc: <http://rdfs.org/sioc/ns#>
        PREFIX en: <http://ircan.org/data/entities/>
        BASE <http://ircan.org/account/>

        INSERT DATA {
            sAc:password a rdf:Property ;
                rdfs:label "has password" .

            sAc:director a rdf:Property ;
                rdfs:label "has director" .

            <Administrator> a sioc:UserAccount ;
                sioc:name "admin" ;
                sAc:password "$2b$12$LM.ZqyZzv7r6ankTnIKFweCi67DHNB9b2LB8LZdZwDaoblDSueEZK" ;
                wac:accessControl <AccessAppendNvCentral>, <AccessWriteNvCentral>, <AccessReadNvCentral>, <AccessControlNvCentral> .

            <AllGroup> a sioc:Usergroup ;
                sioc:has_member <Visitor>, <LabRottingerLab> ;
                wac:accessControl <AllGroupAccess> .

            <AllGroupAccess> a wac:Authorization ;
                wac:agentClass <AllGroup> ;
                wac:mode wac:Read ;
                wac:accessTo s:published .

            <Visitor> a sioc:UserAccount .

            <EricRottinger> a sioc:UserAccount ;
                sioc:member_of <LabRottingerLab> ;
                sioc:name "Rottinger" ;
                sioc:email "matthieuferaud31@gmail.com" ;
                sAc:password '$2b$12$8vIpFKlARJfvfX4FwvFt4OsZySTs0IB7qisdjNAEi/Cl/T/lPSK6q' ;
                wac:accessControl <EricRottingerAccessLine> .

            <EricRottingerAccessLine> a wac:Authorization ;
                wac:agent <EricRottinger> ;
                wac:mode wac:Read, wac:Write ;
                wac:accessTo en:LabRottingerLab2 .

            <LabRottingerLab> a sioc:Usergroup ;
                sioc:member_of <AllGroup> ;
                sAc:director <EricRottinger> ;
                sioc:has_member <MatthieuFeraud>, <EricRottinger> ;
                wac:accessControl <LabRottingerLabAccessLabRottinger2>, <AccessAppendNvCentral> .

            <LabRottingerLabAccessLabRottinger2> a wac:Authorization ;
                wac:agent <LabRottingerLab> ;
                wac:mode wac:Read ;
                wac:accessTo en:LabRottingerLab2 .

            <MatthieuFeraud> a sioc:UserAccount ;
                sioc:member_of <LabRottingerLab> ;
                foaf:accountName "RottingerTeam" ;
                sAc:password '$2b$12$SunmSi3OAkfcCeAY1tqCged3kgAO0o8egZQ5.VA50mI7mLxCIUZsi' ;
                wac:accessControl <AccessAppendNvCentral>, <MatthieuFeraudAccessLine1> .

            <MatthieuFeraudAccessLine1> a wac:Authorization ;
                wac:agent <MatthieuFeraud>, <EricRottinger> ;
                wac:mode wac:Read, wac:Write ;
                wac:accessTo mutants:Line1 .

            <AccessAppendNvCentral> a wac:Authorization ;
                wac:mode wac:Append ;
                wac:accessTo <NvCentral> .

            <AccessWriteNvCentral> a wac:Authorization ;
                wac:mode wac:Write ;
                wac:accessTo <NvCentral> .

            <AccessReadNvCentral> a wac:Authorization ;
                wac:mode wac:Read ;
                wac:accessTo <NvCentral> .

            <AccessControlNvCentral> a wac:Authorization ;
                wac:mode wac:Control ;
                wac:accessTo <NvCentral> .

            <NvCentral> a foaf:Project ;
                rdfs:label "NvCentral" .
        }`;

    await request(query, "update");
  });
  it("check rights", async () => {
    let node = "http://ircan.org/data/mutants/Line1";
    let rights = await checkRightsData(node, "MatthieuFeraud");
    console.log(rights);
    assert.notStrictEqual(rights, -1, rights);
    node = "http://ircan.org/data/mutants/Line3";
    rights = await checkRightsData(node, "MatthieuFeraud");
    assert.strictEqual(rights, -1, rights);
  });
});
