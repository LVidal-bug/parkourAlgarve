const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fileSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    name: {
        type: String,
        required: [true, 'Uploaded File must have a name']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('File', fileSchema)