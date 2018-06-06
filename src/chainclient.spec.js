import chai from 'chai';

const expect = chai.expect;

import {ChainClient} from './chainclient';
import ganache from "ganache-cli";
import Web3 from 'web3';
import Claims from '../build/contracts/Claims.json';

describe('ChainClient', () => {
    let chainClient;
    let claims;
    let issuer;
    let subject;
    let pseudo;
    let key;
    let unknownKey;
    let value;
    let web3;

    const bytes2s = (key) => {
        return Buffer.from(key.split('00').join('').slice(2), 'hex').toString();
    };

    before(async () => {
        web3 = new Web3();
        web3.setProvider(ganache.provider());
        let accounts = await web3.eth.getAccounts();
        issuer = accounts[0];
        subject = accounts[1];
        pseudo = accounts[2];
        key = "BlockCityPassport";
        value = "value";
        unknownKey = "unknownKey";
        let deployed = await new web3.eth.Contract(Claims.abi)
            .deploy({data: Claims.bytecode, arguments: []})
            .send({
                from: issuer,
                gas: 1500000,
                gasPrice: '30000000000000'
            });
        await deployed.methods.set(subject, web3.utils.toHex(key), web3.utils.toHex(value)).send({
            from: issuer
        });

        claims = deployed.options.address;
    });

    it('should able to encode and call the contract', async () => {
        chainClient = new ChainClient(web3);
        let v = await chainClient.call(
            {
                to: claims,
                data: {
                    type: "call",
                    method: "get",
                    params: [
                        issuer,
                        subject,
                        web3.utils.toHex(key)
                    ]
                }
            }
        );

        expect(bytes2s(v)).to.be.equal(value);
    });

    it('should return empty when get with unknown issuer', async () => {
        chainClient = new ChainClient(web3);
        let v = await chainClient.call(
            {
                to: claims,
                data: {
                    type: "call",
                    method: "get",
                    params: [
                        pseudo,
                        subject,
                        web3.utils.toHex(key)
                    ]
                }
            }
        );

        expect(bytes2s(v)).to.be.equal("");
    });

    it('should return empty when get with unknown subject', async () => {
        chainClient = new ChainClient(web3);
        let v = await chainClient.call(
            {
                to: claims,
                data: {
                    type: "call",
                    method: "get",
                    params: [
                        issuer,
                        pseudo,
                        web3.utils.toHex(key)
                    ]
                }
            }
        );

        expect(bytes2s(v)).to.be.equal("");
    });

    it('should return empty when get with unknown key', async () => {
        chainClient = new ChainClient(web3);
        let v = await chainClient.call(
            {
                to: claims,
                data: {
                    type: "call",
                    method: "get",
                    params: [
                        issuer,
                        subject,
                        web3.utils.toHex(unknownKey)
                    ]
                }
            }
        );

        expect(bytes2s(v)).to.be.equal("");
    });
});