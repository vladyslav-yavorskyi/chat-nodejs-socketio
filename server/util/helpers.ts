// define Error from Joi
const parseError = (err) => {
    if (err.isJoi) return err.details[0];
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
};

const sessionizeUser = (user) => {
    return {userId: user.id, username: user.username, sessionID: user.sessionID};
};

module.exports = {parseError, sessionizeUser};
