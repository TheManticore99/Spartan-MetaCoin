const MetaToken = artifacts.require("MetaToken");

module.exports = async function (deployer) {
  const name = "My Token";
  const symbol = "MYT";
  const initialSupply = web3.utils.toWei("1000000"); // 1,000,000 MYT (18 desimal)
  await deployer.deploy(MetaToken, name, symbol, initialSupply);
};
