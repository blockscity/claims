import chai from 'chai';
import ipfsAPI from 'ipfs-api'

const expect = chai.expect;
import {IPFS} from "./ipfs";

describe('IPFS', () => {
    let ipfs;
    let api;
    let hash;

    const bytes2s = (key) => {
        return Buffer.from(key.split('00').join('').slice(2), 'hex').toString();
    };

    before(async () => {
        api = ipfsAPI("/ip4/127.0.0.1/tcp/5002");
        hash = await api.files.add(Buffer.from("test")).then(
            a => a[0].hash
        )
    });

    it('should able to take ipfs by hash', async () => {
        ipfs = new IPFS(api);

        let value = await ipfs.take(hash);
        expect(value).to.be.equal("test")
    });
});