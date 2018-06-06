import Claims from '../build/contracts/Claims.json';

class ChainClient {
    constructor(web3) {
        this.web3 = web3;
        this.abi = Claims.abi;
    }

    async call(tx) {
        let contract = await new this.web3.eth.Contract(this.abi, tx.to);
        return await contract.methods[tx.data.method](...tx.data.params).call();
    };
}


export {ChainClient}