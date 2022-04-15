//await this.setFlag('world','name', this.data.name);
//console.log(this.data.flags.world.name);
let {actorUuid, position, closeOnMouseLeave} = args[0] || {};
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
if (!actor) actor = character;
if (!actor) return;

let level = 0;
for (let [key, value] of Object.entries(actor.classes))
    level += value.data.data.levels;

let w_id = actor.uuid.replace('.','_')+'-rest-dialog';
let positionDefault = //width: `max(300, ${level*56})`  ,
  {  height: '100%' , id: w_id };
position = {...positionDefault, ...position};
//let closeOnMouseLeave = false;
//if (args[2]) closeOnMouseLeave = args[2];
let closeTimeout = 1000;

let hitDice = `
<style>
.hd.used {filter: drop-shadow(0px 0px 3px rgb(255 0 0 / 0.9));
  transition-property: filter;
 transition-duration: .4s; 
}
.hd.used:hover {filter: drop-shadow(0px 0px 4px rgb(255 0 0 / 0.9));}
.hd.unused {
filter: drop-shadow(0px 0px 2px rgb(255 255 255 / 0.9));
  transition-property: filter;
 transition-duration: .4s; 
}
.hd.unused:hover {
filter: drop-shadow(0px 0px 4px rgb(255 255 255 / 0.9));

}
</style><center>`;
let used = {};
for (let [key, value] of Object.entries(actor.classes))
  for (let i=0; i<value.data.data.levels; i++) 
    hitDice += `<img class="hd ${(i>=(value.data.data.levels-value.data.data.hitDiceUsed))?'used':'unused'}" data-d="${value.data.data.hitDice}" src="icons/dice/${value.data.data.hitDice}black.svg" width="48">`;
hitDice += `</center>`
Dialog.persist({
  title: `${actor.name} - Rest`,
  content: hitDice,
  render: (app) => {
    $(`.hd.unused`).click(function() {
      $(this).off('click').removeClass('unused').addClass('used');
      console.log(actor.rollHitDie($(this).attr('data-d'),{dialog: false}))
    });
    
    if (closeOnMouseLeave) {
      $(`#${w_id}`).mouseenter(function(e){
        $(`#${w_id}`).removeClass('hide');
      });
      
      $(`#${w_id}`).mouseleave(async function(e){
        $(`#${w_id}`).addClass('hide');
        await new Promise((r) => setTimeout(r, closeTimeout));
        if ($(`#${w_id}`).hasClass('hide'))
          Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
      });  
    }
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
);//.render(true);