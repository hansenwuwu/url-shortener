const express = require('express')
const app = express()
const port = 3000

const { create_url_id } = require('./tools/pool');

const {
    PUBLISH,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    REDIS_URL
} = process.env;

// mongodb
var mongoose = require('mongoose');
if (PUBLISH == 'publish') {
    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}`;
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}
else {
    var mongoDB = 'mongodb://127.0.0.1/urlshortener';
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const rootRoute = require('./routes/root');
const urlsRoute = require('./routes/urls');

app.use(express.json());

app.use('/', rootRoute);
app.use('/api/v1/urls', urlsRoute);

// async function startup() {
//     console.log('creating unique url_id ...');
//     await create_url_id();
//     console.log('unique url_id created!');

//     app.listen(port, async () => {
//         console.log(`Example app listening at http://localhost:${port}`);
//     })
// }

// startup();

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

module.exports = app;