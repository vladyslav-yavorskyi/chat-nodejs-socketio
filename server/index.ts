require('dotenv').config();
export {};

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('./session');
const cors = require('cors');
const ioServer = require('./socket/index')(app);
const userRoutes = require('./routes');

const PORT = process.env.PORT;

const dbURI = process.env.DB_URI;

// connect to DB before start server
(async () => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true });
    console.log('MongoDB connected 🔥');

    // hide from hackers what stack we use
    app.disable('x-powered-by');
    // app.use(cors);
    app.use(express.json());
    app.use(session);

    const apiRouter = express.Router();
    app.use('/api', apiRouter);
    apiRouter.use('/users', userRoutes);

    app.listen(Number(PORT), () =>
      console.log(`⚡ Listening on port http://localhost:${PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
})();
