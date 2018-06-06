import chai from 'chai';

const expect = chai.expect;
import {contract} from './claims';
import {IPFS} from "./ipfs";
import {ChainClient} from './chainclient';


describe('claims', () => {
    const identity =
        `{
            "@context": "https://w3id.org/did/v1",
            "id": "fakeid",
            "publicKey": [{
                "id": "fakeid#keys-1",
                "type": "Secp256k1VerificationKey2018",
                "owner": "fakeid",
                "publicKeyHex": "04613bb3a4874d27032618f020614c21cbe4c4e4781687525f6674089f9bd3d6c7f6eb13569053d31715a3ba32e0b791b97922af6387f087d6b5548c06944ab062"
            }],
            "authentication": [{
                "type": "Secp256k1SignatureAuthentication2018",
                "publicKey": "fakeid#keys-1"
            }]
        }`;

    let client = new ChainClient();

    let ipfs = new IPFS();


    before(async () => {
        client.call = (tx) => {
            return "ipfs_hash_for_kayla"
        };
        ipfs.take = (id) => {
            if (id === "ipfs_hash_for_kayla") {
                return identity;
            } else {
                return Promise.reject("Not found");
            }
        };
    });

    it('should able to get the claim issued by issuer for subject', async () => {
        let value = await contract(client, "0x0000")
            .sidecar(ipfs)
            .from("0xissuer")
            .for("0xsubject")
            .take("BlockCityPassport");
        expect(value).to.be.equal(identity);
    });
});
