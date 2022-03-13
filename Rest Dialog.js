//await this.setFlag('world','name', this.data.name);
//console.log(this.data.flags.world.name);
if (args[0]) {
  let uuidParts = args[0].split('.');
  console.log(uuidParts);
  if (uuidParts[2]==='Token') actor = canvas.tokens.get(uuidParts[3]).actor;
  else  actor = game.actors.get(uuidParts[1]);
  actor = canvas.tokens.placeables.find(t=>t.actor?.uuid===args[0]).actor;
}
if (!actor) actor = character;
if (!actor) return;

let level = 0;
for (let [key, value] of Object.entries(actor.classes))
    level += value.data.data.levels;



let w_id = actor.uuid.replace('.','_')+'-rest-dialog';
let position = Object.values(ui.windows).find(w=> w.id===w_id)?.position || 
  { width: level*56 , height: 136  };
position["id"] = w_id;
if (args[1]) position = {...position, ...args[1]};
let closeOnMouseLeave = false;
if (args[2]) closeOnMouseLeave = args[2];

let hitDice = `
<style>
.hd.used {filter: drop-shadow(0px 0px 3px rgb(255 0 0 / 0.9));}
.hd.used:hover {filter: drop-shadow(0px 0px 4px rgb(255 0 0 / 0.9));}
.hd.unused {filter: drop-shadow(0px 0px 2px rgb(255 255 255 / 0.9));}
.hd.unused:hover {filter: drop-shadow(0px 0px 4px rgb(255 255 255 / 0.9));}
</style><center>`;
let used = {};
for (let [key, value] of Object.entries(actor.classes))
  for (let i=0; i<value.data.data.levels; i++) 
    hitDice += `<img class="hd ${(i>=(value.data.data.levels-value.data.data.hitDiceUsed))?'used':'unused'}" data-d="${value.data.data.hitDice}" src="icons/dice/${value.data.data.hitDice}black.svg" width="48">`;
hitDice += `</center>`
let d = new Dialog({
  title: `${token.actor.name} Rest`,
  content: hitDice,
  render: (app) => {
    $(`.hd.unused`).click(function() {
      $(this).off('click').removeClass('unused').addClass('used');
      console.log(actor.rollHitDie($(this).attr('data-d'),{dialog: false}))
    });
    
    if (closeOnMouseLeave)
        $(`#${w_id}`).mouseleave(async function(e){
          Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
        });
  },
  buttons: { 
          shortRest: {
            icon: '<i class="fas fa-hourglass-half"></i>',
            label: 'Short Rest',
            callback: html => {
              actor.shortRest({dialog:false})
            }
          },
          longRest: {
            icon: '<i class="fas fa-bed"></i>',
            label: 'Long Rest',
            callback: html => {
              actor.longRest({dialog:true})
            }
          }
  },
  close:   html => {
      return}
},position
).render(true);