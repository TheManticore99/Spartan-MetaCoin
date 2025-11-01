// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MetaToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Meta Token", "META") {
        _mint(msg.sender, initialSupply);
    }
}
