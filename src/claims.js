import Web3 from 'web3';

export const contract = (client, address) => {
    return new Claims(client, address);
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

        return await this._sidecar.take(hash);
    }

    place(key, value) {

    }
}

export {Claims};


export default contract;