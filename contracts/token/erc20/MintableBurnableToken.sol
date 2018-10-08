pragma solidity ^0.4.23;

import './MintableToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';

contract MintableBurnableToken is MintableToken, BurnableToken {

    mapping (address => bool) public burnAgents;

    modifier onlyBurnAgents () {
        require(burnAgents[msg.sender]);
        _;
    }

    event Burn(address indexed burner, uint256 value);

    constructor(
        uint256 _mintedSupply,
        bool _allowedMinting
    ) 
        public 
        MintableToken(
            _mintedSupply,
            _allowedMinting
        ) 
    {

    }

    function updateBurnAgent(
        address _agent, 
        bool _status
    ) 
        public 
        onlyOwner 
    {
        require(_agent != address(0));
        burnAgents[_agent] = _status;
    }

    function burnByAgent(
        address _holder, 
        uint256 _tokensToBurn
    )
        public 
        onlyBurnAgents
        returns (uint256) 
    {
        require(_tokensToBurn > 0);
        _burn(_holder, _tokensToBurn);
        return _tokensToBurn;
    }

    function _burn(
        address _who,
        uint256 _value
    ) internal {
        require(_who != address(0));
        require(_value <= balances[_who]);
        balances[_who] = balances[_who].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        emit Burn(_who, _value);
        emit Transfer(_who, address(0), _value);
    }
}
