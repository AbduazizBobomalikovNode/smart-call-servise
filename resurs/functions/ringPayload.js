// ESP32 firmware (ArduinoJson is<int>() / is<bool>()) accepts only real JSON
// integers and booleans, so ring documents are normalised before publishing.

const INT_FIELDS = ['id', 'call_duration', 'call_delay', 'count'];
const BOOL_FIELDS = ['turn_off_after_work', 'isactive'];

function toInt(value) {
    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        return Number.isInteger(n) ? n : value;
    }
    return value;
}

function toBool(value) {
    if (typeof value === 'string') {
        const v = value.trim().toLowerCase();
        if (v === 'true' || v === 'on' || v === '1') return true;
        if (v === 'false' || v === 'off' || v === '0' || v === '') return false;
        return value;
    }
    return value;
}

function normalizeRing(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    const out = { ...doc };
    for (const key of INT_FIELDS) {
        if (key in out) out[key] = toInt(out[key]);
    }
    for (const key of BOOL_FIELDS) {
        if (key in out) out[key] = toBool(out[key]);
    }
    return out;
}

module.exports = { normalizeRing, toInt, toBool, INT_FIELDS, BOOL_FIELDS };
