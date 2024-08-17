var searchError = require('../../resurs/functions/erors');

function Ring(table) {
    this.getRingForObj = async (obj) => {
        const result = await table.find(obj, {
            projection: { _id: 0 ,lastModified:0}
        }).toArray();
        return result;
    }
    this.getRing = async (id) => {
        const result = await table.findOne({ id: id }, { projection: { _id: 0 ,lastModified:0}})
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error(`Ring  topilmadi: ${err}`)
                return false;
            })
        return result;
    }
    this.getRingAll = async () => {
        const result = await table.find({}, { projection: { _id: 0 ,lastModified:0} })
            .sort({ name: 1 }).toArray()
        return result;
    }
    this.getRingAllFilter = async (skip,limit) => {
        const result = await table.find({}, { projection: { _id: 0 ,lastModified:0} })
            .sort({ name: 1}).limit(limit).skip(skip).toArray();
        return result;
    };
    this.addRing = async (ring) => {
        const result = await table
            .insertOne(ring)
            .catch((err) => {
                let error = { error: [] };
                searchError(err, null, error);
                return error;
            });
        return result;
    }
    this.update = async (id, ring) => {
        const result = await table
            .updateMany({ id: id }, {
                $set: ring,
                $currentDate: { lastModified: true }
            }).catch(err => {
                let error = { error: [] };
                searchError(err, null, error);
                return error;
            });
        const ringx = await this.getRing(id);
        return ringx;
    }
    this.delete = async (id) => {
        const result = await table.deleteOne({ id: id })
        return result;
    }
}


module.exports = Ring;
/*
getRing()
getRingAll()
addRing()
update()
delete()
*/