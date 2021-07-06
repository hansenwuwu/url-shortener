const Joi = require('joi');

const create_url_validation = (data) => {
    const schema = Joi.object({
        url: Joi.string().min(1).required(),
        expireAt: Joi.date().iso().greater('now').required()
    });
    return schema.validate(data);
}

const shorturl_validation = (data) => {
    const schema = Joi.object({
        url_id: Joi.string().min(6).max(6).required()
    });
    return schema.validate(data);
}

module.exports = {
    create_url_validation: create_url_validation,
    shorturl_validation: shorturl_validation
}