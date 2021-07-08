const router = require('express').Router();
var urlModel = require('../models/urlModel');
var poolModel = require('../models/urlPool');
var validUrl = require('valid-url');
const { create_url_validation } = require('../tools/validate');
const { customAlphabet } = require('nanoid');
const alphabet = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

// redis
const redis = require("redis");
let client;
if (process.env.REDIS_URL) {
    client = redis.createClient(process.env.REDIS_URL);
}
else {
    client = redis.createClient(6379);
}

/**
 * @openapi
 * /api/v1/urls:
 *   post:
 *     summary: upload long url
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: long url
 *                 example: https://www.google.com
 *               expireAt:
 *                 type: string
 *                 description: expire date time in iso format
 *                 example: 2021-07-07T08:55:29.921Z
 *     responses:
 *       201:
 *         description: Returns a url_id.
 */

router.post('/', async (req, res) => {
    const validation = await create_url_validation(req.body);
    if (validation.error) return res.status(400).send(validation.error.details[0].message);

    let url = req.body.url;
    let expireAt = req.body.expireAt;

    // add 'http' to url, if it doesn't have
    // for url redirect
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    if (!validUrl.isUri(url)) {
        return res.status(400).send('invalid url');
    }

    try {
        // check shortURl is unique
        // probability for duplication will be 1% a day
        // reference: https://zelark.github.io/nano-id-cc/
        // let url_id = nanoid();
        // let count = 0;
        // while (count < 100) {
        //     count++;
        //     url_id = nanoid();
        //     var r = await urlModel.findOne({ shortURL: url_id });
        //     if (r == null) break;
        // }
        // if (count >= 100) {
        //     return res.status(500).send('url_id collision rate too high');
        // }

        var r = await poolModel.findOneAndDelete({});
        let url_id = r.url_id;

        var p = await urlModel.create({ shortURL: url_id, originalURL: url, expireAt: expireAt });
        client.setex(p.shortURL, 3600, JSON.stringify(p));
        return res.status(201).send({
            url_id: p.shortURL,
            shortUrl: `http:localhost:3000/${p.shortURL}`
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

module.exports = router;