const express = require('express');
const AppControllers = require('../controllers/appControllers');

const sessionRouter = express.Router();

// add session
sessionRouter.post('', AppControllers.createSession);

// delete session
sessionRouter.delete('', AppControllers.deleteSession);

// check if user is logged in
sessionRouter.get('/isAuth', AppControllers.isAuth);

module.exports = sessionRouter;