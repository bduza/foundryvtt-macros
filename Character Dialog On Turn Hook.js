if (Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook'))<0) {
  Hooks.on(`updateCombat`, async (combat, changed, options, userId) => {
    //console.log(combat);
    // CharacterDialogOnTurnHook
    $(`div[id^=items-dialog-], div[id^=item-rolls-dialog-]`).hide();
    
    let combatantToken = canvas.tokens.get(combat.current.tokenId);
    combatantToken.control({releaseOthers: true});
    canvas.animatePan({x: combatantToken.data.x, y: combatantToken.data.y});
    
    let combatant_t = combat.combatant.actor.uuid.replaceAll('.','_');
    let combatantDialog = $(`div[id*=${combatant_t}]`);
    if (!combatantDialog.length) {
      game.macros.getName('Character Dialog').execute();
    }
    $(`div[id*=${combatant_t}]`).show();
  });
  ui.notifications.info('Character Dialog On Turn Hook Added');
} else {
  while (!Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook'))>-1)
    Hooks._hooks.updateCombat.splice(Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook')), 1)
  ui.notifications.info('Character Dialog On Turn Hook Removed');
}
