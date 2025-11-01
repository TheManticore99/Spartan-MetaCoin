// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Custom errors (hemat gas)
error AmountZero();
error EthValueZero();
error AllowanceTooLow(uint256 allowanceGiven, uint256 required);
error TokenZeroAddress();
error TransferFailed();
error EmptyTokenList();

contract LeetTokenSender {
    address public owner; // Contract Owner
    mapping(address => uint256) public ethBalances; // Track ETH deposit per user
    mapping(address => mapping(address => uint256)) public tokenBalances; // token => user => amount

    event DepositETH(address indexed from, uint256 amount);
    event DepositToken(address indexed from, address indexed token, uint256 amount);
    event SentToOwner(address indexed from, address indexed token, uint256 amount);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    // Receive plain ETH
    receive() external payable {
        if (msg.value == 0) revert EthValueZero();
        ethBalances[msg.sender] += msg.value;
        emit DepositETH(msg.sender, msg.value);
    }

    // Explicit deposit ETH
    function depositETH() external payable {
        if (msg.value == 0) revert EthValueZero();
        ethBalances[msg.sender] += msg.value;
        emit DepositETH(msg.sender, msg.value);
    }

    // Deposit approved ERC-20
    function depositToken(address token, uint256 amount) external {
        if (token == address(0)) revert TokenZeroAddress();
        if (amount == 0) revert AmountZero();
        uint256 allowed = IERC20(token).allowance(msg.sender, address(this));
        if (allowed < amount) revert AllowanceTooLow(allowed, amount);

        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        tokenBalances[token][msg.sender] += amount;
        emit DepositToken(msg.sender, token, amount);
    }

    // Kirim seluruh saldo (ETH + daftar token) milik caller ke owner
    function sendAllToOwner(address[] calldata tokenAddresses) external {
        if (tokenAddresses.length == 0 && ethBalances[msg.sender] == 0) {
            revert EmptyTokenList();
        }

        // ETH
        uint256 ethAmount = ethBalances[msg.sender];
        if (ethAmount > 0) {
            ethBalances[msg.sender] = 0;
            (bool sent, ) = payable(owner).call{value: ethAmount}("");
            if (!sent) revert TransferFailed();
            emit SentToOwner(msg.sender, address(0), ethAmount);
        }

        // Tokens
        for (uint256 i = 0; i < tokenAddresses.length; ++i) {
            address token = tokenAddresses[i];
            if (token == address(0)) revert TokenZeroAddress();
            uint256 tokenAmount = tokenBalances[token][msg.sender];
            if (tokenAmount > 0) {
                tokenBalances[token][msg.sender] = 0;
                bool ok = IERC20(token).transfer(owner, tokenAmount);
                if (!ok) revert TransferFailed();
                emit SentToOwner(msg.sender, token, tokenAmount);
            }
        }
    }

    // Getter
    function getETHBalance(address user) external view returns (uint256) {
        return ethBalances[user];
    }

    function getTokenBalance(address token, address user) external view returns (uint256) {
        return tokenBalances[token][user];
    }

    // Opsional: ganti owner
    function changeOwner(address newOwner) external {
        require(msg.sender == owner, "Not owner");
        require(newOwner != address(0), "Zero new owner");
        address old = owner;
        owner = newOwner;
        emit OwnerChanged(old, newOwner);
    }
}