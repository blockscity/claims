import Web3 from 'web3';
export const contract = (client, address) => {
    if (!Web3.utils.isAddress(address)) {
        throw new Error(`contract address ${address} invalid`);
    }
    return new Claims(client, address);
};

const bytes2s = (key) => {
    return Buffer.from(key.split('00').join('').slice(2), 'hex').toString();
};

class Claims {
    constructor(client, address) {
        this.client = client;
        this.address = address;
    }

    sidecar(sidecar) {
        this._sidecar = sidecar;
        return this;
    }

    from(issuer) {
        this.issuer = issuer;
        return this;
    }


    for(subject) {
        this.subject = subject;
        return this;
    }

    async take(key) {
        if (this.issuer === undefined || this.issuer === null) {
            return Promise.reject("issuer needed")
        }

        if (this.subject === undefined || this.subject === null) {
            return Promise.reject("subject needed")
        }

        let hash = await this.client.call({
            to: this.address,
            data: {
                type: "call",
                method: "get",
                params: [
                    this.issuer,
                    this.subject,
                    Web3.utils.toHex(key)
                ]
            }
        });

        let v = bytes2s(hash);
        if (v === "") {
            return "";
        }

        return await this._sidecar.take(v);
    }

    place(key, value) {

    }
}

export {Claims};


export default contract;