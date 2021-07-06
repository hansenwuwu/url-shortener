var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var urlModelSchema = new Schema({
    shortURL: {
        type: String,
        require: true
    },
    originalURL: {
        type: String,
        require: true
    },
    expireAt: {
        type: Date,
        require: true
    }
});

module.exports = mongoose.model('urls', urlModelSchema);