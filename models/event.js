const mongoose = require('mongoose');
const Schema = mongoose.Schema

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    date: {
        type: Array,
        required: true
    },
    hour: {
        startHour: String,
        endHour: String
    },

    description: {
        type: String,
    },

    type: {
        type: String,
        enum: ['Aula', 'Evento', 'Treino Livre', 'Outro'],
        required: true
    },

    freeSpaces: {
        type: Number,
        required: true
    },

    vagas: Array,
    endJsDate:{
        type:Number,
        required: true
    },
    location: {
        spot: {
            type: Schema.Types.ObjectID,
            ref: 'Spot',
        },
        link: String,
    },

    isWhiteListed: {
        whiteListed: Boolean,
        Date: Number,
    },

    jsPostDate: {
        type: Number,
        required: true

    },
    EndDate: {
        type: String,
        required: true
    },
    sendEmail: Boolean,
    level:{
        type: String,
        enum:["Avançados", "Intermédios","Iniciantes"],
        required: true

    }
})
module.exports = mongoose.model('Event', eventSchema)
