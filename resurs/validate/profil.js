const Joi = require('joi');

function Validate(xabar, method) {
    const sxema1 = Joi.object({
        name: Joi.string().min(3).max(50),
        email: Joi.string().min(3).max(50),
    });
    const sxema2 = Joi.object({
        name: Joi.string().min(3).max(50),
        email: Joi.string().min(3).max(50),
        oldpassword: Joi.string().min(6).max(150),
        newpassword: Joi.string().min(6).max(150),
    });

    if (method == "api") {
        return sxema1.validate(xabar);
    }

    return sxema2.validate(xabar);
}

module.exports = Validate;