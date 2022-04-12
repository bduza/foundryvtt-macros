function getMessages() {
  return game.messages.contents.reverse().filter(m=>m._roll && m.data.user === game.user.id && !m.data.blind);
}

function lastChatMessage(l) {
  let message;
  if (!$('#Dice-Tray-Dialog').find('.message-id').val() || l) {
    message = getMessages()[0];
    $('#Dice-Tray-Dialog').find('.message-id').val(message.id);
  } else message = game.messages.get($('#Dice-Tray-Dialog').find('.message-id').val());
  //if (game.user.isGM)
    //message = game.messages.contents.reverse().filter(m=>m._roll && m.data.speaker.actor === actor.id)[0]
  $("#Dice-Tray-Dialog .roll-formula").val(message.roll.formula);
  $("#Dice-Tray-Dialog .roll-flavor").val(message.data.flavor);
  $(`.dice-formula`).removeAttr('style');
  $(`li[data-message-id="${message.id}"]`).find(`.dice-formula`).attr('style',"border: 1px solid red !important;");
  return message;
}
function prevChatMessage() {
  let message;
  let messages = getMessages();
  if ($('#Dice-Tray-Dialog').find('.message-id').val()) {
    let i = messages.indexOf(game.messages.get($('#Dice-Tray-Dialog').find('.message-id').val()));
    message = messages[i+1];
    if (!message) return;
    $('#Dice-Tray-Dialog').find('.message-id').val(message.id);
  } else message = messages[0];
  //if (game.user.isGM)
    //message = game.messages.contents.reverse().filter(m=>m._roll && m.data.speaker.actor === actor.id)[0]
  $("#Dice-Tray-Dialog .roll-formula").val(message.roll.formula);
  $("#Dice-Tray-Dialog .roll-flavor").val(message.data.flavor);
  $(`.dice-formula`).removeAttr('style');
  $(`li[data-message-id="${message.id}"]`).find(`.dice-formula`).attr('style',"border: 1px solid red !important;");
  return message;
}
function nextChatMessage() {
  let message;
  let messages = getMessages();
  if ($('#Dice-Tray-Dialog').find('.message-id').val()) {
    let i = messages.indexOf(game.messages.get($('#Dice-Tray-Dialog').find('.message-id').val()));
    message = messages[i-1];
    if (!message) return;
    $('#Dice-Tray-Dialog').find('.message-id').val(message.id);
  } else message = messages[0];
  
  //if (game.user.isGM)
    //message = game.messages.contents.reverse().filter(m=>m._roll && m.data.speaker.actor === actor.id)[0]
  $("#Dice-Tray-Dialog .roll-formula").val(message.roll.formula);
  $("#Dice-Tray-Dialog .roll-flavor").val(message.data.flavor);
  $(`.dice-formula`).removeAttr('style');
  $(`li[data-message-id="${message.id}"]`).find(`.dice-formula`).attr('style',"border: 1px solid red !important;");
  return message;
}

actor = _token?.actor// || character || null;
let width = 60;
//if (!actor) return ui.notifications.error('no actor');
if (!jQuery.ui) {
  $('head').append($('<script src="https://code.jquery.com/ui/1.13.1/jquery-ui.js" id="jquery-ui"></script>'));
  let waitRender = Math.floor(1000 / 10);
  while (!jQuery.ui && waitRender-- > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

let content = `
  <style>
  #Dice-Tray-Dialog {
    z-index: 1000;
    border: 1px solid var(--color-border-dark);
    border-radius: 5px; 
    width: ${width*7}px;
    background: url(../ui/denim075.png) repeat;
    padding: .5em;
    box-shadow: 0 0 20px var(--color-shadow-dark);
  }
  #Dice-Tray-Dialog > header > h4 > a > i{margin: 0 3px 0 0}
  #input-div input, #input-div button, #dice-div button{
    text-align: center;
    margin: 0 !important;
    width: 100% !important;
  }
  #input-div.hidden input.roll-flavor, #input-div.hidden .edit-buttons button {
  /*display:none !important;*/
    text-align: center;
    pointer-events:none;
    
  }
  #input-div.hidden .edit-buttons {
    display:none !important;
  }
  #input-div div.message-buttons {
    display:none !important;
  }
  #input-div.hidden div.message-buttons{
    display:grid !important;
  }
  #input-div.hidden > div.edit-buttons {
    display:none;
  }
  #input-div.hidden .roll-formula {
    border: 1px solid red !important;
    pointer-events:none;
    width: 100% !important;
  }
  .term img {
    width: ${width}px;
    margin: 20% auto -17% auto;
    filter:  invert(100%);
    transition-property: filter;
    transition-duration: .1s; 
  }
  .term img:hover {filter: drop-shadow(0px 0px 4px #0ff) invert(100%);}
  .term:hover {text-shadow: 0 0 8px var(--color-shadow-primary);}
  .saved-rolls { 
    line-height: 1.75em; 
    width: auto; 
    margin: .5em 0 0 0 ;
    word-wrap: break-word; 
    display: grid; 
    grid-template-columns: auto;
    row-gap: .25em;
  }
  .advantage {line-height: 1.65em}
  .saved-rolls .inline-roll {text-align: center; border: 1px solid var(--color-border-light-primary);}
  .saved-rolls .inline-roll:hover {box-shadow: 0 0 5px var(--color-shadow-primary);}
  #Dice-Tray-Dialog * { background: unset !important; color: white; }
  #Dice-Tray-Dialog img { border: none}
  .roll-formula, .roll-flavor {border: 1px solid var(--color-border-light-primary) !important; margin-right: -2px;}
  .roll-button:hover, .save-button:hover {text-shadow: 0 0 8px var(--color-shadow-primary);}
  </style>
  <input class="message-id" style="display:none"></input>
  <div id="input-div" class="hidden" style="display:grid; grid-template-columns: auto /*auto auto max-content max-content*/; column-gap: 0em; margin: .2em 0 .25em 0; row-gap: .25em">
  
    <input class="roll-flavor" type="text" placeholder="flavor"></input>
    <input class="roll-formula" type="text" placeholder="formula"></input>
    <div class="edit-buttons" style="display:grid; grid-template-columns: auto auto">
      <button class="roll-button" style="line-height: 15px;">Roll</button>
      <button class="save-button" style="line-height: 15px;">Save</button>
    </div>
    <div class="message-buttons" style="display:grid; grid-template-columns: auto auto auto">
      <button class="prev-button" style="line-height: 15px;">Prev</button>
      <button class="next-button" style="line-height: 15px;">Next</button>
      <button class="last-button" style="line-height: 15px;">Last</button>
    </div>
  </div>
  
  <div id="dice-div" style="display:grid; grid-template-columns: calc(${width}px - .5em) repeat(6, auto); column-gap:.25em; justify-content:center;">
    <div style="display:grid; grid-template-columns: auto;row-gap:.25em;  ">
      <button class="advantage">ADV</button>
      <button class="dis advantage">DIS</button>
    </div>
    <button class="term" data-text="1d20"><img src="icons/dice/d20black.svg"></button>
    <button class="term" data-text="1d12"><img src="icons/dice/d12black.svg"></button>
    <button class="term" data-text="1d10"><img src="icons/dice/d10black.svg"></button>
    <button class="term" data-text="1d8" ><img src="icons/dice/d8black.svg"> </button>
    <button class="term" data-text="1d6" ><img src="icons/dice/d6black.svg"> </button>
    <button class="term" data-text="1d4" ><img src="icons/dice/d4black.svg"> </button>
  </div>`;

content += [1,2,3,4,5,6,7,8,9,10].reduce((acc, n)=> 
    acc+=`<center style="font-size:1em"><button class="term number" data-text="${n}" title="${n}">${n}</button></center>`,
    `<div id="nums-div" style="display:grid; grid-template-columns: repeat(10, auto); column-gap:.25em;  margin: .25em 0;">`)+`</div>`;
    
if (actor && game.system.id==='dnd5e')
  content += Object.entries(actor.data.data.abilities).reduce((acc, [key, value])=> 
    acc+=`<center style="font-size:1em"><button class="term" data-text="${value.mod}[${key}]" title="${value.mod}[${key}]">${key.toUpperCase()}</button></center>`,
    `<div id="abilities-div" style="display:grid; grid-template-columns: repeat(7, auto); column-gap:.25em;  margin: .25em 0;">`) +
    `<center style="font-size:1em"><button class="term" data-text="${actor.data.data.prof.term}[prof]" title="${actor.data.data.prof.term}[prof]">PROF</button></center></div>`;
    
content += `<div class="saved-rolls"></div>`;

let position = $(`#Dice-Tray-Dialog`).attr(`style`) || `top:10px;left:${window.innerWidth - width*7 -315}px;position:absolute;`;
$('#Dice-Tray-Dialog').remove();
/*let d = await new Dialog({
  title: header,
  content,
  buttons: {
  },
  render: (html) => {*/
let $tray = $(`<div id="Dice-Tray-Dialog" style="${position}"><header class="window-title"><h4></h4></header>${content}</div>`);
$(`body`).append($tray);
lastChatMessage()


let header = `<a class="last-message">Die Tray</a>${actor?.name?' - ' + actor?.name:''}`;
header += `<a title="Close" class="close" style="float: right" ><i class="fas fa-times"></i>Close</a>`;
header += `<a title="Roll 0" style="float: right" class="roll-0"><i class="fab fa-creative-commons-zero"></i>Roll</a>`;

if ($(`#input-div`).hasClass('hidden')) 
  header += `<a title="Change Mode" style="float: right" class="change-mode-button"><i class="fas fa-plus"></i>Roll </a>`;
else
  header += `<a title="Change Mode" style="float: right" class="change-mode-button"><i class="fas fa-dice-d20"></i>Build</a>`;  
$(`#Dice-Tray-Dialog`).draggable();
$(`#Dice-Tray-Dialog > header > h4`).html(header);
$(`#Dice-Tray-Dialog > header > h4 > a`).css('margin',' 0 8px 0 0 ')
$(`#Dice-Tray-Dialog > header > h4 > .close`).click(()=>{$('#Dice-Tray-Dialog').remove();});
$(`#Dice-Tray-Dialog > header > h4 > .last-message`).click(()=>{
  lastChatMessage(true);
});
$(`.change-mode-button`).click(function(){
  
  if ($(`#input-div`).hasClass('hidden')) {
    $(`#input-div`).removeClass('hidden')
    $(this).html(`<i class="fas fa-dice-d20"></i>Build`)
    $(`.dice-formula`).removeAttr('style');
  } else {
    $(`#input-div`).addClass('hidden')
    $(this).html(`<i class="fas fa-plus"></i>Roll`)
    lastChatMessage();
  }
  $('#Dice-Tray-Dialog').height('max-content');
});
$("#Dice-Tray-Dialog").css('min-width: max-content')
$("#Dice-Tray-Dialog .roll-formula").contextmenu(function(){$(this).val('')});
$("#Dice-Tray-Dialog .roll-flavor").contextmenu(function(){$(this).val('')});

/*
      <button class="prev-button" style="line-height: 15px;">Prev</button>
      <button class="next-button" style="line-height: 15px;">Next</button>
      <button class="last-button" style="line-height: 15px;">Last</button>
*/
$('#Dice-Tray-Dialog').find(`.prev-button`).click(async function(e){
  prevChatMessage();
});
$('#Dice-Tray-Dialog').find(`.next-button`).click(async function(e){
  nextChatMessage();
});
$('#Dice-Tray-Dialog').find(`.last-button`).click(async function(e){
  lastChatMessage(true);
});

$('#Dice-Tray-Dialog').find(`.term`).click(async function(e){
    if ($(`#input-div`).hasClass('hidden')) return;
    let toAdd = $(this).attr('data-text');
    if (toAdd==='1d20' && e.shiftKey) toAdd = '2d20kh1'
    if (toAdd==='1d20' && e.ctrlKey) toAdd = '2d20kl1'
    if (toAdd==='1d10' && e.shiftKey) toAdd = '1d100'
    let add = !!e.originalEvent;
    let targetElement = $("#Dice-Tray-Dialog .roll-formula");
    let termToAdd = Roll.parse(toAdd)[0];
    //console.log(add, termToAdd)
    let termsToRemove = [];
    let terms = Roll.parse(targetElement.val());
    let newTerm = true;
    if (!!termToAdd.flavor && !e.originalEvent) 
      newTerm = false;
    if (terms.length > 0) 
      for (let i = 0; i<terms.length; i++) {
        //console.log(i, terms[i])
        if (terms[i-1]?.operator == '-') add = !add;
        if (terms[i] instanceof DiceTerm && terms[i].faces == termToAdd.faces) {
          add?terms[i].number++:terms[i].number--;
          
          newTerm = false;
        }
        if (terms[i] instanceof NumericTerm && !terms[i].flavor && !termToAdd.flavor && termToAdd instanceof NumericTerm) {
          if (terms[i])
          add?terms[i].number+=termToAdd.number:terms[i].number-=termToAdd.number;
          if (terms[i].number < 0 && terms[i-1]?.operator == '-') {
            terms[i-1].operator = '+';
            terms[i].number = Math.abs(terms[i].number);
          }
          if (terms[i].number < 0 && terms[i-1]?.operator == '+') {
            terms[i-1].operator = '-';
            terms[i].number = Math.abs(terms[i].number);
          }
          
          newTerm = false;
        }
        if (terms[i].number == 0 && !terms[i].flavor)
          termsToRemove.push(terms[i]);
        
        if (!!termToAdd.flavor && (termToAdd.flavor == terms[i].flavor) && !!e.originalEvent)
          newTerm = false;
        
        if (!!termToAdd.flavor && (termToAdd.flavor == terms[i].flavor) && !e.originalEvent)
          termsToRemove.push(terms[i]);
          
      }
    
    //console.log('termsToRemove', termsToRemove)
    for (let term of termsToRemove)
      terms.splice(terms.indexOf(term),1)
      
    if (newTerm) {
      if (e.originalEvent) terms.push(Roll.parse('+')[0])
      else terms.push(Roll.parse('-')[0])
      terms.push(termToAdd);
    }
    terms = terms.cleanRollTerms();
    if (terms.length == 0) return targetElement.val('');
    //if (terms[0] instanceof OperatorTerm && terms[0]?.operator == '+') terms.splice(0,1);
    console.log(terms)
    targetElement.val(Roll.fromTerms(terms).formula);
    //targetElement.val(game.dnd5e.dice.simplifyRollFormula(formula, { preserveFlavor:true } ));
});

$('#Dice-Tray-Dialog').find(`.term`).contextmenu(async function(e) {$(this).click()});
$('#Dice-Tray-Dialog').find(`.term`).click(async function(e) {
  //console.log(e.originalEvent) // returns undefined if comming from the contextmenu event
  if (!$(`#input-div`).hasClass('hidden')) return;
  let message = lastChatMessage();
  if (!message?.roll) return ui.notifications.warn('no message found');
  let roll = message.roll;
  
  let toAdd = $(this).attr('data-text');
  if (toAdd==='1d20' && e.shiftKey) toAdd = '2d20kh1'
  if (toAdd==='1d20' && e.ctrlKey) toAdd = '2d20kl1'
  if (toAdd==='1d10' && e.shiftKey) toAdd = '1d100'
  let toAddRoll = await new Roll(toAdd).roll();
  if (game.modules.get('dice-so-nice')?.active)
    await game.dice3d.showForRoll(toAddRoll, game.user, true);
  //Hooks.once('renderChatMessage', ()=>{ ui.chat.scrollBottom() });
  roll._evaluated=false;
  roll._total=null;
  //if (!toAdd.includes('+')) 
  if (e.originalEvent) roll.terms = roll.terms.concat(Roll.parse('+'))
  else roll.terms = roll.terms.concat(Roll.parse('-'))
  roll.terms = roll.terms.concat(toAddRoll.terms)
  await roll.evaluate();
  roll.terms = roll.terms.cleanRollTerms();
  roll._formula = roll.formula;
  
  return updateMessageWithRoll(message, roll);
  if (game.user.isGM) {
    await message.update({content:roll.total, roll:JSON.stringify(roll)});
  } else if (game.macros.getName('updateChatMessage(id, update)')) {
    game.macros.getName('updateChatMessage(id, update)').execute(message.id, {content:roll.total, roll:JSON.stringify(roll)});
  } else {
    let messageData = {...message.data.toObject(), ...{content:roll.total, roll:JSON.stringify(roll)}};
    await message.delete();
    await ChatMessage.create(messageData);
  }
  return;
  //game.macros.getName('updateChatMessage(id, update)').execute(message.id, {content:roll.total, roll:JSON.stringify(roll)});
  if (message.data.flavor?.toLowerCase().includes('damage'))
    game.macros.getName('applyDamage(damage, targets)').execute(toAddRoll.total, [...game.user.targets].map(t=>t.id));
});

$('#Dice-Tray-Dialog').find(`.roll-button`).click(async function() {
  new Roll($("#Dice-Tray-Dialog .roll-formula").val()||'0').toMessage({flavor: `${$("#Dice-Tray-Dialog .roll-flavor").val()}`, speaker: ChatMessage.getSpeaker({actor})});
});

$('#Dice-Tray-Dialog').find(`.save-button`).click(async function() {
  let id = randomID();
  let formula = $("#Dice-Tray-Dialog .roll-formula").val();
  let flavor = $("#Dice-Tray-Dialog .roll-flavor").val();
  let $a = $(TextEditor.enrichHTML(`[[/r ${formula} # ${flavor}]]`));
  $a.attr('id', id);
  $a.contextmenu(async function() {
    let flag = game.user.data.flags.world.DiceTraySavedRolls;
    flag.splice(flag.indexOf($(this).attr('id')),1)
    await game.user.setFlag('world', 'DiceTraySavedRolls', flag);
    $(this).remove();
    $('#Dice-Tray-Dialog').height('max-content');
    //Object.values(ui.windows).find(w=>w.id==='Dice-Tray-Dialog').setPosition({height: 'auto'});
  });
  $a.html(`${formula}${flavor?` # ${flavor}`:``}`);
  $("#Dice-Tray-Dialog .saved-rolls").append($a);
  if (!game.user.data.flags.world.DiceTraySavedRolls) await game.user.setFlag('world', 'DiceTraySavedRolls', []);
  let flag = game.user.data.flags.world.DiceTraySavedRolls;
  flag.push({id, formula, flavor});
  await game.user.setFlag('world', 'DiceTraySavedRolls', flag);
  $('#Dice-Tray-Dialog').height('max-content');
  //Object.values(ui.windows).find(w=>w.id==='Dice-Tray-Dialog').setPosition({height: 'auto'});
});

if (game.user.data.flags.world?.DiceTraySavedRolls)
for (let sr of game.user.data.flags.world.DiceTraySavedRolls) {
  console.log(sr);
  let $a = $(TextEditor.enrichHTML(`[[/r ${sr.formula} # ${sr.flavor}]]`));
  $a.attr('id', sr.id);
  $a.contextmenu(async function() {
    let flag = game.user.data.flags.world.DiceTraySavedRolls;
    flag.splice(flag.indexOf($(this).attr('id')),1)
    await game.user.setFlag('world', 'DiceTraySavedRolls', flag);
    $(this).remove();
    $('#Dice-Tray-Dialog').height('max-content');
    //Object.values(ui.windows).find(w=>w.id==='Dice-Tray-Dialog').setPosition({height: 'auto'});
  });
  $a.html(`${sr.formula}${sr.flavor?` # ${sr.flavor}`:``}`);
  $("#Dice-Tray-Dialog .saved-rolls").append($a);
}

$('#Dice-Tray-Dialog').find(`button.term`).mouseup(async function() {
  $(this).find('img').css('filter', 'invert(50%)');
  //console.log($(this).css())
  await new Promise((r) => setTimeout(r, 150));
  $(this).find('img').removeAttr('style');
});

$('#Dice-Tray-Dialog').find(`.roll-0`).click(async function() {
  new Roll('0').toMessage({speaker: ChatMessage.getSpeaker({actor})});
});

$('#Dice-Tray-Dialog').find(`.advantage`).contextmenu(async function(e) {$(this).click()});
$('#Dice-Tray-Dialog').find(`.advantage`).click(async function(e) {  
  if ($(`#input-div`).hasClass('hidden')) return;
  let modifier = 'kh';
  if ($(this).hasClass('dis')) modifier = 'kl';
  if (!e.originalEvent) modifier = '';// returns undefined if comming from the contextmenu event
  let targetElement = $("#Dice-Tray-Dialog .roll-formula");
  let terms = Roll.parse(targetElement.val());
  terms.find(t=>t instanceof DiceTerm && t.faces==20).modifiers = [modifier];
  targetElement.val(Roll.fromTerms(terms).formula);
});

$('#Dice-Tray-Dialog').find(`.advantage`).click(async function() {  
  if (!$(`#input-div`).hasClass('hidden')) return;
  let message = lastChatMessage();
  let roll = message.roll;
  let terms = roll.terms;
  let remove = [];
  let newRoll = new Roll();
  let modifier = 'kh';
  if ($(this).hasClass('dis')) modifier = 'kl';
  for (let i1 = 0; i1<terms.length; i1++) {
    for (let i2 = 0; i2<terms.length; i2++)
      if (terms[i1] instanceof DiceTerm && terms[i2] instanceof DiceTerm && terms[i1].faces == terms[i2].faces && i1 !== i2 && terms[i1].faces == 20 && !remove.includes(terms[i2]) && !remove.includes(terms[i1])) {
        terms[i1].number+=terms[i2].number;
        terms[i1].results = terms[i1].results.concat(terms[i2].results);
        remove.push(terms[i2])
      }
  }
  for (let i = 0; i<terms.length; i++) {
    let newTerm = terms[i];
    if (!remove.includes(newTerm)) {
      if (newTerm instanceof DiceTerm) 
        newTerm.modifiers = [modifier];
      newRoll.terms.push(newTerm);
    }
  }
  let highest, lowest;
  for (let i = 0; i<newRoll.terms.length; i++)
    if (newRoll.terms[i] instanceof DiceTerm && newRoll.terms[i].faces == 20 && terms[i].results.length>1) {
      for (let r = 0; r<terms[i].results.length; r++) {
        if (!highest || highest.result < terms[i].results[r].result) highest = {index:r, result:terms[i].results[r].result};
        if (!lowest || lowest.result > terms[i].results[r].result) lowest = {index:r, result:terms[i].results[r].result};
      }
    }
  for (let i = 0; i<newRoll.terms.length; i++) {
    if (newRoll.terms[i] instanceof DiceTerm && newRoll.terms[i].faces == 20 && terms[i].results.length>1) {
      if (modifier === 'kh') 
        for (let d = 0; d<newRoll.terms[i].results.length; d++) 
          if (d !== highest.index) {
            terms[i].results[d].active = false;
            terms[i].results[d].discarded = true;
          } else {
            terms[i].results[d].active = true;
            terms[i].results[d].discarded = false;
          }
      if (modifier === 'kl') 
        for (let d = 0; d<newRoll.terms[i].results.length; d++) 
          if (d !== lowest.index) {
             terms[i].results[d].active = false;
             terms[i].results[d].discarded = true;
          } else {
            terms[i].results[d].active = true;
            terms[i].results[d].discarded = false;
          }
    }
  }
  newRoll.terms = newRoll.terms.cleanRollTerms();
  await newRoll.evaluate();
  console.log(highest, lowest, newRoll.terms);
  return updateMessageWithRoll(message, newRoll);
  //newRoll.toMessage();
});

    //console.log(html.find('img.term')[0].onload(()=>{game.windows.setPosition({height: '100%'});}))
    /*
  },
  close: html => {
    return
  }
},{id:'Dice-Tray-Dialog', width: 500}).render(true);

let waitRender = Math.floor(1000 / 10);
while (!d.rendered && waitRender-- > 0) {
  await new Promise((r) => setTimeout(r, 50));
}
//d.setPosition({height: '100%', width: 'auto'});
$('#dice-div img').ready(function(){
  $('#Dice-Tray-Dialog').height('max-content');
  //d.setPosition({height: 'auto'});
  //console.log('position set')
});
d.bringToTop();
*/
async function updateMessageWithRoll(message, roll) {
  for (let term of roll.terms.filter(term=> term instanceof DiceTerm))
    for (let result of term.results)
      result.hidden=true;
  if (game.user.isGM) {
    await message.update({content:roll.total, roll:JSON.stringify(roll)});
  } else if (game.macros.getName('updateChatMessage(id, update)')) {
    game.macros.getName('updateChatMessage(id, update)').execute(message.id, {content:roll.total, roll:JSON.stringify(roll)});
  } else {
    let messageData = {...message.data.toObject(), ...{content:roll.total, roll:JSON.stringify(roll)}};
    await message.delete();
    await ChatMessage.create(messageData);
  }
}

Array.prototype.cleanRollTerms = function() {
  //if (!(this[0] instanceof RollTerm)) return this;
  let terms = this;
  terms = terms.filter(t=>t.number!==0||t.flavor)
  terms = terms.filter((c, i)=>!c.operator||c.operator!=='+'||c.operator!==terms[i+1]?.operator)//||c.operator!=='+'
  if (terms[terms.length-1]?.operator) terms.pop();
  if (terms[0]?.operator && terms[0].operator==="+") terms.shift();
  //terms = Roll.parse(game.dnd5e.dice.simplifyRollFormula(Roll.fromTerms(terms).formula, { preserveFlavor:true } ));
  return terms;
}

if (!Hooks._hooks.renderChatMessage || Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('rollTermsBackup'))==-1)
Hooks.on('renderChatMessage', (message, html)=>{
  if (!message.roll) return;
  if (!message.roll?.terms) return;
  if (message.data.user === game.user.id && $("#Dice-Tray-Dialog").length) {
    $(`.dice-formula`).removeAttr('style');
    html.find(`.dice-formula`).attr('style',"border: 1px solid red !important;");
    $(`#Dice-Tray-Dialog > header > h4 > .last-message`).click();
  }
  html.find(`div.dice-tooltip`).css('display','block')
  let $diceTooltip = $(`<div class="dice-tooltip">`)
  let $tooltipPart = $(`<section class="tooltip-part">`)
  let $dice = $('<div class="dice">')
  let $ol = $('<ol class="dice-rolls" style="display:flex; justify-content: center;">')
  html.find("li.roll.die").each(function(){
    $ol.append($(this).clone());
  });
  html.find(".dice-tooltip").remove()
  $dice.append($ol);
  $tooltipPart.append($dice);
  $diceTooltip.append($tooltipPart)
  html.find("div.dice-formula").after($diceTooltip);
  if (!game.user.isGM) return;
  html.find('div.dice-formula').html(message.roll.terms.reduce((acc, t, i)=>acc+=`<a class="term" data-index="${i}">${t.formula}</a>`,``));
  html.find(`a.term`).click(async function(e) {
    e.preventDefault()
    let roll = message.roll;
    let rollTermsBackup = [...roll.terms];
    try {
      roll.terms.splice(parseInt($(this).attr('data-index')), 1);
      roll.terms = roll.terms.filter(t=>t.number!==0||!!t.flavor)
      roll.terms = roll.terms.filter((c, i)=>!c.operator||c.operator!=='+'||c.operator!==roll.terms[i+1]?.operator)
      if (roll.terms[roll.terms.length-1]?.operator) roll.terms.pop();
      if (roll.terms[0]?.operator && roll.terms[0].operator==="+") roll.terms.shift();
      if (!roll.terms.length) roll.terms = Roll.parse('0');
      roll._evaluated=false;
      roll._total=null;
      roll._formula = roll.formula;
      await roll.evaluate();
      roll._formula = roll.formula;
    } catch (err) {
      roll.terms = rollTermsBackup;
      roll._evaluated=false;
      roll._total=null;
      roll._formula = roll.formula;
      await roll.evaluate();
      return console.log(err);
    }
    await message.update( {content:roll.total, roll:JSON.stringify(roll)});
  });
});