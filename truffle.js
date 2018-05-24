const TestRPC = require("ganache-cli");

module.exports = {
    networks: {
        test: {
            provider: TestRPC.provider({total_accounts: 10}),
            network_id: "*"
        },
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 4612388
        }
    }
};
