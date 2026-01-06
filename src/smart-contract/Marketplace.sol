// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Item {
        uint256 id;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }

    // payable: artinya alamat ini bisa menerima ETH
    // immutable: ini tidak bisa diubah setelah constructor tapi bisa di set di constructor
    address payable public immutable feeAccount;
    uint256 public immutable feePercent;
    uint256 public itemCount;

    // Mapping
    mapping(uint256 => Item) public items;

    // Event
    event Offered(
        uint256 id,
        address indexed nft, // indexed?
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event Bought(
        uint256 id,
        address indexed nft, // indexed?
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint256 _tokenId,
        uint256 _price
    ) public nonReentrant {
        require(_price > 0, "Price must be greater than zero");

        // nonReentrant?
        itemCount++;

        _nft.transferFrom(msg.sender, address(this), _tokenId);

        // menambahkan item ke items mapping
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint256 _id) public payable nonReentrant {
        uint256 totalPrice = getTotalPrice(_id);
        Item storage item = items[_id];

        require(_id > 0 && _id <= itemCount, "Item Doesn't exist");
        require(msg.value >= totalPrice, "Not enough to cover item price and market fee");
        require(!item.sold, "Item already sold");

        //pay seller and fee account
        (bool success, ) = item.seller.call{value: item.price}("");
        require(success, "Transfer Failed");

        (bool successFeeAccount, ) = feeAccount.call{value: totalPrice - item.price}("");
        require(successFeeAccount, "Fee transfer failed");
        
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        // log
        emit Bought(_id, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }

    function getTotalPrice(uint256 _id) public view returns (uint256) {
        return ((items[_id].price * (100 + feePercent)) / 100);
    }
}