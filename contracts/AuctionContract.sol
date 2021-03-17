//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "./DeedContract.sol";
import "hardhat/console.sol";

contract AuctionContract {
    //available auctions
    Auction[] public auctions;

    //mapping from an auction id to users bids
    mapping(uint256 => Bid[]) public auctionBids;

    //auctions owned by users
    mapping(address => uint256[]) public auctionOwner;

    // bid informations
    struct Bid {
        address payable from;
        uint256 amount;
    }

    //auctions details
    struct Auction {
        string name;
        address payable owner;
        uint256 deedId;
        address deedContractAddress;
        uint256 blockDeadline;
        uint256 startPrice;
        string metaData;
        bool active;
        bool finalized;
    }

    event BidSuccess(address _from, uint256 _auctionId);
    event AuctionCreated(address _owner, uint256 _auctionId);
    event AuctionCancelled(address _owner, uint256 _auctionId);
    event AuctionFinalized(address _owner, uint256 _auctionId);
    event TransferSuccess(address _from, address _to, uint256 _deedId);

    //Check if sender own the auction
    modifier isOwner(uint256 _auctionId) {
        require(auctions[_auctionId].owner == msg.sender);
        _;
    }

    //check if send own the deed
    modifier isDeedOwner(address _deedContractAddress, uint256 _deedId) {
        address deedOwner = DeedContract(_deedContractAddress).ownerOf(_deedId);
        console.log("Deed Owner address is %s ", deedOwner);
        console.log("This address is %s ", msg.sender);
        require(deedOwner == msg.sender);
        _;
    }

    function getAuctionsCount() public view returns (uint256) {
        return auctions.length;
    }

    function getBidsCount(uint256 _auctionId) public view returns (uint256) {
        return auctionBids[_auctionId].length;
    }

    //given an owner, get all auctions owned
    function getAuctionOf(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory ownedAuctions = auctionOwner[_owner];

        return ownedAuctions;
    }

    function getLastBid(uint256 _auctionId)
        public
        view
        returns (uint256, address)
    {
        uint256 bidLength = auctionBids[_auctionId].length;

        if (bidLength > 0) {
            Bid memory lastBid = auctionBids[_auctionId][bidLength - 1];
            return (lastBid.amount, lastBid.from);
        }
    }

    function getAuctionById(uint256 _auctionId)
        public
        view
        returns (
            string memory name,
            address owner,
            uint256 deedId,
            address deedContractAddress,
            uint256 blockDeadline,
            uint256 startPrice,
            string memory metaData,
            bool active,
            bool finalized
        )
    {
        Auction memory auction = auctions[_auctionId];

        return (
            auction.name,
            auction.owner,
            auction.deedId,
            auction.deedContractAddress,
            auction.blockDeadline,
            auction.startPrice,
            auction.metaData,
            auction.active,
            auction.finalized
        );
    }

    //Create aan auction
    function createAuction(
        string memory _auctionTitle,
        uint256 _deedId,
        address _deedContractAddress,
        uint256 _startPrice,
        string memory _metaData,
        uint256 _blockDeadline
    ) public isDeedOwner(_deedContractAddress, _deedId) returns (bool) {
        uint256 auctionId = auctions.length;

        console.log("Creating Auction: title: %s, deedId: %s, startPrice: %s", _auctionTitle, _deedId, _startPrice);

        Auction memory newAuction;
        newAuction.name = _auctionTitle;
        newAuction.owner = msg.sender;
        newAuction.deedId = _deedId;
        newAuction.deedContractAddress = _deedContractAddress;
        newAuction.startPrice = _startPrice;
        newAuction.metaData = _metaData;
        newAuction.blockDeadline = _blockDeadline;
        newAuction.active = true;
        newAuction.finalized = false;

        auctions.push(newAuction);

        auctionOwner[msg.sender].push(auctionId);

        emit AuctionCreated(msg.sender, auctionId);

        return true;
    }

    function approveAndTransfer(
        address _from,
        address _to,
        address _deedContractAddress,
        uint256 _deedId
    ) internal returns (bool) {
        DeedContract deedContract = DeedContract(_deedContractAddress);
        deedContract.approve(_to, _deedId);
        deedContract.transferFrom(_from, _to, _deedId);

        emit TransferSuccess(_from, _to, _deedId);

        return true;
    }

    function cancelAuction(uint256 _auctionId) public isOwner(_auctionId) {
        Auction memory currentAuction = auctions[_auctionId];
        uint256 bidsLength = auctionBids[_auctionId].length;

        //refund last bid
        if (bidsLength > 0) {
            Bid memory lastBid = auctionBids[_auctionId][bidsLength - 1];
            if (!lastBid.from.send(lastBid.amount)) {
                revert();
            }
        }

        //transfer from this contract to the auction owner
        if (
            approveAndTransfer(
                address(this),
                currentAuction.owner,
                currentAuction.deedContractAddress,
                currentAuction.deedId
            )
        ) {
            currentAuction.active = false;
            emit AuctionCancelled(currentAuction.owner, _auctionId);
        }
    }

    function finalizeAuction(uint256 _auctionId) public isOwner(_auctionId) {
        Auction memory currentAuction = auctions[_auctionId];
        uint256 bidsLength = auctionBids[_auctionId].length;

        if (block.timestamp < currentAuction.blockDeadline) {
            revert();
        }

        if (bidsLength == 0) {
            cancelAuction(_auctionId);
        } else {
            //transfer last bid amount to auction's owner
            Bid memory lastBid = auctionBids[_auctionId][bidsLength - 1];
            if (!currentAuction.owner.send(lastBid.amount)) {
                revert();
            }

            //transfer deed to last bider
            if (
                approveAndTransfer(
                    currentAuction.owner,
                    lastBid.from,
                    currentAuction.deedContractAddress,
                    currentAuction.deedId
                )
            ) {
                currentAuction.active = false;
                currentAuction.finalized = true;
                emit AuctionFinalized(currentAuction.owner, _auctionId);
            }
        }
    }

    function bidOnAuction(uint _auctionId) external payable {
        Auction memory currentAuction = auctions[_auctionId];

        if (currentAuction.owner == msg.sender) {
            revert();
        }

        if (currentAuction.blockDeadline < block.timestamp) {
            revert();
        }

        uint bidsLength = auctionBids[_auctionId].length;
        uint256 newBidAmount = msg.value;
        uint256 tamponAmount = currentAuction.startPrice;
        Bid memory lastBid;

        if (bidsLength > 0) {
            lastBid = auctionBids[_auctionId][bidsLength - 1];
            tamponAmount = lastBid.amount;
        }

        if (newBidAmount <= tamponAmount) {
            revert();
        }

        //refund last bider
        if (bidsLength > 0) {
            if (!lastBid.from.send(lastBid.amount)) {
                revert();
            }
        }

        Bid memory newBid;
        newBid.from = msg.sender;
        newBid.amount = newBidAmount;
        auctionBids[_auctionId].push(newBid);
        emit BidSuccess(newBid.from, _auctionId);
    }
}
