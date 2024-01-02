export {};

const asyncHandler = require('express-async-handler');
const User = require('../schemas/user');
const {signIn} = require('../validation/user');
const {parseError, sessionizeUser} = require('../util/helpers');

const createSession = asyncHandler(async (req, res, next) => {
    console.log('createSession start');

    try {
        const {email, password} = req.body;

        // Validate input
        await signIn.validateAsync({email, password});

        // Find the user
        const user = await User.findOne({email});
        // console.log(user, 'user');

        // Check user and password
        if (!user || !user.comparePasswords(password)) {
            console.log('Invalid login credentials');
            return res.status(401).send('Invalid login credentials');
        }

        // Check if a session already exists for the user
        if (req.session.user) {
            console.log('Session already exists for this user');
            return res.status(400).send('Session already exists for this user');
        }

        // Sessionize user
        const sessionUser = sessionizeUser({id: user.id, username: user.username, sessionID: req.sessionID});
        req.session.user = sessionUser;
        req.session.isAuth = true;
        // Save session
        req.session.save(err => {
            if (err) {
                console.log('Error saving session:', err);
                return next(err);
            }

            console.log(req.session.user, 'req.session.user after save');
            res.send(sessionUser);
        });

    } catch (err) {
        console.log('Error in createSession:', err);
        res.status(500).send(parseError(err));
    }
});

const deleteSession = asyncHandler(async (req, res, next) => {
    console.log(`Session before deletion. Session id ${req.sessionID} Data: ${JSON.stringify(req.session)}`);
    req.session.destroy((err) => {
        if (err) next(err);
        req.session = null;
        console.log(`Session after deletion: ${JSON.stringify(req.session)}`);
        res.send({message: 'Session deleted'});
        next();
    });
});

const isAuth = (req, res) => {
    if (req?.session && req?.session?.isAuth) {
        console.log(req.session.isAuth, 'req.session.isAuth')
        res.send(true)
    } else {
        console.log('req.isnot.isAuth')
        res.send(false);
    }
}

const getSession = asyncHandler(async (req, res) => {
    console.log(req.session);

    if (req.session.user) {
        res.send(req.session);
    } else {
        return res.status(401).json('unauthorize');
    }
});

const regenerateSession = asyncHandler(async (req, res) => {
    console.log('regenerateSession')
    req.session.regenerate(function (err) {
        if (err) {
            return res.status(401).send(parseError(err));
        }
        res.send('session regenerated');
    });
});


module.exports = {getSession, createSession, deleteSession, regenerateSession, isAuth};
