const TokiFabric = artifacts.require('./TokiFabric.sol');
const TokiFT = artifacts.require('TokiFT.sol');
const FungibleToken = artifacts.require('token/RFTFTFull.sol');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");
let ALLOWED_CREATOR = 1;
let ALLOWED_STATUS_MODIFIER = 3;
let ALLOWED_PAY_STATUS_MODIFIER = 5;
let ALLOWED_DEACTIVATOR = 6;

contract('TokiFabric', accounts => {

	let fabric;
	let owner = accounts[0];
	let allowedAddress = accounts[2];
	let name = "marketplace1";
	let symbol = "mp1";

	beforeEach(async () => {
		fabric = await TokiFabric.new(name, symbol, { from: owner });
	});

	it('should check metadata', async () => {
		const _name = await fabric.name();
		assert.equal(_name, name, "name is not equal");
		const _symbol = await fabric.symbol();
		assert.equal(_symbol, symbol, "symbol is not equal");
	});

	it('should check that owner has permission to create toki, modify toki status, pay status and deactivate toki', async () => {
		let permissionSet = await fabric.permissions.call(owner);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('107').valueOf(), "permissions are not equal");
	});

	it('should check that random address has not permission to create toki, modify toki status, pay status and deactivate toki', async () => {
		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should update permission for toki creating', async () => {
		await fabric.setPermission(allowedAddress, 2, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('2').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki creating cause _address == address(0)', async () => {
		await fabric.setPermission(0x0, 2, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki creating cause msg.sender != owner', async () => {
		await fabric.setPermission(allowedAddress, 2, { from: accounts[3] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should update permission for toki status modifying', async () => {
		await fabric.setPermission(allowedAddress, 8, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('8').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki status modifying cause _address == address(0)', async () => {
		await fabric.setPermission(0x0, 8, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki status modifying cause msg.sender != owner', async () => {
		await fabric.setPermission(allowedAddress, 8, { from: accounts[3] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should update permission for toki pay status modifying', async () => {
		await fabric.setPermission(allowedAddress, 32, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('32').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki pay status modifying cause _address == address(0)', async () => {
		await fabric.setPermission(0x0, 32, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki pay status modifying cause msg.sender != owner', async () => {
		await fabric.setPermission(allowedAddress, 32, { from: accounts[3] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should update permission for toki deactivating', async () => {
		await fabric.setPermission(allowedAddress, 64, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('64').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki deactivating cause _address == address(0)', async () => {
		await fabric.setPermission(0x0, 64, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should not update permission for toki deactivating cause msg.sender != owner', async () => {
		await fabric.setPermission(allowedAddress, 64, { from: accounts[3] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let permissionSet = await fabric.permissions.call(allowedAddress);
		assert.equal(new BigNumber(permissionSet).valueOf(), new BigNumber('0').valueOf(), "permissions are not equal");
	});

	it('should create toki', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		let events = await fabric.TokiCreated({}, { fromBlock: '0', toBlock: 'latest' });

		events.get((err, logs) => {
			assert.equal(logs.length, 1, "were emitted less or more than 1 event");
			assert.equal(logs[0].event, "TokiCreated", "event type is not equal");
			assert.equal(logs[0].args._tokiId, tokiId, "tokiId is not equal");
			assert.equal(logs[0].args._owner, tokiOwner, "owner is not equal");
			assert.equal(logs[0].args._beneficiary, tokiBeneficiary, "beneficiary is not equal");
			assert.equal(logs[0].args._payDate, payDate, "payDate is not equal");
			assert.equal(logs[0].args._assetReference, assetReference, "assetReference is not equal");
			assert.equal(logs[0].args._ccy, ccy, "ccy is not equal");

			logs.forEach(log => console.log(log.args));
		});
	});

	it('should not create toki cause msg.sender != allowed to create toki', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: accounts[2] }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause msg.sender != allowed to create toki', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: accounts[2] }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause toki owner == address(0)', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			0x0,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause toki beneficiary == address(0)', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			0x0,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause toki value == 0', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('0').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause toki payDate == 0', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('0').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiOwner,
			ccy,
			value,
			0,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create toki cause toki owner == toki beneficiary', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('0').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiOwner,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should check tokiById', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][0]).valueOf(), value.valueOf(), "toki value is not equal");
		assert.equal(new BigNumber(toki[0][1]).valueOf(), payDate, "toki payDate is not equal");
		assert.equal(new BigNumber(toki[0][2]).valueOf(), 1, "toki status is not equal");
		assert.equal(new BigNumber(toki[0][3]).valueOf(), 1, "toki pay status is not equal");
		assert.equal(new BigNumber(toki[0][4]).valueOf(), 1, "toki marketId is not equal");

		assert.equal(toki[1][0], tokiOwner, "toki owner is not equal");
		assert.equal(toki[1][1], tokiBeneficiary, "toki beneficiary is not equal");

		assert.equal(toki[2], tokiId, "tokiId is not equal");
		assert.equal(toki[3], assetReference, "assetReference is not equal");
		assert.equal(toki[4], ccy, "ccy is not equal");
		assert.equal(toki[5], true, "active is not equal");
		assert.equal(toki[6], false, "marketplace is locked is not equal");
	});

	it('should not check tokIById cause tokiId > all tokies amount', async () => {
		let tokiId = 1;
		let toki = await fabric.tokiById(tokiId)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should update toki status', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiStatus(0, 2, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let events = await fabric.TokiStatusUpdated({}, { fromBlock: '0', toBlock: 'latest' });

		events.get((err, logs) => {
			assert.equal(logs.length, 1, "were emitted less or more than 1 event");
			assert.equal(logs[0].event, "TokiStatusUpdated", "event type is not equal");
			assert.equal(logs[0].args._tokenId, 0, "tokenId is not equal");
			assert.equal(logs[0].args._status, 2, "status is not equal");

			logs.forEach(log => console.log(log.args));
		});

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][2]).valueOf(), 2, "toki status is not equal");
	});

	it('should not update toki status cause msg.sender != allowed update toki status', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiStatus(0, 2, { from: accounts[2] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][2]).valueOf(), 1, "toki status is not equal");
	});

	it('should not update toki status cause new status == 0', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiStatus(0, 0, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][2]).valueOf(), 1, "toki status is not equal");
	});

	it('should not update toki status cause tokiId > all tokies amount', async () => {
		await fabric.updateTokiStatus(1, 1, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should update toki pay status', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiPayStatus(0, 2, { from: owner })
			.then(Utils.receiptShouldSucceed);


		let events = await fabric.TokiPayStatusUpdated({}, { fromBlock: '0', toBlock: 'latest' });

		events.get((err, logs) => {
			assert.equal(logs.length, 1, "were emitted less or more than 1 event");
			assert.equal(logs[0].event, "TokiPayStatusUpdated", "event type is not equal");
			assert.equal(logs[0].args._tokenId, 0, "tokenId is not equal");
			assert.equal(logs[0].args._payStatus, 2, "payStatus is not equal");

			logs.forEach(log => console.log(log.args));
		});

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][3]).valueOf(), 2, "toki pay status is not equal");
	});

	it('should not update toki pay status cause msg.sender != allowed to update toki pay status', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiPayStatus(0, 2, { from: accounts[2] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][3]).valueOf(), 1, "toki pay status is not equal");
	});

	it('should not update toki pay status cause new pay status == 0', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.updateTokiPayStatus(0, 0, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let toki = await fabric.tokiById(0);
		assert.equal(new BigNumber(toki[0][3]).valueOf(), 1, "toki pay status is not equal");
	});


	it('should not update toki pay status cause tokiId > all tokies amount', async () => {
		await fabric.updateTokiPayStatus(1, 1, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should deactivate toki', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.deactivateToki(0, { from: owner })
			.then(Utils.receiptShouldSucceed);


		let events = await fabric.TokiDeactivated({}, { fromBlock: '0', toBlock: 'latest' });

		events.get((err, logs) => {
			assert.equal(logs.length, 1, "were emitted less or more than 1 event");
			assert.equal(logs[0].event, "TokiDeactivated", "event type is not equal");
			assert.equal(logs[0].args._tokenId, 0, "tokenId is not equal");

			logs.forEach(log => console.log(log.args));
		});

		let toki = await fabric.tokiById(0);
		assert.equal(toki[5], false, "toki is not active");
	});

	it('should not deactivate toki cause msg.sender != allowed to deactivate toki', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		await fabric.deactivateToki(0, { from: accounts[2] })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		let toki = await fabric.tokiById(0);
		assert.equal(toki[5], true, "toki is not active");
	});

	it('should not deactivate toki cause tokiId > all tokies amount', async () => {
		await fabric.deactivateToki(1, { from: owner })
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should check that all transfers are disallowed until toki not locked to marketplace', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca76";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		let ftAddress = await fabric.ftAddress(0);
		let ft = await TokiFT.at(ftAddress);
		let ftReceiver = accounts[3];
		let amount = new BigNumber('100').mul(precision);

		await ft.transfer(
			ftReceiver,
			amount,
			{ from: tokiBeneficiary }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await ft.approve(ftReceiver, amount, { from: tokiBeneficiary });

		await ft.transferFrom(
			tokiBeneficiary,
			ftReceiver,
			amount,
			{ from: ftReceiver }
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await fabric.lockTokiToMarketplace(0, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let events = await fabric.TokiLockedToMarketplace({}, { fromBlock: '0', toBlock: 'latest' });

		events.get((err, logs) => {
			assert.equal(logs.length, 1, "were emitted less or more than 1 event");
			assert.equal(logs[0].event, "TokiLockedToMarketplace", "event type is not equal");
			assert.equal(logs[0].args._tokenId, 0, "tokenId is not equal");

			logs.forEach(log => console.log(log.args));
		});

		let tokiBeneficiaryBalance = await fabric.ftHolderBalance(0, tokiBeneficiary);
		assert.equal(new BigNumber(tokiBeneficiaryBalance).valueOf(), value.valueOf(), "balance is not equal");

		let payBeneficaryBalance = await fabric.ftHolderBalance(0, ftReceiver);
		assert.equal(new BigNumber(payBeneficaryBalance).valueOf(), 0, "balance is not equal");

		let holdersCount = await fabric.ftHoldersCount(0);
		assert.equal(new BigNumber(holdersCount).valueOf(), 1, "holdersCount is not equal");

		await ft.transfer(
			ftReceiver,
			amount,
			{ from: tokiBeneficiary }
		)
			.then(Utils.receiptShouldSucceed);

		tokiBeneficiaryBalance = await fabric.ftHolderBalance(0, tokiBeneficiary);
		assert.equal(new BigNumber(tokiBeneficiaryBalance).valueOf(), new BigNumber('900').mul(precision).valueOf(), "balance is not equal");

		payBeneficaryBalance = await fabric.ftHolderBalance(0, ftReceiver);
		assert.equal(new BigNumber(payBeneficaryBalance).valueOf(), amount.valueOf(), "balance is not equal");

		holdersCount = await fabric.ftHoldersCount(0);
		assert.equal(new BigNumber(holdersCount).valueOf(), 2, "holdersCount is not equal");
	});

	it('should check batchTransfer of TokiFT', async () => {
		let tokiId = "034dfcf3-066a-459b-ab62-3b8dbfa0ca77";
		let assetReference = "PI-887655RPN";
		let tokiOwner = accounts[1];
		let tokiBeneficiary = accounts[2];
		let ccy = "USD";
		let value = new BigNumber('1000').mul(precision);
		let payDate = 1539349229;
		let marketId = 1;

		await fabric.createToki(
			tokiId,
			assetReference,
			tokiOwner,
			tokiBeneficiary,
			ccy,
			value,
			payDate,
			marketId,
			{ from: owner }
		)
			.then(Utils.receiptShouldSucceed);

		let ftAddress = await fabric.ftAddress(0);
		let ft = await TokiFT.at(ftAddress);
		let ftReceiver = [accounts[3], accounts[4]];
		let amount = [new BigNumber('100').mul(precision), new BigNumber('200').mul(precision)];

		await fabric.lockTokiToMarketplace(0, { from: owner })
			.then(Utils.receiptShouldSucceed);

		let tokiBeneficiaryBalance = await fabric.ftHolderBalance(0, tokiBeneficiary);
		assert.equal(new BigNumber(tokiBeneficiaryBalance).valueOf(), value.valueOf(), "balance is not equal");

		let payBeneficaryBalance = await fabric.ftHolderBalance(0, ftReceiver[0]);
		assert.equal(new BigNumber(payBeneficaryBalance).valueOf(), 0, "balance is not equal");

		let holdersCount = await fabric.ftHoldersCount(0);
		assert.equal(new BigNumber(holdersCount).valueOf(), 1, "holdersCount is not equal");

		await ft.batchTransfer(
			ftReceiver,
			amount,
			{ from: tokiBeneficiary }
		).then(Utils.receiptShouldSucceed);

		tokiBeneficiaryBalance = await fabric.ftHolderBalance(0, tokiBeneficiary);
		assert.equal(new BigNumber(tokiBeneficiaryBalance).valueOf(), new BigNumber('700').mul(precision).valueOf(), "balance is not equal");

		payBeneficaryBalance = await fabric.ftHolderBalance(0, ftReceiver[0]);
		assert.equal(new BigNumber(payBeneficaryBalance).valueOf(), amount[0].valueOf(), "balance is not equal");

		holdersCount = await fabric.ftHoldersCount(0);
		assert.equal(new BigNumber(holdersCount).valueOf(), 3, "holdersCount is not equal");
	});

});