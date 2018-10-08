pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol'; 

contract MintableToken is BasicToken, Ownable {
    using SafeMath for uint256;

    bool public allowedMinting;

    mapping(address => bool) public mintingAgents;
    mapping(address => bool) public stateChangeAgents;

    event Mint(address indexed holder, uint256 tokens);

    modifier onlyMintingAgents () {
        require(mintingAgents[msg.sender]);
        _;
    }

    modifier onlyStateChangeAgents () {
        require(stateChangeAgents[msg.sender]);
        _;
    }

    constructor(
        uint256 _mintedSupply,
        bool _allowedMinting
    ) public {
        totalSupply_ = totalSupply_.add(_mintedSupply);
        allowedMinting = _allowedMinting;
        mintingAgents[msg.sender] = true;
    }

    function mint(
        address _holder, 
        uint256 _tokens
    ) 
        public 
        onlyMintingAgents() 
        returns (uint256)
    {
        require(_holder != address(0));
        require(allowedMinting == true);
        require(_tokens > 0);
        totalSupply_ = totalSupply_.add(_tokens);
        balances[_holder] = balanceOf(_holder).add(_tokens);

        emit Mint(_holder, _tokens);
        return _tokens;
    }

    function disableMinting() public onlyStateChangeAgents() {
        require(allowedMinting == true);
        allowedMinting = false;
    }

    function enableMinting() public onlyStateChangeAgents() {
        require(allowedMinting == false);
        allowedMinting = true;
    }

    function updateMintingAgent(
        address _agent, 
        bool _status
    ) 
        public 
        onlyOwner 
    {
        require(_agent != address(0));
        mintingAgents[_agent] = _status;
    }

    function updateStateChangeAgent(
        address _agent, 
        bool _status
    ) 
        public 
        onlyOwner 
    {
        require(_agent != address(0));
        stateChangeAgents[_agent] = _status;
    }
}

