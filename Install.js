let github = `https://raw.githubusercontent.com/bduza/foundryvtt-macros/main/`;
await jQuery.get(`${github}${encodeURI('Install Dialog')}.js`, async function(data) {
  eval(`( async function() { ${data} }())`);
});
