const TestRPC = require("ganache-cli");

module.exports = {
    networks: {
        development: {
            provider: TestRPC.provider({total_accounts: 10}),
            network_id: "*"
        }
    }
};
