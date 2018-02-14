const pgp = require('pg-promise')({});


/****************
const db = pgp({
  host: 'ultimheat.com',
  port: 5433,
  database: 'blueink',
  user: 'postgres',
});
*****************/

const db = pgp({
  host: 'inhelium.com',
  port: 5432,
  database: 'blueink2',
  user: 'afruth',
  password: 'secret',
});


exports.db = db;

export function museum_index(folder_id){
  folder_id = +folder_id;
  const etime = new Date().getTime()
  return db.any (`
    select
      item.item_id as id,
      content->>'h1' as h1,
      content->>'h2' as h2,
      content->>'ci' as ci,
      content->>'yp' as yp,
      content->>'pic' as pic,
      content->>'mk' as mk,
      content->>'fr' as fr,
      content->>'en' as en,
      content->>'cn' as cn,
      content->>'yc' as yc,
      content->>'aka' as aka,
      content->>'flag' as flag
    from cr_items item
    join cr_revisions r on (r.item_id = item.item_id)
    where parent_id = $(folder_id)
    order by yp, h1;
    `, {folder_id:folder_id
  })
  .then(data =>{
    const _etime = new Date().getTime() - etime;
    return Promise.resolve({
      _etime: _etime,
      rows: data
    })
  })
}; // museum-index

// -------------------------------------------------------------------------


export function museum_get_itemx(o){
  const etime = new Date().getTime()
  if (o.item_id) {
    if (!(o.opCode && ['live','latest','all'].includes(o.opCode))) {
      o.opCode = 'latest';
    }
    // and always return index for all revisions.
  } else {
    return Promise.reject("museum-get-itemx Missing item_id.");
  }

  if (!o.item_id && !o.revision_id) {
    return Promise.reject('Incorrect request museum-get-item: '+o);
  }

  return db.one (`select * from content_item__getx($(item_id),$(opCode))`,o)
  .then(data =>{
    return Promise.resolve({
      _etime: new Date().getTime() - etime,
      row: data
    })
  }) // then
}


// --------------------------------------------------------------------------

/*

select avg((SELECT regexp_replace(value->>'com', '^([0-9]*).*$', '0\1','g'))::integer)
from cr_revisions r
join cr_items item on (r.item_id = item.item_id)
cross join lateral jsonb_array_elements(r.content->'links')
where (parent_id = 604) and not (content->'links' is null)

*/

export function museum_sitemap_pdf() {
  const etime = new Date().getTime()
  return db.many(`
    select
      item.item_id as id,
      content->'links' as links,
      content->>'flag' as flag
    from cr_items item
    join cr_revisions r on (r.item_id = item.item_id)
    where (parent_id = 604)
    and (content->>'flag' != 'R') or (content->>'flag' is null)
    `)
  .then(data =>{
    const list = [];
    data.filter(it=>it.links).forEach(it=>{
      it.links.forEach(it=>{list.push(it.fn)});
    })

    return Promise.resolve({
      _etime: new Date().getTime() - etime,
      rows: list
    })
  })
}

// ---------------------------------------------------------------------------

export function museum_sitemap_img() {
  const etime = new Date().getTime()
  return db.many(`
    select
    distinct
    content->>'pic' as pic,
    content->>'flag' as flag
  from cr_items item
  join cr_revisions r on (r.revision_id = item.latest_revision)
  where (parent_id = 604)
  and not (content->>'pic' = '')
  and (
  (content->>'flag' != 'R')
  or (content->>'flag' is null)
  )
  order by pic
    `)
  .then(data =>{
    return Promise.resolve({
      _etime: new Date().getTime() - etime,
      rows: data.map(it => it.pic)
    })
  })
}

// ---------------------------------------------------------------------------
