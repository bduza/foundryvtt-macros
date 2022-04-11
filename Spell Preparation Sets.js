let actorUuid = ``;
if (!args[0]) return;
actorUuid = args[0].replaceAll('_','.');
if (!actorUuid) return;
actorUuid = args[0].replaceAll('_','.');
actor = await fromUuid(actorUuid);
//if (args[0]) token = canvas.tokens.

let w_id = `spell-sets`;
let position = Object.values(ui.windows).find(w=> w.id === `spell-sets`)?.position || { height:'100%', width: '100%' , id: `spell-sets`};
position["id"] = w_id;
let sets = actor.data.flags.world.SpellSets;
console.log(sets);
if (!sets) await actor.setFlag('world','SpellSets', [])
let content = `<input id="new-set-name" type="text" placeholder="new set name" style="width:150px"></input>&emsp;<a id="add-spell-set-button"><i class="fas fa-plus"></i></a><div id="spell-sets" style="display:grid; grid-template-columns: repeat(${sets.length}, 190px)">`;
for (let spellSet of sets){
  content += `<div style="width: 190px"><a class="spell-set" name="${spellSet.name}" onclick="console.log('${spellSet.name}')" style="font-size: 1.2em;">${spellSet.name}</a>`;
  for (let s_id of spellSet.spells) {
        let s = actor.items.get(s_id);
        content += `<li><img src="${s.data.img}" height="14" style="background: url(../ui/denim075.png) repeat;"/>
        <span> ${s.data.name}</span></li>`;
      }
  content += `</div>`;
}
content += '</div>';
let d = new Dialog({
  title: `${actor.name} Spell Sets` ,
  content,
  render: (app) => {
    
    $('.spell-set').click(async function() {
      let name = $(this).attr('name');
      let spellSet = actor.data.flags.world.SpellSets.find(s=>s.name===name);
      let updates = actor.itemTypes.spell.filter(s=>s.data.data.preparation.mode === 'prepared').map(s=> {return {_id:s.id, "data.preparation.prepared":spellSet.spells?.includes(s.id)}});
      console.log(updates)
      await actor.updateEmbeddedDocuments("Item", updates);
      game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute();
      if (Object.values(ui.windows).find(w=> w.id === `spell-preparation`))
        game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute(actor.uuid);
    });
    
    $('.spell-set').contextmenu(async function() {
      let name = $(this).attr('name');
      let del = await dialogYesNo(`Delete spell set named: ${name}?`)
      if (!del) return;
      let SpellSets = actor.data.flags.world.SpellSets;
      let foundIndex = SpellSets.findIndex(n=>n.name===name);
      if (foundIndex>-1) {
        SpellSets.splice(foundIndex, 1);
      }
      console.log(SpellSets);
      await actor.setFlag('world', 'SpellSets', SpellSets);
      game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute();
    });
    
    $('#add-spell-set-button').click(async function(){
      let name = $(this).prev().val();
      if (!name) return;
      let preparedSpells = actor.itemTypes.spell.filter(s=>s.data.data.preparation.mode === 'prepared' && s.data.data.preparation.prepared).map(s=>s.id);
      let flag = actor.data.flags.world.SpellSets;
      flag.push({name, spells: preparedSpells});
      await actor.setFlag('world', 'SpellSets', flag);
      game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute();
    });
  },
  buttons: {},
  close:   html => {
      return}
},position
).render(true);

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