Template.ad_server_panel.helpers({
  url: ()=>{
    console.log('location:',window.location.origin);
    return location.origin + '/ad-server';
  }
})
