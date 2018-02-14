"strict mode";

/*
  create file /home/dkz/ultimheat.com/museum/sitemap.txt :
  one url per line for each article.
  with or without <h1> in name.
*/

const assert = require('assert');
const api = require('./db-blueink.js');
const fs = require('fs');

/*
  Sitemap index-PDF
*/

module.exports = function(req,res) {
  const etime = new Date().getTime();

  return api.db.many(`
    select
--      item.item_id as id,
--      item.parent_id,
--      item.live_revision,
--      item.latest_revision,
--      r.revision_id,
--      content->>'yp' as yp,
--      content->>'h1' as h1,
    distinct
    content->>'pic' as pic,
    content->>'flag' as flag
  from cr_items item
  join cr_revisions r on (r.revision_id = item.latest_revision)
  where (parent_id = 604)
  and not (content->>'pic' = '')
--    and not (content->'pic' is null)
  and (
  (content->>'flag' != 'R')
  or (content->>'flag' is null)
  )
  order by pic
        `)
  .then(data =>{
    console.log('data.length:',data.length);

  //  console.log(list);
    res.status(200).send(data
//      .sort()
      .map(it=>`http://museum-assets.ultimheat.com/jpeg-www/${it.pic}.jpg`)
      .join('<br>\n'));
  })
  .catch(err =>{
    res.status(200).send(`err:${err}`)
  })

}
