const express = require('express');
const router = express.Router();
const passport = require('passport');
const moment = require('moment')
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Faq = require('../models/Faq');
const Video = require('../models/Video');
const Proxy = require('../models/Proxy');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');
const upload = require('../config/multerHelper');
const proxy_check = require('proxy-check');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('account/login'));

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })(req, res, next);
});

function getbyduration(duration, data){
  let value = 0
  for(var i=0; i<data.length; i++){
    value+=data[i]
    if(i == duration-1){
      break
    }
  }
  return value
}

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  let dw_date = await Video.aggregate([
    {
      $group:
      {
        _id: { down_date: "$dw_date" },
        totaldw: { $sum: 1 }
      }
    },
    {
      $sort : {"_id": 1}
    },
  ])

  let data = []
  let dates = []

  dw_date.forEach(d => {
    data.push(d.totaldw)
    dates.push(d._id.down_date)
  })

  let total_today = (data[data.length-1] ? data[data.length-1] : 0)
  let total_yesterday = (data[data.length-2] ? data[data.length-2] : 0)
  let total_one_week = getbyduration(7, data)
  let total_two_weeks = getbyduration(14, data)
  let total_one_month = getbyduration(30, data)
  let total_two_months = getbyduration(60, data)

  let last_month = total_two_months - total_one_month
  let last_week = total_two_weeks - total_one_week
  let rate_month = 0
  let rate_week = 0
  let rate_today = 0

  if(!last_month == 0){
    rate_month = 100*(total_one_month-last_month)/last_month
  }
  if(!last_week == 0){
    rate_week = 100*(total_one_week-last_week)/last_week
  }
  if(!total_yesterday == 0){
    rate_today = 100*(total_today-total_yesterday)/total_yesterday
  }

  let dw_per_source = await Video.aggregate([
    {
      $group:
      {
        _id: { source: "$source" },
        totaldw: { $sum: 1 }
      }
    }
  ])

  let source = ['Youtube', 'Facebook', 'Twitter', 'Instagram', 
    'Tiktok', 'Reddit', 'TedTalk', 'Vlive', 'Vimeo', 'SoundCloud', 'Izlesene']
  let source_data = []

  source.forEach(s => {
    let found = false
    dw_per_source.forEach(d => {
      if(s == d._id.source){
        source_data.push(d.totaldw)
        found = true
      }
    })
    if(!found){
      source_data.push(0)
    }
  })

  res.render('admin/dashboard', {
    "data": data,
    "dates": dates,
    'total_one_week': total_one_week,
    'total_one_month': total_one_month,
    'rate_month': rate_month.toFixed(1),
    'rate_week': rate_week.toFixed(1),
    'rate_today': rate_today.toFixed(1),
    'total_today': total_today,
    'total_downloads': data.reduce((partialSum, a) => partialSum + a, 0),
    'source_data': source_data,
    'dash_active': 'active',
    'current_user': req.user
  })
});

router.get('/latest_downloads', ensureAuthenticated, async (req, res) => {
  res.render('admin/latest_downloads', {
    'latest_active': 'active',
    'current_user': req.user,
    'down_vids': await Video.find({}).sort({ "_id": -1})
  })
})

router.get('/proxy_list', ensureAuthenticated, async (req, res) => {
  let proxy_list = await Proxy.find()
  res.render('admin/proxy', {
    'proxy_active': 'active',
    'current_user': req.user,
    'proxy_list': proxy_list
  })
})

router.post('/proxy_list', upload.none(), ensureAuthenticated, async (req, res) => {
  const { proxy_type, proxy_list } = req.body

  lines = proxy_list.split("\n");
  for (const line of lines) {
    let proxy_parts = line.split(':')
    const new_proxy = new Proxy({
      type: proxy_type,
      ip: proxy_parts[0],
      port: proxy_parts[1],
      username: proxy_parts[2],
      password: proxy_parts[3].replace('\r', "")
    })
    await new_proxy.save()
  }

  res.redirect('/proxy_list')
})

router.get('/proxy_check/:proxy_id', ensureAuthenticated, async (req, res) => {
  const px = await Proxy.findOne({ _id: req.params.proxy_id })
  const proxy = {
    host: px.ip,
    port: px.port,
    proxyAuth: px.username + ':' + px.password
  };

  proxy_check(proxy).then(r => {
    res.send({
      success: true
    })
  }).catch(e => {
    res.send({
      success: false
    })
  })
})

router.get('/delete_proxy/:proxy_id', ensureAuthenticated, async (req, res) => {
  Proxy.deleteOne({ _id: req.params.proxy_id }).then(px =>{
    res.send({
      success: true
    })
  }).catch(e => {
    res.send({
      success: false
    })
  })
})

router.get('/faq', ensureAuthenticated, async (req, res) => {
  res.render('admin/faq', {
    'faq_active': 'active',
    'current_user': req.user,
    'faqs': await Faq.find({})
  })
})

router.post('/faq', upload.none(), ensureAuthenticated, async (req, res) => {
  const { faq_q, faq_ans } = req.body

  const new_faq = new Faq({
    faq_q: faq_q,
    faq_ans: faq_ans
  })
  await new_faq.save()
  res.redirect('/faq')
})

router.get('/delete_faq/:faq_id', ensureAuthenticated, async (req, res) => {
  await Faq.deleteOne({ _id: req.params.faq_id })
  res.redirect('/faq')
})

router.get('/manage_admins', ensureAuthenticated, async (req, res) => {
  res.render('admin/manage_admins', {
    'manage_active': 'active',
    'current_user': req.user,
    'admins': await Admin.find({})
  })
})

router.post('/create_admin', upload.single('profile_pic'), ensureAuthenticated, async (req, res) => {
  const { username, email, full_name, password } = req.body

  const new_adm = new Admin({
    username: username,
    email: email,
    full_name: full_name,
    profile_pic: req.file.filename
  })
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) throw err;
      new_adm.password = hash;
      await new_adm.save()
    });
  });

  res.redirect('/manage_admins')
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
