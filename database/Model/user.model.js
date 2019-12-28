const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const jwtKey = process.env.SECERT_KEY;

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    session: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: String,
            required: true
        }
    }]
});

/** Add extra method to the use model **/

/**
 * Removes the password and session on the return object
 */
UserSchema.methods.toJson = function() {
    const user = this.toObject();
    return _.omit(user, ['password', 'session']);
}

/**
 * Generate JWT token using user._id for registered user
 */
UserSchema.methods.generateAccesssToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        // toHexString -> return 24 byte hexa string
        jwt.sign({ _id: user._id.toHexString() },
            jwtKey, { expiresIn: '15m' },
            (error, token) => {
                if (!error) {
                    resolve(token);
                } else {
                    reject(error);
                }
            });
    });
}

/**
 * Generate the Refresh Token that stores in DB
 */
UserSchema.methods.generateRefreshToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, buffer) => {
            if (!error) {
                resolve(buffer.toString('hex'));
            }
            reject(error);
        });
    });
}

/**
 * Store the refresh token & store in DB
 */
UserSchema.methods.createSession = function() {
    const user = this;

    return user.generateRefreshToken().then((refreshToken) => {
        return saveSessionToDb(user, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((erorr) => {
        return Promise.reject('Failed to save session to database.\n' + error);
    });
}

/** Static methods **/

/**
 * Find user by _id
 */
UserSchema.statics.findUserById = function(_id, refreshToken) {
    const user = this;
    return user.findOne({
        _id,
        'session.token': refreshToken
    });
}

/**
 * Find user by email and password
 */
UserSchema.statics.findUserByCredentials = function(email, password) {
    const user = this;
    return user.findOne({ email }, (user) => {
        if (!user) {
            return Promise.reject();
        }
        return Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, hash) => {
                if (!error) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}

/**
 * To get the secret key
 */
UserSchema.statics.getJWTSecret = function() {
    return jwtKey;
}

/**
 * Check if refresh token valid
 */
UserSchema.statics.hasRefreshTokenExpired = function(expiresAt) {
    const secondsNow = Date.now() / 1000;
    if (expiresAt > secondsNow) {
        return false // not expired
    }
    return true; // expired
}


/** Helpher Function  **/

/**
 * To save the refresh token in use model
 */
let saveSessionToDb = function(user, refreshToken) {
    return new Promise((resolve, reject) => {
        var expiresAt = getExpieryTime();
        user.session.push({ 'token': refreshToken, expiresAt });
        user.save()
            .then(() => {
                resolve(refreshToken);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Middleware
 */
UserSchema.pre('save', function(next) {
    const user = this;
    const constFactor = 10;

    if (user.isModified('password')) {
        bcrypt.genSalt(constFactor, (error, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    next();
});

/**
 * To get the expire time for refresh token in secs
 */
let getExpieryTime = function() {
    var dayUntilExpire = 10,
        secondsUntilExpire = dayUntilExpire * (24 * 60 * 60);
    return ((Date.now() / 1000) * secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };