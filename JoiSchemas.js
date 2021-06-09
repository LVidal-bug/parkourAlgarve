const Joi = require('joi')

module.exports.classSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
})

module.exports.spotSchema = Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    city: Joi.string().required(),
    imageToBeDeleted: Joi.alternatives().try(Joi.string(), Joi.array())
})
