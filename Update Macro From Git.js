let updated = false;
if(!args[0]) return ui.notifications.error('No macro name passed in args');
let macro = game.macros.getName(args[0]);
if(!macro) return ui.notifications.error('A macro with that name does not exist');
let command = macro.data.command;
let match = true;
let gitData = command;
try {
await jQuery.get(`https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/${encodeURI(macro.name)}.js`, function(data) {
  if (data) {
    match = data=== command;
    gitData = data;
  }
});
}catch (error){console.log(error)}
if (!match && game.user.isGM) {
  ui.notifications.info(`${macro.name} is updating from git`)
  await macro.update({command:gitData});
  ui.notifications.info(`${macro.name} updated from git`)
  updated = true;
}
return {match, updated};
