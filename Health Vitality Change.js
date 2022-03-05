let doVitality = false; 
let inputValue='';
let inputCritical=false;
let useTargets=true;
if (args[0])
    inputValue = args[0];
if (args[1])
    inputCritical = args[1];
if (args[2])
    useTargets = args[2];
  
function tokenIds() {
    let targets = [];
    $(".userSelected:checked").each(function () {
            targets.push(this.name);
    });
    return targets;
}
let windowId = "health-vitality-dialog";
let position = Object.values(ui.windows).find(w=> w.id===windowId)?.position || {  width : 400 };
position["id"] = windowId;
console.log(position);

let content=`
<style>

.userSelected:before {
content: '';
  width: 32px;
  height: 32px;
  position: absolute;
  z-index: 100;
}
:checked+.userSelectedLabel > img {
content: '';
  width: 36px;
  height: 36px;
  border: 1px solid #ff6400;
}
#crit-checkbox:checked + #crit-checkbox-label  {
  text-shadow: 0 0 8px red;
}
#crit-checkbox-label  {
  cursor: pointer;
}
#crit-checkbox-label:hover  {
  cursor: pointer;
  text-shadow: 0 0 8px red;
}
</style>
`;
//let visibleTokens = canvas.tokens.placeables.filter(t => t.visible);


content += `<center><div id="selected-tokens" style="height: ${Math.ceil(canvas.tokens.placeables.length/9)*40}px">`;
for (const x of canvas.tokens.placeables){
       //console.log(x);
        content += `<input type="checkbox" class="userSelected" id="target-${x.id}" name="${x.id}" style="display: none;"/>
        <label class="userSelectedLabel" for="target-${x.id}" title="${x.data.name}"><img height="36" src="${x.data.img}" /></label>`;
    }
content += `</div></center>`;

if (doVitality) 
  content += `<center style="margin-bottom:.2em">
        <a onclick="$('#damage').val(Math.floor($('#damage').val()/2))">Halve</a>&emsp;
        <input type="checkbox" id="crit-checkbox"  style="display: none;" ${(inputCritical?'checked':'')}/>
        <label for="crit-checkbox" id="crit-checkbox-label">Critical</label></center>
        <input style="margin-bottom:.75em;width:100%;margin-right: 5px; text-align: center; " id="damage" name="damage" type="number" value="${inputValue}"></input >
        <div style="display:grid; grid-template-columns: repeat(5, 1fr); column-gap: .5em;">
        <button id="hv-damage">Damage</button>
        <button id="hv-heal">Heal</button>
        <button id="hv-setVitality">Vitality</button>
        <button id="hv-alterVitality">Alter</button>
        <button id="hv-reset">Full</button>
        </div>
  `;
else
  content += `<center style="margin-bottom:.2em">
        <a onclick="$('#damage').val(Math.floor($('#damage').val()/2))">Halve</a>&emsp;
        <input type="checkbox" id="crit-checkbox"  style="display: none;" ${(inputCritical?'checked':'')}/>
        <label for="crit-checkbox" id="crit-checkbox-label">Critical</label></center>
        <input style="margin-bottom:.75em;width:100%;margin-right: 5px; text-align: center; " id="damage" name="damage" type="number" value="${inputValue}"></input >
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); column-gap: .5em;">
        <button id="hv-damage">Damage</button>
        <button id="hv-heal">Heal</button>
        <button id="hv-reset">Full</button>
        </div>
  `;

let vitalityMacro = 'UpdateVitality(actor, damage, hpOld, critical)';
let d = new Dialog({
  title: 'Health Vitality Change',
  //<label><input id="critical" name="critical" type="checkbox" value="false"></input>Critical</label>
  //
  content,
  render: (content) => {
    let header = 'Health Vitality Change';
    header += `<a id="targets-header-button" title="Targets to Chat" style="float:right"><i class="fas fa-crosshairs"></i>Update Targets</a>`;
    $(`#health-vitality-dialog > header > h4`).html(header);
    
    $("#targets-header-button").click(async function(){
      $('.userSelected:checkbox').each(function () {
        if (!useTargets) {
            if (canvas.tokens.controlled.map(t => t.id).includes(this.name)) this.checked = true;
            else this.checked = false;
          } else {
            if ([...game.user.targets].map(t => t.id).includes(this.name)) this.checked = true;
            else this.checked = false;
          }
      });
    });
    
        $('.userSelected:checkbox').each(function () {
          if (!useTargets) {
            if (canvas.tokens.controlled.map(t => t.id).includes(this.name)) this.checked = true;
          } else {
            if ([...game.user.targets].map(t => t.id).includes(this.name)) this.checked = true;
          }
        });
        
        $(".userSelected").click(async function(){
          if (!useTargets) {
            if (this.checked)
                canvas.tokens.get(this.name).control({releaseOthers: false});
            else
                canvas.tokens.get(this.name).release();
          } else {
            let t = [];
            $('.userSelected:checkbox:checked').each(function () {
                t.push(`${this.name}`);
            });
            //console.log(t);
            game.user.updateTokenTargets(t);
            //let panTarget = canvas.tokens.get(this.name);
            //canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
          }
        });
        $("#hv-damage").click(async function(){
          let damage = parseInt($('#damage')[0].value);
          let critical = $("#crit-checkbox")[0].checked;
          if (damage)
          {
              for (let id of tokenIds()) {
                  const t = canvas.tokens.get(id);
                  const a = t.actor;
                  const hpOld = a.data.data.attributes.hp.value;
                  await a.applyDamage(damage);
                  if (doVitality) game.macros.getName(vitalityMacro).execute(a, damage, hpOld, critical);
                  
              }
              
          }
        });
        $("#hv-heal").click(async function(){
          let damage = $('#damage')[0].value;
          if (damage)
          {
              damage = damage*-1;
              for (let id of tokenIds()) {
                  const t = canvas.tokens.get(id);
                  const a = t.actor;
                  const hpOld = a.data.data.attributes.hp.value;
                  await a.applyDamage(damage);
                  if (doVitality) game.macros.getName(vitalityMacro).execute(a, damage, hpOld, false);
                  
              }
          }
        });
        $("#hv-setVitality").click(async function(){
          for (let id of tokenIds()) {
            const t = canvas.tokens.get(id);
            const a = t.actor;
            if (a.type === 'character') {
                
                
                let hp = a.data.data.attributes.hp.value;
                
                const vitality = Math.min(html.find('#damage')[0].value, a.data.data.abilities.con.value);
                const con = a.data.data.abilities.con.value;
                let updates = {};
                updates["flags.world.vitality"] = {"value" : vitality, "min": 0 , "max" : con};
                let level = 0;
                let hpRolled = 0;
                let hd ;
                for (let [key, value] of Object.entries(a.classes)){
                    hd = parseInt(value.data.data.hitDice.split('d')[1])
                    hpRolled += hd+Math.ceil((hd+1)/2)*(value.data.data.levels-1);
                    level += value.data.data.levels;
                }
                let hpVitality =Math.floor((vitality/2)-5)*level; 
                let hpNewMax = hpRolled+ hpVitality;
                
                updates["data.attributes.hp.max"] =  hpNewMax;
                let damage = 0;
                if (a.data.data.attributes.hp.value > hpNewMax){
                    updates["data.attributes.hp.value"] = hpNewMax;
                    damage = a.data.data.attributes.hp.value - (hpNewMax);
                }
                await a.update(updates) ; 
                console.log(t.actor.data.data.attributes.hp.hpNewMax);
                console.log(t.actor.getFlag("world", "vitality"));
                let messageContent = `hp: (${hp}${(damage>0)?'-'+damage:'+'+damage*-1}=${a.data.data.attributes.hp.value})/(${hpNewMax})  vi:     ${vitality}/${con}`;
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({actor: a}),
                    content: messageContent,
                    whisper: ChatMessage.getWhisperRecipients("GM")
                });
            }  
          }
            
        });
        $("#hv-alterVitality").click(async function(){
          for (let id of tokenIds()) {
            const t = canvas.tokens.get(id);
            const a = t.actor;
            if (a.type === 'character') {
                
               
                let hp = a.data.data.attributes.hp.value;
                let v = a.getFlag("world", "vitality");
                let input = html.find('#damage')[0].value;
                let vitality = parseInt(v.value) + parseInt(input);
                console.log(`${vitality}, 0 , ${t.actor.data.data.abilities.con.value}`);
                vitality = Math.clamped(vitality, 0, a.data.data.abilities.con.value);
                const con = a.data.data.abilities.con.value;
                let updates = {};
                updates["flags.world.vitality"] = {"value" : vitality, "min": 0 , "max" : con};
                
                
                let level = 0;
                let hpRolled = 0;
                let hd ;
                for (let [key, value] of Object.entries(a.classes)){
                    hd = parseInt(value.data.data.hitDice.split('d')[1])
                    hpRolled += hd+Math.ceil((hd+1)/2)*(value.data.data.levels-1);
                    level += value.data.data.levels;
                }
                let hpVitality =Math.floor((vitality/2)-5)*level; 
                let hpNewMax = hpRolled+ hpVitality;
                
                updates["data.attributes.hp.max"] =  hpNewMax;
                let damage = 0;
                if (a.data.data.attributes.hp.value > hpNewMax){
                    updates["data.attributes.hp.value"] = hpNewMax;
                    damage = a.data.data.attributes.hp.value - (hpNewMax);
                }
                await a.update(updates) ; 
                console.log(t.actor.data.data.attributes.hp.hpNewMax);
                console.log(t.actor.getFlag("world", "vitality"));
                let messageContent = `hp: (${hp}${(damage>0)?'-'+damage:'+'+damage*-1}=${a.data.data.attributes.hp.value})/(${hpNewMax})  vi:     ${vitality}/${con}`;
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({actor: a}),
                    content: messageContent,
                    whisper: ChatMessage.getWhisperRecipients("GM")
                });
                
              }
            }
        });
        $("#hv-reset").click(async function(){
          for (let id of tokenIds()) {
            const t = canvas.tokens.get(id);
            if (doVitality) {
              if (t.actor.type === 'character' ) {
                  let level = 0;
                  let hpRolled = 0;
                  let hd ;
                  for (let [key, value] of Object.entries(t.actor.classes)){
                      hd = parseInt(value.data.data.hitDice.split('d')[1])
                      hpRolled += hd+Math.ceil((hd+1)/2)*(value.data.data.levels-1);
                      level += value.data.data.levels;
                  }
                  let hpVitality =Math.floor((t.actor.data.data.abilities.con.value/2)-5)*level; 
                  let hpNewMax = hpRolled+ hpVitality;
                  console.log('hp rolled   '+hpRolled);
                  console.log('hp vitality '+hpVitality);
                  console.log('hp new max  '+hpNewMax);
                  await t.actor.setFlag("world", "vitality", {"value" :t.actor.data.data.abilities.con.value , "min": 0 , "max" :t.actor.data.data.abilities.con.value, "hp0": false, "hpMax":hpNewMax});
                  await t.actor.update({"data.attributes.hp.max": hpNewMax});
                  console.log(t.actor.data.data.attributes.hp.max);
                  if (t.actor.data.data.attributes.hp.max !== t.actor.data.data.attributes.hp.value) await t.actor.update({"data.attributes.hp.value": t.actor.data.data.attributes.hp.max});
                  console.log(t.actor.getFlag("world", "vitality"));
              }
              else await t.actor.applyDamage(-1000);
            }
            else await t.actor.applyDamage(-1000);
          }
        });
    },
  buttons: { },
  close:   html => {
      return}
}, position
);
d.render(true);
$("#health-vitality-dialog").ready(function(){
$("input#damage").focus();
});
for ( let w of Object.values(ui.windows).filter(w=> w.id.includes("health-vitality-dialog")))
  ui.windows[w.appId].bringToTop();
