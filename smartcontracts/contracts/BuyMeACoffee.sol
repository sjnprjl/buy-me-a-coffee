// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BuyMeACoffee {

	struct Memo {
		address from;
		string name;
		string message;
		uint coffeePoint;
	}

	Memo[] memos;

    uint currentBalance = 0;

    event NewMemo(address from, string name, string message, uint coffeePoint);
    event CurrentBalance(uint currentBalance);

	address owner;
	
	constructor() {
		owner = msg.sender;
	}


    function buyCoffee(string memory _name, string memory _message) public payable {
        // minimum of 0.0001 eth is required
        require(msg.value >= 0.0001 ether, "You do not have sufficient balance.");
        Memo memory memo = Memo(msg.sender, _name, _message, msg.value);

        memos.push(memo);
        emit NewMemo(msg.sender, _name, _message, msg.value);

        // emit current balance to the end.
        currentBalance += msg.value;
        emit CurrentBalance(currentBalance);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "You need to be admin");
        _;
    }

    function withdrawCoffee() public onlyOwner {
        require(msg.sender == owner, "You cannot withdraw this coffee point");
        payable(owner).transfer(address(this).balance);
    }


    function getCurrentBalance() public onlyOwner {
        emit CurrentBalance(currentBalance);
    }

		function getMemos() public view returns (Memo[] memory) {
			return memos;
		}
}

