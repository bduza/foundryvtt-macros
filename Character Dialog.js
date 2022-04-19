if (typeof Dialog.persist !== "function") game.macros.find(m=>m.data.flags.world?.name==='Dialog.persist').execute();

let {actorUuid, type, position, closeOnMouseLeave} = args[0] || {};
console.log(args[0])
let sortByActionType = false;
//let closeOnMouseLeave = args[3];
let closeTimeout = 1000;
console.log('closeOnMouseLeave', closeOnMouseLeave);
let _uuid = '';
if (!actorUuid) actorUuid = game.user.character?.uuid;
if (!actorUuid) actorUuid = token?.actor.uuid;
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
if (!actor) return ui.notifications.error("No Actor");
//token = null;

/*
{
  let uuidParts = actorUuid.split('.');
  console.log(uuidParts);
  if (uuidParts[2]==='Token') actor = canvas.tokens.get(uuidParts[3]).actor;
  else  actor = game.actors.get(uuidParts[1]);
  actor = canvas.tokens.placeables.find(_uuid=>_uuid.actor?.uuid===actorUuid).actor;
}*/
_uuid = actor.uuid.replaceAll('.','_');

console.log('_uuid: ', _uuid);
let top = 3;
//let left = window.innerWidth-610;
if (game.user.isGM) top = 80;
let left = 110;
let height = '100%';//window.innerheight-50;
let width = 300;
let w_id = `items-dialog-${_uuid}`;
if (type) w_id += `-${type}`;
let positionDefault = //Object.values(ui.windows).find(w=> w.id===`items-dialog-${_uuid}`)?.position || 
  { height: height, width: width, top: top, left: left , id: w_id};
//position["id"] = w_id;
position = {...positionDefault, ...position};

let combatPopout = Object.values(ui.windows).find(w=> w.id === `combat-popout`);
if (combatPopout && !actorUuid) {
  position.top = combatPopout.position.top;
  position.left = combatPopout.position.left + combatPopout.position.width + 5;
}

//if (!game.user.isGM) ui.nav._element.hide();

if (!Hooks._hooks.preCreateChatMessage || Hooks._hooks.preCreateChatMessage?.findIndex(f=>f.toString().includes('chatmessagetargetflags'))==-1)
  Hooks.on(`preCreateChatMessage`, async (message, data, options, user) => {
    //chatmessagetargetflags
    //console.log([...game.user.targets]);
    if (message.data.flavor?.toUpperCase().includes('ATTACK') || message.data.flavor?.toUpperCase().includes('CAST'))
      message.data.update({"flags.world.targetIds": [...game.user.targets].filter(t=>t.visible).map(t=>t.id)});
    
    if (message.data.flavor?.toUpperCase().includes('DAMAGE')) {
      let dt = message.data.flavor.split(' ')[message.data.flavor.split(' ').indexOf('Damage')-1] || 'null';
      message.data.update({"flags.world.damageType": dt});
    }
    
    if (message.data.flavor?.toUpperCase().includes('HEALING')) {
      message.data.update({"flags.world.targetIds": [...game.user.targets].filter(t=>t.visible).map(t=>t.id)});
      message.data.update({"flags.world.damageType": 'Healing'});
    }
    
    if (message.data.flavor?.toUpperCase().includes('ROLLING SAVES'))
      message.data.update({"flags.world.targetIds": [...game.user.targets].filter(t=>t.visible).map(t=>t.id)});
    
  });

function itemFilter(i){
  if( actor.data.type !== 'character' )
    return true;
  if( !i.data.type )
    return false;
  if( i.data.type === undefined )
    return false;
  if( !i.data.data.activation )
    return false;
  if( i.data.data.activation.type === '' || 
    i.data.data.activation.type === undefined || 
    i.data.data.activation.type === 'none' ){
    return false;
  }
  if( i.data.type === "weapon"){
    if( i.data.data.equipped )
      return true;
    return true; //Unequipped Items
  }
  if( i.data.type === "spell"){
    if( i.data.data.preparation ){
      if(i.data.data.preparation.mode ==="prepared"  )
        return i.data.data.preparation.prepared;
      else //( i.labels.level === "Cantrip")
        return true;
    }
    return false ;
  }
  if( i.data.type === "consumable" ){
    if( i.data.data.consumableType !== "ammo")
      return true;
    return false;
  }
  
  if( i.data.type === "loot" ) return true;
  if( i.data.type === "feat" )
    return true;
  if( i.data.type === "equipment" )
    return true;

  return false ;
}

let spells = {};
if (actor.data?.data?.spells) {
  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
  for (const [key, value] of Object.entries(spells)){
    if (value.max > 0) {
      for (let level = parseInt(key.substr(-1)); level > 0; level--) {
        if ('spell'+level === key ){
          spells['spell'+level].slotsAvailable = false;
        }
        if (value.value > 0)
          spells['spell'+level].slotsAvailable = true;
      }
    }
  }
  await actor.update({'data.spells': spells});
}

$(`div[id*=${_uuid}]`).show();

let otherActions = false;
//if($(`[id^=item-rolls-dialog-${_uuid}]`).length) 
//  $(`[id^=item-rolls-dialog-${_uuid}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});

let unavailable = 'rgba(120,120,120,0.5) !important';

//if (canvas.tokens.controlled.length !== 1) return ui.notifications.warn("Please Select One Token");
let content=`
<style>
.ith {
  border-bottom: 1px solid #555; 
  margin-top: 2px;
  width: 90%;
}
.ilh {
  border-bottom: 1px solid #555; 
  margin-top: 2px;
  width: 80%;
}/*url('../icons/svg/d20-grey.svg')*/
.item-img:hover { cursor: pointer ; box-shadow: 0 0 8px red; }
.item-img{vertical-align:middle;margin-bottom:1px;border:1px solid #444}
</style>`;

let header = `${actor.data.name}`;
console.log(type)
if (type) header = `${(type==='feat'?'Features':((['equipment', 'loot'].includes(type))?type:type+'s')).capitalize()}`;
//<a style="float:left;margin-left:0;" onclick="game.actors.get('${actor.id}').sheet.render(true)" title="Sheet"><img src="${actor.data.token.img}" height="20" style="border:unset;vertical-align:middle;"/></a>${actor.data.name} - 
if (!type)
content+=`
<div style="display: grid; grid-template-columns: repeat(5,auto); border-bottom:0px solid black;border-top:0px solid black;margin-bottom:.5em">
<div style="font-size:1.1em"><a style="" class="roll-dialog-button-${_uuid}" name="${_uuid}-abilities-test">Abilities</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${_uuid}" name="${_uuid}-abilities-save">Saves</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${_uuid}" name="${_uuid}-skills-check">Skills</a> </div>
<div style="font-size:1.1em;"><a style="margin-right:5px" onclick="_token.toggleCombat(game.combats.active);"><i class="fas fa-fist-raised"></i></a><a  onclick="_token.actor.rollInitiative()">Initiative</a></div>
<div style="font-size:1.1em;"><a onclick="game.macros.find(m=>m.data.flags.world?.name==='Actor Effects List').execute('${_uuid}');"><i class="fas fa-bolt"></i></a></div>
</div>`;

let doFilter = ["feat", "spell"];

let actorItems;
if (type) {
  if (doFilter.includes(type)) actorItems = actor.itemTypes[type].filter(i => itemFilter(i));
  else  actorItems = actor.itemTypes[type];
}
else actorItems = actor.items.filter(i => itemFilter(i));

let items = {};//.filter(x => itemFilter(item))
for (const item of actorItems) {
    
  let available = true;
  if (item.data.data.uses?.value === 0 && item.data.data.uses?.max !== 0 ) available = false;
  //if ( item.type === 'spell') console.log(item.data.name, item.data.data.level, actor.data.data.spells['spell'+item.data.data.level]?.slotsAvailable);
  //console.log(actor.data.data.spells);
  if ( item.type === 'spell' &&  !actor.data.data.spells['spell'+item.data.data.level]?.slotsAvailable) available = false;
  
  if (item.data.data.quantity===0) available = false;
  
  if (item.data.data.uses?.value !== 0 && item.data.data.uses?.max > 0 ) available = true;
  if( item.data.type === "spell"){
    if( item.data.data.preparation?.mode === "prepared"){
      if(! item.data.data.preparation.prepared )
        available = false ;
    }
  }
  if ( item.type === 'spell' && item.data.data.preparation?.mode === "atwill")
    available = true;
  if (item.type === 'spell' && item.data.data.level === 0) available = true;
  if ( item.data.data.consume?.type === "charges") {
    if (actor.items.get(item.data.data.consume?.target).data.data.uses.value < item.data.data.consume.amount) available = false;
    else available = true;
  }
  
  let title = '';
  if (item.type === 'spell'){
    title +=  `${item.labels.level}\n`;
    title +=  `${item.labels.school}\n`;
    if (item.labels.components.length)  title += item.labels.components.join(', ');
    if (item.labels.components.includes('M')) title += `\n${item.labels.materials}`;
    if (item.labels.range) title += '\nRange: ' + item.labels.range;
    if (item.labels.target) title += '\nTarget: ' + item.labels.target;
  }
  let ammoSelect = '';
  if ( item.data.data.consume?.type === "ammo" && item.data.data.consume?.target !== item.id){
    let ammo = actor.items.filter(i => i.data.data.consumableType === item.data.data.consume?.type);
    if (ammo) {
      ammoSelect = `<select id="${item.id}-ammo" name="${item.id}" class="ammo-select" style="display:inline;height:18px;margin-left: 20px; vertical-align:bottom;"><option value="" ></option> ` ;
      let ammoItem = actor.items.get(item.data.data.consume.target);
      for (let a of ammo) {
        ammoSelect += `<option id="${a.id}-option" value="${a.id}" ${item.data.data.consume.target===a.id?' selected ':''}>${a.data.name} ${a.data.data.quantity>1?'('+a.data.data.quantity+')':''}</option>`;
      }
      ammoSelect += `<select>`;
    }
  }
  
  let equipped = ``;
  /*
  if (item.data.data.equipped)
    equipped = ` <i class="fas fa-user-alt" style="font-size:10px"></i> `;
    */
  let text = `<div id="${item.id}" > <img  src="${item.img}"  class="item-img" height="20" name="${item.id}" title="Roll"><span style="vertical-align:bottom;"> 
        <a id="roll-${item.id}" name="${item.id}" title="${title}" 
        class=" ${(item.type === 'spell' && item.data.data.level !== 0 && !(item.data.data.uses?.max !== undefined  && item.data.data.uses?.max !== 0 && item.data.data.uses?.max !== '' && item.data.data.uses?.max !== null))?_uuid+'-spell'+item.data.data.level:''}" 
        style="${item.data.data.equipped?'text-decoration:underline;':''} ${available?'':'color: '+ unavailable}">${item.data.name} ${item.data.data.quantity>1?'('+item.data.data.quantity+')':''} 
      ${item.data.data.uses?.max && item.data.data.uses?.max !== 0 && item.data.data.uses?.max !== '' && item.data.data.uses?.max !== null ? '('+ item.data.data.uses?.value +'/'+item.data.data.uses?.max+')':''} </span></a>${equipped}${ammoSelect}</div> `;
    

  let level = "none";
  if (item.labels.level)
    level = 'Level ' + item.data.data.level;
    if (item.data.data.level === 0)
      level = 'Cantrip';
    if (item.data.data.preparation?.mode === 'innate')
      level = 'Innate';//level = 'Innate';
    if (item.data.data.preparation?.mode === 'pact')
      level = 'Pact Magic';
  let itemType = item.type;
  
  //if (item.type === 'spell' && item.data.data?.preparation?.mode === 'innate') itemType = 'feat';
  let activation = item.labels.activation
  if (!sortByActionType) activation = 'All'
  
  
  if (!items[itemType])
    items[itemType] = {};
  if (!items[itemType][activation])
    items[itemType][activation] = {};
  if (!items[itemType][activation][level])
    items[itemType][activation][level] = {};
  if (!items[itemType][activation][level][item.data.name])
    items[itemType][activation][level][item.data.name] = [];
    items[itemType][activation][level][item.data.name].push(text);
  
}
console.log(items);
let sections = '';//'<div style="width: 298px; height: 658px; overflow: scroll;">';
for (const key of Object.keys(items).sort().reverse()) {
  let h = key.capitalize();
  if (h === 'Feat') h = 'Feature';
  if (h !== 'Equipment') h = h+'s';
  if (!type) sections += `<h2 class="iah">${h}</h2>`;
  sections += `<div  style="" class="section" id="act-${key.capitalize()}"> `;
  for (const activation of Object.keys(items[key]).sort()) {
  if (sortByActionType)
    sections += `<h3 class="ith" style="">${activation.capitalize().replace('1 ', '')}</h3><div style="margin-bottom:.5em">`;
  
  for (const level of Object.keys(items[key][activation]).sort()) {
    
    if (level !== 'none')
      sections += `<h4 class="ilh" style="">${level}</h4><div style="margin-bottom:.5em">`;
    for (const name of Object.keys(items[key][activation][level]).sort()){
      for (const item of Object.values(items[key][activation][level][name]).sort()){
        sections += item; 
      }
    }
    if (level !== 'none')
      sections += `</div>`;
  }
  sections += `</div>`;  
  }
  sections += `</div>`;
}
content += sections ;

//content =  TextEditor.enrichHTML(content);
//-------------------------------------------------------------
let folder = game.folders.getName('Actions')?.id;
if (folder && otherActions && actor.data.type === 'character'){
   content += `<h2 class="iah">Other Actions</h2><div>`;

   for (const item of game.items.filter(item => item.data.folder === folder)) {
  content += `<div> <img  src="${item.img}"  class="item-img" height="20" name="${item.id}" title="Roll"><span> <a id="roll-${item.id}" name="${item.id}">
  ${item.data.name}</a></span></div>`;
  } 
  content += `</div>  `;
}
content += '</div>';

//----------------other-----------------//

let other = [];
//for ( let item of actor.items.filter(i=> i.type !== 'feat' && i.type !== 'class' && ( i.data.data.activation?.type === '' || i.data.data.activation?.type === undefined ||  i.data.data.activation?.type === 'none')))
if (!type) {
  for (let item of actor.items.filter(i => !itemFilter(i) && i.type !== 'feat' && i.type !== 'spell' && i.type !== 'class' )) {
    other.push(`<a id="roll-${item.id}" name="${item.id}">${item.name}${item.data.data.quantity>1?' ('+item.data.data.quantity+')':''} </a>`);
  }
  if (other.length > 0)
    content += `<h2 class="iah">Other Equipment</h2><div style="margin-bottom:.5em">` + other.join(', ') + `</div>`;
}
//----------------currency-----------------//
if (actor.data.type === 'character' && !type) {
  content += `<h2>Currency</h2><div style="display: grid; grid-template-columns:repeat(${Object.keys(actor.data.data.currency).length}, 1fr);">`
  for (let [key, value] of Object.entries(actor.data.data.currency))
    content += `<div>
      ${key}: <a id="${actor.id}-${key}" name="${actor.id}" class="editable-span" data-key="data.currency.${key}" text="${value}">${value}</a>
    </div>`
  content += `</div>`;
}
//-------------------------------------------------------------
//let d = new 
Dialog.persist({
  title: header,
  content:  content,
  buttons: {},
  render: (html) => {
    
      if (closeOnMouseLeave) {
        //$(`#${w_id}`).mouseleave(async function(e){
        //  Object.values(ui.windows).find(w=> w.id===w_id).close();
        //});
        $(`#${w_id}`).mouseenter(function(e){
          $(`#${w_id}`).removeClass('hide');
        });
        
        $(`#${w_id}`).mouseleave(async function(e){
          $(`#${w_id}`).addClass('hide');
          await new Promise((r) => setTimeout(r, closeTimeout));
          if ($(`#${w_id}`).hasClass('hide'))
            Object.values(ui.windows).find(w=> w.id===w_id).close();
        });  
      }
        
      
      html.find('.iah, .ith, .ilh ').contextmenu(async function(e){
        $(this).next().toggle();
      });
      
      if (!type && $(`#items-dialog-${_uuid} > header`).find('img').length===0) {
        $(`#items-dialog-${_uuid} > header`).prepend(`<a style="margin: 0 0 0 0" id="${_uuid}-header-img" name="${_uuid}"><img src="${actor.data.token.img}" height="23" style="border:unset;vertical-align:middle;margin:0 3px 1px 0;"/></a>`);
        $(`#items-dialog-${_uuid} > header`).attr('style','padding: 0px 8px 0px 3px !important;')
      }
      if (type) $(`#items-dialog-${_uuid}-${type} > header > h4`).html(header);
      
      html.find(`#${_uuid}-header-img`).click(async function(e){
        game.macros.find(m=>m.data.flags.world?.name==='Character Dialog').execute();
      });
      
      html.find(`#${_uuid}-header-img`).contextmenu(async function(e){
        console.log("title click", this.name);
        if (this.name.includes("Token"))
          canvas.tokens.get(this.name.split('_')[3]).actor.sheet.render(true);
        if (this.name.includes("Actor"))
          game.actors.get(this.name.split('_')[1]).sheet.render(true);
      });
      
      html.find(".editable-span").click(async function(e){
        if (!$(this).attr("text")) $(this).attr("text", $(this).html());
        let text = $(this).attr("text");
        let id = $(this).attr("id");
        $(this).toggle();
        //console.log(id, text, $(this));
        $(this).before(`<input id="${id}-input" type="text" value="${text}" style="width:30px; height:${$(this).height()}px  ;font-size:${$(this).css('font-size')};"></input>`);
        $(`input#${id}-input`).select();
        $(`#${id}-input`).keyup(async function(e){
          if (e.which !== 13) return;
          let input = $(this).val();
          let value = parseInt($(this).val());
          if (value == undefined || value == null ) {
            $(this).next().toggle();
            $(this).remove();
            ui.notifications.error('invalid currency ammount');
            return;
          }
          
          let actorid = $(this).next().attr("name");
          let key = $(this).next().attr("data-key");
          //console.log(input, value, input.at(0), a)
          if (input.at(0) === '+' || input.at(0) === '-') await actor.update({[`${key}`]: getProperty(actor.data, key) + value});
          else await actor.update({[`${key}`]: value});
          $(this).next().attr("text", getProperty(actor.data, key));
          $(this).next().html(getProperty(actor.data, key));
          $(this).next().toggle();
          $(this).remove();
        });
      });
      
      html.find(`.roll-dialog-button-${_uuid}`).each(function() {
        $(this).click(async function(e){
          let vars = this.name.split('-');
          console.log(vars)
          game.macros.find(m=>m.data.flags.world?.name==='Roll Dialog').execute({
            actorUuid: vars[0].replaceAll('_','.'),
            rollType: vars[1],
            abilType: vars[2], 
            position: {left: e.clientX - 15, top: e.clientY + 15}, 
            closeOnMouseLeave});
          //game.macros.find(m=>m.data.flags.world?.name==='Roll Dialog').execute(vars[0].replaceAll('_','.'),vars[1],vars[2], {left: e.clientX - 15, top: e.clientY + 15}, false);
        });
      });
      
      html.find(`.ammo-select`).change(async function(){
        await actor.updateEmbeddedDocuments("Item", [{_id: this.name, "data.consume.target": $(`select#${this.name}-ammo`).val()}]);
      });
      
      html.find("a[id^=roll]").click(async function(e){
        let item = actor.items.get(this.name);
        console.log(item);
        if(!item) item = game.items.get(this.name);
        if($(`#item-rolls-dialog-${item.id}`).length) return $(`#item-rolls-dialog-${item.id}`).remove();
        let text  = `<style>
          .my-inline-roll {
          background: #DDD;
          padding: 1px 4px;
          border: 1px solid #4b4a44;
          border-radius: 2px;
          white-space: nowrap;
          word-break: break-all;
          }
          /*
          .jlnk__entity-link {
	          color: rgba(0, 0, 0, 0.8) !important;
	          background: #DDD !important;
          }
          */
        </style>
        <div class="item-rolls" id="rolls-${item.id}">
        <a id="${item.id}-chat-description" style="float:right; clear:both;" title="${item.data.name} description">&nbsp;<i class="fas fa-comment-alt"></i></a>
        <div id="${item.id}-description"> <img src="${item.data.img}" width="32" style="border:unset; float:left;  margin: 0 5px 0 0;"/> ${item.data?.data?.description?.value}</div>`;
        //ChatMessage.create({ flavor: '${item.data.name}', content: $(this).prev().html()});clear:both;
        //-----------LABELS AND ROLLS---------------//
          if (item.labels.level) text +=  `${item.labels.level} `;
          if (item.labels.school) text +=  `${item.labels.school} `;
          if (item.labels.components?.length)  text += item.labels.components.join(', ');
          if (item.labels.components?.includes('M')) text += `<br>Materials: ${item.labels.materials}`;
          if (item.labels.activation && item.labels.activation !== 'None') text += '<br>Activation: ' + item.labels.activation;
          if (item.labels.range && item.labels.range !== '5 Feet') text += '<br>Range: ' + item.labels.range;
          if (item.labels.target) text += (game.dnd5e.canvas.AbilityTemplate.fromItem(item))?`<br><a id="${item.id}-inline-targeting" name="${item.id}" class="my-inline-roll"><i class="fas fa-bullseye"></i> Template:  ${item.labels.target}</a>`:`<br>Targets:  ${item.labels.target}`;
          if (item.labels.duration && item.labels.duration !== 'Instantaneous') text += '<br>Duration: ' + item.labels.duration;
          if (item.labels.save) text +=`<br><a id="${item.id}-inline-dc" name="${item.id}" class="my-inline-roll"><i class="fas fa-dice-d20"></i> Save ${item.labels.save}</a>`;
          if (item.data.data.recharge?.value) 
            if (!item.data.data.recharge?.charged) 
              text +=`<br><a id="${item.id}-inline-recharge" name="${item.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Recharge</a>`;
            else
              text +=`<br><a id="${item.id}-inline-recharge" name="${item.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Charged</a>`;
          let foundEffects = game.dfreds?.effects?.all.filter(e => item.data.name?.toUpperCase()===e.name.toUpperCase());
          if (foundEffects?.length > 0) 
            text += `<br><a id="${item.id}-effect-button" class="my-inline-roll" name="${foundEffects[0].name}" style="margin-right: .3em"><i class="fas fa-bolt" data-mode="${item.data.data.range.units==='self'?'self':'targets'}"></i> Apply ${foundEffects[0].name} to ${item.data.data.range.units==='self'?'Self':'Targets'}</a>`; 
        //-----------ROLLS---------------//
        //let actorName = ``;
        //if (token.data.disposition > 2) actorName = `${actor.name} `;
        text  += `<table>`;
        
        //-----------ATTACK---------------//
        let attackToHit = item.getAttackToHit();
        
        if (attackToHit) {
          
          let attackRollTerms = Roll.parse('1d20 + ').concat(new Roll(attackToHit.parts.join(' + '), attackToHit.rollData).terms).filter(t=>t.formula !== '0');
          if (attackRollTerms[attackRollTerms.length-1].constructor.name === 'OperatorTerm') attackRollTerms.pop();
          attackRollTerms = attackRollTerms.filter((c, i)=>c.formula!==' + '||c.formula!==attackRollTerms[i+1]?.formula)
          let attackRoll = Roll.fromTerms(attackRollTerms).formula
          //<a class="inline-roll roll" title="Bite Attack" data-mode="roll" data-flavor="Bite Attack" data-formula="1d20 + 4 + 3"><i class="fas fa-dice-d20"></i> 1d20 + 4 + 3</a></td><td align="right">
          text += '<tr><th align="left">Attack</th><td style="color: #000" >[[/r ' //+ attackRoll + 
          + game.dnd5e.dice.simplifyRollFormula('1d20 + ' + new Roll(attackToHit.parts.join(' + '), attackToHit.rollData).formula, { preserveFlavor:true }) + 
          
            //Roll.parse(attackToHit.parts.reduce((a,t) => a+=" + " + t , ""), attackToHit.rollData).reduce((a,t) => a+=t.formula, "") +
            //game.dnd5e.dice.simplifyRollFormula('1d20 + ' + new Roll(attackToHit.parts.join(' + '), attackToHit.rollData).formula) + 
            //Roll.fromTerms(new Roll(attackToHit.parts.join(' + '), attackToHit.rollData).terms.filter((c, i)=>c.formula!==' + '||c.formula!==x[i+1]?.formula))
            ` # ${item.data.name} - Attack]] 
            <a id="${item.id}-inline-adv"  class="my-inline-roll" >ADV</a>
            <a id="${item.id}-inline-d20"  class="my-inline-roll" style="display:none"><i class="fas fa-dice-d20"></i></a>
            <a id="${item.id}-inline-dis"  class="my-inline-roll" >DIS</a>
            </td></tr>` ;
        }
        
        //-----------DAMAGE---------------//
        let damageRolls = [];  
        let dpIndex = 0;
        let itemRollData = item.getRollData();
        
        if (item.data.data.damage)
        for (let dp of item.data.data.damage.parts) {
          let rollFlavor = item.name;
          let damageRoll = new Roll(dp[0], itemRollData);
          for (let term of damageRoll.terms.filter(term=> term.constructor.name === 'Die' || term.constructor.name === 'MathTerm' )) {
            if (term.options.flavor && term.options.flavor !== dp[1]) rollFlavor = term.options.flavor;
            term.options.flavor = dp[1];
          }
          //console.log(game.dnd5e.dice.simplifyRollFormula(damageRoll.formula, { preserveFlavor:true }))
          let dr = '<tr><th align="left">' + (rollFlavor===item.name?dp[1].capitalize():rollFlavor) + 
             `</th><td>[[/r `+ game.dnd5e.dice.simplifyRollFormula(damageRoll.formula, { preserveFlavor:true }) + 
             `# ${rollFlavor} - ${dp[1]?dp[1].capitalize():''} ${(dp[1] === 'healing'?'':'Damage')} ]] `;
             //${Roll.fromTerms(damageRoll.terms)._formula}  
            //((dpIndex==0 && itemRollData.bonuses[itemRollData.item.actionType]?.damage)?`${new Roll(itemRollData.bonuses[itemRollData.item.actionType].damage).formula}`:``) + 
          if (item.data.data.scaling?.formula)  
            dr += `<a id="${item.id}-inline-scaling"  class="my-inline-roll" name="${item.id}"> + ${item.data.data.scaling?.formula}</a> `;
          if (attackToHit)  
          dr += `<a id="${item.id}-inline-crit"  class="my-inline-roll">Critical</a>`;
          
          if (dp[1] === 'healing')
            dr += `<a id="${item.id}-inline-max"  class="my-inline-roll">Max</a>`;
            dr+='</td></tr>';
            
          damageRolls.push(dr);
          
          if (dpIndex==0 && itemRollData.bonuses[itemRollData.item.actionType]?.damage) {
            rollFlavor = '';
            let bonusDamageRoll = new Roll(itemRollData.bonuses[itemRollData.item.actionType].damage);
            for (let term of bonusDamageRoll.terms.filter(term=> term.constructor.name === 'Die' || term.constructor.name === 'MathTerm' )) {
              if (term.options.flavor && term.options.flavor !== dp[1]) rollFlavor = term.options.flavor;
            }
            let db = '<tr><th align="left"> Bonus '+
             `</th><td>[[/r ${bonusDamageRoll.formula} # Bonus - ${rollFlavor?rollFlavor:dp[1].capitalize()} ${(dp[1] === 'healing'?'':'Damage')} ]] `;
             db += `<a id="${item.id}-inline-crit"  class="my-inline-roll">Critical</a>
             </td></tr>`;
             damageRolls.push(db)
          }
          
          
          dpIndex++;
        }
        
        if (!actor.shield?.data.data.equipped && item.data.data?.damage?.versatile){
          let dt = item.data.data.damage.parts[0][1];
          damageRolls.push(`<tr><th align="left">Versatile</th><td>[[/r ` + 
            Roll.replaceFormulaData(item.data.data.damage.versatile, item.getRollData())  + 
            ` # ${item.data.name} - Versatile ` +  (dt ? dt.capitalize() : '') + ` Damage]] 
            <a id="${item.id}-inline-crit"  class="my-inline-roll" >Critical</a>
            </td></tr>`);
        }
        if (item.data.data.formula)
          damageRolls.push(`<tr><th align="left">Other</th><td>[[/r ${Roll.replaceFormulaData(item.data.data.formula, item.getRollData())} # ${item.data.name} - Other Damage]]
          <a id="${item.id}-inline-crit"  class="my-inline-roll" >Critical</a>
          </td></tr>`);
        
        
        for (let dr of damageRolls){
          text += dr;
        }
          
        text += `</table></div>`;
        //--------------ITEM USES------------------//
        if (item.data.data.uses?.max > 0 ){
          let usesCount = `Uses: <a id="${item.id}-uses-count" class="my-inline-roll" name="${item.id}">${item.data.data.uses?.value}/${item.data.data.uses?.max}</a>`;
          text += usesCount;
        }
        //--------------AMMO USES------------------//
        if ( item.data.data.consume?.type === "ammo"){
          let ammoItem  = actor.items.get(item.data.data.consume.target);
          if (ammoItem) {
            let ammoCount = `${ammoItem?.data.name} Count: <a id="${item.id}-ammo-count" name="${item.data.data.consume.target}" 
            class="my-inline-roll" style="">${ammoItem.data.data.quantity}</a>`;
            text +=  ammoCount;
          }
        }
        //-----------OTHER ITEM USES---------------//
        if ( item.data.data.consume?.type === "charges"){
          let chargeItem = actor.items.get(item.data.data.consume.target);
          //console.log(chargeItem);
          if (chargeItem) {
            let chargeCount = `${chargeItem?.data.name} Uses: <a id="${item.id}-charges-count" name="${item.data.data.consume.target}" 
            class="my-inline-roll" style="">${chargeItem.data.data.uses.value}/${chargeItem.data.data.uses.max}</a>`;
            text +=  chargeCount;
          }
        }
        //--------------Spell SLOTS----------------//
        if (item.type === 'spell' && !(item.data.data.uses?.max > 0 )) {
          let spellTable = `<table>`;
          let spellTableHeaders = `<tr><th align="left">Level</th>`;
          let spellTableColumns = `<tr><th align="left">Slots</th>`;
          if (item.data.data.level === 0){
            spellTableHeaders += `<th style="text-decoration: underline"'>Cantrip</th>`
            spellTableColumns += `<td  style="text-align:center"><a id="${item.id}-spell-level-0" name="0" 
               class="my-inline-roll spell-level-0" data="${item.id}"><i class="fas fa-infinity"></i></a></td>`;
          } else {
          for (const [key, value] of Object.entries(actor.data.data.spells)){
             if (value.max > 0 && item.data.data.level <= parseInt(key.substr(-1))) {
               spellTableHeaders += `<th ${((item.data.data.level === parseInt(key.substr(-1)))?'style="text-decoration: underline"':'style=""')}>${key.substr(-1)}</th>` ;
               spellTableColumns += `<td  style="text-align:center"><a id="${item.id}-spell-level-${key.substr(-1)}" name="${key.substr(-1)}" 
               class="my-inline-roll spell-level-${key.substr(-1)}" style="" data="${item.id}">${value.value}/${value.max}</a></td>`;
             }
          }
          }
          spellTable += spellTableHeaders + `<tr>` + spellTableColumns + `<tr>` + `</table>`;
          text += spellTable;
        }
        
        let d = new Dialog({
              title : `${item.data.name}`, 
              content : TextEditor.enrichHTML(text),
              buttons : {},
              render: (app) => {
                app.find('a').each(async function(){
                  $(this).css('color', 'white');
                  let foundEffects = game.dfreds.effects.all.filter(e => $(this)[0].outerText.trim().toUpperCase() === (e.name.toUpperCase()));
                  if (foundEffects.length > 0) {
                    let $link = $(`<a class=""><i class="fas fa-bolt" title="Left Click for Targets\nRight Click for Self" style="margin-left:.25em"></i></a>`);
                    $link.click(async ()=>{
                      let effect = this.outerText.trim().split(' ').map(e=>e.capitalize()).join(' ');
                      let targets = [...game.user.targets].map(t=> t.actor.uuid);
                      if (targets.length===0)
                        targets = canvas.tokens.controlled.map(t=> t.actor.uuid);
                      await game.dfreds.effectInterface.toggleEffect(effect, {uuids:targets});
                    });
                    $link.contextmenu(async ()=>{
                      let effect = this.outerText.trim().split(' ').map(e=>e.capitalize()).join(' ');
                      let targets = [_uuid.replaceAll('_','.')];
                      await game.dfreds.effectInterface.toggleEffect(effect, {uuids:targets});
                    });
                    $(this).after($link);
                  }
                });
                let header = `${item.data.name}`;
                
                if (closeOnMouseLeave) {
                  $(`#item-rolls-dialog-${_uuid}-${item.id}`).mouseenter(function(e){
                    $(`#item-rolls-dialog-${_uuid}-${item.id}`).removeClass('hide');
                  });
                  
                  $(`#item-rolls-dialog-${_uuid}-${item.id}`).mouseleave(async function(e){
                    $(`#item-rolls-dialog-${_uuid}-${item.id}`).addClass('hide');
                    await new Promise((r) => setTimeout(r, closeTimeout));
                    if ($(`#item-rolls-dialog-${_uuid}-${item.id}`).hasClass('hide'))
                      Object.values(ui.windows).filter(w=> w.id===`item-rolls-dialog-${_uuid}-${item.id}`)[0].close();
                  });  
                }
                  
                  
                
                app.find(` .inline-roll.roll`).contextmenu(async function(e) {
                  console.log(`#item-rolls-dialog-${_uuid}-${item.id} .inline-roll`)
                  let targetElement = $(this);
                  let oldFormula = targetElement.attr('data-formula');
                  let flavor = targetElement.attr('data-flavor');
                  let flavorType = '';
                  if (flavor.toUpperCase().includes('ATTACK')) flavorType = ' + Attack (adv/dis)';
                  if (targetElement.attr('data-flavor').toUpperCase().includes('DAMAGE')) flavorType = ' + Crit Dice';
                  let newRoll = new Roll(oldFormula);
                  console.log(newRoll)
                  let terms = [];
                  for (let t of newRoll.terms.filter(t=> t.constructor.name === 'Die' || t.constructor.name === 'OperatorTerm'))
                    terms.push(t)
                    
                  let formula = Roll.fromTerms(terms)._formula;
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', flavor + flavorType);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', flavor.replace(flavorType,''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                  
                app.find(`#item-rolls-dialog-${_uuid}-${item.id} > header > h4`).html(header);
                
                app.find(`a[id^=${item.id}-header-roll]`).click(async function(e){
                  actor.items.get(`${item.id}`).roll()
                });
                
                app.find(`a[id^=${item.id}-effect-button]`).click(async function(e){
                  let effect = $(this).attr('name');
                  let mode = $(this).attr('data-mode');
                  if (mode !== 'self') {
                    console.log([...game.user.targets].map(t=>t.actor.uuid));
                    await game.dfreds.effectInterface.toggleEffect(effect, {uuids:[...game.user.targets].map(t=>t.actor.uuid)});
                  } else {
                    await game.dfreds.effectInterface.toggleEffect(effect, {uuids:[_uuid.replaceAll('_','.')]});
                  }
                });
                
                app.find(`a[id^=${item.id}-effect-button]`).contextmenu(async function(e){
                  let effect = $(this).attr('name');
                  let mode = $(this).attr('data-mode');
                  await game.dfreds.effectInterface.toggleEffect(effect, {uuids:[_uuid.replaceAll('_','.')]});
                  
                });
                
                app.find(`a[id^=${item.id}-chat-description]`).click(async function(e){
                  ChatMessage.create({flavor: `${item.data.name}`, speaker:ChatMessage.getSpeaker({actor: item.parent}),  content:  $(this).next().html()})
                });//flavor: `${item.data.name}`,`@ActorEmbeddedItem[${item.parent.id}][${item.id}]{${item.data.name}}<br>` +
                
                app.find(`a[id^=${item.id}-inline-targeting]`).click(async function(e){
                  game.dnd5e.canvas.AbilityTemplate.fromItem(item).drawPreview()
                });
                
                app.find(`a[id^=${item.id}-inline-dc]`).click(async function(e){
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${item.labels.save}</h3>`);
                  let dcArray = item.labels.save.split(' ');
                  let ability = dcArray[dcArray.length-1];
                  let dc = parseInt(dcArray[dcArray.length-2]);
                  let abil = Object.keys(CONFIG.DND5E.abilities).find(key => CONFIG.DND5E.abilities[key] === ability);
                  ChatMessage.create({speaker:ChatMessage.getSpeaker({token: actor.getActiveTokens()[0]}), flavor: `Rolling Saves for ${item.data.name}...`})
                  for (let target of game.user.targets) {
                    let roll = await new Roll(`1d20 + ${target.actor.data.data.abilities[abil].save}`).roll({ async: true });
                    let result;
                    if (roll.total < dc)
                      result = 'Failed';
                    else
                      result = 'Succeeded';
                      
                    roll.toMessage({speaker:ChatMessage.getSpeaker({token: actor.getActiveTokens()[0]}),flavor:`${target.name}<br><b>${result}</b> ${ability} Save for ${item.name}`,"flags.world.save":{[target.id]:result}},{rollMode: 'blindroll'});
                    //console.log(roll.total)
                  }
                });
                app.find(`a[id^=${item.id}-inline-recharge]`).click(async function(e){
                  let roll = await new Roll(`1d6`).roll({ async: true });
                  let result ;
                  if (roll.total < item.data.data.recharge.value) {
                    result = 'Failed';
                  }
                  else {
                    result = 'Succeeded';
                    await item.update({'data.recharge.charged':true});
                    $(this).html(`<i class="fas fa-dice-d6"></i> Charged`);
                  }
                  roll.toMessage({flavor:`${item.name} Recharge: ${result}`},{rollMode: 'gmroll'});
                 
                });
                
                app.find(`a[id^=${item.id}-inline-recharge]`).contextmenu(async function(e){
                  if (this.text.includes('Recharge')) {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Charged`);
                    await item.update({'data.recharge.charged':true});
                  }
                  else {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Recharge`);
                    await item.update({'data.recharge.charged':false});
                  }
                });
                
                app.find(`a[id^=${item.id}-inline-adv]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = 2;
                  if (e.shiftKey) 
                    numD20 = 3;
                  formulaArray.shift();
                  formulaArray.unshift(numD20+'d20kh');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','0 0 8px inset lawngreen');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with advantage');
                  targetElement.click();
                  $(this).next().click();
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with advantage',''));
                });
                
                app.find(`a[id^=${item.id}-inline-d20]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = parseInt(formulaArray[0].split('d')[0]);
                  formulaArray.shift();
                  formulaArray.unshift('1d20');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','unset');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                
                app.find(`a[id^=${item.id}-inline-dis]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  formulaArray.shift();
                  formulaArray.unshift('2d20kl');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','0 0 8px inset red');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with disadvantage');
                  targetElement.click();
                  $(this).prev().click();
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with disadvantage',''));
                });
                
                app.find(`a[id^=${item.id}-inline-max]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let oldFormula = targetElement.attr('data-formula');
                  let formula = oldFormula.replaceAll('d','*');
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' Max');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' Max',''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                
                app.find(`a[id^=${item.id}-inline-crit]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let oldFormula = targetElement.attr('data-formula');
                  let formula = new Roll(oldFormula).alter(2,0)._formula;
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' Critical');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' Critical',''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                app.find(`a[id^=${item.id}-inline-scaling]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let item = actor.items.get($(this).attr('name'));
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  formulaArray.push(` + ${item.data.data.scaling.formula}[${item.data.data.damage.parts[0][1]}]`);
                  let formula = formulaArray.join(' ');
                  formula = game.dnd5e.dice.simplifyRollFormula(formula, { preserveFlavor:true })
                  targetElement.attr('data-formula', formula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                
                app.find(`a[id^=${item.id}-inline-scaling]`).contextmenu(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let scalingFormula = `${item.data.data.scaling.formula}[${item.data.data.damage.parts[0][1]}]`;
                  let formula = targetElement.attr('data-formula');
                  let newFormula = formula.replace(scalingFormula,'');
                  newFormula = game.dnd5e.dice.simplifyRollFormula(newFormula, { preserveFlavor:true })
                  targetElement.attr('data-formula', newFormula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${newFormula}`);
                });
                
                app.find(`a[id^=${item.id}-uses-count]`).contextmenu(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses)
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${item.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    $(`#roll-${item.id}`).css('color', `unset`);
                    let whatUses = actor.items.filter(x => item.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).css('color', `unset`);
                  }
                });
                
                app.find(`a[id^=${item.id}-uses-count]`).click(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value > 0) {
                    uses.value--;
                    if (item.type === 'spell')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(item.labels.save===undefined?'':'<br>Save '+item.labels.save)}`});
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${item.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    $(`a#roll-${item.id}`).attr('style', `color : ${unavailable}`);
                    let whatUses = actor.items.filter(x => item.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                app.find(`a[id^=${item.id}-ammo-count]`).contextmenu(async function(e){
                  let count = $(`a#${item.id}-ammo-count`).html();
                    count++;
                  let a = actor.items.get(this.name);
                  await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                  $(`a#${item.id}-ammo-count`).html(count);
                  $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                  $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                  if (count > 0) $(`a#roll-${a.id}`).css('color', `unset`);
                });
                
                app.find(`a[id^=${item.id}-ammo-count]`).click(async function(e){
                  let count = parseInt($(`a#${item.id}-ammo-count`).html());
                  if (count > 0) {
                    count--;
                    let a = actor.items.get(this.name);
                    await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                    $(`a#${item.id}-ammo-count`).html(count);
                    $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                    $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                    if (count === 0) $(`a#roll-${a.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                app.find(`a[id^=${item.id}-charges-count]`).contextmenu(async function(e){
                  let item  = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a[id$='-charges-count'][name='${this.name}']`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    let whatUses = actor.items.filter(x => item.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`#roll-${w.id}`).css('color', `unset`);
                    $(`#roll-${item.id}`).css('color', `unset`);
                  }
                });
                
                app.find(`a[id^=${item.id}-charges-count]`).click(async function(e){
                  let item = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses, item.type);
                  if (uses.value > 0) {
                    uses.value--;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a[id$='-charges-count'][name='${this.name}']`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    let whatUses = actor.items.filter(x => item.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                    $(`a#roll-${item.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                app.find("a[id*=-spell-level-]").click(async function(e){
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${item.labels.save}</h3>`);
                  let spellLevel = this.name;
                  console.log(item.data.data.level, spellLevel, spellLevel-parseInt(item.data.data.level));
                  let upcast = spellLevel-parseInt(item.data.data.level);
                  if (spellLevel==="0" && actor.type==='character') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({token: item.parent.getActiveTokens()[0]}),flavor:`Casts ${item.name} ${upcast>0?'<br>Upcast ' + upcast:''} ${(item.labels.save===undefined?'':'<br>Save '+item.labels.save)}`});
                  if (spellLevel==="0" && actor.type==='npc') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({token: item.parent.getActiveTokens()[0]}),flavor:`Casts ${item.name} ${(item.labels.save===undefined?'':'<br>Save '+item.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
                  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
                  if (spells['spell'+spellLevel].value != 0) {
                    spells['spell'+spellLevel].value--;
                    if (spells['spell'+spellLevel].value < 1) {
                      for (const [key, value] of Object.entries(spells)){
                        if (value.max > 0) {
                          for (let level = parseInt(key.substr(-1)); level > 0; level--) {
                            if ('spell'+level === key ){
                              spells['spell'+level].slotsAvailable = false;
                            }
                            if (value.value > 0)
                              spells['spell'+level].slotsAvailable = true;
                          }
                        }
                      }
                    }
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        if (value.slotsAvailable) 
                          $(`.${_uuid}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${_uuid}-${key}`).attr('style', `color : ${unavailable}`);
                      }
                    }
                    await actor.update({'data.spells': spells});
                    $(this).html(spells['spell'+spellLevel].value+'/'+spells['spell'+spellLevel].max);
                    if (actor.type==='character')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({token: item.parent.getActiveTokens()[0]}),flavor:`Casts ${item.name} with a level ${spellLevel} slot  ${upcast>0?'<br>Upcast ' + upcast:''} ${(item.labels.save===undefined?'':'<br>Save '+item.labels.save)}`});
                    else
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({token: item.parent.getActiveTokens()[0]}),flavor:`Casts ${item.name} with a level ${spellLevel} slot  ${upcast>0?'<br>Upcast ' + upcast:''} ${(item.labels.save===undefined?'':'<br>Save '+item.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
                    if (actor.hasPlayerOwner)
                      ui.chat.processMessage(`/w GM ${actor.data.name} Level ${spellLevel} Slots: (${ spells['spell'+spellLevel].value}/${spells['spell'+spellLevel].max})`);
                  }
                });
                
                app.find("a[id*=-spell-level-]").contextmenu(async function(e){
                  let spellLevel = this.name;
                  if (spellLevel==="0") return;
                  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
                  if (spells['spell'+spellLevel].value != spells['spell'+spellLevel].max) {
                    spells['spell'+spellLevel].value++;
                  if (spells['spell'+spellLevel].value === 1) {
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        for (let level = parseInt(key.substr(-1)); level > 0; level--) {
                          if ('spell'+level === key ){
                            spells['spell'+level].slotsAvailable = false;
                          }
                          if (value.value > 0)
                            spells['spell'+level].slotsAvailable = true;
                        }
                      }
                    }
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        if (value.slotsAvailable) 
                          $(`.${_uuid}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${_uuid}-${key}`).attr('style', `color : ${unavailable}`);
                      }
                    }
                  }
                  await actor.update({'data.spells': spells});
                  $(this).html(spells['spell'+spellLevel].value+'/'+spells['spell'+spellLevel].max);
                  if (actor.hasPlayerOwner)
                    ui.chat.processMessage(`/w GM ${actor.data.name}<br>Gained a level ${spellLevel} slot <br>Level ${spellLevel} Slots: (${ spells['spell'+spellLevel].value}/${spells['spell'+spellLevel].max})<br>From: ${actor.items.get($(this).attr('data')).data.name}<br>`);
                  }    
                });
                
                let currentrollmode = game.settings.get("core", "rollMode");
                //$(`.inline-roll`).attr('data-mode', currentrollmode);
                //if (!$(`#item-rolls-dialog-${_uuid}-${item.id}`).hasClass('clickToToken'))
                $(`#item-rolls-dialog-${_uuid}-${item.id}`).click(async function(e){
                  console.log(_uuid);
                  let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === _uuid.replaceAll('_','.'))
                  if (placeables.length > 0)
                    placeables[0].control({releaseOthers:true});
                  else 
                    canvas.tokens.releaseAll();
                });
                app.find(`#item-rolls-dialog-${_uuid}-${item.id}`).addClass('clickToToken');
                //$(`.inline-roll`).attr('data-mode', game.settings.get("core", "rollMode"));
              },
              close:   html => {
              return}
              
            },{  id:`item-rolls-dialog-${_uuid}-${item.id}`, left : e.clientX-5 , top: e.clientY-5 }).render(true);
        
      });
      
      html.find("a[id^=roll]").contextmenu(async function(e){
        actor.items.get(this.name).sheet.render(true);
      });
      
      html.find(".item-img").click(async function(e){
        actor.items.get(this.name).roll(true);
      });
      
      //$(`#items-dialog-${_uuid}`).off('click');
      //if (!$(`#items-dialog-${_uuid}`).hasClass('clickToToken'))
      $(`#${w_id}`).click(async function(e){
        console.log(_uuid);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === _uuid.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id.includes(`${_uuid}`)))
          ui.windows[w.appId].bringToTop();//item-rolls-dialog-
      });
      //$(`#items-dialog-${_uuid}`).addClass('clickToToken');
  },
  close:   html => {
    console.log($(`[id^=item-rolls-dialog-${_uuid}]`).length ,closeOnMouseLeave )
    if ($(`[id^=item-rolls-dialog-${_uuid}]`).length && !closeOnMouseLeave) 
      $(`[id^=item-rolls-dialog-${_uuid}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});
    ui.nav._element.show();
    return;}
  },position
);
//d.render(true);