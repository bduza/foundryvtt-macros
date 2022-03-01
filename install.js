if(!game.macros.getName('Get Macro From Git')) {
let gitData = "";
try{
await jQuery.get(`https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/${encodeURI('Get Macro From Git')}.js`, async function(data) {
  gitData = data;
});
}catch(error){return ui.notifications.error('Macro not found: '+error.responseText)}
if (gitData)
await Macro.create({
    "name": 'Get Macro From Git',
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
if(game.macros.getName('Get Macro From Git'))  ui.notifications.info('Macro: Get Macro From Git created');
else return ui.notifications.error('Macro: Get Macro From Git not created. something went wrong');
}
let macros = [
  "Update Macro From Git",
  "Character Dialog",
  "Chat Messages Dialog",
  "Health Vitality Change",
  "UpdateVitality(actor, damage, hpOld, critical)",
  "Request Chat Inline Roll",
  "Macro Directory",
  "More Convenient Effects"
  ];
for (let m of macros) {
  await game.macros.getName("Get Macro From Git").execute(m);
}
ui.notifications.info('Setup Complete');
