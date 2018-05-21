var Claims = artifacts.require("./Claims.sol");

module.exports = (deployer) => {
    deployer.deploy(Claims);
};