if (args[0]) token = canvas.tokens.placeables.filter(t=>t.actor?.uuid===args[0].replaceAll('_','.'))[0];
token.control({releaseOthers:true});
let list=`
<div><input type="text" id="myeffectInput"  placeholder="Search for names.." style="margin-bottom:.5em;width:200px"><a onclick="game.macros.getName('More Convenient Effects').execute()" style="float: right; margin: .45em"><i class="fa fa-plus"></i></a></div>
<div id="myUL" style="" >
`;//height:520px;overflow-y:scroll;

for (const effect of [...token.actor.effects].filter(e=>e.isTemporary)){
        list += `<p id="${effect.id}">
                <img src="${effect.data.icon}" height="14" style="background: url(../ui/denim075.png) repeat;"/><span><a id="effect-name-${effect.id}" name="${effect.id}"> ${effect.data.label}</a> </span>
                <a id="effect-delete-${effect.id}" name="${effect.id}" style="float:right;"><i class="fa fa-times"></i></a>
                <a id="toggle-effect-${effect.id}" name="${effect.id}" style="float:right; margin-right: .4em;"><i class="fa fa-toggle-${effect.data.disabled?'off':'on'}"></i></a>
                </p>`;
}
list += `</div>`;
let d = new Dialog({
  title: `${token.actor.name} Active Effects`,
  content:  list,
  render: ()=>{
    $("input#myeffectInput").focus();
    $("a[id^=effect-name]").click(async function(e){
        let effect = token.actor.effects.get(this.name);
        effect.sheet.render(true);
    });
    $("a[id^=toggle-effect]").click(async function(){
        let effect = token.actor.effects.get(this.name);
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
        let effect = token.actor.effects.get(this.name);
        await effect.delete();
        $(this).parent().remove();
    });
    $("input#myeffectInput").keyup(function(){
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('myeffectInput');
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName('p'); 
        
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("span")[0];
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
},{width: 250, id: token.actor.uuid.replace('.','_') + "-effects"}
);
d.render(true);
