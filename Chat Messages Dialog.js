async function toggleEffect(effect) {
  for (let t of canvas.tokens.controlled) {
  let actorUuid = t.actor.uuid;
  await game.dfreds.effectInterface.toggleEffect(effect, actorUuid);
  }
}
async function controlUserTargets(section) {
  let userTargets = game.users.getName(section.replace('act-','')).targets;
  for (const target of userTargets){
  target.control({releaseOthers: false});
  }
}

let ce = game.modules.get("dfreds-convenient-effects").active;

let selectedAlias = $(`select#alias-select`).val();
//console.log(selectedAlias);
let title = "Roll Messages";
let windowId = "roll-messages-dialog"
let position = Object.values(ui.windows).find(w=> w.id === windowId)?.position || { height: 721, width : 450 , id: windowId};
position["id"] = windowId;
let header = `<h4><a onclick="game.macros.find(m=>m.data.flags.world?.name==='${this.name}').execute()" oncontextmenu="game.macros.find(m=>m.data.flags.world?.name==='${this.name}').sheet.render(true)" style="margin: 0 0 0 0;">${title}</a></h4>`
if (!(Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))!==-1))
  Hooks.on(`renderChatMessage`, (message, html, data) => { 
    //renderchatmessagesdialog
    if (Object.values(ui.windows).filter(w=> w.id === "roll-messages-dialog" && (message.data.flavor || message.data._roll))){
      game.macros.find(m=>m.data.flags.world?.name==='Chat Messages Dialog').execute();
      //console.log('new message:', message);
    }
  });

let content=`
<style>
.thl {
  border-bottom: 1px solid var(--color-border-highlight);; 
  width: 100%;
}
</style>
<script>
function openSection(section) {
  var i;
  var x = document.getElementsByClassName('user-message-section');
  for (i = 0; i < x.length; i++) {
  x[i].style.display = "none"; 
  }
  let y  = document.getElementsByClassName('message-user-tab')
  for (i = 0; i < x.length; i++) {
  y[i].style.textShadow =  "";
  }
  console.log(section);
  document.getElementById(section).style.display = "block";  
  document.getElementById(section+'-tab').style.textShadow = "0 0 8px red";
  //canvas.tokens.placeables.filter(t => t.actor === game.users.getName(section.replace('act-','')).character)[0].control({releaseOthers: false});
  canvas.tokens.releaseAll();
  let userTargets = game.users.getName(section.replace('act-','')).targets;
  for (const target of userTargets){
  target.control({releaseOthers: false});
  }
}
</script>
<div id="messages-dialog-content" style="display:flex; flex-direction: column-reverse;width: 440px; height: 640px;overflow-y: auto;overflow-x: hidden;">
`;
let users = {};
let usersDamageTotal = {};
let usersLastAttack = {};
let usersAttackCritical = {};
let usersDamageCritical = {}
let messages = [];
let saves = {};
let damageTaken = {};
//for (const m of game.messages.contents){
//let damageTotal = 0;
//let lastAttack = 0;
//let header = 'Chat Messages';
//for (let i = game.messages.contents.length - 1; 0 <= i; i--) {
for (let m of game.messages.contents.filter(m=> ((m.data.roll || m.data.flavor) && m.data.speaker.alias) || (m.data.speaker.alias === undefined && m.data.flavor?.includes('Round'))).reverse()) {
  //let m = game.messages.contents[i];
  let total = 0;
  let message = ``;
  let user = '';
  let damage = '';
  if (m.data.speaker.alias);
    user = m.data.speaker.alias;//game.users.get(m.data?.user)?.data.name;
  if (user === undefined && m.data.flavor?.includes('Round')) {
  //header = m.data.flavor + ' Messages';margin-top:.5em;
    messages.push(`<div><hr><h2 style="border-top: 1px solid var(--color-underline-header); margin-top:.6em;">${m.data.flavor}</h2></div>`)
    //rounds[m.data.flavor] = users;
    //users = {};
    continue;
  }
  //if (!m.data.flavor) continue; 
  //if (!m.data.speaker.alias) continue;
  //if (!m.data.roll && !m.data.flavor) continue; 
  if (!users[user])
    users[user] = [];
  if (!usersDamageTotal[user])
    usersDamageTotal[user] = {};
  if (!usersAttackCritical[user])
    usersAttackCritical[user] = false;
  if (!usersDamageCritical[user])
    usersDamageCritical[user] = false;
  if (!saves[user])
      saves[user] = {};
  
  message += `<div style="" class="cm" name="${user}"><hr>
  <span style="float:right; clear:both; margin-right: 5px;">
  <a class="speaker" data-token="${m.data.speaker.token}">${user}</a>
  </span>
  <p>`;//game.macros.find(m=>m.data.flags.world?.name==='Character Dialog').execute();
  let flavor = ``;
  if (m.data.flavor) 
    flavor += `${m.data.flavor}`;
    
  if (m.data.flavor && ce) {
    let foundEffects = game.dfreds.effects.all.filter(e => flavor.includes(e.name));
    if (foundEffects.length > 0) 
      flavor = flavor.replace(foundEffects[0].name, `<a class="effect-button" name="${foundEffects[0].name}">${foundEffects[0].name}</a>`); 
  }
  message += flavor + `</p>`;
  if (m.data.roll) {
    let roll = JSON.parse(m.data.roll);//Roll.fromJSON(m.data.roll);//
    //let roll = m.roll;
    //console.log($(await roll.getTooltip()).find(".dice-rolls"));//
    //console.log(roll.terms);
    let title = '';
    for (let term of roll.terms.filter(t => t.class === 'Die')) {
      title += term.number + 'd' + term.faces + ` => `;
      let resultResults = [];
      for (let result of term.results){
        resultResults.push(result.result);
        //console.log(m.data.flavor.includes('Attack') , term.faces === 20 ,result.result === 20 , result.result.active);
        if (m.data.flavor?.includes('Attack') && term.faces === 20 && result.result === 20 && result.active)
          usersAttackCritical[user] = true;
      }
      title += resultResults.join(', ') + `\n`;
    }
    if (m.data.flavor?.toUpperCase().includes('ATTACK'))
      usersLastAttack[user] = roll.total;
    
    if (m.data.flavor?.toUpperCase().includes('DAMAGE') || m.data.flavor?.toUpperCase().includes('HEALING')){
      let dt = m.data.flags?.world?.damageType;
      if (dt && !usersDamageTotal[user][dt]) usersDamageTotal[user][dt] = 0;
      usersDamageTotal[user][dt] += roll.total;
      //message = message.replace('<hr>','');
      if (m.data.flavor?.toUpperCase().includes('CRITICAL'))
        usersDamageCritical[user] = true;
    }
    if (m.data.flavor?.toUpperCase().includes('ATTACK'))
      message += `<p title="${title}">${roll.formula} =  ${roll.total}</p>`;
    else
      message += `<p title="${title}"><a class="applyDamage" data-val="${roll.total}" data-crit="${usersAttackCritical[user]}">${roll.formula} =  ${roll.total}</a> </p>`;
    /*
    if (m.data.flavor?.toUpperCase().includes('ATTACK') && Object.keys(usersDamageTotal[user]).length !== 0){
      let totalTotal = 0;
      for (let [key, value] of Object.entries(usersDamageTotal[user])) {
        message += `<p title="${title}"><b><a class="HVM" data-val="${value}" data-crit="${usersAttackCritical[user]}">${key} Damage: ${value}</a></b></p>`;
        totalTotal += value;
      }
      if (Object.keys(usersDamageTotal[user]).length !== 1)
        message += `<p title="${title}"><u><b><<a class="HVM" data-val="${value}" data-crit="${usersAttackCritical[user]}">Total Damage: ${totalTotal}</a></b></u></p>`;
      //usersDamageTotal[user] = {};
    }*/
    //if (m.data.roll)
      //message += `<span class="dice-tooltip" style="color:#000 !important"> ${$(await m.roll.getTooltip()).find(".dice-rolls")[0].outerHTML}</span>`;
  }
  if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')||m.data.flavor?.toUpperCase().includes('ATTACK') && Object.keys(usersDamageTotal[user]).length !== 0){
    let totalTotal = 0;
    for (let [key, value] of Object.entries(usersDamageTotal[user]).reverse()) {
      message += `<p><b><a class="applyDamage" data-val="${value}" data-crit="${usersAttackCritical[user]}">${key} Damage:  ${value}</a>`;
      if (game.modules.get("mmm").active && usersAttackCritical[user])
        message += `&ensp;<a onclick="ui.chat.processMessage('/mmmm ${key}')">MMMM</a>`;
      message += `</b></p>`;
        
        totalTotal += value;
    }
    if (Object.keys(usersDamageTotal[user]).length > 1)
      message += `<p><u><b><a class="applyDamage" data-val="${totalTotal}" data-crit="${usersAttackCritical[user]}">Total Damage:  ${totalTotal}</a></b></u></p>`;
    //usersDamageTotal[user] = {};
    
  }
    
  
  if (m.data.flags?.world?.save !== undefined && m.data.speaker.token) {
    //console.log(Object.keys(m.data.flags.world.save), Object.values(m.data.flags.world.save));
    saves[user][Object.keys(m.data.flags.world.save)[0]] = Object.values(m.data.flags.world.save)[0];
  }
  
  if (m.data.flags.world?.targetIds && m.data.flags.world?.targetIds?.length > 0) 
    message += `<b><a class="target-button" name="${m.data.flags.world?.targetIds.join('-')}" style="margin-right: .3em"><i class="fas fa-crosshairs"></i> Targets</a></b>`;  
  //console.log(saves);
  
  if (m.data.flags?.world?.targetIds) {
    let hits = [];
    let saved = [];
    let failed = [];
    let targets = '';
    for (let t_id of m.data.flags.world?.targetIds){
      let t = canvas.tokens.get(t_id);
      if (!t) continue;
      let traits = '';
      //&& t.actor.data.data.traits[key]?.value?.length
      for (const [key, value] of Object.entries(t.actor.data.data.traits)) {
        if ((key == 'di' || key == 'dr' || key == 'dv') && t.actor.data.data.traits[key]?.value?.length) {
          traits += `\n${key.toUpperCase()}: ${value.value.join(', ')}`;
        }
      }
      
      if (m.data.flavor?.toUpperCase().includes('ATTACK') &&
      usersLastAttack[user] >=t.actor.data.data.attributes.ac.value)
        hits.push(t_id);
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR') && saves[user][t.id] === "Succeeded")
        saved.push(t_id);
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR') && saves[user][t.id] === "Failed")
        failed.push(t_id);
        
      
      
      targets += `<div style="margin: 5px 0 0 0;"><a onclick="canvas.animatePan({x:${t.data.x}, y:${t.data.y}})" ><img src="${t.data.img}" height="36" style="border:unset; float: left; clear:both; margin-right: 5px;"></a><a class="target-img" data-id="${t_id}">${t.actor.data.name} ${traits}<br>` ;
      
      if (m.data.flavor?.toUpperCase().includes('ATTACK')) 
        targets += `AC: ${t.actor.data.data.attributes.ac.value} (${usersLastAttack[user]>=t.actor.data.data.attributes.ac.value?'hits':'misses'})&nbsp;`;
        
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')) 
        targets += `<b>${saves[user][t.id]}</b> Save &nbsp;`;
        
      if (m.data.flavor?.toUpperCase().includes('CAST'))
        targets += ``;
        
      if (m.data.flavor?.toUpperCase().includes('HEALING')) 
        targets += ``;
        
      for (let [key, value] of Object.entries(usersDamageTotal[user]).reverse()) {
        if (t.actor.data.data?.traits?.dv?.value?.includes(key.toLowerCase())) value *= 2;
        if (t.actor.data.data?.traits?.di?.value?.includes(key.toLowerCase())) value = 0;
        if (t.actor.data.data?.traits?.dr?.value?.includes(key.toLowerCase())) value = Math.floor(value/2);
        
        if (hits.includes(t_id) || failed.includes(t_id))
          targets += `<a class="applyDamage" data-val="${key.toUpperCase().includes('HEALING')?value*-1:value}" data-crit="${usersAttackCritical[user]}" data-token="${t_id}"> ${value} ${key}</a>&nbsp;`;
        if (saved.includes(t_id))
          targets += `<a class="applyDamage" data-val="${key.toUpperCase().includes('HEALING')?value*-1:value}" data-crit="${usersAttackCritical[user]}" data-token="${t_id}"> ${Math.floor(value/2)} ${key}</a>&nbsp;`;
      }
      
      targets += `</a><a class="x-target" data-tid="${t_id}" data-mid="${m.id}"><i class="fas fa-times" style="float:right; font-size: 1.25em; margin-right: 1em;"></i></a></div>`;
      
    }
    if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR'))
      saves[user] = {};
    //console.log(m, hits, saved, failed);
    for (let t_id of hits) {
      if (!damageTaken[t_id]) damageTaken[t_id] = [];
      damageTaken[t_id].unshift(usersDamageTotal[user]);
    }
    
    
    if (hits.length > 1 || saved.length > 0 || failed.length > 0)
      message += '<b style="margin-right: .5em">Targets:</b>';
    if (hits.length > 1)
      message += `<a class="target-button" name="${hits.join('-')}" style="margin-right: .5em"><b>Hits</b></a>`
    if (saved.length > 0)
      message += `<a class="target-button" name="${saved.join('-')}" style="margin-right: .5em"><b>Saved</b></a>`
    if (failed.length > 0)
      message += `<a class="target-button" name="${failed.join('-')}" style="margin-right: .5em"><b>Failed</b></a>`
    hits = [];
    saved = [];
    failed = [];
    
    
    message += targets;
  }
  usersDamageCritical[user] = false;
  usersAttackCritical[user] = false;
  if (m.data.flavor?.toUpperCase().includes('ATTACK') || m.data.flavor?.toUpperCase().includes('HEALING') || m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')) usersDamageTotal[user] = {};
  message += `</div>`
  //users[user].push(message);  
  messages.push(message);
  //m = game.messages.contents[game.messages.contents.length - i];
}

console.log(damageTaken);
for (const m of messages) {
        content += m; 
}
content += '</div>';
//console.log(users);
let aliasSelect = `<center style="border-bottom: 0px solid white;"><select id="alias-select" style="margin-bottom:.5em;  width: 100%;"><option value="" ${selectedAlias?'selected':''}></option>`;
for (const alias of Object.keys(users).sort()) {
  aliasSelect +=  `<option value="${alias}" ${selectedAlias===alias?'selected':''}>${alias}</option>`;
}
aliasSelect += `</select></center>`;
content = aliasSelect + content;

let d = new Dialog({
  title: title,
  content:  content,
  buttons: {},
  render: (html) => {
    
    if ($('#alias-select').val()) {
        $(`div.cm`).css('display', 'none');
        $(`div[name="${$('#alias-select').val()}"]`).css('display', 'unset');
    }
    else
      $(`div.cm`).css('display', 'unset');
        
    $(`#${position["id"]} > header > h4`).html(header);
    
    //$(html[0]).parent().css("flex-direction", 'column-reverse');
    
    $('#alias-select').change(async function(e){
      if ($('#alias-select').val()) {
        $(`div.cm`).css('display', 'none');
        $(`div[name="${$('#alias-select').val()}"]`).css('display', 'unset');
      }
      else
        $(`div.cm`).css('display', 'unset');
    });
    
    $('#alias-select').contextmenu(async function(e){
      $(this).val('').change();
    });
    
    $('.HVM').click(async function(e){
      console.log($(this).attr('data-crit'))
      game.macros.find(m=>m.data.flags.world?.name==='Health Vitality Change').execute($(this).attr('data-val'), $(this).attr('data-crit').toLowerCase()==='true', false);
    });
    
    $('.HVM').contextmenu(async function(e){
      game.macros.find(m=>m.data.flags.world?.name==='Health Vitality Change').execute($(this).attr('data-val'), $(this).attr('data-crit'), true);
    });
    
    $('.applyDamage').click(async function(e){
      let t_id = $(this).attr('data-token');
      if (t_id)
        game.user.updateTokenTargets([t_id]);
        
      //let target = canvas.tokens.get(t_id);
      for ( let target of game.user.targets) {
        if (e.ctrlKey) 
          target.actor.applyDamage($(this).attr('data-val'),.5);
        else if (e.shiftKey) 
          target.actor.applyDamage($(this).attr('data-val'), 2);
        else
          target.actor.applyDamage($(this).attr('data-val'));
      }
    });
    
    $('.applyDamage').contextmenu(async function(e){
      let t_id = $(this).attr('data-token');
      if (t_id)
        game.user.updateTokenTargets([t_id]);
      //let target = canvas.tokens.get(t_id);
      for ( let target of game.user.targets) {
        if (e.ctrlKey) 
          target.actor.applyDamage($(this).attr('data-val')*-1,.5);
        else if (e.shiftKey) 
          target.actor.applyDamage($(this).attr('data-val')*-1, 2);
        else
          target.actor.applyDamage($(this).attr('data-val')*-1);
      }
    });
    
    $('.speaker').contextmenu(async function(e){
      canvas.tokens.get($(this).attr('data-token')).control({releaseOthers:true});canvas.animatePan({x:_token.data.x, y:_token.data.y});
    });
    
    $('.speaker').click(async function(e){
      return game.user.updateTokenTargets([$(this).attr('data-token')]);
      if ([...game.user.targets].length>0) game.user.updateTokenTargets([]);
      else game.user.updateTokenTargets($(this).attr('name').split('-'));
    });
    
    $('a.x-target').click(async function(e){
      let t_id = $(this).attr('data-tid');
      let m_id = $(this).attr('data-mid');
      //let targetButton = $(this).parent().prev().prev().prev().find('a.target-button');
      let targetButton = $(this).parent().parent().find('a.target-button');
      console.log(targetButton);
      let targets = targetButton.attr('name').split('-');
      targets.splice(targets.indexOf(t_id),1);
      targetButton.attr('name', targets.join('-'));
      let m = game.messages.get(m_id);
      $(this).parent().remove();
      await ChatMessage.updateDocuments([{_id: m_id, "flags.world.targetIds" : targets}]);
    });
    
    $('a.target-img').contextmenu(async function(e){
      //return game.user.updateTokenTargets([]);
      let t_Id = $(this).attr('data-id');
      console.log(t_Id);
      //let t = canvas.tokens.get(t_Id);
      let targets = [...game.user.targets].map(t => t.id);
      console.log(targets);
      if (targets.includes(t_Id)) targets.splice(targets.indexOf(t_Id),1);
      game.user.updateTokenTargets(targets);
      /*
      if (!t._controlled)
        t.control({releaseOthers: false});
      else
        t.release();*/
    });
    
    $('a.target-img').click(async function(e){
      let t_Id = $(this).attr('data-id');
      //return game.user.updateTokenTargets([t_Id]);
      let targets = [...game.user.targets].map(t => t.id);
      if (!targets.map(t => t.id).includes(t_Id)) targets.push(t_Id);
      //else targets.splice([...game.user.targets].indexOf(t_Id),1);
      game.user.updateTokenTargets(targets);
    });
    /*
    $("a.target-img > img").hover((e) => {
            let panTarget = canvas.tokens.get($(e.originalEvent.srcElement).parent().attr('data-id'));
            canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
        },() => {});
    */
    $('a.target-button').contextmenu(async function(e){
      return game.user.updateTokenTargets([]);
      let t_Ids = $(this).attr('name').split('-');
      if (canvas.tokens.controlled.length==0) {
        canvas.tokens.releaseAll();
        for (let t_Id of t_Ids) {
          canvas.tokens.get(t_Id).control({releaseOthers: false});
        }
      } else {
        canvas.tokens.releaseAll();
      }
    });
    
    $('a.target-button').click(async function(e){
      return game.user.updateTokenTargets($(this).attr('name').split('-'));
      if ([...game.user.targets].length>0) game.user.updateTokenTargets([]);
      else game.user.updateTokenTargets($(this).attr('name').split('-'));
    });
    
    if (ce)
    $('a.effect-button').click(async function(e){
      let effect = $(this).attr('name');
      await game.dfreds.effectInterface.toggleEffect(effect, {uuids: [...game.user.targets].map(t=>t.actor.uuid)});
    });
  
  },
  close:   html => {
    while (Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))>-1)
      Hooks._hooks.renderChatMessage.splice( Hooks._hooks.renderChatMessage.findIndex(f=>f.toString().includes('renderchatmessagesdialog')), 1)
  return}
},position
);
d.render(true);