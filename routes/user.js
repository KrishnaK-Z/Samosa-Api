const express = require('express');
const router = express.Router();
const { User } = require('./../database/Model');


const VerfiySession = require('../middleware/verification');
/**
 * Login Endpoint
 */
router.post('/login', (request, response) => {
    let body = request.body;
    User.findUserByCredentials(body.email, body.password).then(user => {

        return user.createSession().then(refreshToken => {
            return user.generateAccesssToken().then((accessToken) => {
                return { accessToken, refreshToken };
            });
        }).then(authTokens => {
            response
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch(error => {
        response.status(400).json(error);
    })
});

/**
 * Register endpoint
 */
router.post('/register', (request, response) => {
    let body = request.body;
    console.log(body);
    const user = new User(body);

    user.save().then(() => {
        return user.createSession();
    }).then((refreshToken) => {
        return user.generateAccesssToken().then((accessToken) => {
            return { accessToken, refreshToken };
        })
    }).then((authTokens) => {
        response.header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(user);
    }).catch(error => {
        response.status(400).json({ error });
    });

});

/**
 * To get the access token
 */
router.get('/me/auth', VerfiySession, (request, response) => {
    request.userObject.generateAccesssToken().then(accessToken => {
        response.header('x-access-token', accessToken).json({ accessToken });
    }).catch(error => {
        response.status(400).json(error);
    })
});

module.exports = router;