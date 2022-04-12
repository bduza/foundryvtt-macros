if (typeof Dialog.persist !== "function")
Object.getPrototypeOf(Dialog).persist = function(data, options) {
  let w = Object.values(ui.windows).find(w=> w.id===options.id);
  let position = w?.position || {};
  options = {...options, ...position};
  new Dialog(data, options).render(true);
  if (w) w.bringToTop();
  if (w) w.setPosition({height:'auto'})  
  return;
}

let list=`
<input type="text" id="myEffectsInput"  placeholder="Search for names.." style="margin-bottom:.5em;">
<div id="effectsUL" style="overflow-y:scroll;height:320px;" >
`;
for (const effect of game.dfreds.effects.all){
    list +=`<p>
            <a id="apply-effect-${effect.name}" name="${effect.name}">
             <img src="${effect.icon}" height="14" style="background: #333333; margin-right:.5em"/>${effect.name}</a></p>`;
    
}
list += `</div>`;
Dialog.persist({
  title: 'Convenient Effects' ,
  content:  list,
  render: (list) => {
       $("input#myEffectsInput").focus();
        
        $("a[id^=apply-effect-]").click(async function(){
            let effect = $(this).attr('name');
            //for (let t of canvas.tokens.controlled) {
            await game.dfreds.effectInterface.toggleEffect(effect, {uuids:canvas.tokens.controlled.map(t=>t.document.uuid)});
            for (let t of canvas.tokens.controlled) 
              if ([...Object.values(ui.windows)].map(w=>w.id).includes(t.actor.uuid.replace('.','_') + "-effects"))
                game.macros.find(m=>m.data.flags.world?.name==='Actor Effects List').execute(t.actor.uuid.replace('.','_'));
            
            //}
        });
        $("a[id^=apply-effect-]").contextmenu(async function(){
            let effectName = $(this).attr('name');
            let effect = game.dfreds.effects.all.filter(e=> e.name === effectName)[0]
            let messageContent = `<img src="${effect.icon}" style="border:unset; float:left; clear:both; margin-right: 5px;" width="32"/>
            ${effect.description}
            `;
            ChatMessage.create({
                flavor: effectName,
                content: messageContent,
                whisper: ChatMessage.getWhisperRecipients("GM")
            });
        });
        $("input#myEffectsInput").keyup(function(){
            var input, filter, ul, li, a, i, txtValue;
            input = document.getElementById('myEffectsInput');
            filter = input.value.toUpperCase();
            ul = document.getElementById("effectsUL");
            li = ul.getElementsByTagName('p'); 
            
            // Loop through all list items, and hide those who don't match the search query
            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("a")[0];
                txtValue = a.textContent || a.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "";
                } else {
                    li[i].style.display = "none";
                }
            }
        });
  },
  buttons: {},
  close:   html => {
      return}
},{ height:400, width:250 , id: "df-effects-directory"}
);