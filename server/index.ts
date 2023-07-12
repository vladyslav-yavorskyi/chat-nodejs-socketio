require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('./session');
const cors = require('cors');
const ioServer = require('./socket/index')(app);

const PORT = 4000;

// app.use(cors);
app.use(express.json());
app.use(session);

app.get('/', (req, res, next) => {
  req.session.user = {
    uuid: '12234-2345-2323423',
  }; //THIS SETS AN OBJECT - 'USER'
  req.session.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send(req.session.user); // YOU WILL GET THE UUID IN A JSON FORMAT
    }
  }); //THIS SAVES THE SESSION.
});
app.get('/end', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send('Session is destroyed');
    }
  }); //THIS DESTROYES THE SESSION.
});

// app.get('/name', (req, res) => {
//   let name;

//   if (!req.session) {
//     return res.status(404).send();
//   }

//   name = req.session.user.name;

//   return res.status(200).send({ name });
// });

mongoose
  .connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    ioServer.listen(PORT, () => {
      console.log(`Listening on server: ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
