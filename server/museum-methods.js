"use strict";

const assert = require('assert')
const fs = require('fs');
var encodeUrl = require('encodeurl')

//import {db} from './db-blueink';
const api = require('./db-blueink');

const folder_id = 604;

Meteor.methods({
'museum-index'() {
  const p1 = api.museum_index(folder_id);
//  console.log('p1:',p1);
  return p1;
},
});

// -------------------------------------------------------

/*
  either:
    item_id: 1234,
    revision_id: 1234
    if (item_id) is given, then we need to ask for live, latest, all revisions.
    opCode: 'live' | 'latest' | 'all'
*/


Meteor.methods({
  'museum-get-itemx': (o)=>{ // live or latest revision.
    assert(o,'FATAL Missing arguments')
    console.log('##museum-get-itemx o:',o);
    return api.museum_get_itemx(o)
  },
})

// ------------------------------------------------------------

function url_escaped(s) {
  s = s.replace(/\s\s+/g,'-').replace(/\-\-+/g,'-')
    .replace(/\'/g,'')
  return encodeUrl(s);
}

function fn_nor(s) {
  s = s.replace(/[ \.\',;.:\(\)°']/g,'-')
    .replace(/\-\-+/g,'-')
    .toLowerCase();

  const v = s.split('-').filter(it => {return (it.length > 2);});
//  console.log(v);
  return v.join('-');
}




function mk_index(rows){
  const fpath = '/home/dkz/ultimheat.com/museum/index.html';
  return new Promise(function(resolve, reject) {
    const file = fs.createWriteStream(fpath);
    const sitemap = fs.createWriteStream('/home/dkz/ultimheat.com/museum/sitemap.txt');

    file.write(`
      <title>Ultimheat Museum TOC</title>
      <style>
      li {
        list-style-type: none;
      }
      </style>
      <h2>Ultimheat Museum TOC for Robots ${new Date()}</h2>
    `);
    rows.forEach(it=>{
      let fp = fn_nor(`${it.id}-${it.yp}-${it.h1}`);
      console.log('-- ',fp+'.html');
      fs.writeFileSync('/home/dkz/ultimheat.com/museum/'+fp+'.html',`
      id:${it.id}<h1>${it.h1}</h1><h2>${it.h2}</h2>${fp}<hr>
      <a href="/museum-app/article/${it.id}">visit our web-app</a>
      `,(err)=>{
        if (err)
          console.log('err:',err)
      })

      file.write(`<li>
        <a href="${fp}.html">${it.yp} ${it.h1}</a>
        ${it.h2||''} ${it.mk2||''} ${it.ci||''}
        </li>\n`);

      sitemap.write(
        encodeUrl('http://ultimheat.com/museum/' + fp) + '.html\n');
    })
    file.end();
    sitemap.end();

    return Promise.resolve(rows);
    /*
    fs.writeFile(fpath, new Date(), function(err) {
      if (err) reject(err);
      else resolve({
        absPath: process.env.PWD,
        _etime:data._etime,
        rows:[{}]
      });
    }); // writeFile
    */
  }); // promise
}

Meteor.methods({
  'museum-toc'() {
    return api.museum_index(folder_id)
    .then((data)=>{
      console.log('data.rows.length:',data.rows.length); // data.rows.
      var absPath = process.env.PWD;
      console.log('absPath:',absPath)
      /*
      fs.readdir(absPath, function(err, items) {
        console.log(items);

        for (var i=0; i<items.length; i++) {
          console.log(items[i]);
        }
      });
      */
  //    const fpath = absPath+'/public/toc.html'
      return mk_index(data.rows);
    }) // then
    .then(()=>{
      return Promise.resolve(data);
    })
  },
}); // method
