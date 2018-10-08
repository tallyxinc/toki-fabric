pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './token/erc1358/ERC1358.sol';
import './token/erc1358/ERC1358FTFull.sol';
import './Strings.sol';

contract TokiFabric is ERC1358, Strings {
    using SafeMath for uint256;

    struct Obligature {
        string tokiId;
        uint256 tokenId;
        address owner;
        address beneficiary;
        uint256 value;
        uint256 payDate;
        ObligatureMetadata metadata;
    }

    struct ObligatureMetadata {
        string assetReference;
        string ccy;
        bool active;
        uint256 marketId;
        bool paid;
        bool marketplaceIsLocked;
    }

    Obligature[] private obligatures;

    constructor(
        string _name,
        string _symbol
    )   public
        ERC1358(_name, _symbol) {}

    function ownerObligatures(address _owner)  
        public 
        view 
        returns (uint256[])
    {
        require(_owner != address(0));
        return _ownedTokens[_owner];
    }

    function ownerObligatureByIndex(
        address _owner,
        uint256 _index
    )
        public 
        view
        returns (uint256)
    {
        require(_owner != address(0));
        require(_index < _ownedTokens[_owner].length);
        return _ownedTokens[_owner][_index];
    }

    function createObligature(
        string _tokiId,
        string _assetReference,
        address _owner,
        address _beneficiary,
        string _ccy,
        uint256 _value,
        uint256 _payDate,
        uint256 _marketId
    ) 
        external 
        onlyOwner 
        returns (uint256 tokenId) 
    {
        require( 
            _owner != address(0) && 
            _beneficiary != address(0) &&
            _value > 0 &&
            _payDate > 0 &&
            _owner != _beneficiary
        );

        tokenId = _allTokens.length;

        obligatures.push(
            Obligature({
                tokiId: _tokiId,
                tokenId: tokenId,
                owner: _owner,
                beneficiary: _beneficiary,
                value: _value,
                payDate: _payDate,
                metadata: ObligatureMetadata({
                    assetReference: _assetReference,
                    ccy: _ccy,
                    active: true,
                    marketId: _marketId,
                    paid: false,
                    marketplaceIsLocked: false
                })
            })
        );
        
        string memory symbol = concat("TOKI", toString(tokenId));

        super.createFungible(
            _tokiId,
            symbol,
            18,
            _owner,
            _value
        );
    } 

    function migrateObligature(uint256 _obligatureId) 
        external
        returns (
            string _tokiId,
            address _owner,
            address _beneficiary,
            uint256 _value,
            uint256 _payDate,
            string _assetReference,
            string _ccy
        )
    {
        require(_obligatureId < _allTokens.length);
        Obligature storage obligature = obligatures[_obligatureId];

        require(
            msg.sender == obligature.owner &&
            getTokiOwners(_obligatureId).length == 1 &&
            getTokiOwners(_obligatureId)[0] == obligature.owner &&
            obligature.metadata.active == true &&
            obligature.metadata.paid == false &&
            obligature.metadata.marketplaceIsLocked == false &&
            obligature.payDate > block.timestamp
        );

        obligature.metadata.active = false;

        return (
            obligature.tokiId,
            obligature.owner,
            obligature.beneficiary,
            obligature.value,
            obligature.payDate,
            obligature.metadata.assetReference,
            obligature.metadata.ccy
        );
    } 

    function lockTokiToMarketplace(uint256 _obligatureId) 
        public 
        returns (bool)
    {
        require(_obligatureId < _allTokens.length);
        Obligature storage obligature = obligatures[_obligatureId];

        require(
            msg.sender == obligature.owner &&
            obligature.metadata.active == true &&
            obligature.metadata.paid == false &&
            obligature.metadata.marketplaceIsLocked == false
        );

        obligature.metadata.marketplaceIsLocked = true;
        return true;
    }

    function getTokiLockStatus(uint256 _obligatureId) 
        public 
        view 
        returns (bool)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].metadata.marketplaceIsLocked;
    }

    function getTokiStatus(uint256 _obligatureId)
        public
        view
        returns (bool)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].metadata.active;
    }

    function getTokiBeneficiary(uint256 _obligatureId)
        public
        view
        returns (address)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].beneficiary;
    }

    function getTokiOwner(uint256 _obligatureId)
        public
        view
        returns (address)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].owner;
    }

    function getTokiPayStatus(uint256 _obligatureId)
        public
        view
        returns (bool)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].metadata.paid;
    }

    function getTokiPayDate(uint256 _obligatureId)
        public
        view 
        returns (uint256)
    {
        require(_obligatureId < _allTokens.length);
        return obligatures[_obligatureId].payDate;
    }

    function getTokiOwners(uint256 _obligatureId)
        public
        view
        returns (address[])
    {
        require(_obligatureId < _allTokens.length);
        return super.getFungibleTokenHolders(_obligatureId);
    }

    function getTokiPortions(uint256 _obligatureId)
        public
        view
        returns(address[], uint256[])
    {
        require(_obligatureId < _allTokens.length);
        return super.getFungibleTokenHolderBalances(_obligatureId);
    }

    function getTokiDependentFungibleToken(uint256 _obligatureId)
        public
        view 
        returns (address)
    {
        require(_obligatureId < _allTokens.length);
        return ftAddresses[_obligatureId];
    }

    function setTokiAsPaid(uint256 _obligatureId)
        public
        onlyOwner
    {
        require(
            _obligatureId < _allTokens.length &&
            obligatures[_obligatureId].metadata.paid == false &&
            obligatures[_obligatureId].metadata.marketplaceIsLocked == true &&
            obligatures[_obligatureId].metadata.active == true    
        );
        obligatures[_obligatureId].metadata.paid = true;
        obligatures[_obligatureId].metadata.active = false;
    }
}