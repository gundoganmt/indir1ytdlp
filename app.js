const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const path = require("path");
const registerAdmin = require('./config/registerAdmin');
const app = express();
var MongoStore = require("connect-mongo");

// Passport Config
require('./config/passport')(passport);
require('dotenv').config();

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public/")));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
       mongoUrl: db ,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// register Admin
registerAdmin()

// Routes
app.use('/', require('./routes/index.js'));
app.use('/', require('./routes/admin.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
