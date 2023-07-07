const Spacebear = artifacts.require("Spacebear");
const SpacebearsKyc = artifacts.require("SpacebearKyc");

const truffleAssert = require('truffle-assertions');

contract('Spacebear', (accounts) => {
    it ("should not be able to mint nft if kyc not approved", async() => {
        const spacebearInst = await Spacebear.deployed();
        
        await truffleAssert.reverts(
            spacebearInst.safeMint(accounts[1], 1),
            "Not KYC Approved to buy this NFT"
        );
    })

    it("should mint NFT to the requesting account", async() => {
        const spacebearInstance = await Spacebear.deployed();
        const spacebearsKycInstance = await SpacebearsKyc.deployed();

        let txResult = await spacebearsKycInstance.setApproval(accounts[1], 1);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        txResult = await spacebearInstance.safeMint(accounts[1], 1);
        truffleAssert.eventEmitted(txResult, 'Transfer', {to: accounts[1], tokenId: web3.utils.toBN("0")});        
        assert.equal(await spacebearInstance.ownerOf(0), accounts[1], "Owner of nft is not the expected account");

        txResult = await spacebearsKycInstance.setApproval(accounts[2], 2);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        txResult = await spacebearInstance.safeMint(accounts[2], 2);
        truffleAssert.eventEmitted(txResult, 'Transfer', {to: accounts[2], tokenId: web3.utils.toBN("1")});        
        assert.equal(await spacebearInstance.ownerOf(1), accounts[2], "Owner of nft is not the expected account");
    })
})
