pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./token/rft/RFT.sol";
import "./token/rft/RFTFTFull.sol";
import "./TokiFT.sol";
import "./Strings.sol";
import "./Constants.sol";
import "./Permissions.sol";

contract TokiFabric is RFT, Strings, Constants, Permissions {
    using SafeMath for uint256;

    // Struct that implements TOKI (obligatoire) entity for Tallyx system
    struct Toki {
        string tokiId;
        address owner;
        address beneficiary;
        uint256 value;
        uint256 payDate;
        TokiMetadata metadata;
    }

    // Struct that implements TOKI (obligatoire) metadata entity for Tallyx system
    struct TokiMetadata {
        string assetReference;
        string ccy;
        uint256 status;
        uint256 payStatus;
        uint256 marketId;
        bool active;
        bool marketplaceIsLocked;
    }

    // Mapping from NFT id to Toki data
    mapping (uint256 => Toki) private tokis;

    /**
     * @dev Emits when Toki is created
     */
    event TokiCreated(
        string _tokiId,
        uint256 _tokenId,
        address _owner,
        address _beneficiary,
        uint256 _value,
        uint256 _payDate,
        string _assetReference,
        string _ccy,
        address _ftAddress
    );


    /**
     * @dev Emits when a Toki is locked to market place
     */
    event TokiLockedToMarketplace(
        uint256 _tokenId
    );


    /**
     * @dev Emits when a Toki status is updated
     */
    event TokiStatusUpdated(
        uint256 _tokenId,
        uint256 _status
    );


    /**
     * @dev Emits when a Toki payStatus is updated
     */
    event TokiPayStatusUpdated(
        uint256 _tokenId,
        uint256 _payStatus
    );

    /**
     * @dev Emits when a Toki is deactivated
     */
    event TokiDeactivated(
        uint256 _tokenId
    );


    /** 
     * Constructor of TokiFabric smart contract for Tallyx system
     * @param _name - Name for set of TOKI's
     * @param _symbol - Symbol for set TOKI's
     */
    constructor(
        string _name,
        string _symbol
    )   public
        RFT(_name, _symbol) 
        Permissions()
    {
        permissions[msg.sender] = PERMISSION_SET_PERMISSION | PERMISSION_TO_CREATE | 
            PERMISSION_TO_MODIFY_STATUS | PERMISSION_TO_MODIFY_PAY_STATUS | 
            PERMISSION_TO_DEACTIVATE;
    }

    /**
     * @dev Disallowed transferFrom function
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed approve function
     */
    function approve(
        address, 
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed setApprovalForAll function
     */
    function setApprovalForAll(
        address, 
        bool
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed mint function
     */ 
    function mint(
        string,
        string,
        uint256,
        address,
        uint256
    )
        public
        returns (uint256)
    {
        require(false, ERROR_DISALLOWED);
    } 

    /**
     * @dev Disallowed burn function
     */ 
    function burn(
        address,
        uint256
    )
        public
        returns (bool)
    {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * Overrided createFT with TokiFT creation instead RFTFT
     */
    function _createFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply,
        uint256 _tokenId
    )
        internal 
        returns (address)
    {
        require (
            _decimals > 0 && 
            _tokenOwner != address(0) &&
            _fungibleTokenSupply > 0
        );

        TokiFT fungibleToken = new TokiFT(
            _name,
            _symbol,
            _decimals,
            _fungibleTokenSupply,
            address(this),
            _tokenId,
            _tokenOwner
        );
        return address(fungibleToken);
    }

    /**
     * @dev Creates obligatoire (TOKI) with its metadata, it is active by default
     * TOKI - NFT extended with metadata (_tokiId, _assetReference, _owner, _beneficiary,
     *  _ccy, _status, _payStatus, _value, _payDate, _marketId)
     * @notice This function creates NFT extended with metadata for TOKI and FT, that is 
     * supply for this NFT, so there is a binding between NFT and FT, thus for 1 NFT we 
     * have 1 FT. The TOKI split appears in the next way: you get address of FT which is 
     * related to NFT and call transfer function from it. Basically all FT supply belongs to 
     * TOKI beneficiary, if he realize to share his profit from TOKI he could transfer some FT's 
     * to him and he will became pay beneficiary too, so your stake in FT's define your portion 
     * for TOKI. 
     */
    function createToki(
        string _tokiId,
        string _assetReference,
        address _owner,
        address _beneficiary,
        string _ccy,
        uint256 _fungibleTokenSupply,
        uint256 _payDate,
        uint256 _marketId
    ) 
        external 
        hasPermission(msg.sender, PERMISSION_TO_CREATE)
        returns (uint256) 
    {
        require( 
            _owner != address(0) && 
            _beneficiary != address(0) &&
            _fungibleTokenSupply > 0 &&
            _payDate > 0 &&
            _owner != _beneficiary
        );

        uint256 tokenId = _allTokens.length;
        address fungibleToken = _createFT(
            concat("TOKI", toString(tokenId)),
            "TOKI",
            18,
            _beneficiary,
            _fungibleTokenSupply,
            tokenId
        );

        require(super._mint(_owner, tokenId) == true, ERROR_MINTING_NFT);
        ftAddresses[tokenId] = fungibleToken;
        nftValues[tokenId] = _fungibleTokenSupply;

        tokis[tokenId].tokiId = _tokiId;
        tokis[tokenId].owner = _owner;
        tokis[tokenId].beneficiary = _beneficiary;
        tokis[tokenId].value = _fungibleTokenSupply;
        tokis[tokenId].payDate = _payDate;
        tokis[tokenId].metadata.assetReference = _assetReference;
        tokis[tokenId].metadata.ccy = _ccy;
        tokis[tokenId].metadata.status = 1;
        tokis[tokenId].metadata.payStatus = 1;
        tokis[tokenId].metadata.marketId = _marketId;
        tokis[tokenId].metadata.active = true;
        tokis[tokenId].metadata.marketplaceIsLocked = false;

        emit TokiCreated(
            tokis[tokenId].tokiId,
            tokenId,
            tokis[tokenId].owner,
            tokis[tokenId].beneficiary,
            tokis[tokenId].value,
            tokis[tokenId].payDate,
            tokis[tokenId].metadata.assetReference,
            tokis[tokenId].metadata.ccy,
            fungibleToken
        );


        return tokenId;
    }    

    /** 
     * @dev Returns obligatoire (TOKI) internal data, including (tokiId, owner,
     * beneficiary, value, payDate, assetReference, ccy, active, marketId, paid)
     * @param _tokiId - Unique identifier of TOKI
     */
    function tokiById(uint256 _tokiId)
        public
        view
        returns (
            uint256[5], 
            address[2],
            string,
            string,
            string, 
            bool, 
            bool
        )
    {
        require(_tokiId < _allTokens.length);
        Toki storage toki = tokis[_tokiId];
        uint256[5] memory tokiNumericData;
        address[2] memory tokiAddresses;

        tokiNumericData[0] = toki.value; // TOKI value
        tokiNumericData[1] = toki.payDate; // TOKI payDate
        tokiNumericData[2] = toki.metadata.status; // TOKI status
        tokiNumericData[3] = toki.metadata.payStatus; // TOKI payStatus
        tokiNumericData[4] = toki.metadata.marketId; // TOKI marketId
        tokiAddresses[0] = toki.owner; // TOKI owner
        tokiAddresses[1] = toki.beneficiary; // TOKI beneficiary

        return(
            tokiNumericData,
            tokiAddresses,
            toki.tokiId,
            toki.metadata.assetReference,
            toki.metadata.ccy,
            toki.metadata.active,
            toki.metadata.marketplaceIsLocked
        );
    }

    /**
     * @dev Updates obligatoire (TOKI) pay status
     * @param _tokiId - Unique identifier of TOKI NFT
     */
    function updateTokiStatus(
        uint256 _tokiId,
        uint256 _newStatus
    )
        public
        hasPermission(msg.sender, PERMISSION_TO_MODIFY_STATUS)
        returns (bool)
    {
        require(
            _newStatus > 0 &&
            _tokiId < _allTokens.length
        );
        tokis[_tokiId].metadata.status = _newStatus;

        emit TokiStatusUpdated(
            _tokiId,
            _newStatus
        );

        return true;
    }

    /**
     * @dev Updates obligatoire (TOKI) pay status
     * @param _tokiId - Unique identifier of TOKI NFT
     */
    function updateTokiPayStatus(
        uint256 _tokiId,
        uint256 _newPayStatus
    )
        public
        hasPermission(msg.sender, PERMISSION_TO_MODIFY_PAY_STATUS)
        returns (bool)
    {
        require(
            _newPayStatus > 0 &&
            _tokiId < _allTokens.length
        );
        tokis[_tokiId].metadata.payStatus = _newPayStatus;

        emit TokiPayStatusUpdated(
            _tokiId,
            _newPayStatus
        );

        return true;
    }

    /**
     * @dev Deactivate obligatoire (TOKI) for current marketplace
     * @param _tokiId - Unique identifier of TOKI NFT
     */
    function deactivateToki(uint256 _tokiId)
        public
        hasPermission(msg.sender, PERMISSION_TO_DEACTIVATE)
        returns (bool)
    {
        require(_tokiId < _allTokens.length);
        tokis[_tokiId].metadata.active = false;

        emit TokiDeactivated(
            _tokiId
        );

        return true;
    }

    /**
     * @dev Marks obligatoire (TOKI) as locked for current marketplace
     * @param _tokiId - Unique identifier of TOKI NFT
     */
    function lockTokiToMarketplace(uint256 _tokiId) 
        public 
        hasPermission(msg.sender, PERMISSION_TO_CREATE)
        returns (bool)
    {
        require(
            _tokiId < _allTokens.length &&
            tokis[_tokiId].metadata.marketplaceIsLocked == false
        );
        tokis[_tokiId].metadata.marketplaceIsLocked = true;

        emit TokiLockedToMarketplace(
            _tokiId
        );
        
        return true;
    }

    /**
     * @dev Returns TOKI lock status
     * @param _tokiId - Unique identifier of TOKI NFT
     */
    function tokiLockStatus(uint256 _tokiId)
        public
        view
        returns (bool)
    {
        require (_tokiId < _allTokens.length);
        return tokis[_tokiId].metadata.marketplaceIsLocked;
    }
}