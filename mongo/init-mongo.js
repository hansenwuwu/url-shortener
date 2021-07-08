db = new Mongo().getDB("url_db");

db.createCollection('pools', { capped: false });

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

let count = 0;
while (count < 500) {
    // let url_id = "";
    // while (true) {
    //     url_id = nanoid();
    //     var r = await db.pools.find_one({ url_id: url_id });
    //     if (r === null) break;
    // }
    let url_id = makeid(6);
    db.pools.insert({ url_id: url_id });
    count++;
}