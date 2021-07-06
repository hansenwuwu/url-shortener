const router = require('express').Router();
var urlModel = require('../models/urlModel');
const { shorturl_validation } = require('../tools/validate');

router.get('/', (req, res) => {
    res.send(`Hs's URL shortener`)
})

router.get('/:url_id', async (req, res) => {
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
                return res.status(404).send('url has been expired');
            }
            return res.redirect(r.originalURL);
        }
        else {
            return res.status(404).send('no such url');
        }
    }
    catch (err) {
        return res.status(500).send(err);
    }
})

module.exports = router;