var Migrations = artifacts.require("./TokiFabric.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations, "Toki", "TOKI");
};
