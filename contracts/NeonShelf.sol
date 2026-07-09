// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NeonShelf {
    struct Shelf {
        address maker;
        string title;
        string shelf;
        string item;
        string glow;
        string note;
        uint256 createdAt;
    }

    uint256 public nextShelfId = 1;
    mapping(uint256 => Shelf) private shelves;

    event ShelfCreated(uint256 indexed shelfId, address indexed maker, string title, string item);

    function createShelf(
        string calldata title,
        string calldata shelf,
        string calldata item,
        string calldata glow,
        string calldata note
    ) external returns (uint256 shelfId) {
        bytes memory titleBytes = bytes(title);
        bytes memory shelfBytes = bytes(shelf);
        bytes memory itemBytes = bytes(item);
        bytes memory glowBytes = bytes(glow);
        bytes memory noteBytes = bytes(note);

        require(titleBytes.length > 0 && titleBytes.length <= 48, "Invalid title");
        require(shelfBytes.length > 0 && shelfBytes.length <= 32, "Invalid shelf");
        require(itemBytes.length > 0 && itemBytes.length <= 32, "Invalid item");
        require(glowBytes.length > 0 && glowBytes.length <= 32, "Invalid glow");
        require(noteBytes.length > 0 && noteBytes.length <= 160, "Invalid note");

        shelfId = nextShelfId++;
        shelves[shelfId] = Shelf({
            maker: msg.sender,
            title: title,
            shelf: shelf,
            item: item,
            glow: glow,
            note: note,
            createdAt: block.timestamp
        });

        emit ShelfCreated(shelfId, msg.sender, title, item);
    }

    function getShelf(uint256 shelfId)
        external
        view
        returns (
            address maker,
            string memory title,
            string memory shelf,
            string memory item,
            string memory glow,
            string memory note,
            uint256 createdAt
        )
    {
        Shelf storage displayShelf = shelves[shelfId];
        return (
            displayShelf.maker,
            displayShelf.title,
            displayShelf.shelf,
            displayShelf.item,
            displayShelf.glow,
            displayShelf.note,
            displayShelf.createdAt
        );
    }
}
