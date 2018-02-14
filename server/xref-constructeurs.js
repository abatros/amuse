"strict mode";

/*
  create file /home/dkz/ultimheat.com/museum/sitemap.txt :
  one url per line for each article.
  with or without <h1> in name.
*/

const assert = require('assert');
const api = require('./db-blueink.js');
const fs = require('fs');


function format(listp) {
  return listp.map(it => {return `${it.yp}(${it.id})`}).join(' ');
}

module.exports = function(req,res) {
  const etime = new Date().getTime();

  return api.db.many(`
    select
      content->>'h1' as h1,
      array_agg(json_build_object('id',item.item_id,'yp',content->>'yp','h2',content->>'h2')) as listp
    from cr_items item
    join cr_revisions r on (r.item_id = item.item_id)
    where (parent_id = 604)
    group by h1
    order by h1;
  `)
  .then(data =>{
    if (false) data.forEach((it,j) => {
      console.log(`[${j+1}] ${it.h1} ${format(it.listp)}`);
    })
    console.log('SSR:',SSR)
    const html = SSR.render('xref-constructeurs',{list:data});
    console.log('html:',html);
//    res.setHeader('content-type', 'text/plain');
//    res.status(200).send(list.join('\n'));
    res.status(200)
      .end(SSR.render('page',{
        html:html
      }));
  })
  .catch(err =>{
    res.status(200).send(`err:${err}`)
  })

}
