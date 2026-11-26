const Joi = require('joi');

const DAYS = Joi.array().items(Joi.number().integer().min(1).max(7));

function Validate(xabar, method, role) {
    const sxema1 = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        time: Joi.string().min(3).max(50).required(),
        days: DAYS.min(1).max(7).required(),
        turn_off_after_work: Joi.boolean().required(),
        call_duration: Joi.number().integer().required(),
        call_delay: Joi.number().integer().required(),
        count: Joi.number().integer().required(),
        iddevice: Joi.number().required(),
    });
    let sxema2 = null;

    sxema2 = Joi.object({
        name: Joi.string().min(3).max(50),
        time: Joi.string().min(3).max(50),
        days: DAYS.min(1).max(7),
        turn_off_after_work: Joi.boolean(),
        call_duration: Joi.number().integer(),
        call_delay: Joi.number().integer(),
        count: Joi.number().integer(),
        isactive:Joi.boolean(),
        iddevice: Joi.number(),
    });


    if (method == 'add')
        return sxema1.validate(xabar);


    return sxema2.validate(xabar);
}

module.exports = Validate;