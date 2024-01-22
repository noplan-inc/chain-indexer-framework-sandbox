// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";

contract TestNft is ERC721URIStorage, Ownable {
    constructor(address initialOwner)
        ERC721("TestNFT", "TNFT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function updateTokenUri(uint256 tokenId, string memory uri) public onlyOwner {
        _setTokenURI(tokenId, uri);
        emit MetadataUpdate(tokenId);
    }
}
