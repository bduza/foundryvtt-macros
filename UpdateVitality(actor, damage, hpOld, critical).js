//let a = actorEntity;
//let hpOld = data.oldHpVal;

let a = args[0];
let damage = args[1];
let hpOld = parseInt(args[2]);
let isCritical = args[3];

if (args[0] == undefined || args[1] == undefined || args[2] == undefined || args[3] == undefined) 
    return console.log(args[0] , args[1] ,args[2] ,args[3]);

if (a.type !== 'character') 
    return;
    
let hp = a.data.data.attributes.hp;
let con = a.data.data.abilities.con;
console.log('hpOLD:' + hpOld)
if (!a.getFlag("world", "vitality")) await a.setFlag("world", "vitality", {"value" : con.value , "min": 0 , "max" : con.value, "hp0": false});
console.log(`Updating vitality for ${a.name}`);
let vitalityObj = a.getFlag("world", "vitality");
let vitality = vitalityObj.value;
let vitalityStart = vitalityObj.value;
let vitalityDamage = 0;
if (damage > 0) {
    vitalityDamage = Math.floor(damage/10);
    //if (hp0) vitalityDamage+=1;
}
else {
    // if this was healing, heal vitality 1 point for every 10 healing if they have max health
    if (hpOld >=  hp.max)
        vitalityDamage = Math.ceil(damage/10);
    // if they recieved healing that wouldput them at max and then have 10+ left over
    console.log(hpOld-hp.max-damage);
    if ((hpOld-hp.max-damage) >=10)
        vitalityDamage = Math.ceil(damage/10);
}
// calculate for overkill for additional vitality damage
let hpRemaining = hpOld-damage;
if (hpRemaining < 0)  vitalityDamage -= hpRemaining;
if (isCritical)
    vitalityDamage = Math.max(1, vitalityDamage*2);
// apply vitality damage
console.log(`${a.name} vitalityDamage: ${vitalityDamage}`);
console.log(`${a.name} old vitality: ${vitality}`);
vitality -= parseInt(vitalityDamage);
// to prevent overhealing vitality
vitality = Math.min(vitality, vitalityObj.max);
// to prevent overkilling vitality
if (vitality < 0 ) vitality = 0;
// automatic 0 hp at 0 vitality
if (vitality === 0) hpRemaining = 0;
// log new vitality value
console.log(`${a.name} new vitality: ${vitality}`);
// calculate new max hp
let level = 0;
let hpRolled = 0;
let hd ;
for (let [key, value] of Object.entries(a._classes)){
    hd = parseInt(value.data.data.hitDice.split('d')[1])
    hpRolled += hd+Math.ceil((hd+1)/2)*(value.data.data.levels-1);
    level += value.data.data.levels;
}
console.log('level       '+level);
let hpVitality =Math.floor((vitality/2)-5)*level; 
let hpNewMax = hpRolled+hpVitality;
if (hpNewMax < 1)
    hpNewMax = 1;
console.log('hp rolled   '+hpRolled);
console.log('hp vitality '+hpVitality);
console.log('hp new max  '+hpNewMax);

const updates = {};
// keep them alive if hp=0, but still has vitality (prevents CUB from knocking them unconsious and prone if you do that)
// maybe add this to the conditions below if we don't want non-characters surviving on vitality && a.type === 'character'
// && false to keep this from triggering
/*
if (vitality > 0 && hpRemaining < 1 && a.type === 'character') {
    updates["data.attributes.hp.value"] =  1;
    hp0 = true;
} else {
    hp0 = false;
}*/
// if they somehow got vitality damage to their tempmax more than the damage reduced, reduce their hp.value to match (should only come into play at higher levels or bad monster calculations)
if (hp.value > hpNewMax) {
    updates["data.attributes.hp.value"] = hpNewMax;
} 
// if they recieved healing more than the tempmax would allow at the time, but tempmax has increased give them the correct health
if (hpOld-damage>hpNewMax) {
    hpRemaining = Math.min(hp.value-damage, hpNewMax);
    // the damage(healing) = damage - the difference of damage and the correct health value 
    //damage = (hpRemaining - hpOld)*-1;
    // remaining hp is should be this?
    // hpRemaining = hp - damage;
    updates["data.attributes.hp.value"] = hpRemaining;
}

if (vitality === 0)
{
    updates["data.attributes.hp.value"] =  0;
}
// if they took vitality damage, update the vitality flag and hp tempmax
if (vitalityDamage !== 0) {
    updates["data.attributes.hp.max"] =  hpNewMax;
    updates["flags.world.vitality"] = {"value" : vitality , "min": 0 , "max" : con.value};//, "hp0": hp0
}
// do all the updates
console.log(updates);
await a.update(updates);
//(!tempMaxOld === tempMax )
// whisper the GM with all the changes
let maxDisplay = ''
let hpMaxChange = Math.abs(hp.max-hpNewMax);
!hpMaxChange ?
maxDisplay = hp.max:
(hp.max-hpNewMax<0)?
maxDisplay = '('+hp.max.toString()+'+'+hpMaxChange.toString()+'='+hpNewMax.toString()+')':
maxDisplay = '('+hp.max.toString()+'-'+hpMaxChange.toString()+'='+hpNewMax.toString()+')';

let messageContent = `hp: (${hpOld}${(damage>-1)?'-'+damage:'+'+damage*-1}=${hpRemaining})/${maxDisplay}  vi: ${vitalityStart}${(vitalityDamage>0)?'-'+vitalityDamage:'+'+vitalityDamage*-1}=${vitality}/${vitalityObj.max}`;
ChatMessage.create({
     speaker: ChatMessage.getSpeaker({actor: a}),
     flavor:messageContent,
     content: '',
     whisper: ChatMessage.getWhisperRecipients("GM")
});