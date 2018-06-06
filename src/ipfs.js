

class IPFS {

    constructor(api) {
        this.api = api;
    }

    async place(data, options) {

    };

    async take(id) {
        return this.api.files.get(id).then(r => r[0].content).then(c => c.toString("utf8"));
    }
}

export {IPFS}