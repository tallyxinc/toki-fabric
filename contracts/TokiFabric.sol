pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './token/erc1358/ERC1358.sol';
import './token/erc1358/ERC1358FTFull.sol';
import './Strings.sol';

contract TokiFabric is ERC1358, Strings {
    using SafeMath for uint256;

    struct Toki {
        string tokiId;
        uint256 tokenId;
        address owner;
        address beneficiary;
        uint256 value;
        uint256 payDate;
        TokiMetadata metadata;
    }

    struct TokiMetadata {
        string assetReference;
        string ccy;
        bool active;
        uint256 marketId;
        bool paid;
        bool marketplaceIsLocked;
    }

    Toki[] private tokis;

    constructor(
        string _name,
        string _symbol
    )   public
        ERC1358(_name, _symbol) {}

    function ownerToki(address _owner)  
        public 
        view 
        returns (uint256[])
    {
        require(_owner != address(0));
        return _ownedTokens[_owner];
    }

    function ownerTokiByIndex(
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

    function createToki(
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

        tokis.push(
            Toki({
                tokiId: _tokiId,
                tokenId: tokenId,
                owner: _owner,
                beneficiary: _beneficiary,
                value: _value,
                payDate: _payDate,
                metadata: TokiMetadata({
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

    function migrateToki(uint256 tokiId) 
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
        require(tokiId < _allTokens.length);
        Toki storage toki = tokis[tokiId];

        require(
            msg.sender == toki.owner &&
            getTokiOwners(tokiId).length == 1 &&
            getTokiOwners(tokiId)[0] == toki.owner &&
            toki.metadata.active == true &&
            toki.metadata.paid == false &&
            toki.metadata.marketplaceIsLocked == false &&
            toki.payDate > block.timestamp
        );

        toki.metadata.active = false;

        return (
            toki.tokiId,
            toki.owner,
            toki.beneficiary,
            toki.value,
            toki.payDate,
            toki.metadata.assetReference,
            toki.metadata.ccy
        );
    } 

    function lockTokiToMarketplace(uint256 _tokiId) 
        public 
        returns (bool)
    {
        require(_tokiId < _allTokens.length);
        Toki storage toki = tokis[_tokiId];

        require(
            msg.sender == toki.owner &&
            toki.metadata.active == true &&
            toki.metadata.paid == false &&
            toki.metadata.marketplaceIsLocked == false
        );

        toki.metadata.marketplaceIsLocked = true;
        return true;
    }

    function getTokiLockStatus(uint256 _tokiId) 
        public 
        view 
        returns (bool)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].metadata.marketplaceIsLocked;
    }

    function getTokiStatus(uint256 _tokiId)
        public
        view
        returns (bool)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].metadata.active;
    }

    function getTokiBeneficiary(uint256 _tokiId)
        public
        view
        returns (address)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].beneficiary;
    }

    function getTokiOwner(uint256 _tokiId)
        public
        view
        returns (address)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].owner;
    }

    function getTokiPayStatus(uint256 _tokiId)
        public
        view
        returns (bool)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].metadata.paid;
    }

    function getTokiPayDate(uint256 _tokiId)
        public
        view 
        returns (uint256)
    {
        require(_tokiId < _allTokens.length);
        return tokis[_tokiId].payDate;
    }

    function getTokiOwners(uint256 _tokiId)
        public
        view
        returns (address[])
    {
        require(_tokiId < _allTokens.length);
        return super.getFungibleTokenHolders(_tokiId);
    }

    function getTokiPortions(uint256 _tokiId)
        public
        view
        returns(address[], uint256[])
    {
        require(_tokiId < _allTokens.length);
        return super.getFungibleTokenHolderBalances(_tokiId);
    }

    function getTokiDependentFungibleToken(uint256 _tokiId)
        public
        view 
        returns (address)
    {
        require(_tokiId < _allTokens.length);
        return ftAddresses[_tokiId];
    }

    function setTokiAsPaid(uint256 _tokiId)
        public
        onlyOwner
    {
        require(
            _tokiId < _allTokens.length &&
            tokis[_tokiId].metadata.paid == false &&
            tokis[_tokiId].metadata.marketplaceIsLocked == true &&
            tokis[_tokiId].metadata.active == true    
        );
        tokis[_tokiId].metadata.paid = true;
        tokis[_tokiId].metadata.active = false;
    }
}