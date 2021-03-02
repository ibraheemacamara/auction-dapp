//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DeedContract is ERC721 {
    
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol){

    }

    function registerDeed(uint _tokenId, string memory _uri) public {
        _mint(msg.sender, _tokenId);
        addMetaData(_tokenId, _uri);
        emit DeedRegistred(msg.sender, _tokenId);
    }

    function addMetaData(uint _tokenId, string memory _uri) public returns (bool){
        _setTokenURI(_tokenId, _uri);
        return true;
    }

    function exists(uint _tokenId) public view returns (bool){
        return _exists(_tokenId);
    }

    event DeedRegistred(address _by, uint _tokenId);
}