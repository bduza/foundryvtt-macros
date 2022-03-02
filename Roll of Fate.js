const selected = canvas.tokens.controlled;
let tableMessage = '<h3>Roll of Fate!</h3><table>';
let start = 0;
let cutoff = 0;
for (var i = 0; i < selected.length; i++){
    console.log(selected[i].data.name );
    cutoff = Math.floor(parseFloat(i+1)*(100/selected.length)) ;
    tableMessage += '<tr><td>' + (start+1) + ' - ' + cutoff + '</td><td>' + selected[i].data.name + '</td></tr>';
    start = cutoff;
}
canvas.tokens.releaseAll();
ui.chat.processMessage(tableMessage);
let roll = await new Roll('1d100').roll({async:true});
roll.toMessage();
let total = 0;
roll.total === 100 ? total = 99 : total = roll.total;//roll.total;
Hooks.once("diceSoNiceRollComplete",(messageId) => {
let chosen = selected[Math.floor(total/(100/selected.length))];

ui.chat.processMessage('<h3><i>' + chosen.data.name  + ' has been chosen!</i></h3>');
chosen.setTarget(true, {releaseOthers: true});
});