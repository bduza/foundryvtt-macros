//game.playlists.getName("Combat").sounds.getName("battle_4").update({ playing : true });
for (let p of [...game.playlists].filter(p=>p.data.playing)) for (let s of [...p.data.sounds].filter(p=>p.data.playing)) await s.update({playing:false})
if (!game.combats.viewed)
    await Combat.create({scene: canvas.scene.id, active: true});
let combatants = canvas.tokens.controlled.filter(t=>t.data.disposition!==0).map( token => {
    if (token.actor.type === "character" || token.actor?.hasPlayerOwner) {
        return {tokenId: token.id, hidden: token.data.hidden};
    } else {
        let roll = new Roll(`1d20 + ${token.actor.data.data.attributes.init.total}`).roll({async: false});
        return {tokenId: token.id, hidden: token.data.hidden, initiative: roll.total, name:""};
    }
});
console.log(combatants.length);
if (combatants.length) {
    await game.combats.viewed.createEmbeddedDocuments("Combatant", combatants);
    
    
    for (let turn of game.combat.turns) {
        console.log(turn);
        if (turn.actor.hasPlayerOwner){
           const data = {
                "user": turn.players[0].data.id,
                "actors": [turn.actor.id],
                "abilities": [],
                "saves": [],
                "skills": [],
                "advantage": 0,
                "mode": "roll",
                "title": 'Roll for Initiative',
                "message": '',
                "formula": '',
                "deathsave": false,
                "initiative": true,
                "tables": []
            };
            console.log(data);
            game.socket.emit('module.lmrtfy', data);
        }
    }
}
    
let content = `<select id="select-sound" name="select-type">`;
let sounds = game.playlists.getName('Combat').sounds;
for (let [key, value] of  sounds.entries()) {
    content += ` <option value="${key}">${value.data.name}</option>`; 
	console.log(key + " = " + value)
}
content +=     `</select>`;
       
let d = new Dialog({
  title: 'Select a Playlist and Wait for player Initiative',
  content: content,
  buttons: {
      start: {
        icon: "<i class='fas fa-check'></i>",
        label: `Start Combat`,
        callback: async (html) => {
            let _id = html.find('#select-sound')[0].value;
            
            console.log(_id);
            game.playlists.getName("Combat").sounds.get(_id).update({ playing : true });
            game.combats.viewed.startCombat();
        }
    }
  },
  close:   html => {
      return}
}
);
d.render(true);