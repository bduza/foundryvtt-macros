//if(!args[0]) return ui.notifications.error('No macro name passed in args');
let macroName = "Get Allen's 5e Macros From Git"//args[0];
let command = this.data.command;
let match = false;
let gitData = '';
console.log(`getting ${macroName} macro from git`);
try{
await jQuery.get(`https://raw.githubusercontent.com/xaukael/foundryvtt-macros/main/${encodeURI(macroName)}.js`, function(data) {
  gitData = data;
});
}catch(error){return ui.notifications.error('Macro not found: '+error.responseText)}
await this.update({command:gitData});
console.log(`executing ${macroName} code as ${this.name}`);
this.execute();
await this.update({command:command});
console.log(`${this.name} reset to original command`);