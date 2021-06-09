const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        required: true,
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    recoverPassword: {
        type: String,
    },
    profile: {
        photo:
        {
            url: String,
            fileName: String,
        },
        experience: Number,
        age: Number,
        city: String,
        description: String,
    },
    level: {
        isBegginer: {
            type: Boolean,
            default: true
        },
        isIntermidiate: {
            type: Boolean,
            default: false,
        },
        isAdvanced: {
            type: Boolean,
            default: false,
        }
    },
    trains: [{
        goesTrain1: {
            type: Boolean,
        },
        goesTrain2: {
            type: Boolean,
        },
        goesTrain3: {
            type: Boolean,
        },
        goesTrain4: {
            type: Boolean,
        },
        goesTrain5: {
            type: Boolean,
        },
        goesTrain6: {
            type: Boolean,
        },
        goesTrain6_2: {
            type: Boolean,
        },
        goesTrain7: {
            type: Boolean,
        }
    }],
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    isInstructor: {
        type: Boolean,
        required: true,
        default: false,
    },
    certificates: [
        {
            type: Schema.Types.ObjectId,
            ref: 'File'
        }
    ],
    googleId: { type: String }
})



UserSchema.plugin(passportLocalMongoose, {
    usernameUnique: false,
});



UserSchema.statics.findOrCreate = async function findOrCreate(id, profile, cb, User) {
    try {
        const foundUser = await User.findOne({ googleId: profile.id })
        if (!foundUser) {
            const user = new User({ username: profile.displayName, googleId: profile.id, email: profile.emails[0].value, status: 'Active' })
            // user.photos = profile.photos.map(f => ({ url: f.value }))
            await user.save()
            cb(null, user)
        }
        if (foundUser) {
            cb(null, foundUser)
        }
    } catch (e) {
        cb(e)
    }
}


module.exports = mongoose.model('User', UserSchema)






