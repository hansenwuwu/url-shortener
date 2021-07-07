var urlPool = require('../models/urlPool');
const { customAlphabet } = require('nanoid');
const alphabet = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

async function create_url_id() {

    // for demo usage
    // if pool has enough url_id for demo, then don't need to create another 500 url_id
    var rq = await urlPool.countDocuments({});
    if (rq >= 100) {
        return;
    }

    let count = 0;
    while (count < 500) {
        let url_id = "";
        while (true) {
            url_id = nanoid();
            var r = await urlPool.findOne({ url_id: url_id });
            if (r === null) break;
            else console.log('collision');
        }
        await urlPool.create({ url_id: url_id });
        count++;
    }
    return;
}

module.exports = {
    create_url_id: create_url_id
}