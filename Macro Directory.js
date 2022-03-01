let list=`
<input type="text" id="myMacroInput"  placeholder="Search for names.." style="margin-bottom:.5em;">
<div id="myUL" style="overflow-y:scroll;height:520px;" >
`;

for (const macro of game.macros){
    if (macro)
        list += `<p id="${macro.id}">
                <img src="${macro.data.img}" height="14" style="background: url(../ui/denim075.png) repeat;"/><span><a id="macro-run-${macro.id}" name="${macro.id}"> ${macro.data.name}</a> </span></p>`;
}
list += `</div>`;
let d = new Dialog({
  title: 'Macro Directory ' + game.macros.size,
  content:  list,
  render: ()=>{
    $("input#myMacroInput").focus();
    $("a[id^=macro-run]").contextmenu(async function(e){
        let macro = game.macros.get(this.name);
        let macroName = macro.data.name;
        if (e.ctrlKey) {
            var blob = new Blob([macro.data.command], {type: "text/plain;charset=utf-8"});
            saveAs(blob, macroName + '.js')
        } else if (e.shiftKey) { 
            let response = false;
            response = await new Promise((resolve)=>{
                new Dialog({
                 title: 'Delete Macro?',
                 content:  '<center>Delete Macro: ' + macroName + '?</center>',
                 buttons: {
                   yes: { label : `Yes`, callback : () => { 
	            resolve(true); 
                            }
                        },
                   no:  { label : `No`, callback : () => { 
	            resolve(false); 
                            }
                        }
                 },
                 close:   html => {
                     return}
                   },{ id: "delete-macro-dialog"}
                ).render(true);
            });
            if (response) {
                Macro.deleteDocuments([this.name]);
                $(`p#${this.name}`).remove();
                $(`#macro-macro-directory > header > h4`).html('Macro Directory ' + game.macros.size);
                ui.notifications.info('Macro: ' + macroName + ' deleted');
            }
        } else {
            if ($(this).attr("name"))
                game.macros.get(this.name).sheet.render(true);
        }
    });
    $("a[id^=macro-run]").click(function(){
        game.macros.get(this.name).execute();
    });
    $("a[id^=macro-delete]").click(async function(){
        await Macro.delete([this.name]);
        $(`p#${this.name}`).remove();
        $(`#macro-macro-directory > header > h4`).html('Macro Directory ' + game.macros.size);
    });
    $("a[id^=macro-log]").click(async function(){
        console.log(game.macros.get(this.name));
    });
    $("a[id^=macro-download]").click(async function(){
        
    });
    $("input#myMacroInput").keyup(function(){
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('myMacroInput');
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
},{ height: 600, width:325 , id: "macro-macro-directory"}
);
d.render(true);