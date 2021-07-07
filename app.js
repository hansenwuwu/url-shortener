const express = require('express')
const app = express()
const port = 3000

const { create_url_id } = require('./tools/pool');

// mongodb
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/urlshortener';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const rootRoute = require('./routes/root');
const urlsRoute = require('./routes/urls');

app.use(express.json());

app.use('/', rootRoute);
app.use('/api/v1/urls', urlsRoute);

app.listen(port, async () => {

    // create 5000 unique url_id in database beforehand
    console.log('creating unique url_id ...');
    await create_url_id();

    console.log(`Example app listening at http://localhost:${port}`);
})

module.exports = app;