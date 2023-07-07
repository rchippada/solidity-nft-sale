// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SpacebearKyc is Ownable {

    struct KycStats {
        mapping(uint => uint) uriPrefixStats;
        uint pendingUriPrefix;
    }

    mapping(address => KycStats) private kycMapping;

    event KycApproved(address account, uint uriPrefix);
    event KycFulfilled(address account, uint uriPrefix);

    function setApproval(address account, uint uriPrefix) public onlyOwner {
        KycStats storage stats = kycMapping[account];
        stats.pendingUriPrefix = uriPrefix;
        emit KycApproved(account, uriPrefix);
    }
    function fulfillApproval(address account, uint uriPrefix) public {
        KycStats storage stats = kycMapping[account];
        stats.uriPrefixStats[uriPrefix] += 1;
        stats.pendingUriPrefix = 0;
        emit KycFulfilled(account, uriPrefix);
    }

    function getApproval(address user) public view returns(uint) {
        KycStats storage stats = kycMapping[user];
        return stats.pendingUriPrefix;
    }

    function getStatsFor(address user, uint uriPrefix) public view returns(uint) {
        KycStats storage stats = kycMapping[user];
        mapping(uint => uint) storage uriPrefixStats = stats.uriPrefixStats;

        return(uriPrefixStats[uriPrefix]);
    }
}
