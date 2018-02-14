const app = require('../client-app.js');

const TP = Template['toc-index'];

// =============================================================================================

TP.onCreated(()=>{
  console.log('> sIndex.onCreated');
});

// =============================================================================================

TP.onRendered(function(){
  console.log('> sIndex.onRendered');
//  app.download_index();
  new Promise((resolve,reject)=>{
    Meteor.call('museum-toc',(err,data)=>{
      if (err) reject(err);
      resolve(data);
    })
  })
  .then(data =>{
    console.log('museum-index etime:%d ms  for %d entries:',
      data._etime, data.rows.length);
    console.log('data.rows:',data.rows);
//    app.load_index(data.rows);
    // return app.bh_init();
    // subIndex is a reactive-array
    window.location.href="/toc.html";
  })

});

// ================================================================================

TP.helpers({
  inc(x){
    return x+1;
  },
  index: function() {
    return app.index.list();
  },
  total_entries: ()=>{
    return app.index.list().length;
  },
  loading: ()=>{
    return (app.index.list().length <= 0);
  }
});

// ================================================================================
