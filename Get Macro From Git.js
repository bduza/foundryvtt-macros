if(!args[0]) return ui.notifications.error('No macro name passed in args');
if(game.macros.getName(args[0])) return ui.notifications.error(`A macro named ${args[0]} already exists`);
let gitData = "";
try{
await jQuery.get(`https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/${encodeURI(args[0])}.js`, async function(data) {
  gitData = data;
});
}catch(error){return ui.notifications.error('Macro not found: '+error.responseText)}
if (gitData)
await Macro.create({
    "name": args[0],
    "type": "script",
    "author": game.user.id,
    "img": "icons/svg/dice-target.svg",
    "scope": "global",
    "command": gitData,
    "folder": null,
    "sort": 0,
    "permission": {
        "default": 0,
        [game.user.id]:3
    }
});
if(game.macros.getName(args[0])) return ui.notifications.info('Macro: ' + args[0] + ' created');
else return ui.notifications.info('Macro: ' + args[0] + ' not created. something went wrong');
