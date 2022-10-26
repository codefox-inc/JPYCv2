//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
	function decimals() external view returns (uint256);
	function balanceOf(address account) external view returns (uint256);
	function allowance(address owner, address spender) external view returns (uint256);
	function transfer(address recipient, uint256 amount) external returns (bool);
	function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract MultisendToken is Ownable {

    constructor() {
    }

    function multisend(address payable[] calldata receivers, uint256[] calldata amounts) public payable {
        uint256 toLength = receivers.length;
        for(uint256 i = 0; i < toLength; i++) {
            (bool sent,) = receivers[i].call{value: amounts[i]}("");
            require(sent, "Failed to send Ether");
        }
    }

    function multisendERC20(address tokenAddress, address[] calldata receivers, uint256[] calldata amounts) public {
        uint256 toLength = receivers.length;
	    for(uint256 i = 0; i < toLength; i ++) {
            IERC20(tokenAddress).transferFrom(msg.sender, receivers[i], amounts[i]);
        }
    }

    function withdrawERC20(address _tokenAddress, address to) onlyOwner external {
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).transfer(to, balance);
    }
}