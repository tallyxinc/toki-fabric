pragma solidity ^0.4.24;

import "./token/rft/RFTFTFull.sol";
import "./TokiFabric.sol";
import "./Constants.sol";

contract TokiFT is RFTFTFull, Constants {
	
	/**
	 * @dev Checks that Obligature is locked to marketplace
	 */ 
	modifier isActive() {
		require(TokiFabric(nftAddress_)
			.tokiLockStatus(initialTokenId_) == true, 
			ERROR_TOKI_NOT_LOCKED
		);
		_;
	}

	/**
	 * @dev Constructor of TokiFT smart contract for Tallyx system
	 * @param _name - Name for FT
	 * @param _symbol - Symbol for FT
	 * @param _decimals - Precision amount for FT
	 * @param _totalSupply - Max FT supply
	 * @param _nftAddress - Address of TokiFabric
	 * @param _initialTokenId - Toki id related to this FT
	 * @param _owner - Address of FT owner
	 */
	constructor (
		string _name,
		string _symbol,
		uint256 _decimals,
		uint256 _totalSupply,
		address _nftAddress,
		uint256 _initialTokenId,
        address _owner
	) 
		public
		RFTFTFull(
			_name,
			_symbol,
			_decimals,
			_totalSupply,
			_nftAddress,
			_initialTokenId,
        	_owner
		)
	{

	}

	/** 
	 * @dev Overrided transfer function, which requires TOKI to be locked to marketplace
	 */
	function transfer(
		address _to,
		uint256 _amount
	)
		public
		isActive
		returns (bool)
	{
		super.transfer(_to, _amount);
		return true;
	}

	/** 
	 * @dev Overrided transferFrom function, which requires TOKI to be locked to marketplace
	 */
	function transferFrom(
		address _from,
		address _to,
		uint256 _amount
	)
		public
		isActive
		returns (bool)
	{
		super.transferFrom(_from, _to, _amount);
		return true;
	}
}