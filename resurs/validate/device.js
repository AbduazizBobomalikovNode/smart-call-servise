const Joi = require('joi');

function Validate(xabar, method,role) {
    const sxema1 = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        pin: Joi.number().required(),
        key: Joi.string().min(3).max(50).required(), // broker emailli   
        wifi_name: Joi.string().min(3).max(50).required(),
        wifi_password: Joi.string().min(3).max(150).required(),
    });
    let sxema2 = null;
    if (role.includes("admin")) {
        sxema2 = Joi.object({
            name: Joi.string().min(3).max(50),
            pin: Joi.number(),
            key: Joi.string().min(3).max(50),
            wifi_name: Joi.string().min(3).max(50),
            wifi_password: Joi.string().min(3).max(150),
        });
    }else{
        sxema2 = Joi.object({
            name: Joi.string().min(3).max(50),
            pin: Joi.number(),
            wifi_name: Joi.string().min(3).max(50),
            wifi_password: Joi.string().min(3).max(150),
        });

        if (method == "api") {
            return Joi.object({
                name: Joi.string().min(3).max(50),
                pin: Joi.number()
            }).validate(xabar);
        }
    }

    if (method == 'add')
        return sxema1.validate(xabar);


    return sxema2.validate(xabar);
}

module.exports = Validate;