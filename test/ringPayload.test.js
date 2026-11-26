const test = require('node:test');
const assert = require('node:assert');
const { normalizeRing } = require('../resurs/functions/ringPayload');
const validate = require('../resurs/validate/ring');

const good = () => ({
    name: 'Dars 1', time: '08:30', days: [1, 2, 3],
    turn_off_after_work: true, call_duration: '5', call_delay: '10', count: '2', iddevice: 123,
});

test('normalizeRing coerces numbers and booleans, leaves the rest', () => {
    const out = normalizeRing({
        id: '42', name: 'x1', time: '08:30', days: [1, 2], call_duration: '5', call_delay: '10',
        count: '3', turn_off_after_work: 'on', isactive: 'false', iddevice: '7',
    });
    assert.strictEqual(out.id, 42);
    assert.strictEqual(out.call_duration, 5);
    assert.strictEqual(out.call_delay, 10);
    assert.strictEqual(out.count, 3);
    assert.strictEqual(out.turn_off_after_work, true);
    assert.strictEqual(out.isactive, false);
    assert.strictEqual(out.iddevice, '7');
    assert.deepStrictEqual(out.days, [1, 2]);
    assert.strictEqual(out.name, 'x1');
});

test('normalizeRing does not mutate input and tolerates non-objects', () => {
    const src = { id: '1' };
    normalizeRing(src);
    assert.strictEqual(src.id, '1');
    assert.strictEqual(normalizeRing(null), null);
});

test('add: string numbers are converted in value', () => {
    const { error, value } = validate(good(), 'add');
    assert.ifError(error);
    assert.strictEqual(value.call_duration, 5);
    assert.strictEqual(value.call_delay, 10);
    assert.strictEqual(value.count, 2);
    assert.strictEqual(value.turn_off_after_work, true);
});

test('add and update: non-integers are rejected', () => {
    for (const method of ['add', 'update']) {
        for (const key of ['call_duration', 'call_delay', 'count']) {
            const body = good();
            body[key] = 1.5;
            assert.ok(validate(body, method).error, `${method} ${key}`);
        }
        const body = good();
        body.days = [1, 2.5];
        assert.ok(validate(body, method).error, `${method} days`);
    }
});

test('days: min 1 in both schemas, 1..7 only', () => {
    assert.ifError(validate({ days: [1] }, 'update').error);
    assert.ifError(validate({ ...good(), days: [7] }, 'add').error);
    assert.ok(validate({ days: [] }, 'update').error);
    assert.ok(validate({ ...good(), days: [] }, 'add').error);
    assert.ok(validate({ days: [8] }, 'update').error);
});

test('turn_off_after_work must be boolean; required on add, optional on update', () => {
    const missing = good();
    delete missing.turn_off_after_work;
    assert.ok(validate(missing, 'add').error);
    assert.ifError(validate({ isactive: false }, 'update').error);
    const off = good();
    off.turn_off_after_work = false;
    assert.strictEqual(validate(off, 'add').value.turn_off_after_work, false);
    const bad = good();
    bad.turn_off_after_work = 'on';
    assert.ok(validate(bad, 'add').error);
});

const { convertRing } = require('../scripts/migrate-ring-types');

test('convertRing converts string numbers', () => {
    assert.deepStrictEqual(
        convertRing({ id: '7', call_duration: '5', call_delay: '10', count: '2' }),
        { id: 7, call_duration: 5, call_delay: 10, count: 2 });
});

test('convertRing converts on/true/1 and false/off/0 booleans', () => {
    for (const t of ['on', 'true', '1']) {
        assert.deepStrictEqual(convertRing({ turn_off_after_work: t, isactive: t }), { turn_off_after_work: true, isactive: true });
    }
    assert.deepStrictEqual(convertRing({ isactive: 'false' }), { isactive: false });
});

test('convertRing converts string days, leaves unparseable ones alone', () => {
    assert.deepStrictEqual(convertRing({ days: ['1', 2, '3'] }), { days: [1, 2, 3] });
    assert.deepStrictEqual(convertRing({ days: ['1', 'x'] }), {});
    assert.deepStrictEqual(convertRing({ call_duration: '2.5' }), {});
});

test('convertRing leaves already-correct docs unchanged', () => {
    const doc = { id: 1, name: 'abc', days: [1, 2], call_duration: 5, call_delay: 1, count: 2, turn_off_after_work: true, isactive: false };
    const copy = JSON.parse(JSON.stringify(doc));
    assert.deepStrictEqual(convertRing(doc), {});
    assert.deepStrictEqual(doc, copy);
});
