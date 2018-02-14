const app = require('../client-app.js');
const assert = require('assert');

const TP = Template.article;

function get_itemx(item_id){
  return new Promise((resolve,reject)=>{
    Meteor.call('museum-get-itemx',{item_id:item_id, opCode:'latest'},(err,data)=>{
      if (err) {
        reject (err);
      }

      console.log('museum-get-itemx =>data:',data);
      data.row.content.reserved = (data.row.content.flag == 'R');
      app.state.set('db-article',data.row);
      app.state.set('html',null);
      app.state.set('meta',data.row.content); // Museum is 100% pure YAML.
      resolve (data.row);
    }) // call
 }); // promise
};  // get_itemx

TP.onCreated(function(){
  let ai = FlowRouter.getParam("id");
  console.log('> article.onCreated ai:',ai);
  assert(ai, "FATAL 7F3W")

  $(document).on('keyup', (e) => {
      if (e.which === 37) { // left
         e.stopPropagation();
        let ai = Meteor.publibase.next_article(-1);
//        FlowRouter.setParams({id:ai});
         return false;
      }
      if (e.which === 39) { // right
         e.stopPropagation();
         let ai = Meteor.publibase.next_article(+1);
//         FlowRouter.setParams({id:ai});
         return false;
      }
      if (e.which === 27) { // right
         e.stopPropagation();
//         FlowRouter.go('index');
         return false;
      }

      console.log(e.which)
    });
});

TP.onDestroyed(function(){
    $(document).off('keyup');
});


// ==========================================================================

TP.onRendered(function(){
  let ai = FlowRouter.getParam("id");
  console.log('> article.onRendered ai:',ai);
  assert(ai, "FATAL 7F3W")
  get_itemx(ai);
});

// ==========================================================================

/*
const clear_messages = function(){
  Session.set('ui-message','');
  Session.set('ui-warning','');
  Session.set('ui-error','');
}
*/

TP.events({
  'click .js-index': (e,tp)=>{
    throw "FATAL 77"
    clear_messages();
//    Meteor.publibase.article_html_preview.set(null);
//    Meteor.publibase.article_html.set(null);
    FlowRouter.go('cc-index');
    return false;
  }
});

/**
TP.events({ // could be in article.js !!!!
  'click .js-title': (e,tp)=>{
    throw "FATAL 78"
//    console.log('> search for exact title e:',e);
    console.log('> search for exact title <%s>:',e.currentTarget.text);
//    const v = find_article_byTitle(e.currentTarget.text.toLowerCase());
    const x = Meteor.publibase.index_lookup(e.currentTarget.text.toLowerCase());
    if (x.err) {
      Session.set('ui-error', x.err);
      return false;
    }

    switch(x.data.length) {
      case 0: Session.set('ui-warning','Aucun resultat.(2)'); break;

      case 1:
      FlowRouter.setParams({id: x.data[0].id});
      break;

      default:
      Session.set('ui-warning','multiple results');
      FlowRouter.setParams({id: x.data[0].id});
      break;
    }
    return false;
  }
});
**/

// =======================================================================

TP.helpers({
  cursor_info() {
    const si = app.subIndex.get();
    if (!si || si.length <= 0) {
      return '';
    }
    const max = si.length;
    const i = app.state.get('subIndex-cursor');
    return '' + (i+1) +':'+ max;
  },
  article() {
    return app.state.get('db-article');
  }
});


// ---------------------------------------------------

TP.events({
  'click .js-prev-article': (e,tp)=>{
    console.log('prev-article e:',e);
    //clear_messages();
    const ai = app.next_article(-1); // based on flowrouter.getParams
    if (ai < 0) {
      FlowRouter.go('index');
    } else {
      FlowRouter.setParams({id:ai});
    }
    return false;
  }
});



TP.events({
  'click .js-next-article': (e,tp)=>{
    console.log('next-article e:',e);
    //clear_messages();
    const ai = app.next_article(+1);
    if (ai <0) {
      FlowRouter.go('index');
    } else {
      //    app.set_xpage(xp); // because need also xp_meta.
      get_itemx(ai)
      .then(()=>{
        console.log('success');
        FlowRouter.setParams({id: ai}); // will change url only.
      })
      .catch(err=>{
        console.log('ERROR:',err);
      })
    }
    return false;
  }
});



Template.ad_server_panel.helpers({
  id() {
    let id = FlowRouter.getParam('id'); // to make it reactive
    return `${id}`;
  }
});
