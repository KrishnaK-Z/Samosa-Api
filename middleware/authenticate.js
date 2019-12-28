const jwt = require('jsonwebtoken');
const { User } = require('../database/Model');

let authenticate = (request, response, next) => {
    let token = request.header('x-access-token');

    jwt.verify(token, User.getJWTSecret(), (error, decoded) => {
        if (error) {
            response.status(401).send(error);
        } else {
            request.body._userId = decoded._id;
            request.userId = decoded._id;
            next();
        }
    });
}

module.exports = authenticate;