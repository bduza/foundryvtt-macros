if (!args[0]) return;
else {
  let uuidParts = args[0].split('.');
  console.log(uuidParts);
  if (uuidParts[2]==='Token') actor = canvas.tokens.get(uuidParts[3]).actor;
  else  actor = game.actors.get(uuidParts[1]);
  actor = canvas.tokens.placeables.find(t=>t.actor?.uuid===args[0]).actor;
}
let rollType = args[1];
let abilType = args[2];
console.log(args);

let t = '';
if (!token) token = _token;
if (!token && !actor) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");;
token = null

t = actor.uuid.replaceAll('.','_');
console.log('t: ', t);
    
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
  
let top = 3;
//let left = window.innerWidth-610;
if (game.user.isGM) top = 80;
let left = 110;
let width = 330;
let w_id = `${t}-${roll}-dialog`;
let position = Object.values(ui.windows).find(w=> w.id===w_id)?.position || 
  {  width: width ,  top: top, left: left };
position["id"] = w_id;
if (args[3]) position = {...position, ...args[3]};

let closeOnMouseLeave = args[4];
console.log('closeOnMouseLeave', closeOnMouseLeave)

console.log(roll)
let wTargets = [];

for (const [key, value] of Object.entries(actor.data.permission)) {
  if (key !== 'default' && value === 3)
    wTargets.push(game.users.get(key).name)
}
let whisperTargets = wTargets.join(', ')
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
<a id="${w_id}-rollmodeselectpr" name="publicroll" class="rms">&ensp;/pr&ensp;</span>
<a id="${w_id}-rollmodeselectgm" name="gmroll"     class="rms">&ensp;/gmr&ensp;</span>
<a id="${w_id}-rollmodeselectbr" name="blindroll"  class="rms">&ensp;/br&ensp;</span>
<a id="${w_id}-rollmodeselectsr" name="selfroll"   class="rms">&ensp;/sr&ensp;</span>
</center>`;
content = TextEditor.enrichHTML(content) ;
let d = new Dialog({
    title : `${actor.data.name} ${rollType.capitalize()} ${abilType?abilType.capitalize():''}`, 
    content : content,
    render : (content) => {
      if (closeOnMouseLeave)
        $(`#${w_id}`).mouseleave(async function(e){
          Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
        });
      
      $(`[id$=${w_id}-straight-section-tab]`).css('textShadow' , "0 0 8px red");
      $(`#${w_id}-rollmodeselect-roll`).css('textShadow' , "0 0 8px red");
      $(`[id^=${w_id}-rollmodeselect]`).click(async function(e){
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
      $(`#${w_id}`).find(`section.window-content`).click(async function(e){
        console.log(this);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].bringToTop();
      });
    },
    buttons : {},
    close:   html => { 
      return;
    }
},position).render(true);