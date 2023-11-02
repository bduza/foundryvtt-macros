if(!game.macros.getName('Get Macro From Git')) {
let gitData = "";
try{
await jQuery.get(`https://raw.githubusercontent.com/bduza/foundryvtt-macros/main/${encodeURI('Get Macro From Git')}.js`, async function(data) {
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
if(game.macros.getName('Get Macro From Git'))  console.log(ui.notifications.info('Macro: Get Macro From Git created'));
else return console.log(ui.notifications.error('Macro: Get Macro From Git not created. something went wrong'));
}
let macros = [
  "Character Dialog",
  "Roll Dialog",
  "Actor Menu",
  "Spell Preparation",
  "Spell Preparation Sets",
  "Rest Dialog",
  "Chat Messages Dialog",
  "Health Vitality Change",
  "UpdateVitality(actor, damage, hpOld, critical)",
  "Request Chat Inline Roll",
  "Macro Directory",
  "More Convenient Effects",
  "Actor Effects List",
  "Character Dialog On Turn Hook",
  "Update Encumbered Status",
  "Custom CSS",
  "Custom CSS Dialog"
  ];
if(!game.macros.getName('Update Macro From Git')) {
  await game.macros.getName('Get Macro From Git').execute('Update Macro From Git');
  if(game.macros.getName('Update Macro From Git')) console.log(ui.notifications.info('Macro: Update Macro From Git created'));
  else return console.log(ui.notifications.error('Macro: Update Macro From Git not created. something went wrong'));
}
for (let m of macros) {
  if (game.macros.getName(m)) {
    if (await dialogYesNo(`Update ${m} macro?`))
      await game.macros.getName('Update Macro From Git').execute(m);
  }
  else {
    if (await dialogYesNo(`Add ${m} macro?`))
      await game.macros.getName("Get Macro From Git").execute(m);
  }
}
ui.notifications.info('Get Complete');

async function dialogYesNo(prompt) {
  let response = await new Promise((resolve)=>{
      new Dialog({
       title: prompt,
       content:  '',
       buttons: {
         yes: { label : `Yes`, callback : () => { resolve(true); }},
         no:  { label : `No`,  callback : () => { resolve(false); }}
       },
       close:   html => { resolve(false); }
        },{}
      ).render(true);
  });
  return response;
}
