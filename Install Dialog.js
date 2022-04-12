let macros = [
    {
        "name": "Character Dialog",
        "description": "A dialog that lists actor items by category. Clicking an item creates another dialog with details, inline rolls for artacks and damage, and other useful buttons.",
        "permission": 2,
        "img": "icons/magic/movement/trail-streak-zigzag-yellow.webp"
    },
    {
        "name": "Chat Messages Dialog",
        "description": "For DM. Iterates through chat messages to detect attack hits, damage (with application), and saves succeeded/failed. My method of semi-automating damage application with inline rolls",
        "permission": 0,
        "img": "icons/sundries/documents/envelope-sealed-red-brown.webp"
    },
    {
        "name": "Roll Dialog",
        "description": "Shows inline rolls for Ability Tests / Ability Saves / Skill Checks",
        "permission": 2,
        "img": "icons/svg/d20-black.svg"
    },
    {
        "name": "Actor Menu",
        "description": "Calls other dialogs from a Token Action Hud style dialo.g",
        "permission": 2,
        "img": "icons/skills/trades/smithing-anvil-silver-red.webp"
    },
    {
        "name": "Spell Preparation",
        "description": "Shows an actor's spells; clicking a preparable spell will toggle it's prepared state.",
        "permission": 2,
        "img": "icons/sundries/books/book-tooled-silver-blue.webp"
    },
    {
        "name": "Spell Preparation Sets",
        "description": "Allows for saving currently prepared spells in a named set that can be applied with a single click.",
        "permission": 2,
        "img": "icons/sundries/documents/blueprint-recipe-alchemical.webp"
    },
    {
        "name": "Rest Dialog",
        "description": "Shows Hit Dice as clickable images to roll. Short Rest and Long Rest button.",
        "permission": 2,
        "img": "icons/svg/unconscious.svg"
    },
    {
        "name": "Whisper Request Inline Roll",
        "description": "A dialog with user character selection and buttons that will whisper to selected players' a request for a roll for Ability Test / Ability Save / Skill Check",
        "permission": 0,
        "img": "icons/svg/d20-highlight.svg"
    },
    {
        "name": "More Convenient Effects",
        "description": "Shows Dfred's Convenient Effects in a small searchable dialog",
        "permission": 0,
        "img": "icons/svg/aura.svg"
    },
    {
        "name": "Actor Effects List",
        "description": "Shows active effects on the actor in a small dialog with delete and toggle buttons for each",
        "permission": 0,
        "img": "icons/svg/lightning.svg"
    },
    {
        "name": "Character Dialog On Turn Hook",
        "description": "Creates Hook to: Selects turn actor token. Hides all character dialogs and sub-dialogs. Shows character dialog and sub-dialogs for current turn actor",
        "permission": 0,
        "img": "icons/svg/dice-target.svg"
    },
    {
        "name": "Update Encumbered Status",
        "description": "Iterates through characters and uses dfred's convenient effects to apply encumbered status effects based on current encumbrance thresholds",
        "permission": 0,
        "img": "icons/containers/bags/pack-leather-brown.webp"
    },
    {
        "name": "Custom CSS",
        "description": "Sets some custom Foundry-app-similar css changes and darkening to make dialogs more tolerable to look at",
        "permission": 2,
        "img": "icons/magic/light/hand-sparks-glow-yellow.webp"
    },
    {
        "name": "Taskbar",
        "description": "Sets some custom Foundry-app-similar css changes to make dialogs more tolerable to look at",
        "permission": 2,
        "img": "icons/svg/wall-direction.svg"
    },
    {
        "name": "Dice Tray",
        "description": "Edit Messages Roll; Build Rolls; Save Rolls to User Flag [[/r formula # flavor]]",
        "permission": 2,
        "img": "icons/sundries/gaming/dice-pair-white-green.webp"
    }
]
/*
for (let macro of macros) 
  macro.img = game.macros.getName(macro.name).data.img;
console.log(macros);
return
*/
let content = '<div style="margin:0 .25em 12m 0"><button id="install-all">Install/Update All</button></div>';
for (let macro of macros) {
  content += `
  <div style="margin-top: 1em">
    <h2><img src="${macro.img}" height="20" style="margin-right: .25em">${macro.name}</h2>
    <p>${macro.description}</p>
  </div>
  <div style="padding-bottom: 1em;">
    <button class="installer-button" name="${macro.name}">
      ${game.macros.find(m=>m.data.flags.world?.name===macro.name)?'Update':'Create'}
    </button>
  </div>
  <hr>
  `;
}//${game.macros.find(m=>m.data.flags.world?.name===macro.name)?.length?'Update':'Install'}

let d = new Dialog({
  title: '5e Dialog Macros Installer' ,
  content,
  render: (list) => {
    
        $('#install-all').click(async ()=>{
          for (let m of macros) {
              $(`.installer-button[name="${m.name}"]`).click();
              await new Promise((r) => setTimeout(r, 500));
          }
        });
    
       $('.installer-button').click(async function(){
        let folderName = '5e Dialog Macros';
        let macroFolder = game.folders.find(f => f.data.name === folderName && f.data.type === 'Macro');
        if (!macroFolder) macroFolder = await Folder.create({name : folderName , type : 'Macro'});
        let folderId = game.folders.find(f => f.data.name === folderName && f.data.type === 'Macro').id;
        let github = "https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/";
        let macro = macros.find(m=>m.name === $(this).attr('name'))
        let args = [macro.name];
        let gitData = '';
        try {
          await jQuery.get(`${github}${encodeURI(macro.name)}.js`, async function(data) {
            gitData = data;
        });
        } catch(error){
          return ui.notifications.error('Macro not found on github: '+ error.responseText)
        } 
        
        switch($(this).text().trim()) {
          case "Create":
            $(this).text("Update")
            await Macro.create({
              "name": macro.name,
              "type": "script",
              "img": macro.img,
              "scope": "global",
              "command": gitData,
              "folder": folderId,
              "sort": 0,
              "permission": {
                  "default": macro.permission
              },
              "flags": {
                "world": {
                  "name": macro.name
                }
              }
            });
            break;
          case "Update":
            await Macro.update({
              "name": macro.name,
              "type": "script",
              "img": "icons/svg/dice-target.svg",
              "scope": "global",
              "command": gitData,
              "folder": folderId,
              "sort": 0,
              "permission": {
                  "default": macro.permission
              },
              "flags": {
                "world": {
                  "name": macro.name
                }
              }
            });
            break;
          default: return;
            // code block
        }
       });
  },
  buttons: {},
  close:   html => {
      return}
},{ height:400, width:500 , id: "Installer"}
);
d.render(true)
