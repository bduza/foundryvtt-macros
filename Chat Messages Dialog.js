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

let selectedAlias = $(`select#alias-select`).val();
//console.log(selectedAlias);
let title = "Roll Messages";
let windowId = "roll-messages-dialog"
let position = Object.values(ui.windows).filter(w=> w.data?.title === title && w.constructor.name === "Dialog")[0]?.position || { height: 721, width :450 , id: windowId};
position["id"] = windowId;
let header = `<h4><a onclick="game.macros.getName('${this.name}').execute()" style="margin: 0 0 0 0;">${title}</a></h4>`

if (!Hooks._hooks.renderChatMessage || Hooks._hooks.renderChatMessage.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))<0)
  Hooks.on(`renderChatMessage`, (message, html, data) => { 
    //renderchatmessagesdialog
    if (Object.values(ui.windows).filter(w=> w.data?.title === title 
    && w.constructor.name === "Dialog").length>0
    && message.data.flavor){
      game.macros.getName('Chat Messages Dialog').execute();
      //console.log('new message:', message);
    }
  });

let content=`
<style>
.thl {
  border-bottom: 1px solid darkred; 
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
  if (m.data.speaker.alias);
    user = m.data.speaker.alias;//game.users.get(m.data?.user)?.data.name;
  if (user === undefined && m.data.flavor?.includes('Round')) {
  //header = m.data.flavor + ' Messages';
    messages.push(`<h2 style="border-top: 1px solid var(--color-underline-header);">${m.data.flavor}</h2>`)
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
  <a onclick="canvas.tokens.placeables.filter(t=>t.id==='${m.data.speaker?.token}')[0].control({releaseOthers:true});game.macros.getName('Character Dialog').execute();">${user}</a>
  </span>
  <p>`;
  if (m.data.flavor) 
    message += `${m.data.flavor}`;
    
  if (m.data.flavor) {
    let foundEffects = game.dfreds.effects.all.filter(e => m.data.flavor?.toUpperCase().includes(e.name.toUpperCase()));
    if (foundEffects.length > 0) { 
      message += `&ensp;<a class="effect-button" name="${foundEffects[0].name}" style="margin-right: .3em"><i class="fas fa-bolt"></i></a>`; 
    }
  }
  if (m.data.flags.world?.targetIds && m.data.flags.world?.targetIds?.length > 0) 
    message += `&ensp;<a class="target-button" name="${m.data.flags.world?.targetIds.join('-')}" style="margin-right: .3em"><i class="fas fa-crosshairs"></i></a>`;  
        
  message += `</p>`;
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
    
    if (m.data.flavor?.toUpperCase().includes('DAMAGE')){
      let dt = m.data.flags?.world?.damageType;
      if (dt && !usersDamageTotal[user][dt]) usersDamageTotal[user][dt] = 0;
      usersDamageTotal[user][dt] += roll.total;
      //message = message.replace('<hr>','');
      if (m.data.flavor?.toUpperCase().includes('CRITICAL'))
        usersDamageCritical[user] = true;
      
      message += `<p title="${title}"> ${roll.formula} = <a onclick="game.macros.getName('Health Vitality Change').execute(${roll.total},${usersDamageCritical[user]}, true)" oncontextmenu="game.macros.getName('Health Vitality Change').execute(${roll.total},${usersDamageCritical[user]}, false)">${roll.total}</a> </p> `;
    }
    else
    {
      message += `<p title="${title}"> ${roll.formula} = <a onclick="game.macros.getName('Health Vitality Change').execute(${roll.total},${usersDamageCritical[user]}, true)" oncontextmenu="game.macros.getName('Health Vitality Change').execute(${roll.total},${usersDamageCritical[user]}, false)" > ${roll.total}</a> </p>`;
    }
    if (m.data.flavor?.toUpperCase().includes('ATTACK') && Object.keys(usersDamageTotal[user]).length !== 0){
      let attackName = m.data.flavor.split(' - ')[0];
      
      let totalTotal = 0;
      for (let [key, value] of Object.entries(usersDamageTotal[user])) {
        message += `<p title="${title}"><b><a onclick="game.macros.getName('Health Vitality Change').execute(${value},${usersAttackCritical[user]}, true)" oncontextmenu="game.macros.getName('Health/Vitality Change').execute(${value},${usersAttackCritical[user]}, false)">Total ${key} Damage: ${value}</a></b></p>`;
        totalTotal += value;
      }
      if (Object.keys(usersDamageTotal[user]).length !== 1)
        message += `<p title="${title}"><u><b>Total Damage: <a onclick="game.macros.getName('Health Vitality Change').execute(${totalTotal},${usersAttackCritical[user]}, true)" oncontextmenu="game.macros.getName('Health Vitality Change').execute(${totalTotal},${usersAttackCritical[user]}, false)">${totalTotal}</a></b></u></p>`;
      usersDamageTotal[user] = {};
    }
    //if (m.data.roll)
      //message += `<span class="dice-tooltip" style="color:#000 !important"> ${$(await m.roll.getTooltip()).find(".dice-rolls")[0].outerHTML}</span>`;
  }
    if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')){
      let totalTotal = 0;
      for (let [key, value] of Object.entries(usersDamageTotal[user])) {
        message += `<p><b><a onclick="game.macros.getName('Health Vitality Change').execute(${value},${usersAttackCritical[user]}, true)" oncontextmenu="game.macros.getName('Health/Vitality Change').execute(${value},${usersAttackCritical[user]}, false)">Total ${key} Damage:  ${value}</a></b></p>`;
          totalTotal += value;
      }
      if (Object.keys(usersDamageTotal[user]).length > 1)
        message += `<p><u><b><a onclick="game.macros.getName('Health Vitality Change').execute(${totalTotal},${usersAttackCritical[user]}, true)" oncontextmenu="game.macros.getName('Health Vitality Change').execute(${totalTotal},${usersAttackCritical[user]}, false)">Total Damage:  ${totalTotal}</a></b></u></p>`;
      usersDamageTotal[user] = {};
      
    }
    
  
  if (m.data.flags?.world?.save !== undefined && m.data.speaker.token) {
    //console.log(Object.keys(m.data.flags.world.save), Object.values(m.data.flags.world.save));
    saves[user][Object.keys(m.data.flags.world.save)[0]] = Object.values(m.data.flags.world.save)[0];
  }
  //console.log(saves);
  
  if (m.data.flags?.world?.targetIds) {
    let hits = [];
    let saved = [];
    let failed = [];
    let targets = '<div class="thl"></div>';
    for (let t_id of m.data.flags.world?.targetIds){
      let t = canvas.tokens.get(t_id);
      if (!t) continue;
      let traits = '';
      for (const [key, value] of Object.entries(t.actor.data.data.traits)) {
        if (key !== 'languages' && key !== 'size' && key !== 'weaponProf' && key !== 'armorProf' && key !== 'toolProf' &&
          t.actor.data.data.traits[key]?.value?.length) {
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
        
      
      
      targets += `<div style="margin: 5px 0 0 0;"><a class="target-img" data-id="${t_id}"><img src="${t.data.img}" height="36" style="border:unset; float: left; clear:both; margin-right: 5px;">${t.actor.data.name} ${traits}` ;
      if (m.data.flavor?.toUpperCase().includes('ATTACK'))
        targets += `<br>AC: ${t.actor.data.data.attributes.ac.value} (${usersLastAttack[user] >=t.actor.data.data.attributes.ac.value?'hits':'misses'})`
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')){
        targets += `<br><b>${saves[user][t.id]}</b> Save`;
      }
      targets += `</a><a class="x-target" data-tid="${t_id}" data-mid="${m.id}"><i class="fas fa-times" style="float:right; font-size: 1.25em; margin-right: 1em;"></i></a></div>`;
      
    }
    if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR'))
      saves[user] = {};
    console.log(m, hits, saved, failed);
    
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
  message += `</div>`
  //users[user].push(message);  
  messages.push(message);
  //m = game.messages.contents[game.messages.contents.length - i];
}


for (const m of messages) {
        content += m; 
}
content += '</div>';
//console.log(users);
let aliasSelect = `<center style="border-bottom: 1px solid white;"><select id="alias-select" style="margin-bottom:.5em;  width: 100%;"><option value="" ${selectedAlias?'selected':''}></option>`;
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
      //let t_Id = $(this).attr('class').replace('-target-img','');
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
      let targets = [...game.user.targets].map(t => t.id);
      if (!targets.map(t => t.id).includes(t_Id)) targets.push(t_Id);
      //else targets.splice([...game.user.targets].indexOf(t_Id),1);
      game.user.updateTokenTargets(targets);
    });
    
    $("a.target-img > img").hover((e) => {
            let panTarget = canvas.tokens.get($(e.originalEvent.srcElement).parent().attr('data-id'));
            canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
        },() => {});
    
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
    
    $('a.effect-button').click(async function(e){
      let effect = $(this).attr('name');
      await game.dfreds.effectInterface.toggleEffect(effect, {uuids: canvas.tokens.controlled.map(t=>t.actor.uuid)});
    });
  
  },
  close:   html => {
    while (Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))>-1)
      Hooks._hooks.renderChatMessage.splice( Hooks._hooks.renderChatMessage.findIndex(f=>f.toString().includes('renderchatmessagesdialog')), 1)
  return}
},position
);
d.render(true);
