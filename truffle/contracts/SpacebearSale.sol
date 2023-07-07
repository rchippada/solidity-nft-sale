// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Spacebear.sol";
import "./SpacebearKyc.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract SpacebearSale {
    Spacebear public spacebear;
    SpacebearKyc public spacebearKyc;

    uint public priceInWei = 0.1 ether;
    uint public initialSupplyForEach;

    address owner;

    mapping(uint=>uint) public minted;

    uint public availableNumNfts;
    string[] public availableNftImages;

    event Purchased(address buyer, uint uriPrefix);
    event ErrorLog(string reason);

    constructor(Spacebear nft, SpacebearKyc kyc, uint supply, uint numNfts) {
        spacebear = nft;
        spacebearKyc = kyc;

        initialSupplyForEach = supply;
        availableNumNfts = numNfts;

        availableNftImages = new string[](numNfts);
        for (uint i = 0; i < numNfts; i++) {
            availableNftImages[i] = spacebear.getNftImageURI(i+1);
        }

        owner = msg.sender;
    }

    function getAvailableNftImages() public view returns (string[] memory) {
        return availableNftImages;
    }

    function availableSupply(uint uriPrefix) public view returns(uint){
        return(initialSupplyForEach - minted[uriPrefix]);
    }

    function getOwnershipStats(address buyer) public view returns(uint[] memory){
        uint[] memory stats = new uint[](availableNumNfts);

        for (uint i = 0; i < availableNumNfts; i++) {
            stats[i] = spacebearKyc.getStatsFor(buyer, i+1);
        }

        return stats;
    }

    // Invoked by the receive function to transfer nft to the buyer
    // After transfering nft to buyer, nft price amount is transferred to the deployer account
    // Any remaining funds after purchasing nft are returned to the buyer
    function buyNft(address payable buyer) private {
        uint uriPrefix = spacebearKyc.getApproval(buyer);

        require(uriPrefix > 0, "Not allowed to buy nfts");
        require(minted[uriPrefix] < initialSupplyForEach, string.concat("No more remaining NFTs for ", Strings.toString(uriPrefix)));
        require(msg.value >= priceInWei, "Insufficient amount of funds sent");

        try spacebear.safeMint(buyer, uriPrefix) {
            payable(owner).transfer(priceInWei);  // transfer nft price amount to the owner account
            buyer.transfer(msg.value - priceInWei);   // transfer any remaining funds to the buyer

            spacebearKyc.fulfillApproval(buyer, uriPrefix);
            minted[uriPrefix] += 1;
            emit Purchased(buyer, uriPrefix);
        } catch Error(string memory reason) {
            emit ErrorLog(reason);
        }
    }

    // A buyer can buy an nft by sending the required amount of wei to this contract
    // A buyer should be kycApproved prior to sending money to this contract
    // (using the dapp frontent in this example implementation where they selected the uriPrefix)
    receive() external payable {
        buyNft(payable(msg.sender));
    }
}
