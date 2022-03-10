if (args[0]) token = canvas.tokens.placeables.filter(t=>t.actor?.uuid===args[0].replaceAll('_','.'))[0];
if (!token) return;
token.control({releaseOthers:true});
let w_id = "spell-preparation";
let position = Object.values(ui.windows).find(w=> w.id === w_id)?.position || {width: 930 , height: '100%'};
position["id"] = w_id;
let spells = token.actor.itemTypes.spell.sort((a, b)=> (a.data.data.level > b.data.data.level) ? 1 : (a.data.data.level === b.data.data.level) ? ((a.data.name > b.data.name) ? 1 : -1) : -1  );
let level = -1;
let list = `<div>`;//<div  style="display:grid; grid-template-columns: repeat(4, 200px)" >`;
let unprepared = 'rgba(150,150,150,1) !important';
for (const spell of spells){
  if (spell.data.data.level !== level){
    level ++;
    if (level>=0) list +=`</div>`;
    list +=`<h2 style="margin-top: .2em">${level===0?'Cantrip':'Level '+level}</h2><div  style="display:grid; grid-template-columns: repeat(5, 180px)" >`;
  }
  let style = 'color: #fff !important';
  if (spell.data.data.preparation?.mode === 'prepared' && !spell.data.data.preparation.prepared) style = `color: ${unprepared}`;
  if (spell.data.data.level === 0) style = 'color: #fff !important';
  if (spell.data.data.preparation?.mode === 'innate') style = 'color: #8ff !important';//level = 'Innate';
  if (spell.data.data.preparation?.mode === 'pact') style = 'color: #fd3 !important';
  if (spell.data.data.preparation?.mode === 'always') style = 'color: #afa !important';
  list += `
  <div id="${spell.id}" style="white-space: nowrap; overflow: hidden;  text-overflow: ellipsis;">
  <img src="${spell.data.img}" height="14" style="background: url(../ui/denim075.png) repeat;"/>
  <span><a id="spell-name-${spell.id}" style="${style}" name="${spell.id}"> ${spell.data.name}</a> 
  </span></div>`;
}//<a id="spell-delete-${spell.id}" name="${spell.id}" style="float:right;"><i class="fa fa-times"></i></a>
list += `</div></div>`;
let d = await new Dialog({
  title: `${token.actor.name} Spells Prepared: `,
  content:  list,
  render: ()=>{
    let header = `${token.actor.name} Spells Prepared: 
    ${token.actor.itemTypes.spell.filter(spell=>spell.data.data.preparation.mode === 'prepared' && spell.data.data.preparation?.prepared).length}`;
    header += `<a title="Spell Sets" style="float: right" id="spell-sets-macro-button"><i class="fas fa-list"></i>&nbsp;Spell Sets</i></a>`;
    
    $(`#${w_id} > header > h4`).html(header);
    
    $(`#spell-sets-macro-button`).click(()=>{
      let w = Object.values(ui.windows).find(w=> w.id === `spell-sets`);
      if (w?.appId) w.bringToTop();
      else game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation Sets').execute();
    });
    
    $("input#myspellInput").focus();
    
    $("a[id^=spell-name]").contextmenu(async function(e){
        let spell = token.actor.items.get(this.name);
        console.log(spell);
        spell.sheet.render(true);
    });
    $("a[id^=spell-name]").click(async function(){
      let spell = token.actor.items.get(this.name);
        if (spell.data.data.preparation.mode !== 'prepared') 
          return ui.notifications.warn(`${spell.data.name} is not a preparable spell`);
        await  spell.update({"data.preparation.prepared":!spell.data.data.preparation.prepared})
        console.log(spell.data.data.preparation.prepared, spell.data.data.preparation.mode) ;
        console.log($(this))
        if (spell.data.data.preparation.prepared) 
          $(this).attr('style', `color : ${'rgba(255,255,255,1) !important'}`);
        else 
          $(this).attr('style', `color : ${unprepared}`);
        
        let header = `${token.actor.name} Spells Prepared: 
        ${token.actor.itemTypes.spell.filter(spell=>spell.data.data.preparation.mode === 'prepared' && spell.data.data.preparation?.prepared).length}`;
        header += `<a title="Spell Sets" style="float: right" id="spell-sets-macro-button"><i class="fas fa-list"></i>&nbsp;Spell Sets</i></a>`;
        $(`#${w_id} > header > h4`).html(header);
        
    });
    $("a[id^=spell-delete]").click(async function(){
        let spell = token.actor.spells.get(this.name);
        await spell.delete();
        $(this).parent().remove();
    }); 
    
  },
  buttons: {},
  close:   html => {
    let w = Object.values(ui.windows).find(w=> w.id === `spell-sets`);
      if (w?.appId) w.close();
      return;}
},position
);
await d.render(true);