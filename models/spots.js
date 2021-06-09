const mongoose = require('mongoose');
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }
const spotSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true

    },
    location: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    images: [{
        url: String,
        filename: String,

    }],
    description: {
        type: String,
        required: true,

    },
    city: {
        type: String,
        enum: ['Faro', 'Portimão', 'Lagos', 'Lagoa', 'Albufeira', 'Aljezur', 'Monchique', 'Silves', 'Loulé', 'São Brás', 'Olhão', 'Tavira', 'Alcoutim', 'Castro Marim', 'Vila Real de Santo António'],
        required: true,
    },
    confirmed: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed']
    },

    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            unique: true
        }
    },

    titleQuery: {
        type: String,
        required: true,
        unique: true

    }
}, opts)



module.exports = mongoose.model('Spot', spotSchema)