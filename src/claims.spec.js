import chai from 'chai';

const expect = chai.expect;
import {contract} from './claims';
import {IPFS} from "./ipfs";
import {ChainClient} from './chainclient';
import Web3 from "web3";
import ganache from "ganache-cli";
import Claims from '../build/contracts/Claims.json';


describe('claims', () => {
    let web3;
    let chainClient;
    let claims;
    let issuer;
    let subject;
    let pseudo;
    let key;
    let unknownKey;
    let value;
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


    let ipfs = new IPFS();


    before(async () => {
        web3 = new Web3();
        web3.setProvider(ganache.provider());
        let accounts = await web3.eth.getAccounts();
        issuer = accounts[0];
        subject = accounts[1];
        pseudo = accounts[2];
        key = "BlockCityPassport";
        value = "ipfs_hash_for_kayla";
        unknownKey = "unknownKey";

        let deployed = await new web3.eth.Contract(Claims.abi)
            .deploy({data: Claims.bytecode, arguments: []})
            .send({
                from: issuer,
                gas: 1500000,
                gasPrice: '30000000000000'
            });
        claims = deployed.options.address;

        await deployed.methods.set(subject, web3.utils.toHex(key), web3.utils.toHex(value)).send({
            from: issuer
        });

        chainClient = new ChainClient(web3);
        ipfs.take = (id) => {
            if (id === "ipfs_hash_for_kayla") {
                return identity;
            } else {
                return Promise.reject("Not found");
            }
        };
    });

    it('should able to get the claim issued by issuer for subject', async () => {
        let value = await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(issuer)
            .for(subject)
            .take(key);
        expect(value).to.be.equal(identity);
    });

    it('should not able to get the claim with non existed issuer', async () => {
        let value = await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(pseudo)
            .for(subject)
            .take(key);
        expect(value).to.be.equal("");
    });

    it('should not able to get the claim with non existed subject', async () => {
        let value = await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(issuer)
            .for(pseudo)
            .take(key);
        expect(value).to.be.equal("");
    });

    it('should not able to get the empty claim when key not set', async () => {
        let value = await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(issuer)
            .for(subject)
            .take(unknownKey);
        expect(value).to.be.equal("");
    });

    it('should error when no issuer defined', async () => {
        await contract(chainClient, claims)
            .sidecar(ipfs)
            .for(subject)
            .take(key)
            .then(() => {
                return Promise.reject("should remind set the issuer");
            })
            .catch(e => {
                if (typeof e === "string" && e === "issuer needed") {
                    // ok
                } else {
                    expect.fail("should remind set the issuer")
                }
            });
    });

    it('should error when no subject defined', async () => {
        await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(issuer)
            .take(key)
            .then(() => {
                return Promise.reject("should remind set the subject");
            })
            .catch(e => {
                if (typeof e === "string" && e === "subject needed") {
                    // ok
                } else {
                    throw new Error("should remind set the subject");
                }
            });
    });

    it('should error when no subject defined', async () => {
        await contract(chainClient, claims)
            .sidecar(ipfs)
            .from(issuer)
            .take(key)
            .then(() => {
                return Promise.reject("should remind set the subject");
            })
            .catch(e => {
                if (typeof e === "string" && e === "subject needed") {
                    // ok
                } else {
                    throw new Error("should remind set the subject");
                }
            });
    });

    it('should error claims not valid address', async () => {
        let invalidAddress = "0x000000";
        try {
            await contract(chainClient, invalidAddress)
                .sidecar(ipfs)
                .from(issuer)
                .for(subject)
                .take(key);
        } catch (e) {
            if (typeof e === "object" && e.message === `contract address ${invalidAddress} invalid`) {
                // ok
            } else {
                throw new Error("init contract with valid address");
            }
        }
    });
});
