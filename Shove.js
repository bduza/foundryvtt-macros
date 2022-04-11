if (!Array.from(game.user.targets).length) return ui.notifications.warn('No Target!');
if (Array.from(game.user.targets).length > 1) return ui.notifications.warn('Too Many Targets!');
if (!token) return ui.notifications.warn('No Token Selected!');
let target = Array.from(game.user.targets)[0];
if (tokenDistance(target, token) > 7.5) return ui.notifications.warn('Targeted token too far away!');
actor = token.actor;
let away = true;
if (this.name === 'Shove')
  away = await new Promise((resolve)=>{
      new Dialog({
       title: 'Shove Away or Prone?',
       content:  '',
       buttons: {
         away: { label : `Away`, callback : () => { resolve(true); }},
         prone:  { label : `Prone`,  callback : () => { resolve(false); }}
       },
       default: "away",
       close:   html => { resolve(true); }
        },{}
      ).render(true);
  });
let skillRoll =  await actor.rollSkill('ath');
let total = skillRoll._total
let targetSkills = target.actor.data.data.skills
console.log('ath:',targetSkills.ath.total, 'acr:',targetSkills.acr.total);
let mod, skill;
if (targetSkills.ath.total>=targetSkills.acr.total) {
  mod = targetSkills.ath.total;
  skill = 'Athletics';
} else {
  mod = targetSkills.acr.total;
  skill = 'Acrobatics';
}
let dc = mod + 10;
let opposingRoll = await new Roll(`1d20 + ${mod}`).toMessage({flavor:`Opposing with ${skill}`, speaker: ChatMessage.getSpeaker({token})});
dc = opposingRoll.roll._total;
await waitFor3DDiceMessage(opposingRoll.id);

if (total<dc) return ChatMessage.create({flavor: `${this.name} Failed`, speaker:ChatMessage.getSpeaker({token})});
else ChatMessage.create({flavor: `${this.name} Sucessful`, speaker:ChatMessage.getSpeaker({token})});

if (this.name === 'Shove') {
  if (away) await game.macros.getName('Move Token').execute(token, target);
  else await game.dfreds.effectInterface.addEffect({effectName: "Prone", uuid:target.actor.uuid});
}
if (this.name === 'Grapple')
  await game.dfreds.effectInterface.addEffect( {effectName: "Grappled", uuid:target.actor.uuid});

function tokenDistance(token1, token2){
  if(!(token1 instanceof Token) || !(token2 instanceof Token)) return;

  let distance = canvas.grid.measureDistance(token1, token2);
  if(token1.elevation !== token2.data.elevation){
    let h_diff = token2.data.elevation > token1.data.elevation 
      ? token2.data.elevation - token1.data.elevation 
      : token1.data.elevation - token2.data.elevation;

    return Math.sqrt(Math.pow(h_diff,2) + Math.pow(distance,2));
  }else
    return distance;
}

function waitFor3DDiceMessage(targetMessageId) {
  function buildHook(resolve) {
    Hooks.once('diceSoNiceRollComplete', (messageId) => {
      if (targetMessageId === messageId)
        resolve(true);
      else
        buildHook(resolve)
    });
  }
  return new Promise((resolve,reject) => {
    if(game.dice3d){
      buildHook(resolve);
    } else {
      resolve(true);
    }
  });
}