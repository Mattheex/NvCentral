// test/auth.test.js
import { describe, it, before } from "node:test";
import assert from "node:assert";
import { getRights, getUsername } from "../routes/auth.js";
import { request } from "../global.js";

describe("Auth Client Tests", async function () {
  before(async () => {
    let query = `
        DELETE {?x ?y ?z} WHERE {
            FILTER(strstarts(str(?x), str(mut:)) || strstarts(str(?x), str(ac:)))
          ?x ?y ?z
        }`;

    await request(query, "update");

    query = `
        INSERT DATA {
            mut:Line1 a obo:OBI_1000048;
                geno:id 0;
                obo:NCIT_C42628  en:TechnauLab ;
                geno:status  s:published.

            mut:Line2 a obo:OBI_1000048;
                geno:id 1;
                obo:NCIT_C42628  en:RentzschLab ;
                geno:status  s:published.
            
            mut:Line3 a obo:OBI_1000048;
                geno:id 2;
                obo:NCIT_C42628  en:LabRottingerLab2 ;
                geno:status  s:genotyped.
        }`;

    await request(query, "update");
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
  it("check rights", async () => {
    const query = `
        INSERT DATA {
            ac:AllGroup
                a                 sioc:Usergroup ;
                wac:accessControl ac:AllGroupAccess .

            ac:AllGroupAccess a wac:Authorization ;
                wac:agentClass ac:AllGroup ;
                wac:mode wac:Read ;
                wac:accessTo s:published .

            ac:Visitor a sioc:UserAccount ;
                sioc:member_of ac:AllGroup.

            ac:LabRottingerLab a sioc:Usergroup ;
                sioc:member_of ac:AllGroup ;
                sAc:hasDirector ac:EricRottinger ;
                wac:accessControl ac:LabRottingerLabAccessLabRottinger2, ac:AccessAppendNvCentral .

            ac:LabRottingerLabAccessLabRottinger2 a wac:Authorization ;
                wac:agent ac:LabRottingerLab ;
                wac:mode wac:Read ;
                wac:accessTo en:LabRottingerLab2 .

            ac:MatthieuFeraud a sioc:UserAccount ;
                sioc:member_of ac:LabRottingerLab ;
                foaf:accountName "RottingerTeam" ;
                sAc:password '$2b$12$SunmSi3OAkfcCeAY1tqCged3kgAO0o8egZQ5.VA50mI7mLxCIUZsi' ;
                wac:accessControl ac:MatthieuFeraudAccessLine1 .

            ac:MatthieuFeraudAccessLine1 a wac:Authorization ;
                wac:agent ac:MatthieuFeraud;
                wac:mode wac:Write ;
                wac:accessTo mut:Line1 .

            ac:AccessReadNvCentral
                a            wac:Authorization ;
                wac:mode     wac:Read ;
                wac:accessTo sAc:NvCentral .

            ac:AccessAppendNvCentral
                a            wac:Authorization ;
                wac:mode     wac:Append ;
                wac:accessTo sAc:NvCentral .
        }`;

    await request(query, "update");

    let node = "mut:Line3";
    let rights = await getRights("MatthieuFeraud", node);
    assert.deepEqual(
      rights,
      {
        read: true,
        write: false,
        append: false,
        control: false,
        node: ["http://ircan.org/data/mutants/Line3"],
      },
      rights
    );
    rights = await getRights("Visitor");
    assert.deepEqual(
      rights,
      {
        read: [true, true],
        write: [false, false],
        append: [false, false],
        control: [false, false],
        node: ["http://ircan.org/data/mutants/Line1", "http://ircan.org/data/mutants/Line2"],
      },
      rights.toString()
    );
    node = "mut:Line1";
    rights = await getRights("MatthieuFeraud", node);
    assert.deepEqual(
      rights,
      {
        read: true,
        write: true,
        append: false,
        control: false,
        node: ["http://ircan.org/data/mutants/Line1"],
      },
      rights
    );
  });
  it("get username", async () => {
    const username = await getUsername("MatthieuFeraud");
    assert.equal(username, "RottingerTeam", username);
  });
});
