const Joi = require('joi');

function Validate(xabar, method, role) {
    const sxema1 = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        time: Joi.string().min(3).max(50).required(),
        days: Joi.array().min(1).max(50).required(),
        turn_off_after_work: Joi.boolean().required(),
        call_duration: Joi.number().required(),
        call_delay: Joi.number().required(),
        count: Joi.number().required(),
        iddevice: Joi.number().required(),
    });
    let sxema2 = null;

    sxema2 = Joi.object({
        name: Joi.string().min(3).max(50),
        time: Joi.string().min(3).max(50),
        days: Joi.array().min(3).max(50),
        turn_off_after_work: Joi.boolean(),
        call_duration: Joi.number(),
        call_delay: Joi.number(),
        count: Joi.number(),
        isactive:Joi.boolean(),
        iddevice: Joi.number(),
    });


    if (method == 'add')
        return sxema1.validate(xabar);


    return sxema2.validate(xabar);
}

module.exports = Validate;