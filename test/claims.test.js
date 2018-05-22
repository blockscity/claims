const Claims = artifacts.require("./Claims.sol");

contract('Claims', (accounts) => {
    let claims;
    let subject;
    let issuer;
    let pseudo;

    const data = [
        {
            key: "key1",
            value: "value1"
        },
        {
            key: "key2",
            value: "value2"
        }
    ];

    const bytes2s = (key) => {
        return Buffer.from(key.split('00').join('').slice(2), 'hex').toString();
    };

    before(async () => {
        claims = await Claims.deployed();
        issuer = accounts[1];
        subject = accounts[2];
        pseudo = accounts[3];
    });


    it('should set claim and fire event', async () => {
        let tx = await claims.set(subject, data[0].key, data[0].value, {from: issuer});
        assert.equal(tx.logs.length, 1, 'should fire 1 event');

        let event = tx.logs[0];

        assert.equal(event.event, 'Set', 'should fire the set event');
        assert.equal(event.args.issuer, issuer, 'should issued by the issuer');
        assert.equal(event.args.subject, subject, 'should issued to the subject');
        assert.equal(bytes2s(event.args.key), data[0].key, 'should issued the correct key');
        assert.equal(bytes2s(event.args.value), data[0].value, 'should issued correct value for the key');
    });

    it('should get correspond claim for the issuer', async () => {
        await claims.set(subject, data[0].key, data[0].value, {from: issuer});
        let claim = await claims.get(issuer, subject, data[0].key);

        assert.equal(bytes2s(claim), data[0].value, 'should get correspond issued value');
    });

    it('should unset claim and fire event as issuer', async () => {
        await claims.set(subject, data[0].key, data[0].value, {from: issuer});
        let tx = await claims.unset(issuer, subject, data[0].key, {from: issuer});

        assert.equal(tx.logs.length, 1, 'should fire 1 event');

        let event = tx.logs[0];
        assert.equal(event.event, 'Unset', 'should fire unset event');
        assert.equal(event.args.issuer, issuer, 'should unset claim from issuer');
        assert.equal(event.args.subject, subject, 'should unset claim for subject');
        assert.equal(bytes2s(event.args.key), data[0].key, 'should unset claim for subject');

        let claim = await claims.get(issuer, subject, data[0].key);
        assert.equal(bytes2s(claim), '', 'should get nothing after unset');
    });

    it('should not able to unset as pseudo', async () => {
        await claims.set(subject, data[0].key, data[0].value, {from: issuer});
        try {
            await claims.unset(issuer, subject, data[0].key, {from: pseudo});
            assert.fail();
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert')
        }
    });

    it('should unset claim and fire event as subject', async () => {
        await claims.set(subject, data[0].key, data[0].value, {from: issuer});
        let tx = await claims.unset(issuer, subject, data[0].key, {from: subject});

        assert.equal(tx.logs.length, 1, 'should fire 1 event');

        let event = tx.logs[0];
        assert.equal(event.event, 'Unset', 'should fire unset event');
        assert.equal(event.args.issuer, subject, 'should unset claim from issuer');
        assert.equal(event.args.subject, subject, 'should unset claim for subject');
        assert.equal(bytes2s(event.args.key), data[0].key, 'should unset claim for subject');

        let claim = await claims.get(issuer, subject, data[0].key);
        assert.equal(bytes2s(claim), '', 'should get nothing after unset');
    });


    it('should not able to unset when key not exists', async () => {
        try {
            await claims.unset(issuer, subject, 'not_exists', {from: issuer});
            assert.fail();
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert')
        }
    });
});