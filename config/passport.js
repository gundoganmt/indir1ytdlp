const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ UsernameField: 'username' }, (username, password, done) => {
      // Match Admin
      Admin.findOne({
        username: username
      }).then(adm => {
        if (!adm) {
          return done(null, false, { message: 'That username is not registered' });
        }

        // Match password
        bcrypt.compare(password, adm.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, adm);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Admin.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
