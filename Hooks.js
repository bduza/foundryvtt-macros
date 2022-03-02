//if(!game.user.isGM) game.logOut();
console.log('INITIALIZE MACRO');
if (Hooks._hooks.renderMacroConfig.filterIndex(f=>f.toString().includes('Triggler'))[0])
  Hooks._hooks.renderMacroConfig.splice( Hooks._hooks.renderMacroConfig.filterIndex(f=>f.toString().includes('Triggler'))[0], 1)

Hooks.on(`pauseGame`, (paused) => { 
  if (!game.user.isGM)
    $('textarea#chat-message').prop('disabled', paused);
});

Hooks.on(`renderChatLog`, (app, html, data) => {
  if (!game.user.isGM)
    html.find('textarea#chat-message').prop('disabled', game.paused);
});

Hooks.on(`renderMacroConfig`, (app,html) => { 
  html.find('div.form-group').find(`select`).parent().toggle();
  html.find('div.form-group').find(`input`).parent().toggle();
  html.find('div.form-group').find('select[name="type"]').find('option[value="script"]')[0].selected = true;
  html.find('div.furnace-macro-command').prev().append('<a name="show" style="float: right; clear: both;">options</a>').click(()=>{
    html.find('div.form-group').find(`select`).parent().toggle();
    html.find('div.form-group').find(`input`).parent().toggle();
  });
});

Hooks.on(`renderChatMessage`, (message, html, data) => { 
  //removeflavortext from gamemaster rolls for players
  if (message.data.user===game.users.getName('Gamemaster').id && !game.user.isGM && message.data.roll?.length>0){
    html.find('header.message-header span.flavor-text')[0].remove();
    html.find('div.message-content div.dice-roll div.dice-result div.dice-formula')[0].remove();
  }
});

Hooks.on(`restCompleted`, (actorEntity, data) => { 
  game.macros.getName('Vitality on restCompleted').execute(actorEntity, data);
});
    
Hooks.on(`preCreateChatMessage`, async (message, data, options, user) => {
  //chatmessagetargetflags
  if (message.data.user===game.user.id && (message.data.flavor?.includes('Attack') || message.data.flavor?.includes('Casts'))){
    message.data.update({"flags.world.targetIds": [...game.users.get(user).targets].map(t=>t.id)});
  }
  if (message.data.user===game.user.id && (message.data.flavor?.includes('Damage'))){
    message.data.update({"flags.world.damageType": message.data.flavor.split(' ')[message.data.flavor.split(' ').indexOf('Damage')-1]});
  }
  if (message.data.user===game.user.id && (message.data.flavor?.includes('Rolling Saves'))){
    message.data.update({"flags.world.targetIds": [...game.users.get(user).targets].map(t=>t.id)});
  }
});

/*     
Hooks.on(`updateActor`, async (actorEntity, data, options, userId) => { 
  console.log(actorEntity, data, options, userId);
  console.log(actorEntity, options.dhp, data.oldHpVal);
  if (actorEntity.type !== 'character' ) return;
  if (!options.dhp) return;
  
  let apply = await new Promise((resolve)=>{
      new Dialog({
       title: 'Apply Vitality Damage?',
       content:  `
       <p>Apply ${data.oldHpVal} ${options.dhp>0?'+'+options.dhp:options.dhp} = ${data.oldHpVal+options.dhp}?
       <input type="checkbox" id="crit-checkbox" /><label for="crit-checkbox" id="crit-checkbox-label">Critical</label></center></p>`,
       buttons: {
         yes: { label : `Yes`, callback : (html) => { 
           let critical = html.find("#crit-checkbox")[0].checked;
	          resolve([true, critical]); 
                  }
              },
         no:  { label : `No`, callback : (html) => { 
           let critical = html.find("#crit-checkbox")[0].checked;
	          resolve([false, critical]); 
                  }
              }
       },
       close:   html => {
           return}
         },{ id: "vitality-dialog"}
      ).render(true);
  });
console.log(apply[0], apply[1]);
if (!apply[0]) return;
let a = actorEntity;
let damage = options.dhp*-1;
let hpOld = data.oldHpVal;
let isCritical = apply[1];
game.macros.getName('UpdateVitality(actor, damage, hpOld, critical)').execute(a, damage, hpOld, isCritical);
});

Hooks.on("midi-qol.RollComplete", async (workflow)=>{
	    
	    if (!workflow.damageList) return;
		//workflow.damageList.forEach( damage => {
		for (const damage of workflow.damageList) {
		    //console.log("HEY! Damage:");
		    //console.log(damage);
		    let a = game.actors.get(damage.actorId);
		    if (a.type == 'character')
		        game.macros.getName('UpdateVitality(actor, damage, critical)').execute(a, damage.appliedDamage, workflow.isCritical);
		}
	    
		
    });
Hotkeys.registerShortcut({
        name: `CombatNextTurn`,
        label: `Combat Next Turn`,
        default: () => { return { key: Hotkeys.keys.KeyN, alt: false, ctrl: false, shift: true }; },
        onKeyDown: (e) => {
            //ui.nav._collapsed? 
            //ui.nav.expand():
            //ui.nav.collapse();
            if(game.combat) game.combat.nextTurn();
        }
    });
    
Hotkeys.registerShortcut({
        name: `ToggleHotbar`,
        label: `Toggle Hotbar`,
        default: () => { return { key: Hotkeys.keys.KeyH, alt: false, ctrl: false, shift: true }; },
        onKeyDown: (e) => {
            ui.hotbar._collapsed?
            ui.hotbar.expand():
            ui.hotbar.collapse();
        }
    });
            
Hotkeys.registerShortcut({
        name: `ToggleSidebar`,
        label: `Toggle Sidebar`,
        default: () => { return { key: Hotkeys.keys.KeyB, alt: false, ctrl: false, shift: true }; },
        onKeyDown: (e) => {
            ui.sidebar._collapsed?
            ui.sidebar.expand():
            ui.sidebar.collapse();
            //if(game.combat) game.combat.previousTurn();
        }
    });
    
    
Hotkeys.registerShortcut({
        name: `RequestRoll`,
        label: `MTB Request Roll`,
        default: () => { return { key: Hotkeys.keys.KeyR, alt: false, ctrl: false, shift: true }; },
        onKeyDown: (e) => { 
            game.MonksTokenBar.requestRoll(canvas.tokens.controlled)
        }
    });
    /*
Hotkeys.registerShortcut({
        name: `ToggleTurn`,
        label: `Toggle Turn`,
        default: () => { return { key: Hotkeys.keys.KeyT, alt: false, ctrl: false, shift: true }; },
        onKeyDown: (e) => { 
            game.macros.getName('Toggle Turn on Hovered').execute();
        }
    });*/