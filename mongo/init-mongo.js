db = new Mongo().getDB("urlshortener");

db.createCollection('pools', { capped: false });

let count = 0;
while (count < 500) {
    let url_id = "";
    while (true) {
        url_id = nanoid();
        var r = await db.pools.find_one({ url_id: url_id });
        if (r === null) break;
    }
    await db.pools.insert({ url_id: url_id });
    count++;
}