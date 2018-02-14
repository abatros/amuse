"strict mode";

/*
  create file /home/dkz/ultimheat.com/museum/sitemap.txt :
  one url per line for each article.
  with or without <h1> in name.
*/

const assert = require('assert');
const api = require('./db-blueink.js');
const fs = require('fs');

exports.get_sitemap = function(req,res) {
  const etime = new Date().getTime();

  api.museum_index(604)
  .then(data =>{
    const list = data.rows.map(it=>{
      const h1 = it.h1 && it.h1.replace(/[ ,\.]{1,}/g,'-')
      return `http://ultimheat.com/museum/${it.id}-${it.yp}-${h1}.html`
    })
    res.setHeader('content-type', 'text/plain');
    res.status(200).send(list.join('\n'));
  })
  .catch(err =>{
    res.status(200).send(`err:${err}`)
  })

}
