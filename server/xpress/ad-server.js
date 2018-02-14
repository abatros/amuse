/*
  to deliver ads for MUseum.
*/


const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ipInfo = require("ipinfo");
const parseAcceptLanguage = require('parse-accept-language');

const base = {zh:[], de:[], en:[], fr:[]};
//const base_folder = path.join(__dirname + '/public/');
const base_folder = '/home/dkz/museum-pub/';

const ip_cache = {};
/* {timeStamp, iSeq, lang} */


function _init() { // populate the cache.
  ['zh','de','en','fr'].forEach(it=>{
    fs.readdir(path.join(base_folder,it), (err,data)=>{
      if (err) {
        throw err;
      }
      console.log(`folder ${it}.length:${data.length}`);
      base[it] = data;
    });
  });
} // reset

_init();

export function send_file(req,res) {
  let query_lang = req.query.lang;
  console.log('## send-file query.lang:', query_lang);

  let query_tz = req.query.tz || req.query.TZ;
  console.log('query.tz:', query_tz);

  let query_country = req.query.c || req.query.country;
  console.log('query.country:', query_country);

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('ip:',ip);


  let la = req.headers['accept-language'];
  var pal = parseAcceptLanguage(req);
  console.log('accept-language:',pal);
  console.log('accept-language[0]:',pal[0].language);

  pal = (pal && (pal.length > 0))?pal[0].language:'en';

  let req_lang = query_lang || pal;
  if (!base[req_lang]) {
    req_lang = 'en';
  }

  const get_ad = function(req_lang){
    console.log(`>get_ad(${req_lang})`);
    let fdir = base[req_lang];
    assert(fdir);
    assert(fdir.length);

    let ic = ip_cache[ip];
    let iSeq = 0;

    if (!ic) {
      /*
      let _path = path.join(base_folder,req_lang+'/'+fdir[0]);
      console.log('serving: <%s>',_path);
      ip_cache[ip] = {timeStamp:new Date().getTime(), iSeq:0, lang:req_lang};
      return _path;
      */
      iSeq = Math.floor(Math.random() * fdir.length);
    } else {
      iSeq = (ic.iSeq + 1) % fdir.length;
    }

//  console.log('cache:',ic);
    let _path = path.join(base_folder, req_lang+'/'+fdir[iSeq]);
    console.log('serving: <%s>',_path);
    ip_cache[ip] = {timeStamp:new Date().getTime(), iSeq:iSeq, lang:req_lang};
    return _path;
  }


  let country = null;
  ipInfo(ip.replace('::ffff:',''), (err, data) => {
    if (err) {
      console.log('ipInfo err:',err);
      return;
    }
    console.log('ipInfo.country:', data.country);
    if (data.country == 'FR') {
      country = 'fr';
    }
    console.log('ipInfo.city:', data.city);
    // here only we can select the pub.
    let _path = get_ad(country || 'en');
    res.sendFile(_path);
  });
} // send-file



function send_iframe(req,res){
    // this might be better, it call a pic that will stay in the cache.
}


/*
module.exports = {
  init: _init,
//  get_href: _get_href,
  send_file:send_file,
  send_iframe:send_iframe
}
*/
