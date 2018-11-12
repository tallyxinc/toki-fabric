# TokiFabric
## Overview
TokiFabric smart contract is built ahead of RFT token standard, implements functionality for storing, migrating and sharing TOKI's (obligatory). Each obligatory is presented by RFT Non-Fungible token and its value is presented by RFT Fungible token, giving user ability to sold his obligations to another people inefficient way, your stake in RFT Fungible token defines your portion for TOKI (obligatory).

## Internal process

The entry point to all functions of  TokiFabric smart contract is ‘createToki’ function, which creates RFT Fungible, RFT Non-Fungible token, adds obligatory metadata to a registry. Initially, each TOKI (obligatory) is marked as unpaid, unlocked to a marketplace and active, the user has the ability to move his obligation to another marketplace (side-chain) only when it’s not locked to a marketplace, once it’s locked you won’t be capable of doing that. Each RFT Fungible token transfer from TOKI owner balance to another split the property rights between parties, depending on their stake.

## Functions

### TokiFabric

1.  **setPermission( address _address, uint256 _permission)**
Allow/Disallow(depends on _permission value) function call permissions for selected address _address - receiver of permissions
**Return value:** void

2. **createToki(string _tokiId, string _assetReference, address _owner, address _beneficiary, string _ccy, uint256 _status, uint256 _payStatus, uint256 _value, uint256 _payDate, uint256 _marketId)**
Creates obligatoire (TOKI) with its metadata, it is active by default TOKI - NFT extended with metadata (_tokiId, _assetReference, _owner, _beneficiary, _ccy, _status, _payStatus, _value, _payDate, _marketId).
**Return value:** uint256
**Sample return value:** 10

3.  **deactivateToki(uint256 _tokiId)**
Deactivate obligatoire (TOKI) for current marketplace.
**Return value:**  bool
**Sample return value:** true

4.  **updateTokiStatus( uint256 _tokiId string _newStatus)**
Updates obligatoire (TOKI) status. 
_tokiId - unique identifier of TOKI NFT
**Return value:** bool
**Sample return value:** false

6.  **lockTokiToMarketplace( uint256 _tokiId)**
Checks if all NFT's of certain address(_owner) is approved to transfer by another address(_operator).
 _owner - address of NFT's owner 
 _operator - receipient address of transfer rights
**Return value:** bool
**Sample return value:** false

7.  **tokiById( uint256 _tokiId)**
Returns obligatoire (TOKI) internal data, including (tokiId, owner, beneficiary, value, payDate, assetReference, ccy, active, marketId, paid) 
_tokiId - unique identifier of TOKI
**Return value:** (uint256[3],address[2], string, string, string, bool, bool)
**Sample return value:** ([2000, 1539269692, 2, 4, 12], [0x6e14c8e557482b98078ad506399bdab479a0d256, 0x65d25f75dfdd2a42725a404748dbc05ab7182be8], "034dfcf3-066a-459b-ab62-3b8dbfa0ca76", "PI-887655RPN", "USD", false, true)

8.  **updateTokiPayStatus( uint256 _tokiId, string _newPayStatus)**
Updates obligatoire (TOKI) pay status. 
_tokiId - unique identifier of TOKI NFT
**Return value:** bool
**Sample return value:** false

### Toki FT

1.  **transfer(address _to, uint256 _amount)**
Overridden RFTFT transfer function, which requires TOKI to be locked to the marketplace
**Return value:** bool
**Sample return value:** false

2.  **transferFrom(address _from address _to,uint256 _amount)**
Overridden RFT transferFrom function, which requires TOKI to be locked to the marketplace
**Return value:** bool
**Sample return value:** false
    
 