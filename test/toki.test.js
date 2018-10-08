const TokiFabric = artifacts.require('TokiFabric.sol');
const FungibleToken = artifacts.require('token/ERC1358FTFull.sol');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");

contract('TokiFabric', accounts => {

	let fabric;
	let owner = accounts[0];
	let name = "marketplace1";
	let symbol = "mp1";

	beforeEach(async () => {
		fabric = await TokiFabric.new(name, symbol, {from: owner});
	});	

	it('should check metadata', async () => {
		const _name = await fabric.name();
		assert.equal(_name, name, "name is not equal");
		const _symbol = await fabric.symbol();
		assert.equal(_symbol, symbol, "symbol is not equal");
	});

	it('should not create obligature cause msg.sender != owner', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: tokiOwner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create obligature cause payDate <= 0', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 0;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create obligature cause value <= 0', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('0').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create obligature cause toki owner == toki beneficiary', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[1];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should create obligature', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");
	});

	it('should check getTokiLockStatus', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		let obligatureId = 0;

		let tokiLockStatus = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(tokiLockStatus, false, "toki lock status is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		tokiLockStatus = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(tokiLockStatus, true, "toki lock status is not equal");
	});

	it('should check getTokiStatus && setTokiAsPaid', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		let obligatureId = 0;

		let tokiStatus = await fabric.getTokiStatus(obligatureId);
		assert.equal(tokiStatus, true, "toki status is not equal");

		let tokiLockStatus = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(tokiLockStatus, false, "toki lock status is not equal");

		let payStatus = await fabric.getTokiPayStatus(obligatureId);
		assert.equal(payStatus, false, "toki pay status is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		tokiLockStatus = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(tokiLockStatus, true, "toki lock status is not equal");

		await fabric.setTokiAsPaid(obligatureId, {from: accounts[2]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await fabric.setTokiAsPaid(obligatureId, {from: owner})
			.then(Utils.receiptShouldSucceed);

		tokiStatus = await fabric.getTokiStatus(obligatureId);
		assert.equal(tokiStatus, false, "toki status is not equal");

		payStatus = await fabric.getTokiPayStatus(obligatureId);
		assert.equal(payStatus, true, "toki pay status is not equal");

		await fabric.setTokiAsPaid(obligatureId, {from: owner})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should check getTokiBeneficiary && getTokiOwner && getTokiPayDate && getTokiOwners && getTokiPortions && getTokiDependentFungibleToken', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		let obligatureId = 0;

		let beneficiaryOfToki = await fabric.getTokiBeneficiary(obligatureId);
		assert.equal(beneficiaryOfToki, tokiBeneficiary, "toki beneficiary is not equal");

		let ownerOfToki = await fabric.getTokiOwner(obligatureId);
		assert.equal(ownerOfToki, tokiOwner, "toki owner is not equal");

		let tokiPayDate = await fabric.getTokiPayDate(obligatureId);
		assert.equal(tokiPayDate, payDate, "toki pay date is not equal");

		let tokiOwners = await fabric.getTokiOwners(obligatureId);
		assert.equal(tokiOwners[0], tokiOwner, "toki owners is not equal");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki portions is not equal");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki portions is not equal");

		let ftAddress = await fabric.ftAddresses.call(obligatureId);
		let ftOwners = await fabric.ftOwners.call(tokiOwner);
		assert.equal(ftAddress, ftOwners, "fungible token address is not equal");

		let tokiFungibleToken = await fabric.getTokiDependentFungibleToken(obligatureId);
		assert.equal(tokiFungibleToken, ftAddress, "toki dependent funigible token address is not equal");
	});

	it('should not migrate obligature cause mgs.sender is not obligature owner', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.migrateObligature(obligatureId, {from: accounts[5]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let isObligatureActive = await fabric.getTokiStatus(obligatureId);
		assert.equal(isObligatureActive, true, "obligature is not active")
	});

	it('should not migrate obligature cause obligature is locked to marketplace', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		await fabric.migrateObligature(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let isObligatureActive = await fabric.getTokiStatus(obligatureId);
		assert.equal(isObligatureActive, true, "obligature is not active")
	});

	it('should migrate obligature', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		let marketplaceIsLocked = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(marketplaceIsLocked, false, "marketplace is not equal");

		await fabric.migrateObligature(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let isObligatureActive = await fabric.getTokiStatus(obligatureId);
		assert.equal(isObligatureActive, false, "obligature is active")
	});


	it('should not lock obligature to marketplace cause msg.sender is not obligature owner', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: accounts[5]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not lock obligature to marketplace cause msg.sender is not obligature owner', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.migrateObligature(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should lock obligature to marketplace', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");
	});

	it('should split toki between 2 parties (toki owner and buyer) by calling `transfer(buyer, valueToSold);`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('3000').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transfer(buyer, valueToSold, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokiOwnerBalance = new BigNumber('7000').mul(precision);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), tokiOwnerBalance, "toki owner token balance is not equal");
		assert.equal(tokiPortions[0][1], buyer, "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][1]).valueOf(), valueToSold, "toki buyer token balance if not equal");
	});

	it('should not split toki between 2 parties cause valueToSold > toki value (transfer)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('10001').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transfer(buyer, valueToSold, {from: tokiOwner})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should not split toki between 2 parties cause msg.sender != toki owner (transfer)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('3000').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transfer(buyer, valueToSold, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should split toki between 2 parties (toki owner and buyer) by calling `transferFrom(tokiOwner, buyer, valueToSold);`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('3000').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		await fungibleToken.approve(accounts[2], valueToSold, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transferFrom(tokiOwner, buyer, valueToSold, {from: accounts[2]})
			.then(Utils.receiptShouldSucceed);

		let tokiOwnerBalance = new BigNumber('7000').mul(precision);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), tokiOwnerBalance, "toki owner token balance is not equal");
		assert.equal(tokiPortions[0][1], buyer, "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][1]).valueOf(), valueToSold, "toki buyer token balance if not equal");
	});

	it('should not split toki between 2 parties cause valueToSold > toki value (transferFrom)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('10001').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		await fungibleToken.approve(accounts[2], valueToSold, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transferFrom(tokiOwner, buyer, valueToSold, {from: accounts[2]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should not split toki between 2 parties cause msg.sender != (owner || approved agent) (transferFrom)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyer = accounts[6];
		let valueToSold = new BigNumber('10001').mul(precision);

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		await fungibleToken.approve(accounts[2], valueToSold, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.transferFrom(tokiOwner, buyer, valueToSold, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should split toki between multiple parties (toki owner and buyer) by calling `batchTransfer(buyers, values);`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('1500').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransfer(buyers, values, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokiOwnerBalance = new BigNumber('3500').mul(precision);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), tokiOwnerBalance, "toki owner token balance is not equal");
		assert.equal(tokiPortions[0][1], buyers[0], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][1]).valueOf(), values[0], "toki buyer token balance if not equal");
		assert.equal(tokiPortions[0][2], buyers[1], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][2]).valueOf(), values[1], "toki buyer token balance if not equal");
		assert.equal(tokiPortions[0][3], buyers[2], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][3]).valueOf(), values[2], "toki buyer token balance if not equal");
	});

	it('should not split toki between multiple parties cause values sum > toki value (batchTransfer)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('5001').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransfer(buyers, values, {from: tokiOwner})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should not split toki between multiple parties cause values msg.sender != toki owner (batchTransfer)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('1000').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransfer(buyers, values, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should split toki between multiple parties (toki owner and buyer) by calling `batchTransferFrom(tokiOwner, buyers, values);`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('1500').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		await fungibleToken.approve(accounts[2], new BigNumber('6500').mul(precision), {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransferFrom(tokiOwner, buyers, values, {from: accounts[2]})
			.then(Utils.receiptShouldSucceed);

		let tokiOwnerBalance = new BigNumber('3500').mul(precision);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), tokiOwnerBalance, "toki owner token balance is not equal");
		assert.equal(tokiPortions[0][1], buyers[0], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][1]).valueOf(), values[0], "toki buyer token balance if not equal");
		assert.equal(tokiPortions[0][2], buyers[1], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][2]).valueOf(), values[1], "toki buyer token balance if not equal");
		assert.equal(tokiPortions[0][3], buyers[2], "toki buyer is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][3]).valueOf(), values[2], "toki buyer token balance if not equal");
	});

	it('should not split toki between multiple parties cause values sum > toki value (batchTransferFrom)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('5001').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		await fungibleToken.approve(accounts[2], new BigNumber('10001').mul(precision))
			.then(Utils.receiptShouldSucceed);

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransferFrom(tokiOwner, buyers, values, {from: accounts[2]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});

	it('should not split toki between multiple parties cause values msg.sender != (toki owner || approved agent) (batchTransferFrom)`', async () => {
		let tokiId = "toki_01";
		let assetReference = "sample_asset";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "usd";
		let value = new BigNumber('10000').mul(precision);
		let payDate = 1546300800;
		let marketId = new BigNumber('1');

		await fabric.createObligature(
			tokiId,
			assetReference,

			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{from: owner}
		)
			.then(Utils.receiptShouldSucceed);

		let obligatureId = 0;

		let obligatureIndex = await fabric.tokenByIndex(0);
		assert.equal(new BigNumber(obligatureIndex).valueOf(), new BigNumber(0).valueOf(), "obligatureIndex is not equal");

		let ownedObligature = await fabric.ownerObligatures(tokiOwner);
		assert.equal(new BigNumber(ownedObligature).valueOf(), new BigNumber(0).valueOf(), "ownedObligatures is not equal");

		let ownedObligatureByIndex = await fabric.ownerObligatureByIndex(tokiOwner, 0);
		assert.equal(new BigNumber(ownedObligatureByIndex).valueOf(), new BigNumber(0).valueOf(), "ownedObligatureByIndex is not equal");

		let balanceOfOwner = await fabric.balanceOf(tokiOwner);
		assert.equal(new BigNumber(balanceOfOwner).valueOf(), new BigNumber(1).valueOf(), "balanceOfOwner is not equal");

		let ownerOf = await fabric.ownerOf(0);
		assert.equal(ownerOf, tokiOwner, "ownerOf is not equal");

		let totalSupply = await fabric.totalSupply();
		assert.equal(new BigNumber(totalSupply).valueOf(), new BigNumber(1).valueOf(), "totalSupply is not equal");

		await fabric.lockTokiToMarketplace(obligatureId, {from: tokiOwner})
			.then(Utils.receiptShouldSucceed);

		let lockedToMarketPlace = await fabric.getTokiLockStatus(obligatureId);
		assert.equal(lockedToMarketPlace, true, "marketplace is not equal");

		let buyers = [accounts[6], accounts[7], accounts[8]];
		let values = [
			new BigNumber('2000').mul(precision),
			new BigNumber('1000').mul(precision),
			new BigNumber('3000').mul(precision)
		];

		let fungibleTokenAddress = await fabric.getTokiDependentFungibleToken(obligatureId);
		let fungibleToken = await FungibleToken.at(fungibleTokenAddress);

		let symbol = await fungibleToken.symbol();
		assert.equal(symbol, "TOKI0", "symbol is not equal");

		let tokenHolder = await fungibleToken.tokenHolders.call(tokiOwner);
		assert.equal(tokenHolder, true, "is not token holder");

		await fungibleToken.approve(accounts[2], new BigNumber('6500').mul(precision))
			.then(Utils.receiptShouldSucceed);

		let tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");

		await fungibleToken.batchTransferFrom(tokiOwner, buyers, values, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		tokiPortions = await fabric.getTokiPortions(obligatureId);
		assert.equal(tokiPortions[0][0], tokiOwner, "toki owner is not token holder");
		assert.equal(new BigNumber(tokiPortions[1][0]).valueOf(), value, "toki owner token balance is not equal");
	});
});