// SpacebearsSale test

const spacebearsSale = artifacts.require("SpacebearSale");
const spacebears = artifacts.require("Spacebear");
const spacebearsKyc = artifacts.require("SpacebearKyc");

const truffleAssert = require('truffle-assertions');

require("dotenv").config({path: "../../.env"});

contract('SpacebearSale', (accounts) => {

    it ("should return the list of available NFTs", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        const spacebearsInst = await spacebears.deployed();

        let nfts = await spacebearsSaleInst.getAvailableNftImages();
        assert.equal(nfts.length, 4);

        for (let i=0; i<nfts.length; i++) {
            let nftUri = await spacebearsInst.getNftImageURI(i+1);
            assert.equal(nfts[i], nftUri);
        }
    })

    it ("should not be able to buy nft if kyc not approved", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        
        await truffleAssert.reverts(
            spacebearsSaleInst.sendTransaction ({from: accounts[2], value: web3.utils.toWei("0.1", "ether")}),
            "Not allowed to buy nfts"
        );
    })

    it ("should be able to buy nft", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        const spacebearsKycInst = await spacebearsKyc.deployed();

        const initialSupplyForEach = process.env.INITIAL_SUPPLY_FOR_EACH;

        // 1.json
        let txResult = await spacebearsKycInst.setApproval(accounts[1], 1);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        let deployerAcctBalanceBeforeBuyingNft = await web3.eth.getBalance(accounts[0]);
        let buyerAcctBalanceBeforeBuyingNft = await web3.eth.getBalance(accounts[1]);

        txResult = await spacebearsSaleInst.sendTransaction ({from: accounts[1], value: web3.utils.toWei("0.15", "ether")}); // 1 nft plus change
        truffleAssert.eventEmitted(txResult, 'Purchased');
        
        remainingSupply = await spacebearsSaleInst.availableSupply(1);
        assert.equal(remainingSupply, initialSupplyForEach-1);

        let buyerStatsForUri = await spacebearsKycInst.getStatsFor(accounts[1], 1);
        assert.equal(buyerStatsForUri, 1);

        let deployerAcctBalanceAfterBuyingNft = await web3.eth.getBalance(accounts[0]);
        let buyerAcctBalanceAfterBuyingNft = await web3.eth.getBalance(accounts[1]);

        assert.equal((deployerAcctBalanceAfterBuyingNft - deployerAcctBalanceBeforeBuyingNft) > web3.utils.toWei("0.09", "ether"), true, "Deployer account is expected to have received about one nft price"); // nft price minus gas fees
        assert.equal((buyerAcctBalanceBeforeBuyingNft - buyerAcctBalanceAfterBuyingNft) > web3.utils.toWei("0.1", "ether"), true, "Balance expected to be depleted by at least one nft price");
    })

    it ("should be able to buy only up to max supply", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        const spacebearsKycInst = await spacebearsKyc.deployed();

        const initialSupplyForEach = process.env.INITIAL_SUPPLY_FOR_EACH;

        // 2.json
        for (let i = 0; i < initialSupplyForEach; i++) {
            let txResult = await spacebearsKycInst.setApproval(accounts[1], 2);
            truffleAssert.eventEmitted(txResult, 'KycApproved');
    
            txResult = await spacebearsSaleInst.sendTransaction ({from: accounts[1], value: web3.utils.toWei("0.15", "ether")}); // 1 nft plus change
            truffleAssert.eventEmitted(txResult, 'Purchased');
            
            remainingSupply = await spacebearsSaleInst.availableSupply(2);
            assert.equal(remainingSupply, initialSupplyForEach-(i+1));    
        }

        remainingSupply = await spacebearsSaleInst.availableSupply(2);
        assert.equal(remainingSupply, 0);

        // try to buy one more and it should fail
        await spacebearsKycInst.setApproval(accounts[1], 2);
        await truffleAssert.reverts(
            spacebearsSaleInst.sendTransaction ({from: accounts[1], value: web3.utils.toWei("0.15", "ether")}),
            "No more remaining NFTs for 2"
        );        
    })

    it ("should fail to buy nft if insufficient amount of funds sent", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        const spacebearsKycInst = await spacebearsKyc.deployed();

        let txResult = await spacebearsKycInst.setApproval(accounts[3], 1);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        await truffleAssert.reverts(
            spacebearsSaleInst.sendTransaction ({from: accounts[3], value: web3.utils.toWei("0.01", "ether")}),
            "Insufficient amount of funds sent"
        );
    })

    it ("should get stats for buyer", async() => {
        const spacebearsSaleInst = await spacebearsSale.deployed();
        const spacebearsKycInst = await spacebearsKyc.deployed();

        // get first nft
        let txResult = await spacebearsKycInst.setApproval(accounts[2], 1);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        txResult = await spacebearsSaleInst.sendTransaction ({from: accounts[2], value: web3.utils.toWei("0.15", "ether")});
        truffleAssert.eventEmitted(txResult, 'Purchased');

        // get second nft
        txResult = await spacebearsKycInst.setApproval(accounts[2], 3);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        txResult = await spacebearsSaleInst.sendTransaction ({from: accounts[2], value: web3.utils.toWei("0.1", "ether")});
        truffleAssert.eventEmitted(txResult, 'Purchased');

        let stats = await spacebearsSaleInst.getOwnershipStats(accounts[2]);
        assert.equal(stats[0], 1);
        assert.equal(stats[1], 0);
        assert.equal(stats[2], 1);
        assert.equal(stats[3], 0);
    })
})
