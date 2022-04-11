if (!game.user.data.flags.world?.ActorMenuAutoClose)
  await game.user.setFlag('world', 'ActorMenuAutoClose');
let {actorUuid} = args[0] || {};
let t = '';
if (!token) token = _token;
if (!token) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");
token = null;
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
} 
t = actor.uuid.replaceAll('.','_');

let w_id = `menu-${t}`;
let position =  { width: '100%',  left: 125, top: 75, id: w_id};


//if($(`#menu-${t}`).length) return ui.windows[$(`#menu-${t}`).attr('data-appid')].close();
$('.actor-menu').each(async function(){
  let this_id = $(this).attr('id');
  if (this_id === w_id) return;
  let _w = Object.values(ui.windows).find(w=> w.id === this_id);
  position = _w.position;
  _w.close();
});

position['width'] = '100%';
position['id'] = w_id;
let types = [];

for (let [type, array] of Object.entries(actor.itemTypes) ) {
  if (type==='backpack') continue;
  if (type==='class') continue;
  if (array.length>0)
    types.push(type.capitalize());
}
let length = types.length + 6;
if (types.includes('Spells')) length ++;
//console.log(types, length)
let content = `
<div style="margin: 0 3px; position: absolute; right:60px; top: 7px;">
  <input type="checkbox" id="${t}-closeOnMouseLeave" style="float:right; margin-top: 3px;  height: 12px;">
  <label for="${t}-closeOnMouseLeave">Auto-Close</label>
</div>`;
//<div id="${t}-menu-div" style="font-size: 1.1em; font-weight: semibold; display:grid; grid-template-${display}s: repeat(${length}, auto) 10px; grid-${display}-gap: .6em;">`;
let list = [];
for (let type of types){
  list.push( 
  `<a id="open-category-${type}-${t}" name="${type.toLowerCase()}" data-t="${t}" class="type-link">
    <span style="margin: 0 3px" >
      ${type==='Feat'?'Features':((['Equipment', 'Loot'].includes(type))?type:type+'s')} 
    </span>
  </a>`);
  if (type==='Spell') list.push(`
  <a onclick="game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute('${t}');">
    <span style="margin: 0 3px" >Prepare</span>
  </a>`);
}


list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-test">
  <span style=" margin: 0 3px" >Abilities</span>
</a>`);
list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-save">
  <span style=" margin: 0 3px" >Saves</span>
</a>`);
list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-skills-check">
  <span style="margin: 0 3px" >Skills</span>
</a>`);
list.push(`<a id="rest-dialog-${t}" data-t="${t}">
  <span style="margin: 0 3px">Rest</span>
</a>`);
list.push(`<a id="initiative-${t}"  data-t="${t}">
  <span style="margin: 0 3px">Initiative</span>
</a>`);
list.push(`<a id="${t}-ce" data-t="${t}" >
  <span style="margin: 0 10px 0 3px" >Effects</span>
</a>`);

content += '<span style="white-space: nowrap;">'+list.join('')  + '</span>';
Dialog.persist({
  title: `${actor.name}`,
  content,
  buttons: {},
  render: ()=>{
    /*
    $(`#menu-${t}`).click(async function(e){
        console.log(t);
        let placeables = canvas.tokens.placeables.filter(tp => tp?.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
      });
    */
    $(`#${t}-menu-div`).parent().parent().css('padding','3px');
    if (actor.data.data.attributes.hp.value === 0 && actor.type===character) {
      $(`#${t}-menu-div`).empty();
      $(`#${t}-menu-div`).append(`
      <a id="death-save-${t}" data-t="${t}">Death Save</a>
      <i class="fas fa-skull df1 df2 df3"></i>
      <i class="fas fa-skull df2 df3"></i>
      <i class="fas fa-skull df3"></i>
      <i class="fas fa-check ds1 ds2 ds3"></i>
      <i class="fas fa-check ds2 ds3"></i>
      <i class="fas fa-check ds3"></i>
      `);
      //$(`#${t}-menu-div`).parent().prepend(`<style id="${t}-death-style"> 
      //  .df${actor.data.data.attributes.death.failure} {color: red !important; } 
      //  .ds${actor.data.data.attributes.death.success} {color: brightgreen !important; }
      //  </style>`);
      
      console.log($(`.fa-skull.df${actor.data.data.attributes.death.failure}`))
      $(`#${t}-menu-div > .fa-skull.df${actor.data.data.attributes.death.failure}`).css('color', 'red');
      $(`#${t}-menu-div > .fa-check.ds${actor.data.data.attributes.death.success}`).css('color', 'green');
      $(`#death-save-${t}`).click(async function() {
        await actor.rollDeathSave();
        Hooks.once('diceSoNiceRollComplete', () => {
          game.macros.find(m=>m.data.flags.world?.name==='Actor Menu').execute($(this).attr('data-t').replaceAll('_','.'));
        });
      });
      
    }
    
    $('.type-link').click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      
      let position = {left: $(this).offset().left, top:$(this).offset().top+20};
      
      game.macros.find(m=>m.data.flags.world?.name==='Character Dialog').execute({
        actorUuid: $(this).attr('data-t').replaceAll('_','.'),
        type: $(this).attr('name'),
        position, //{left : $(this)[0].offsetLeft , top: $(this)[0].offsetTop },
        //position: {left : e.clientX- 15 , top: e.clientY+15 },
        closeOnMouseLeave
        });
    });
    
    $(`#${t}-ce`).click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      let position = {left: $(this).offset().left, top:$(this).offset().top+20};
       game.macros.find(m=>m.data.flags.world?.name==='Actor Effects List').execute({
         actorUuid: $(this).attr('data-t').replaceAll('_','.'),
         position, 
         closeOnMouseLeave});
    });
    
    $(`#initiative-${t}`).click(async function (e) {
      let uuidParts = $(this).attr('data-t').replaceAll('_','.').split('.');
      let token;
      if (uuidParts[2]==='Token') token = canvas.tokens.get(uuidParts[3]);
      else  token = canvas.tokens.placeables.find(t=>t.actor?.id===uuidParts[1]);
      if (!game.combats.viewed.turns.map(c=>c.token.id).includes(token.id)) await token.toggleCombat();
      //else  return ui.notifications.warn(`${token.name} already rolled initiative`);
      if (game.user.isGM)
        game.settings.set("core", "rollMode", 'selfroll');
      
      if (!game.combats.viewed.turns.find(c=>c.token.id===token.id)?.initiative) await token.actor.rollInitiative();
    });
    
    $(`#rest-dialog-${t}`).click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      let position = {left: $(this).offset().left, top:$(this).offset().top+20};
      game.macros.find(m=>m.data.flags.world?.name==='Rest Dialog').execute({
        actorUuid: $(this).attr('data-t').replaceAll('_','.'),
        position,
        closeOnMouseLeave});
    });
    
    $(`.menu-roll-dialog-button-${t}`).each(function() {
        $(this).click(async function(e){
          let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
          let vars = this.name.split('-');
          let position = {left: $(this).offset().left, top:$(this).offset().top+20};
          game.macros.find(m=>m.data.flags.world?.name==='Roll Dialog').execute({
            actorUuid: vars[0].replaceAll('_','.'),
            rollType: vars[1],
            abilType: vars[2], 
            position, 
            closeOnMouseLeave});
        });
    });
     
    $(`#${t}-closeOnMouseLeave`).prop('checked', game.user.data.flags.world.ActorMenuAutoClose);

    $(`#${t}-closeOnMouseLeave`).change(async function() {
        await game.user.setFlag('world', 'ActorMenuAutoClose', $(this).is(":checked"));       
    });
    
    $(`#menu-${t}`).find(`section.window-content`).click(async function(e){
        
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].bringToTop();
      });
    $(`#menu-${t}`).addClass('actor-menu');
    $(`#menu-${t}`).show();
  },
  close:   html => {
    for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].close();
      return;}
},position
);//.render(true);