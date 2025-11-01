const MetaToken       = artifacts.require("MetaToken");
const LeetTokenSender = artifacts.require("LeetTokenSender");

module.exports = async function (deployer) {
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1,000,000 token (18 desimal)
  await deployer.deploy(MetaToken, initialSupply);
  await deployer.deploy(LeetTokenSender);
};