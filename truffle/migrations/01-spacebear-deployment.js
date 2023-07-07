const spacebears = artifacts.require("Spacebear");
const spacebearsKyc = artifacts.require("SpacebearKyc");
const spacebearsSale = artifacts.require("SpacebearSale");

require("dotenv").config({path: "../../.env"});

module.exports = async function(deployer, network, accounts) {
    let deployerAccount = accounts[0];

    await deployer.deploy(spacebearsKyc, {from: deployerAccount});
    let spacebearsKycInst = await spacebearsKyc.deployed();

    await deployer.deploy(spacebears, spacebearsKycInst.address, {from: accounts[0]});
    let spacebearsInst = await spacebears.deployed();

    await deployer.deploy(spacebearsSale, spacebearsInst.address, spacebearsKycInst.address,
        process.env.INITIAL_SUPPLY_FOR_EACH, process.env.AVAILABLE_NFTS, {from: deployerAccount});
}
