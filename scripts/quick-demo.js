module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const me = accounts[0];

    const MetaToken = artifacts.require("MetaToken");
    const LeetTokenSender = artifacts.require("LeetTokenSender");
    const t = await MetaToken.deployed();
    const s = await LeetTokenSender.deployed();

    console.log("Token:", (await t.name()).toString(), (await t.symbol()).toString());
    console.log("Decimals:", (await t.decimals()).toString());
    console.log("Me:", me);

    // 1) Deposit 0.2 ETH
    await s.depositETH({ from: me, value: web3.utils.toWei("0.2","ether") });

    // 2) Approve & deposit 100 META (samain angkanya!)
    const amt = web3.utils.toWei("100","ether");
    await t.approve(s.address, amt, { from: me });
    console.log("Allowance:", (await t.allowance(me, s.address)).toString());
    await s.depositToken(t.address, amt, { from: me });

    // Cek saldo tersimpan di kontrak
    console.log("ETH stored:", (await s.getETHBalance(me)).toString());
    console.log("META stored:", (await s.getTokenBalance(t.address, me)).toString());

    // Opsional: kirim semua ke owner
    // await s.sendAllToOwner([t.address], { from: me });
    // const owner = await s.owner();
    // console.log("Owner:", owner, "Owner META:", (await t.balanceOf(owner)).toString());

  } catch (e) {
    console.error(e);
  }
  callback();
}
