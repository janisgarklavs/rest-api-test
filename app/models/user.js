let autoIncrement = require('mongoose-auto-increment');
let bcrypt = require('bcrypt');
let mongoose = require('mongoose');

const SALT_FACTOR = 10;

let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: { type: String, required: true , index: { unique: true} },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        password: { type: String, required: true },
        created: { type: Date, default: Date.now }, 
    },
    {
        versionKey: false
    }
);

UserSchema.pre('save', function(next) {
    var user = this;
    
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (potentialPassword, cb) {
    bcrypt.compare(potentialPassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

UserSchema.plugin(autoIncrement.plugin, {
    model: 'user',
    startAt: 1
});

module.exports = mongoose.model('user', UserSchema);