const router = require('express').Router();
var urlModel = require('../models/urlModel');
const { shorturl_validation } = require('../tools/validate');

// redis
const redis = require("redis");
let client;
if (process.env.REDIS_URL) {
    client = redis.createClient(process.env.REDIS_URL);
}
else {
    client = redis.createClient(6379);
}

router.get('/', (req, res) => {
    res.send('Hi, this is a URL shortener demo');
})

router.get('/:url_id', cache, async (req, res) => {
    const validation = await shorturl_validation(req.params);
    if (validation.error) return res.status(400).send(validation.error.details[0].message);

    try {
        var r = await urlModel.findOne({ shortURL: req.params.url_id });
        if (r) {
            // check date is not expired
            var date = new Date(r.expireAt);
            // if expire delete this data
            if (date - Date.now() <= 0) {
                var r = await urlModel.deleteOne({ shortURL: req.params.url_id });
                return res.status(400).send('url has been expired');
            }
            client.setex(r.shortURL, 3600, JSON.stringify(r));
            return res.redirect(r.originalURL);
        }
        else {
            client.setex(req.params.url_id, 3600, '');
            return res.status(400).send('no such url');
        }
    }
    catch (err) {
        return res.status(500).send(err);
    }
})

async function cache(req, res, next) {
    const validation = await shorturl_validation(req.params);
    if (validation.error) return res.status(400).send(validation.error.details[0].message);

    client.get(req.params.url_id, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            try {
                // if data is not json, then it is a invalid shortURL
                let r = JSON.parse(data);
                let originalURL = r.originalURL;
                // check expire
                var date = new Date(r.expireAt);
                if (date - Date.now() <= 0) {
                    return next();
                }
                return res.redirect(originalURL);
            } catch (e) {
                return res.status(404).send('no such url');
            }
        }
        else {
            next();
        }
    });

}

module.exports = router;