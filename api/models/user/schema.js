const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

let userSchema = new Schema({
    name: { type: String, default: '', required: true },
    username: { type: String, default: '', required: true, index: { unique: true } },
    email: { type: String, default: '', required: true, index: { unique: true } },
    password: { type: String, default: '', required: true },
    active: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    token: { type: String, default: '' },
},
{
    timestamps: true
})

userSchema.pre('save', function(next) {
    let user = this

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err)

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err)

            // override the cleartext password with the hashed one
            user.password = hash
            next()
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('User', userSchema)
