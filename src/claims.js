export const contract = (client, address) => {
    return new Claims(client, address);
};


class Claims {
    constructor(client, address) {
        this.client = client;
        this.address = address;
    }

    sidecar(ipfs) {
        this.ipfs = ipfs;
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
                issuer: this.issuer,
                subject: this.subject,
                key
            }
        });

        return await this.ipfs.take(hash);
    }

    place(key, value) {

    }
}

export {Claims};


export default contract;