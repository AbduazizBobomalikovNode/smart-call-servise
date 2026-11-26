// One-off migration: converts string numbers / string booleans in the `ring`
// collection to real integers / booleans (ESP32 firmware requires them).
// Usage:  URI_MONGO=... node scripts/migrate-ring-types.js [--apply]
// Default is dry-run: prints counts only, writes nothing.
const { INT_FIELDS, BOOL_FIELDS, toInt, toBool } = require('../resurs/functions/ringPayload');

// Pure: returns the $set patch needed to fix a ring doc (empty object = already correct).
function convertRing(doc) {
    const set = {};
    for (const key of INT_FIELDS) {
        if (typeof doc[key] === 'string') {
            const v = toInt(doc[key]);
            if (typeof v === 'number') set[key] = v;
        }
    }
    for (const key of BOOL_FIELDS) {
        if (typeof doc[key] === 'string') {
            const v = toBool(doc[key]);
            if (typeof v === 'boolean') set[key] = v;
        }
    }
    if (Array.isArray(doc.days) && doc.days.some(d => typeof d === 'string')) {
        const days = doc.days.map(toInt);
        if (days.every(Number.isInteger)) set.days = days;
    }
    return set;
}

async function main() {
    const { MongoClient } = require('mongodb');
    const uri = process.env.URI_MONGO;
    if (!uri) throw new Error('URI_MONGO environment variable is required');
    const apply = process.argv.includes('--apply');
    const client = new MongoClient(uri);
    await client.connect();
    try {
        const col = client.db('smart_call').collection('ring');
        let scanned = 0, changed = 0, daysFixed = 0;
        const perField = {};
        for await (const doc of col.find({})) {
            scanned++;
            const set = convertRing(doc);
            if (set.days) daysFixed++;
            const keys = Object.keys(set);
            if (keys.length === 0) continue;
            changed++;
            keys.forEach(k => { perField[k] = (perField[k] || 0) + 1; });
            if (apply) await col.updateOne({ _id: doc._id }, { $set: set });
        }
        console.log(`mode: ${apply ? 'APPLY' : 'dry-run'}`);
        console.log(`scanned: ${scanned}, documents ${apply ? 'updated' : 'to update'}: ${changed}`);
        console.log('per field:', JSON.stringify(perField));
        if (!apply && changed) console.log('re-run with --apply to write changes');
    } finally {
        await client.close();
    }
}


if (require.main === module) {
    main().catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = { convertRing };
