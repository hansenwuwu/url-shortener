const express = require('express')
const app = express()
const port = 3000

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "URL shortener API",
            version: "1.0.0",
            description: ""
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
    },
    apis: ["./routes/*.js"]
}

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const {
    PUBLISH,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env;

// mongodb
var mongoose = require('mongoose');
if (PUBLISH == 'publish') {
    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}
else {
    var mongoDB = 'mongodb://127.0.0.1/url_db';
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
}
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