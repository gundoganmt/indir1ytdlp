const express = require('express');
const router = express.Router();
const axios = require('axios')
const Video = require('../models/Video')
const Proxy = require('../models/Proxy')
const Faq = require('../models/Faq')
const Resolution = require('../models/Resolution')
const youtubedl = require('yt-dlp-exec')
const moment = require('moment');
const multer = require('multer')
const fs = require('fs');

const body = multer({})

//  random hex string generator
var randHex = function(len) {
  var maxlen = 8,
      min = Math.pow(16,Math.min(len,maxlen)-1) 
      max = Math.pow(16,Math.min(len,maxlen)) - 1,
      n   = Math.floor( Math.random() * (max-min+1) ) + min,
      r   = n.toString(16);
  while ( r.length < len ) {
     r = r + randHex( len - maxlen );
  }
  return r;
};

function convertFileSize(num){
  if (!num){
    return 'unknown'
  }
  else{
    let kb = num/1024
    if (kb < 1024)
      return kb.toFixed(2) + 'kb'
    else{
      let mb = kb/1024
      if (mb < 1024)
          return mb.toFixed(2) + 'mb'
      else{
          gb = mb/1024
          return gb.toFixed(2) + 'gb'
      }
    }
  }
}

var get_size = async function(url){
  let response = await axios.head(url)
  if(response.headers.hasOwnProperty('content-length')){
    return convertFileSize(response.headers['content-length'])
  }
  else{
    return 'unknown'
  }
}

function compare( a, b ) {
  if ( parseInt(a.resolution) < parseInt(b.resolution) ){
    return 1;
  }
  if ( parseInt(a.resolution) > parseInt(b.resolution) ){
    return -1;
  }
  return 0;
}

async function youtube(meta){
  let video_streams = []
  let video_without_sound = []
  let audio_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Youtube'
  })
  await video.save()

  meta.formats.forEach(m => {
    let token = randHex(32)
    if(m.acodec != 'none' && m.vcodec != 'none'){
      video_streams.push({
        'resolution': m.format_note,
        'filesize': convertFileSize(m.filesize),
        'ext': m.ext,
        'token': token
      })
    }            
    else if(m.acodec == 'none' && m.vcodec != 'none'){
      video_without_sound.push({
        'resolution': m.format_note,
        'filesize': convertFileSize(m.filesize),
        'ext': m.ext,
        'token': token
      })
    }            
    else if(m.acodec != 'none' && m.vcodec == 'none'){
      audio_streams.push({
        'resolution': 'audio',
        'filesize': convertFileSize(m.filesize),
        'ext': m.ext,
        'token': token
      })
    }
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  });  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
    'video_without_sound': video_without_sound.sort(compare),
    'audio_streams': audio_streams
  }
  return context
}

async function facebook(meta){
  let video_streams = []
  let video_without_sound = []
  let audio_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Facebook'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.quality == 0 || m.quality == 1 ){
      video_streams.push({
        'resolution': (m.quality == 0) ? 'SD' : 'HD',
        'filesize': await get_size(m.url),
        'thumb_url': m.url,
        'ext': m.ext,
        'token': token
      })
    }            
    else if(m.acodec == 'none' && m.vcodec != 'none'){
      video_without_sound.push({
        'resolution': m.resolution,
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }            
    else if(m.acodec != 'none' && m.vcodec == 'none'){
      audio_streams.push({
        'resolution': 'audio',
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
    'video_without_sound': video_without_sound.sort(compare),
    'audio_streams': audio_streams,
  }
  return context
}

async function twitter(meta){
  let video_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Twitter'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.protocol == 'https'){
      video_streams.push({
        'resolution': m.height + 'p',
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }            

    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
  }
  return context
}

async function izlesene(meta){
  let video_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Izlesene'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    video_streams.push({
      'resolution': m.format_id,
      'filesize': await get_size(m.url),
      'ext': m.ext,
      'token': token
    })

    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
  }
  return context
}

async function vimeo(meta){
  let video_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Vimeo'
  })
  await video.save()

  
  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.protocol == 'https'){
      video_streams.push({
        'resolution': m.format_id.split('-')[1],
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }
    
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
  }
  return context
}

async function instagram(meta){
  let video_streams = []
  let imgt = randHex(16)
  
  const response = await axios({
    method: 'GET',
    url: meta.thumbnail,
    responseType: 'stream',
  });

  response.data.pipe(fs.createWriteStream('public/images/' + imgt + '.jpg'))
  let thumbnail = 'images/' + imgt + '.jpg'

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Instagram'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.ext == 'mp4'){
      video_streams.push({
        'resolution': m.resolution,
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }

    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': thumbnail,
    'title': meta.title,
    'video_streams': video_streams
  }
  return context
}

async function vlive(meta){
  let video_streams = []
  let imgt = randHex(16)
  
  const response = await axios({
    method: 'GET',
    url: meta.thumbnail,
    responseType: 'stream',
  });

  response.data.pipe(fs.createWriteStream('public/images/' + imgt + '.jpg'))
  let thumbnail = 'images/' + imgt + '.jpg'

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Vlive'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    let filesize
    if(m.hasOwnProperty('filesize')){
      filesize = m.filesize
    }
    else{
      filesize = await get_size(m.url)
    }
    if(m.ext == 'mp4'){
      video_streams.push({
        'resolution': m.format_id.split('_')[1],
        'filesize': convertFileSize(filesize),
        'ext': m.ext,
        'token': token
      })
    }

    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare)
  }
  return context
}

async function soundcloud(meta){
  let audio_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'SoundCloud'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.protocol == 'http'){
      audio_streams.push({
        'resolution': 'audio',
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }
    
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'audio_streams': audio_streams,
  }
  return context
}

async function reddit(meta){
  let video_streams = []
  let audio_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Reddit'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.hasOwnProperty('format_note') && m.format_note == "DASH video"){
      video_streams.push({
        'resolution': m.width + 'x' + m.height,
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }                       
    else if(m.hasOwnProperty('format_note') && m.format_note == "DASH audio"){
      audio_streams.push({
        'resolution': 'audio',
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
    'audio_streams': audio_streams
  }
  return context
}

async function tiktok(meta){
  let video_streams = []
  let audio_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'Tiktok'
  })
  await video.save()

  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.resolution && video_streams.length == 0){
      video_streams.push({
        'resolution': m.resolution,
        'filesize': convertFileSize(m.filesize),
        'ext': m.ext,
        'token': token
      })
    }                       
    else if(m.resolution == null && audio_streams.length == 0){
      audio_streams.push({
        'resolution': 'audio',
        'filesize': convertFileSize(m.filesize),
        'ext': 'mp3',
        'token': token
      })
    }
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
    'audio_streams': audio_streams
  }
  return context
}

async function tedtalk(meta){
  let video_streams = []

  const video = new Video({
    web_url: meta.webpage_url,
    thumbnail: meta.thumbnail,
    title: meta.title,
    dw_date: moment().format("MMM DD"),
    source: 'TedTalk'
  })
  await video.save()

  
  for (const m of meta.formats) {
    let token = randHex(32)
    if(m.protocol == 'https'){
      video_streams.push({
        'resolution': 'HD',
        'filesize': await get_size(m.url),
        'ext': m.ext,
        'token': token
      })
    }
    
    let res = new Resolution({
      download_url: m.url,
      ext: m.ext,
      token: token,
      vid_id: video._id
    })
    res.save().then(res => {})
  };  

  let context = {
    'error': false,
    'duration': 'Duration: ' + moment.utc(meta.duration*1000).format('HH:mm:ss'),
    'thumbnail': meta.thumbnail,
    'title': meta.title,
    'video_streams': video_streams.sort(compare),
  }
  return context
}

// Welcome Page
router.get('/', async (req, res) => {
  const dw_list = ['youtube', 'twitter', 'facebook', 
    'instagram', 'reddit', 'tedtalk', 'tiktok', 
    'vlive', 'vimeo', 'soundcloud', 'izlesene']

  var dw = req.query.downloader
  if(dw && !dw_list.includes(dw)){
    res.sendStatus(404)
  }
  else{
    res.render('public/index', {
      dw: dw,
      faqs: await Faq.find({})
    })
  }
});

// Dashboard
router.post('/extractor', body.none(), async (req, res) =>{

  const countProxy = await Proxy.countDocuments()
  var random = Math.floor(Math.random() * countProxy)
  const px = await Proxy.findOne().skip(random)

  face_urls = ['facebook.com', 'fb.com', 'fb.watch']
  let options = {
    'dumpSingleJson': true,
    'noWarnings': true,
    'noCallHome': true,
    'noCheckCertificate': true,
    'preferFreeFormats': true,
    'youtubeSkipDashManifest': true,
    'referer': req.body.inputValue,
    'proxy': px ? px.type + '://' + px.username + ':' + px.password + '@' + px.ip + ':' + px.port : ""
  }

  if (face_urls.some(url => req.body.inputValue.includes(url))) {
    options.cookies = "fbcookies.txt"
  }

  else if(req.body.inputValue.includes('vimeo.com')){
    options.cookies = "vcookies.txt"
  }
  
  const meta = await youtubedl(req.body.inputValue, options)

  // let data = JSON.stringify(meta);
  // fs.writeFileSync('tiktok.json', data);

  // res.send({
  //   success: false
  // })

  // let rawdata = fs.readFileSync('fb.json');
  // let meta = JSON.parse(rawdata);

  if(meta.extractor == 'youtube'){
    res.send(await youtube(meta)) 
  }
  else if(meta.extractor == 'facebook'){
    res.send(await facebook(meta)) 
  }
  else if(meta.extractor == 'twitter'){
    res.send(await twitter(meta)) 
  }
  else if(meta.extractor == 'Izlesene'){
    res.send(await izlesene(meta)) 
  }
  else if(meta.extractor == 'vimeo'){
    res.send(await vimeo(meta)) 
  }
  else if(meta.extractor == 'soundcloud'){
    res.send(await soundcloud(meta)) 
  }
  else if(meta.extractor == 'Instagram'){
    res.send(await instagram(meta))
  }
  else if(meta.extractor == 'vlive'){
    res.send(await vlive(meta))
  }
  else if(meta.extractor == 'Reddit'){
    res.send(await reddit(meta))
  }
  else if(meta.extractor == 'TikTok'){
    res.send(await tiktok(meta))
  }
  else if(meta.extractor == 'TedTalk'){
    res.send(await tedtalk(meta))
  }
});

router.get('/download', async (req, res) =>{
  const resolution = await Resolution.findOne({ token: req.query.token }).populate('vid_id', 'title').exec()
  let filename = (resolution.vid_id.title).replace(/[^a-zA-Z ]/g, "") + '.' + resolution.ext

  if(!resolution){
    res.sendStatus(404)
  }
  else{
    axios({
      method: 'get',
      url: resolution.download_url,
      responseType: 'stream'
    })
      .then(function(response) {
        if(response.headers.hasOwnProperty('content-length')){
          res.setHeader('content-length', response.headers['content-length'])
          res.setHeader("content-disposition", "attachment; filename=" + filename);
        }
        else{
          res.setHeader("content-disposition", "attachment; filename=" + filename);
        }
        response.data.pipe(res)
    });
  }
});

module.exports = router;
