let {actorUuid, rollType, abilType, position, closeOnMouseLeave} = args[0] || {};
let t = '';
if (!token) token = _token;
if (!token && !actor) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");
token = null
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
if (!actor) return ui.notifications.error("No Actor");
t = actor.uuid.replaceAll('.','_');
let w_id = `${t}-effects`;

let w = Object.values(ui.windows).find(w=>w.id===w_id);
if (w) position = w.position;
console.log(position)
let positionDefault =  
  {width: 350, id: w_id};
position = {...positionDefault, ...position, ...{height:'auto'}};

let closeTimeout = 1000;

let list=`

<div style="" >
`;
let activeEffects = [...actor.effects];
for (const effect of activeEffects){
        list += `<p id="${effect.id}">
                <img src="${effect.data.icon}" height="14" style="background: url(../ui/denim075.png) repeat;"/><span><a id="effect-name-${effect.id}" name="${effect.id}"> ${effect.data.label}</a> </span>
                <a id="effect-delete-${effect.id}" name="${effect.id}" style="float:right;"><i class="fa fa-times"></i></a>
                <a id="toggle-effect-${effect.id}" name="${effect.id}" style="float:right; margin-right: .4em;"><i class="fa fa-toggle-${effect.data.disabled?'off':'on'}"></i></a>
                </p>`;
}
list += `</div>`;
$(`#${w_id}`).remove()
if (w) w.close();
new Dialog({
  title: `${actor.name} - Active Effects`,
  content:  list,
  render: ()=>{
    //let header = `${actor.name} - Active Effects <a onclick="game.macros.find(m=>m.data.flags.world?.name==='More Convenient Effects').execute()" style="float: right; ><i class="fa fa-plus"></i> Add</a>`;
    //$(`#${actor.uuid.replace('.','_')}-effects > header > h4`).html(header);
    
    if ($(`#${t}-effects-add`).length === 0)
    $(`#${t}-effects`).find('.window-title').after(`<a id="${t}-effects-add" onclick="game.macros.find(m=>m.data.flags.world?.name==='More Convenient Effects').execute()" style="float: right; "><i class="fa fa-plus"></i> Add</a>`);
    
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
    
    $("input#myeffectInput").focus();
    $("a[id^=effect-name]").click(async function(e){
        let effect = actor.effects.get(this.name);
        effect.sheet.render(true);
    });
    
    $("a[id^=toggle-effect]").click(async function(){
        let effect = actor.effects.get(this.name);
        await effect.update({disabled:!effect.data.disabled})
        if (effect.data.disabled) {
          $(this).find('i').removeClass('fa-toggle-on')
          $(this).find('i').addClass('fa-toggle-off')
        } else {
          $(this).find('i').addClass('fa-toggle-on')
          $(this).find('i').removeClass('fa-toggle-off')
        }
    });
    
    $("a[id^=effect-delete]").click(async function(){
        let effect = actor.effects.get(this.name);
        await effect.delete();
        $(this).parent().remove();
    });
    
  },
  buttons: {},
  close:   html => {
      return}
}, position
).render(true);
//d.render(true);