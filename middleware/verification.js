const { User } = require('./../database/Model');

/**
 * Checks Valid & Expired Session
 * Appends the request with current user object, id, refresh-token
 * 
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */
let verfiySession = (request, response, next) => {
    const refreshToken = request.header('x-refresh-token');
    const _id = request.header('_id');

    User.findUserById(_id, refreshToken).then(user => {
        if (!user) {
            return new Promise.reject({
                'error': 'Invalid Session'
            });
        }
        request.user_id = user._id;
        request.userObject = user;
        request.refreshToken = refreshToken;

        let isSessionExpired = false;

        user.session.forEach(sess => {
            if (sess.token == refreshToken) {
                // if expired
                if (User.hasRefreshTokenExpired(sess.expiresAt)) {
                    isSessionExpired = true;
                }
            }
        });

        if (isSessionExpired) {
            return new Promise.reject({
                'error': 'Expired Session'
            });
        } else {
            next();
        }

    }).catch(error => {
        response.status(400).json(error);
    });
}

module.exports = verfiySession;