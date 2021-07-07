var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var urlPoolSchema = new Schema({
    url_id: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('pools', urlPoolSchema, 'pools');