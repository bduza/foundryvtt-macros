let macro = this.data.command;
await jQuery.get("https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/Character%20Dialog.js", function(data) {
  console.log(data.slice(0, -1))
  console.log(macro)
  console.log(data.slice(0, -1) === macro)
});

function itemFilter(i){
  if( actor.data.type !== 'character' )
    return true;
  // Commented this out to make NPCs easier.   
  
  // Ignore items without type 
  if( !i.data.type )
    return false;
  if( i.data.type === undefined )
    return false;
  
  // Ignore items without activation
  if( !i.data.data.activation )
    return false;
  if( i.data.data.activation.type === '' || 
    i.data.data.activation.type === undefined || 
    i.data.data.activation.type === 'none' ){
    return false;
  }

  // Look for Equipped weapons
  if( i.data.type === "weapon"){
    if( i.data.data.equipped )
      return true;
    return true; //Unequipped Items
  }

  // Look for Prepared spells
  if( i.data.type === "spell"){
    if( i.data.data.preparation ){
      if( i.data.data.preparation.prepared )
        return true;
      if( i.labels.level === "Cantrip")
        return true;
    }
    return false ; //unprepared spells
  }

  // Consumables with an action that aren't ammunition
  if( i.data.type === "consumable" ){
    if( i.data.data.consumableType !== "ammo")
      return true;
    return false;
  }
  
  if( i.data.type === "loot" ) return true;
  // Features that are also Actions
  if( i.data.type === "feat" )
    return true;
  if( i.data.type === "equipment" )
    return true;
  //console.log(i);

  return false ;
}

//if (!token) return ui.notifications.warn("No Token");
let t = '';

if (!token) 
  token = _token;

if (!token)
  actor = game.user.character;
else
  actor = token.actor
  
token = null;

t = actor.uuid.replaceAll('.','_');
console.log('t: ', t)

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

let top = 3;
let left = window.innerWidth-610;
let height = window.innerheight-50;
let width = 300;

let position = Object.values(ui.windows).filter(w=> w.id === `items-dialog-${t}` && w.constructor.name === "Dialog")[0]?.position || 
  { height: height, width: width ,  top: top, left: left,  id:`items-dialog-${t}`};
position["id"] = `items-dialog-${t}`;

$(`div[id*=${t}]`).show();

let otherActions = false;
if($(`[id^=item-rolls-dialog-${t}]`).length) 
  $(`[id^=item-rolls-dialog-${t}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});

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

let header = `
<img src="${actor.data.token.img}" height="23" style="border:unset;vertical-align:middle;margin:0 3px 1px 0;"/>
<a style="margin: 0 0 0 0" id="${t}-header-title" name="${t}">${actor.data.name}</a>

`;
//<a style="float:left;margin-left:0;" onclick="game.actors.get('${actor.id}').sheet.render(true)" title="Sheet"><img src="${actor.data.token.img}" height="20" style="border:unset;vertical-align:middle;"/></a>

content+=`
<div style="display: grid; grid-template-columns: auto auto auto auto; border-bottom:1px solid black;border-top:1px solid black;margin-bottom:.5em">
<div style="font-size:1.1em"><a style="" class="roll-dialog-button-${t}" name="${t}-abilities-test">Abilities</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${t}" name="${t}-abilities-save">Saves</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${t}" name="${t}-skills-check">Skills</a> </div>
<div style="font-size:1.1em;"><a style="" onclick="_token.toggleCombat(game.combats.active);"><img src="icons/svg/combat.svg" width="14" height="14" title="Toggle Combat State"></a>&nbsp;<a style="" onclick="_token.actor.rollInitiative()">Initiative</a></div>
</div>`;
let items = {};
for (const x of actor.items.filter(x => itemFilter(x))) {
    
  let available = true;
  if (x.data.data.uses?.value === 0 && x.data.data.uses?.max !== 0 ) available = false;
  //if ( x.type === 'spell') console.log(x.data.name, x.data.data.level, actor.data.data.spells['spell'+x.data.data.level]?.slotsAvailable);
  //console.log(actor.data.data.spells);
  if ( x.type === 'spell' &&  !actor.data.data.spells['spell'+x.data.data.level]?.slotsAvailable) available = false;
  if ( x.data.data.consume?.type === "charges") if (actor.items.get(x.data.data.consume?.target).data.data.uses.value === 0) available = false;
  if (x.data.data.quantity===0) available = false;
  
  if (x.data.data.uses?.value !== 0 && x.data.data.uses?.max > 0 ) available = true;
  if( x.data.type === "spell"){
    if( x.data.data.preparation ){
      if(! x.data.data.preparation.prepared )
        available = false ;
    }
  }
  if (x.type === 'spell' && x.data.data.level === 0) available = true;
  let title = '';
  if (x.type === 'spell'){
    title +=  `${x.labels.level}\n`;
    title +=  `${x.labels.school}\n`;
    if (x.labels.components.length)  title += x.labels.components.join(', ');
    if (x.labels.components.includes('M')) title += `\n${x.labels.materials}`;
    if (x.labels.range) title += '\nRange: ' + x.labels.range;
    if (x.labels.target) title += '\nTarget: ' + x.labels.target;
  }
  let ammoSelect = '';
  if ( x.data.data.consume?.type === "ammo" && x.data.data.consume?.target !== x.id){
    let ammo = actor.items.filter(i => i.data.data.consumableType === x.data.data.consume?.type);
    if (ammo) {
      ammoSelect = `<select id="${x.id}-ammo" name="${x.id}" class="ammo-select" style="display:inline;height:18px;margin-left: 20px; vertical-align:bottom;"><option value="" ></option> ` ;
      let ammoItem = actor.items.get(x.data.data.consume.target);
      for (let a of ammo) {
        ammoSelect += `<option id="${a.id}-option" value="${a.id}" ${x.data.data.consume.target===a.id?' selected ':''}>${a.data.name} ${a.data.data.quantity>1?'('+a.data.data.quantity+')':''}</option>`;
      }
      ammoSelect += `<select>`;
    }
  }
  
  let equipped = ``;
  /*
  if (x.data.data.equipped)
    equipped = ` <i class="fas fa-user-alt" style="font-size:10px"></i> `;
    */
  let text = `<div id="${x.id}" > <img  src="${x.img}"  class="item-img" height="20" name="${x.id}" title="Roll"><span style="vertical-align:bottom;"> 
        <a id="roll-${x.id}" name="${x.id}" title="${title}" 
        class=" ${(x.type === 'spell' && x.data.data.level !== 0 && !(x.data.data.uses?.max !== 0 && x.data.data.uses?.max !== '' && x.data.data.uses?.max !== null))?t+'-spell'+x.data.data.level:''}" 
        style="${x.data.data.equipped?'text-decoration:underline;':''} ${available?'':'color: '+ unavailable}">${x.data.name} ${x.data.data.quantity>1?'('+x.data.data.quantity+')':''} 
      ${x.data.data.uses?.max !== 0 && x.data.data.uses?.max !== '' && x.data.data.uses?.max !== null ? '('+ x.data.data.uses?.value +'/'+x.data.data.uses?.max+')':''} </span></a>${equipped}${ammoSelect}</div> `;
    

  let level = "none";
  if (x.labels.level)
    level = 'Level ' + x.data.data.level;
    if (x.data.data.level === 0)
      level = 'Cantrip';
    if (x.data.data.preparation?.mode === 'innate')
      level = 'Innate';//level = 'Innate';
    if (x.data.data.preparation?.mode === 'pact')
      level = 'Pact Magic';
  let itemType = x.type;
  
  //if (x.type === 'spell' && x.data.data?.preparation?.mode === 'innate') itemType = 'feat';
    
  if (!items[itemType])
     items[itemType] = {};
  if (!items[itemType][x.labels.activation])
     items[itemType][x.labels.activation] = {};
  if (!items[itemType][x.labels.activation][level])
     items[itemType][x.labels.activation][level] = {};
  if (!items[itemType][x.labels.activation][level][x.data.name])
     items[itemType][x.labels.activation][level][x.data.name] = [];
     items[itemType][x.labels.activation][level][x.data.name].push(text);
  
}
let sections = '';//'<div style="width: 298px; height: 658px; overflow: scroll;">';
for (const type of Object.keys(items).sort().reverse()) {
  let h = type.capitalize();
  if (h === 'Feat') h = 'Feature';
  if (h !== 'Equipment') h = h+'s';
  sections += `<h2 class="iah">${h}</h2>`;
  sections += `<div  style="" class="section" id="act-${type.capitalize()}"> `;
  for (const activation of Object.keys(items[type]).sort()) {
  sections += `<h3 class="ith" style="">${activation.capitalize().replace('1 ', '')}</h3><div style="margin-bottom:.5em">`;
  
  for (const level of Object.keys(items[type][activation]).sort()) {
    
    if (level !== 'none')
      sections += `<h4 class="ilh" style="">${level}</h4><div style="margin-bottom:.5em">`;
    for (const name of Object.keys(items[type][activation][level]).sort()){
      for (const item of Object.values(items[type][activation][level][name]).sort()){
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

   for (const x of game.items.filter(item => item.data.folder === folder)) {
  content += `<div> <img  src="${x.img}"  class="item-img" height="20" name="${x.id}" title="Roll"><span> <a id="roll-${x.id}" name="${x.id}">
  ${x.data.name}</a></span></div>`;
  } 
  content += `</div>  `;
}
content += '</div>';

//----------------other-----------------//

let other = [];
//for ( let x of actor.items.filter(i=> i.type !== 'feat' && i.type !== 'class' && ( i.data.data.activation?.type === '' || i.data.data.activation?.type === undefined ||  i.data.data.activation?.type === 'none')))
for (let x of actor.items.filter(i => !itemFilter(i) && i.type !== 'feat' && i.type !== 'spell' && i.type !== 'class' )) {
  other.push( `<a id="roll-${x.id}" name="${x.id}">${x.name}${x.data.data.quantity>1?' ('+x.data.data.quantity+')':''} </a>`);
}
if (other.length > 0)
  content += `<h2 class="iah">Other Equipment</h2><div style="margin-bottom:.5em">` + other.join(', ') + `</div>`;
//----------------currency-----------------//
if (actor.data.type === 'character') {
  content += `<h2>Currency</h2><div style="display: grid; grid-template-columns:repeat(${Object.keys(actor.data.data.currency).length}, 1fr);">`
  for (let [key, value] of Object.entries(actor.data.data.currency))
    content += `<div>
      ${key}: <a id="${actor.id}-${key}" name="${actor.id}" class="editable-span" text="${value}">${value}</a>
    </div>`
  content += `</div>`;
}
//-------------------------------------------------------------
let d = new Dialog({
  title: `${actor.name} Dialog`,
  content:  content,
  buttons: {},
  render: (content) => {
      
      $('.iah, .ith, .ilh ').contextmenu(async function(e){
        $(this).next().toggle();
      });
      
      $(`#items-dialog-${t} > header > h4`).html(header);
      
      $(`#${t}-header-title`).click(async function(e){
        game.macros.getName('Character Dialog').execute();
      });
      
      $(`#${t}-header-title`).contextmenu(async function(e){
        console.log("title click", this.name);
        if (this.name.includes("Token"))
          canvas.tokens.get(this.name.split('_')[3]).actor.sheet.render(true);
        if (this.name.includes("Actor"))
          game.actors.get(this.name.split('_')[1]).sheet.render(true);
      });
      
      $(".editable-span").click(async function(e){
        if (!$(this).attr("text")) $(this).attr("text", $(this).html());
        let text = $(this).attr("text");
        let id = $(this).attr("id");
        $(this).toggle();
        console.log(id, text);
        $(this).before(`<input id="${id}-input" type="number" value="${text}" style="width:${$(this).width()+10}px; height:${$(this).height()}px"></input>`);
        $(`input#${id}-input`).select();
        $(`#${id}-input`).keyup(async function(e){
          if (e.which !== 13) return;
          let value = parseInt($(this).val());
          if (value == undefined || value == null ) {
            $(this).next().toggle();
            $(this).remove();
            ui.notifications.error('invalid currency ammount');
            return;
          }
          let actorid = $(this).next().attr("id").split('-')[0];
          let key = $(this).next().attr("id").split('-')[1];
          await game.actors.get(actorid).update({[`data.currency.${key}`]:value});
          $(this).next().attr("text", value);
          $(this).next().html(value);
          $(this).next().toggle();
          $(this).remove();
          
        });
      });
      
      $(`.roll-dialog-button-${t}`).each(function() {
        $(this).click(async function(e){
          let vars = this.name.split('-');
          RollDialog(vars[0].toString(),vars[1],vars[2], e.clientX, e.clientY );
        });
      });
      
      $(`.ammo-select`).change(async function(){
        await actor.updateEmbeddedDocuments("Item", [{_id: this.name, "data.consume.target": $(`select#${this.name}-ammo`).val()}]);
      });
      
      $("a[id^=roll]").click(async function(e){
        let x = actor.items.get(this.name);
        console.log(x);
        if(!x) x = game.items.get(this.name);
        if($(`#item-rolls-dialog-${x._id}`).length) return $(`#item-rolls-dialog-${x._id}`).remove();
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
        <div class="item-rolls" id="rolls-${x.id}">
        <a id="${x.id}-chat-description" style="float:right; clear:both;" title="${x.data.name} description">&nbsp;<i class="fas fa-comment-alt"></i></a>
        <div id="${x.id}-description"> <img src="${x.data.img}" width="32" style="border:unset; float:left;  margin: 0 5px 0 0;"/> ${x.data?.data?.description?.value}</div>`;
        //ChatMessage.create({ flavor: '${x.data.name}', content: $(this).prev().html()});clear:both;
        //-----------LABELS AND ROLLS---------------//
          if (x.labels.level) text +=  `${x.labels.level} `;
          if (x.labels.school) text +=  `${x.labels.school} `;
          if (x.labels.components?.length)  text += x.labels.components.join(', ');
          if (x.labels.components?.includes('M')) text += `<br>Materials: ${x.labels.materials}`;
          if (x.labels.activation && x.labels.activation !== 'None') text += '<br>Activation: ' + x.labels.activation;
          if (x.labels.range && x.labels.range !== '5 Feet') text += '<br>Range: ' + x.labels.range;
          if (x.labels.target) text += (game.dnd5e.canvas.AbilityTemplate.fromItem(x))?`<br><a id="${x.id}-inline-targeting" name="${x.id}" class="my-inline-roll"><i class="fas fa-bullseye"></i> Template:  ${x.labels.target}</a>`:`<br>Targets:  ${x.labels.target}`;
          if (x.labels.duration && x.labels.duration !== 'Instantaneous') text += '<br>Duration: ' + x.labels.duration;
          if (x.labels.save) text +=`<br><a id="${x.id}-inline-dc" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d20"></i> Save ${x.labels.save}</a>`;
          if (x.data.data.recharge?.value) 
            if (!x.data.data.recharge?.charged) 
              text +=`<br><a id="${x.id}-inline-recharge" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Recharge</a>`;
            else
              text +=`<br><a id="${x.id}-inline-recharge" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Charged</a>`;
          let foundEffects = game.dfreds?.effects?.all.filter(e => x.data.name?.toUpperCase()===e.name.toUpperCase());
          if (foundEffects?.length > 0) 
            text += `<br><a id="${x.id}-effect-button" class="my-inline-roll" name="${foundEffects[0].name}" style="margin-right: .3em"><i class="fas fa-bolt"></i> Apply Effect to Targets</a>`; 
        //-----------ROLLS---------------//
        //let actorName = ``;
        //if (token.data.disposition > 2) actorName = `${actor.name} `;
        text  += `<table>`;
        
        //-----------ATTACK---------------//
        let attackToHit = x.getAttackToHit();
        if (attackToHit){
          //<a class="inline-roll roll" title="Bite Attack" data-mode="roll" data-flavor="Bite Attack" data-formula="1d20 + 4 + 3"><i class="fas fa-dice-d20"></i> 1d20 + 4 + 3</a></td><td align="right">
          console.log(attackToHit);
          text += '<tr><th align="left">Attack</th><td style="color: #000" >[[/r 1d20 + ' + 
            //Roll.parse(attackToHit.parts.reduce((a,t) => a+=" + " + t , ""), attackToHit.rollData).reduce((a,t) => a+=t.formula, "") +
            Roll.getFormula(Roll.parse(attackToHit.parts.join(' + '), attackToHit.rollData)) + 
            ` # ${x.data.name} - Attack]] 
            <a id="${x.id}-inline-adv"  class="my-inline-roll" >ADV</a>
            <a id="${x.id}-inline-d20"  class="my-inline-roll" style="display:none"><i class="fas fa-dice-d20"></i></a>
            <a id="${x.id}-inline-dis"  class="my-inline-roll" >DIS</a>
            </td></tr>` ;
        }
        
        //-----------DAMAGE---------------//
        let damageRolls = [];  
        
        for (let dp of x.data.data.damage.parts) {
          let dr = '<tr><th align="left">' + (dp[1] ? dp[1].capitalize(): '') + 
             `</th><td>[[/r ` + Roll.replaceFormulaData(dp[0], x.getRollData()) +  ` # ${x.data.name} - ` +  (dp[1]?dp[1].capitalize():'') + (dp[1] === 'healing'?``:` Damage`)+ `]] `;
          
          if (x.data.data.scaling?.formula)  
            dr += `<a id="${x.id}-inline-scaling"  class="my-inline-roll" name="${x.id}"> + ${x.data.data.scaling?.formula}</a> `;
          dr += `<a id="${x.id}-inline-crit"  class="my-inline-roll">Critical</a>`;
          if (dp[1] === 'healing')
            dr += `<a id="${x.id}-inline-max"  class="my-inline-roll">Max</a>`;
            dr+='</td></tr>';
            
             damageRolls.push(dr);
        }
        if (!actor.shield?.data.data.equipped && x.data.data?.damage?.versatile){
          let dt = x.data.data.damage.parts[0][1];
          damageRolls.push(`<tr><th align="left">Versatile</th><td>[[/r ` + 
            Roll.replaceFormulaData(x.data.data.damage.versatile, x.getRollData())  + 
            ` # ${x.data.name} - Versatile ` +  (dt ? dt.capitalize() : '') + ` Damage]] 
            <a id="${x.id}-inline-crit"  class="my-inline-roll" >Critical</a>
            </td></tr>`);
        }
        if (x.data.data.formula)
          damageRolls.push(`<tr><th align="left">Other</th><td>[[/r ${Roll.replaceFormulaData(x.data.data.formula, x.getRollData())} # ${x.data.name} - Other Damage]]
          <a id="${x.id}-inline-crit"  class="my-inline-roll" >Critical</a>
          </td></tr>`);
        
        
        for (let dr of damageRolls){
          text += dr;
        }
          
        text += `</table></div>`;
        //--------------ITEM USES------------------//
        if (x.data.data.uses?.max > 0 ){
          let usesCount = `Uses: <a id="${x.id}-uses-count" class="my-inline-roll" name="${x.id}">${x.data.data.uses?.value}/${x.data.data.uses?.max}</a>`;
          text += usesCount;
        }
        //--------------AMMO USES------------------//
        if ( x.data.data.consume?.type === "ammo"){
          let ammoItem  = actor.items.get(x.data.data.consume.target);
          if (ammoItem) {
            let ammoCount = `${ammoItem?.data.name} Count: <a id="${x.id}-ammo-count" name="${x.data.data.consume.target}" 
            class="my-inline-roll" style="">${ammoItem.data.data.quantity}</a>`;
            text +=  ammoCount;
          }
        }
        //-----------OTHER ITEM USES---------------//
        if ( x.data.data.consume?.type === "charges"){
          let chargeItem = actor.items.get(x.data.data.consume.target);
          //console.log(chargeItem);
          if (chargeItem) {
            let chargeCount = `${chargeItem?.data.name} Uses: <a id="${x.id}-charges-count" name="${x.data.data.consume.target}" 
            class="my-inline-roll" style="">${chargeItem.data.data.uses.value}/${chargeItem.data.data.uses.max}</a>`;
            text +=  chargeCount;
          }
        }
        //--------------Spell SLOTS----------------//
        if (x.type === 'spell' && !(x.data.data.uses?.max > 0 )) {
          let spellTable = `<table>`;
          let spellTableHeaders = `<tr><th align="left">Level</th>`;
          let spellTableColumns = `<tr><th align="left">Slots</th>`;
          if (x.data.data.level === 0){
            spellTableHeaders += `<th style="text-decoration: underline"'>Cantrip</th>`
            spellTableColumns += `<td  style="text-align:center"><a id="${x.id}-spell-level-0" name="0" 
               class="my-inline-roll spell-level-0" data="${x.id}"><i class="fas fa-infinity"></i></a></td>`;
          }
          for (const [key, value] of Object.entries(actor.data.data.spells)){
             if (value.max > 0 && x.data.data.level <= parseInt(key.substr(-1))) {
               spellTableHeaders += `<th ${((x.data.data.level === parseInt(key.substr(-1)))?'style="text-decoration: underline"':'style=""')}>${key.substr(-1)}</th>` ;
               spellTableColumns += `<td  style="text-align:center"><a id="${x.id}-spell-level-${key.substr(-1)}" name="${key.substr(-1)}" 
               class="my-inline-roll spell-level-${key.substr(-1)}" style="" data="${x.id}">${value.value}/${value.max}</a></td>`;
             }
          }
          spellTable += spellTableHeaders + `<tr>` + spellTableColumns + `<tr>` + `</table>`;
          text += spellTable;
        }
        
        let d = new Dialog({
              title : `${actor.name} - ${x.data.name}`, 
              content : TextEditor.enrichHTML(text),
              buttons : {},
              render: (content) => {
                
                let header = `${x.data.name}`;//header-button 
                /*
                if (game.macros.getName("Targets"))
                  header += `<a class="targets-header-button" title="Targets to Chat" style="float:right" onclick="game.macros.getName('Chat Targets').execute()" oncontextmenu="game.macros.getName('Targets').execute()"><i class="fas fa-bullseye"></i>Declare Targets</a>`;
                if (actor.items.get(x.id))
                  header += `<a  title="Roll" class="header-button" id="${x.id}-header-roll" style="float:right" ><i class="fas fa-angle-double-right" ></i>Roll</a>`;
                */
                /*<i class="fas fa-angle-double-right" >&nbsp;${x.data.name}</i></a>`;
                if (x.data.flags.itemacro?.macro?.data.command)
                  header += `<a class="header-button" title="Macro" style="float: right" onclick="canvas.scene.tokens.get('${t}').actor.items.get('${x.id}').sheet.render(true)">
                  <i class="fas fa-terminal" >&nbsp;Macro</i></a>`;
                if (x.hasDamage)  
                  header += `<a class="header-button" title="Damage" style="float: right;" onclick="canvas.scene.tokens.get('${t}').actor.items.get('${x.id}').rollDamage()">
                  <i class="fas fa-dice-d6" ></i>&nbsp;Damage</a>`;
                if (x.hasAttack)  
                  header += `<a class="header-button" title="Attack" style="float: right" onclick="canvas.scene.tokens.get('${t}').actor.items.get('${x.id}').rollAttack()">
                  <i class="fas fa-dice-d20" >&nbsp;Attack</i></a>`; 
                  */
                
                $(`#item-rolls-dialog-${t}-${x._id} > header > h4`).html(header);
                
                $(`a[id^=${x.id}-header-roll]`).click(async function(e){
                  actor.items.get(`${x.id}`).roll()
                });
                
                $(`a[id^=${x.id}-effect-button]`).click(async function(e){
                  let effect = $(this).attr('name');
                  console.log([...game.user.targets].map(t=>t.actor.uuid));
                  await game.dfreds.effectInterface.toggleEffect(effect, {uuids:[...game.user.targets].map(t=>t.actor.uuid)});
                });
                
                $(`a[id^=${x.id}-chat-description]`).click(async function(e){
                  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: x.parent}), flavor: `<h3>${x.data.name}</h3>`, content: $(this).next().html()})
                });
                
                $(`a[id^=${x.id}-inline-targeting]`).click(async function(e){
                  let item = x;// = actor.items.get(this.name);
                  game.dnd5e.canvas.AbilityTemplate.fromItem(item).drawPreview()
                });
                
                $(`a[id^=${x.id}-inline-dc]`).click(async function(e){
                  let item = x;//actor.items.get(this.name);
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${x.labels.save}</h3>`);
                  let dcArray = x.labels.save.split(' ');
                  let ability = dcArray[dcArray.length-1];
                  let dc = parseInt(dcArray[dcArray.length-2]);
                  let abil = Object.keys(CONFIG.DND5E.abilities).find(key => CONFIG.DND5E.abilities[key] === ability);
                  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: x.parent}), flavor: `Rolling Saves for ${x.data.name}...`})
                  for (let target of game.user.targets) {
                    let roll = await new Roll(`1d20 + ${target.actor.data.data.abilities[abil].save}`).roll({ async: true });
                    let result;
                    if (roll.total < dc)
                      result = 'Failed';
                    else
                      result = 'Succeeded';
                      
                    roll.toMessage({speaker:ChatMessage.getSpeaker({actor: x.parent}),flavor:`<b>${result}</b> ${ability} Save for ${x.name}`,"flags.world.save":{[target.id]:result}},{rollMode: 'blindroll'});
                    //console.log(roll.total)
                  }
                });
                /*
                $(`a[id^=${x.id}-inline-dc]`).contextmenu(async function(e){
                  return;
                  let item = x;// = actor.items.get(this.name);
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${x.labels.save}</h3>`);
                  let dcArray = x.labels.save.split(' ');
                  let ability = dcArray[dcArray.length-1]
                  let abil = Object.keys(CONFIG.DND5E.abilities).find(key => CONFIG.DND5E.abilities[key] === ability);
                  for (let target of game.user.targets) {
                    let roll = await new Roll(`1d20 + ${target.actor.data.data.abilities[abil].dc-8}`).roll({ async: true });
                    let result ;
                    if (roll.total >= target.actor.data.data.abilities[abil].save+14)
                      result = 'Failed';
                    else
                      result = 'Succeeded';
                    console.log(target.id);
                    roll.toMessage({speaker:ChatMessage.getSpeaker({token: target}),flavor:`${ability} roll vs ${ability} defense of ${target.actor.data.data.abilities[abil].save+14}<br><b>${result}`,"flags.world.save":result},{rollMode: 'gmroll'});
                  }
                });
                */
                $(`a[id^=${x.id}-inline-recharge]`).click(async function(e){
                  let item = x;// = actor.items.get(this.name);
                  
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
                
                $(`a[id^=${x.id}-inline-recharge]`).contextmenu(async function(e){
                  //console.log(this.text);
                  let item = x;// = actor.items.get(this.name);
                  if (this.text.includes('Recharge')) {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Charged`);
                    await item.update({'data.recharge.charged':true});
                  }
                  else {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Recharge`);
                    await item.update({'data.recharge.charged':false});
                  }
                });
                
                $(`a[id^=${x.id}-inline-adv]`).click(async function(e){
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
                
                $(`a[id^=${x.id}-inline-d20]`).click(async function(e){
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
                
                $(`a[id^=${x.id}-inline-dis]`).click(async function(e){
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
                
                $(`a[id^=${x.id}-inline-max]`).click(async function(e){
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
                
                $(`a[id^=${x.id}-inline-crit]`).click(async function(e){
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
                /*
                $(`a[id^=${x.id}-inline-crit]`).contextmenu(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let formulaArrayLength = formulaArray.length;
                  for (let i = 0; i < formulaArrayLength; i++) {
                    if (formulaArray[i].includes('d')) {
                      let dieRollArray = formulaArray[i].split('d');
                      let numD20 = Math.ceil(parseInt(dieRollArray[0])/2);
                      dieRollArray.shift();
                      dieRollArray.unshift(numD20);
                      let dieRoll = dieRollArray.join('d');
                      formulaArray.splice(i, 1, dieRoll);
                    }
                  }
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' Critical');
                  targetElement.css('box-shadow','unset');
                  $(this).css('box-shadow','unset');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                */
                $(`a[id^=${x.id}-inline-scaling]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let item = actor.items.get($(this).attr('name'));
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  formulaArray.push(' + ' + item.data.data.scaling.formula);
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                
                $(`a[id^=${x.id}-inline-scaling]`).contextmenu(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let scalingFormula = $(this).text();
                  let formula = targetElement.attr('data-formula');
                  let newFormula = formula.replace(scalingFormula,'');
                  targetElement.attr('data-formula', newFormula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${newFormula}`);
                });
                
                $(`a[id^=${x.id}-uses-count]`).contextmenu(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses)
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${x.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    $(`#roll-${x.id}`).css('color', `unset`);
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).css('color', `unset`);
                  }
                });
                
                $(`a[id^=${x.id}-uses-count]`).click(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value > 0) {
                    uses.value--;
                    if (item.type === 'spell')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${x.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    $(`a#roll-${x.id}`).attr('style', `color : ${unavailable}`);
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $(`a[id^=${x.id}-ammo-count]`).contextmenu(async function(e){
                  $(this).off('oncontextmenu');
                  let count = $(`a#${x.id}-ammo-count`).html();
                    count++;
                  let a = actor.items.get(this.name);
                  await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                  $(`a#${x.id}-ammo-count`).html(count);
                  $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                  $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                  if (count > 0) $(`a#roll-${a.id}`).css('color', `unset`);
                });
                
                $(`a[id^=${x.id}-ammo-count]`).click(async function(e){
                  //$(this).off('onclick');
                  let count = parseInt($(`a#${x.id}-ammo-count`).html());
                  if (count > 0) {
                    count--;
                    let a = actor.items.get(this.name);
                    await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                    $(`a#${x.id}-ammo-count`).html(count);
                    $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                    $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                    if (count === 0) $(`a#roll-${a.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $(`a[id^=${x.id}-charges-count]`).contextmenu(async function(e){
                  
                  //$(this).off('oncontextmenu');
                  let item  = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-charges-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`#roll-${w.id}`).css('color', `unset`);
                    $(`#roll-${item.id}`).css('color', `unset`);
                  }
                });
                
                $(`a[id^=${x.id}-charges-count]`).click(async function(e){
                  //$(this).off('onclick');
                  let item = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses, item.type);
                  if (uses.value > 0) {
                    uses.value--;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-charges-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                    $(`a#roll-${item.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $("a[id*=-spell-level-]").click(async function(e){
                  let item = x;// = actor.items.get($(this).attr('data'));
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${x.labels.save}</h3>`);
                  console.log(x.labels.save);
                  let spellLevel = this.name;
                  if (spellLevel==="0" && actor.type==='character') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                  if (spellLevel==="0" && actor.type==='npc') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
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
                          $(`.${t}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${t}-${key}`).attr('style', `color : ${unavailable}`);
                      }
                    }
                    await actor.update({'data.spells': spells});
                    $(this).html(spells['spell'+spellLevel].value+'/'+spells['spell'+spellLevel].max);
                    if (actor.type==='character')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} with a level ${spellLevel} slot ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                    else
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} with a level ${spellLevel} slot ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
                    if (actor.hasPlayerOwner)
                      ui.chat.processMessage(`/w GM ${actor.data.name} Level ${spellLevel} Slots: (${ spells['spell'+spellLevel].value}/${spells['spell'+spellLevel].max})`);
                  }
                });
                
                $("a[id*=-spell-level-]").contextmenu(async function(e){
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
                          $(`.${t}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${t}-${key}`).attr('style', `color : ${unavailable}`);
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
                
                $(`#item-rolls-dialog-${t}-${x.id}`).click(async function(e){
                  console.log(t);
                  let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
                  if (placeables.length > 0)
                    placeables[0].control({releaseOthers:true});
                  else 
                    canvas.tokens.releaseAll();
                });
                
                //$(`.inline-roll`).attr('data-mode', game.settings.get("core", "rollMode"));
              },
              close:   html => {
              return}
              
            },{  id:`item-rolls-dialog-${t}-${x.id}`, left : e.clientX-5 , top: e.clientY-5 }).render(true);
        
      });
      
      $("a[id^=roll]").contextmenu(async function(e){
        actor.items.get(this.name).sheet.render(true);
      });
      
      $(".item-img").click(async function(e){
        actor.items.get(this.name).roll(true);
      });
      
      $(`#items-dialog-${t}`).click(async function(e){
        console.log(t);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id.includes(`item-rolls-dialog-${t}`)))
          ui.windows[w.appId].bringToTop();
      });
  },
  close:   html => {
    if($(`[id^=item-rolls-dialog-${t}]`).length) 
      $(`[id^=item-rolls-dialog-${t}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});
    return;}
  },position
);
d.render(true);

function RollDialog(id, rollType, abilType, left, top ){

let bonus = '';
if (rollType === 'abilities' && abilType === 'save')
  bonus = 'save';
  if (rollType === 'abilities' && abilType === 'test')
  bonus = 'mod';
if (rollType === 'skills')
  bonus = 'total';
 
let roll = '';
if (rollType === 'abilities' && abilType === 'save')
  roll = `Ability${abilType.capitalize()}`;
if (rollType === 'abilities' && abilType === 'test')
  roll = `Ability${abilType.capitalize()}`;
if (rollType === 'skills')
  roll = `Skill`;

console.log(roll)
let wTargets = [];

for (const [key, value] of Object.entries(actor.data.permission)) {
  if (key !== 'default' && value === 3)
    wTargets.push(game.users.get(key).name)
}
let whisperTargets = wTargets.join(', ')
let d_Id = `${id}${roll}`;
console.log('?', actor.data.data[rollType]);
let content = `
<style>
  .my-inline-roll {
  background: #DDD;
  padding: 1px 4px;
  border: 1px solid #4b4a44;
  border-radius: 2px;
  white-space: nowrap;
  word-break: break-all;
  }
  .rms {
  font-size: 1.5em; border-bottom: 1px solid #782e22; margin-right:.1em;
  }
</style>
<div style="display:grid; grid-template-columns:1fr 1fr;">`;
for (const [key, value] of Object.entries(actor.data.data[rollType])){
  let text = CONFIG.DND5E[rollType][key] ;
  content += `<div align="left" style="margin-bottom:.75em;">${text}</div>
    <div align="left"> 
    [[/r 1d20 + ${value[bonus]} # ${text} ${abilType}]]
    <a id="inline-adv"  class="my-inline-roll" >ADV</a>
    <a id="inline-d20"  class="my-inline-roll" style="display:none"><i class="fas fa-dice-d20"></i></a>
    <a id="inline-dis"  class="my-inline-roll" >DIS</a>
    
    </div>`;
}
content += `</div>`;
let rollmodes = `<center>
<a id="${d_Id}-rollmodeselectpr" name="publicroll" class="rms">&ensp;/pr&ensp;</span>
<a id="${d_Id}-rollmodeselectgm" name="gmroll"     class="rms">&ensp;/gmr&ensp;</span>
<a id="${d_Id}-rollmodeselectbr" name="blindroll"  class="rms">&ensp;/br&ensp;</span>
<a id="${d_Id}-rollmodeselectsr" name="selfroll"   class="rms">&ensp;/sr&ensp;</span>
</center>`;
content = TextEditor.enrichHTML(content) ;
let d = new Dialog({
        title : `${actor.data.name} ${rollType.capitalize()} ${abilType?abilType.capitalize():''}`, 
        content : content,
        render : (content) => {
            $(`[id$=${d_Id}-straight-section-tab]`).css('textShadow' , "0 0 8px red");
            $(`#${d_Id}-rollmodeselect-roll`).css('textShadow' , "0 0 8px red");
            $(`[id^=${d_Id}-rollmodeselect]`).click(async function(e){
              let rollMode = $(this).attr('name');
              $('.rms').css('textShadow' , "unset");
              $(this).css('textShadow' , "0 0 8px red");
              game.settings.set("core", "rollMode", rollMode);
            });
                $(`a#inline-adv`).click(async function(e){
                  let targetElement = $(this).prev();
                  console.log(targetElement)
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = 2;
                  if (e.shiftKey) 
                    numD20 = 3;
                  formulaArray.shift();
                  formulaArray.unshift(numD20+'d20kh');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with advantage');
                  targetElement.click();
                  $(this).next().click();
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with advantage',''));
                });
                $(`a#inline-d20`).click(async function(e){
                  let targetElement = $(this).prev().prev();
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = parseInt(formulaArray[0].split('d')[0]);
                  formulaArray.shift();
                  formulaArray.unshift('1d20');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','unset');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                $(`a#inline-dis`).click(async function(e){
                  let targetElement = $(this).prev().prev().prev();
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
        },
        buttons : {},
        close:   html => {
        return}
    },{width:330, top: top-5 , left: left-5 ,  id:`${d_Id}-roll-dialog` }).render(true);
}
