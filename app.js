const express = require('express')
const app = express()
const port = 3000

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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

module.exports = app;