let content = '<table>'
for (let actor of game.actors.filter(a=>a.hasPlayerOwner)) { 
  let pct = actor.data.data.attributes.encumbrance.pct;
  let status='';
  let encumbered = await game.dfreds.effectInterface.hasEffectApplied('Encumbered', actor.uuid);
  let encumberedHeavy = await game.dfreds.effectInterface.hasEffectApplied('Heavily Encumbered', actor.uuid);
  console.log(encumbered, encumberedHeavy)
  if (pct < 1/3*100){
    console.log(actor.name, status='Not Encumbered');
    if (encumbered)
      await game.dfreds.effectInterface.removeEffect({effectName:'Encumbered', uuid:actor.uuid});
    if (encumberedHeavy)
      await game.dfreds.effectInterface.removeEffect({effectName:'Heavily Encumbered', uuid:actor.uuid});
  }
  if (pct > 1/3*100 && pct < 2/3*100) {
    console.log(actor.name, status='Encumbered');
    if (!encumbered)
      await game.dfreds.effectInterface.addEffect({effectName:'Encumbered', uuid:actor.uuid});
    if (encumberedHeavy)
      await game.dfreds.effectInterface.removeEffect({effectName:'Heavily Encumbered', uuid:actor.uuid});
  }
  if (pct > 2/3*100 && pct !== 100) {
    console.log(actor.name, status='Heavily Encumbered');
    if (encumbered)
      await game.dfreds.effectInterface.removeEffect({effectName:'Encumbered', uuid:actor.uuid});
    if (!encumberedHeavy)
      await game.dfreds.effectInterface.addEffect({effectName:'Heavily Encumbered', uuid:actor.uuid});
  }
  if (pct == 100){
    console.log(actor.name, status='Immobile');
    if (!encumbered)
      await game.dfreds.effectInterface.addEffect({effectName:'Encumbered', uuid:actor.uuid});
    if (!encumberedHeavy)
      await game.dfreds.effectInterface.addEffect({effectName:'Heavily Encumbered', uuid:actor.uuid});
  }
  content += `<tr><td>${actor.name}</td><td><center>${actor.data.data.attributes.encumbrance.value}/${actor.data.data.attributes.encumbrance.max/3}<//center></td><td>${Math.floor(pct)}%</td><td>${status}</td><tr>`;
}
content += '</table>';
let d = new Dialog({
  title: 'Party Encumbrance',
  content:  content,
  buttons: {},
  close:   html => {
    return}
}).render(true);