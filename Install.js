let github = `https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/`;
try {
await jQuery.get(`${github}${encodeURI('Install Dialog')}.js`, async function(data) {
  eval(`( async function() {
    ${data}
  }())`);
});
} catch(error){
  return ui.notifications.error('Macro not found on github: '+ error.responseText)
}