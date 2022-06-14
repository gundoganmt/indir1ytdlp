const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Register Admin
const registerAdmin = async () => {
    let pass = '123456'
    adm = await Admin.findOne({ username: 'admin' })
    if(!adm){
        const new_admin = new Admin({
            full_name: 'john doe',
            username: 'admin',
            email: 'johndoe@gmail.com',
        })
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(pass, salt, async (err, hash) => {
                if (err) throw err;
                new_admin.password = hash;
                await new_admin.save()
            });
        });
    }
  };

  module.exports = registerAdmin;