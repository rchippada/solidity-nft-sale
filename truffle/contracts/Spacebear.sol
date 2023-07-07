// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./SpacebearKyc.sol";


contract Spacebear is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    SpacebearKyc public spacebearKyc;

    constructor(SpacebearKyc kyc) ERC721("Spacebear", "SBT") {
        spacebearKyc = kyc;
    }

    function _baseURI() internal pure override returns (string memory) {
        //return "https://ethereum-blockchain-developer.com/2022-06-nft-truffle-hardhat-foundry/nftdata/";
        return "https://ipfs.io/ipfs/QmU1CNuwJZTxc6FZqKLsUPVjPrR1Fg2U79sNDYQozpBj7w/genesis/";
    }

    function getNftImageURI(uint uriPrefix) public pure returns (string memory) {
        string memory uri = string.concat("https://ipfs.io/ipfs/QmWpbme9ECzeNZDbpe5kJKRmiL6WhKGJJZ9RbHb5ioLeHD/genesis/", Strings.toString(uriPrefix), ".png");
        return uri;
    }

    function safeMint(address to, uint uriPrefix) public {
        uint approvedUriPrefix = spacebearKyc.getApproval(to);
        require(uriPrefix == approvedUriPrefix, "Not KYC Approved to buy this NFT");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string.concat(Strings.toString(uriPrefix), ".json"));
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}