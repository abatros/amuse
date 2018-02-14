const app = require('./client-app.js');

Template.registerHelper('subIndex_count',() => {
  const si = app.subIndex.get();
  if (si && si.length > 0) {
    app.state.set('show-intro',false)
    return si.length;
  }
});

Template.registerHelper('subIndex_cursor',() => {
  const si = app.subIndex_cursor.get();
  if (si >= 0) return si+1;
});

Template.registerHelper('article_id',() => {
  const ai = app.article_id.get();
  console.log('helper article_id:',ai);
  return ai;
});

Template.registerHelper('bh_ready',() => {
  return app.bh_ready.get();
});


//--  only reactive vars.
Template.registerHelper('app',(x) => {
  return app[x].get();
});



Template.registerHelper('list_of_columns',()=>{
  let x = app.search_columns.list();
  return x && x.map(it=>it.label);
});
