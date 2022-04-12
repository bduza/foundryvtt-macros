let github = "https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/";

let macros = [
{
  name: "Character Dialog",
  description: "A dialog that lists actor items by category. Clicking an item creates another dialog with details, inline rolls for artacks and damage, and other useful buttons.",
  "permission": {"default": 2}
},
{
  name: "Roll Dialog",
  description: "Shows inline rolls for Ability Tests / Ability Saves / Skill Checks",
  "permission": {"default": 2}
},
{
  name: "Actor Menu",
  description: "Calls other dialogs from a Token Action Hud style dialo.g",
  "permission": {"default": 2}
},
{
  name: "Spell Preparation",
  description: "Shows an actor's spells; clicking a preparable spell will toggle it's prepared state.",
  "permission": {"default": 2}
},
{
  name: "Spell Preparation Sets",
  description: "Allows for saving currently prepared spells in a named set that can be applied with a single click.",
  "permission": {"default": 2}
},
{
  name: "Rest Dialog",
  description: "Shows Hit Dice as clickable images to roll. Short Rest and Long Rest button.",
  "permission": {"default": 2}
},
{
  name: "Chat Messages Dialog",
  description: "For DM. Iterates through chat messages on each chat message render to detect attack hits, damage (with application), and saves succeeded/failed.",
  "permission": {"default": 0}
},
{
  name: "Request Chat Inline Roll",
  description: "A dialog with user character selection and buttons that will whisper to selected players' a request for a roll for Ability Test / Ability Save / Skill Check",
  "permission": {"default": 0}
},
{
  name: "Macro Directory",
  description: "Quick simple search of all macros by name. LClick to run, RClick to edit, Ctrl+RClick to download as js.",
  "permission": {"default": 0}
},
{
  name: "More Convenient Effects",
  description: "Shows Dfred's Convenient Effects in a small searchable dialog",
  "permission": {"default": 0}
},
{
  name: "Actor Effects List",
  description: "Shows active effects on the actor in a small dialog with delete and toggle buttons for each",
  "permission": {"default": 0}
},
{
  name: "Character Dialog On Turn Hook",
  description: "Creates Hook to: Selects turn actor token. Hides all character dialogs and sub-dialogs. Shows character dialog and sub-dialogs for current turn actor",
  "permission": {"default": 0}
},
{
  name: "Update Encumbered Status",
  description: "Iterates through characters and uses dfred's convenient effects to apply encumbered status effects based on current encumbrance thresholds",
  "permission": {"default": 0}
},
{
  name: "Custom CSS",
  description: "Sets some custom Foundry-app-similar css changes to make dialogs more tolerable to look at",
  "permission": {"default": 2}
}
];
let folderName = '5e Dialog Macros'
let userMacroFolder = game.folders.find(f => f.data.name === folderName && f.data.type === 'Macro');
if (!userMacroFolder) userMacroFolder = await Folder.create({name : folderName , type : 'Macro'});
//if(!args[0]) return ui.notifications.error('No macro name passed in args');
let macroName = "Get Allen's 5e Macros From Git"//args[0];
let command = this.data.command;
let match = false;
let gitData = '';
console.log(`getting ${macroName} macro from git`);
try{
await jQuery.get(`${github}${encodeURI(macroName)}.js`, function(data) {
  gitData = data;
});
}catch(error){return ui.notifications.error('Macro not found: '+error.responseText)}
await this.update({command:gitData});
console.log(`executing ${macroName} code as ${this.name}`);
this.execute();
await this.update({command:command});
console.log(`${this.name} reset to original command`);


async function getMacroFromGit (macroName, args) {
  let github = 'https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/';
  try {
    await jQuery.get(`${github}${encodeURI('Get Macro From Git')}.js`, async function(data) {
      eval(`( async function() {
          ${data}
          }())`);
  });
  } catch(error){
    return ui.notifications.error('Macro not found on github: '+ error.responseText)
  }  
}

async function updateMacroFromGit (macroName) {
  let github = 'https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/';
  try {
    await jQuery.get(`${github}${encodeURI('Update Macro From Git')}.js`, async function(data) {
      let a = 'fire';
      eval(` console.log(a)`);
  });
  } catch(error){
    return ui.notifications.error('Macro not found on github: '+ error.responseText)
  }  
}