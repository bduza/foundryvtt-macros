let update = await game.macros.getName("Update Macro From Git").execute(this.name);
if (!update.match) return this.execute();

let content=`
<style>
center > div > label:before {
content: '';
  width: 32px;
  height: 32px;
  position: absolute;
  z-index: 100;
}
center > div > :checked+label::before  {
content: '';
  width: 32px;
  height: 32px;
  border: 2px solid #ff6400;
}
/*box-shadow: 0 0 10px #ff6400 inset;*/
.faux-hotbar-macro:hover {
    
    border: 1px solid #ff6400;
}

.faux-macro-img {
    margin: 1px 0px 0px 1px;
    width: 44px;
    height: 44px;
    object-fit: cover;
    object-position: 50% 50%;
    border: unset;
    opacity: 1.0;
}

#macros-set-dialog > section > div.dialog-buttons > button
{
    color: #fff;
    border: 1px solid #000;
}
.faux-hotbar-macro {
    border: 1px solid #000;
    height: 48px; width: 48px; box-sizing: border-box; border-radius: 5px;
    
    position: relative;
    flex: 0 0 50px;
    height: 48px;
    border: 1px solid #000;
    border-radius: 3px;
    
    cursor: pointer;
}
.faux-hotbar-macro > .tooltip {
  display: block;
  min-width: 148px;
  height: 26px;
  padding: 2px 4px;
  position: absolute;
  top: -32px;
  left: -50px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid var(--color-border-dark-primary);
  border-radius: 3px;
  color: var(--color-text-light-highlight);
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
  word-break: break-all;
}
</style>
`;//background: url(../ui/denim075.png);

content += `<center><div id="targets" >`;
for (const u of Array.from(game.users)){//.filter(u => !u.isGM)
        content += `<input type="checkbox" class="macro-users" id="user-${u.id}" name="${u.id}" style="display: none;"/>
        <label for="user-${u.id}" class="user-label" title="${u.name}" name="${u.id}"  /><img height="36" width="36" src="${u.character?u.character.data.img:'icons/svg/cowled.svg'}" style="cursor: pointer"></label>`;
    }
content += `</div></center>`;


content += `<div style="width:100%; display: grid; grid-template-columns: repeat(10, 1fr); margin-bottom: .5em; id="macro-set-grid">`;

let b = 50;
while (b > 0) {
    for (let i = 1; i <= 10; i++) {
        content +=  `<div style="" class="faux-hotbar-macro" id="hotbar-macro-${b-10+i}" data="${b-10+i}" >
                        <img draggable="true" class="faux-macro-img" width="46" height="46" src="./ui/denim075.png">
                        <span style="position: relative; bottom: 48px; left: 1px; padding: 0px 3px 0px 3px; text-align: right; background-color: #222222 ">
                            ${b-10+i}
                        </span>
                    </div>
                    `;
    }
    b-=10;
}/*
for (let i = 1; i <= 50; i++) {
    content +=  `<div style="" class="faux-hotbar-macro" id="hotbar-macro-${i}" data="${i}">
                    <img class="faux-macro-img"  src="./ui/denim075.png">
                    <span style="position: absolute; bottom: 28px; left: 2px; padding: 0px 3px 0px 3px; text-align: right; background-color: #222222; color: #fff ">
                        ${i}
                    </span>
                </div>
                `;
}*/
content += '</div>';
let d = new Dialog({
        title : `User Macro Manager`, 
        content : content,
        render : (html) => {
          console.log(html);
        //document.querySelector("#macros-set-dialog > section").style.background = 'url(../ui/parchment.jpg) repeat';
        //document.querySelector("#macros-set-dialog > section").style.padding = '3px';
        $(`.faux-hotbar-macro > img`).css('opacity',' 0.0');

        for (let i = 0; i <= 50; i++){
            //$(`#hotbar-macro-${i}`).css('background', `url('/ui/denim075.png')`);
            $(`#hotbar-macro-${i}`).click(async function(e){
                if (e.ctrlKey) {
                    $(`#hotbar-macro-${i}`).removeAttr("name");
                    $(`#hotbar-macro-${i} > img`).attr("src",  '/ui/denim075.png');
                    $(`#hotbar-macro-${i} > img`).css('opacity',' 0.0');
                    $(`#hotbar-macro-${i} > img`).attr("data", "");
                } else if (e.shiftKey) { 
                    let macroid = await MacroSelect();
                    let macro = game.macros.get(macroid);
                    $(`#hotbar-macro-${i}`).attr("name", macroid);
                    $(`#hotbar-macro-${i} > img`).attr("name", macro.id);
                    $(`#hotbar-macro-${i} > img`).attr("src", macro.data.img);
                    $(`#hotbar-macro-${i} > img`).attr("data", macro.data.name);
                    $(this).children(':first-child').css('opacity',' 1.0');
                    console.log(this.id);
                } else {
                    let macro ;
                    if ($(this).attr("name")) 
                        macro = game.macros.get($(this).attr("name"))
                    if (macro){
                        console.log('execute?');
                        macro.execute();
                    }
                    else {
                        let macroid = await MacroSelect();
                        macro = game.macros.get(macroid);
                        $(`#hotbar-macro-${i}`).attr("name", macroid);
                        $(`#hotbar-macro-${i} > img`).attr("name", macro.id);
                        $(`#hotbar-macro-${i} > img`).attr("src", macro.data.img);
                        $(`#hotbar-macro-${i} > img`).attr("data", macro.data.name);
                        $(this).children(':first-child').css('opacity',' 1.0');
                        console.log(this.id);
                    }
                }
            });
            $(`#hotbar-macro-${i} > img`).bind("dragstart", function(e) {
              console.log(e.originalEvent)
              e.originalEvent.dataTransfer.setData("text", e.originalEvent.target.parentElement.attributes.getNamedItem('name').nodeValue+','+e.originalEvent.target.parentElement.id);
              $('.tooltip').remove()
            });
            $(`#hotbar-macro-${i}`).bind("drop", function(e) {
              let target = $(this);
              console.log(target);
              e.originalEvent.preventDefault();
              console.log(e.originalEvent);
              var macroid = e.originalEvent.dataTransfer.getData("text").split(',')[0];
              var srcId = e.originalEvent.dataTransfer.getData("text").split(',')[1];
              let macro = game.macros.get(macroid);
              console.log(macro);
              $(`#hotbar-macro-${i}`).attr("name", macroid);
              $(`#hotbar-macro-${i} > img`).attr("name", macro.id);
              $(`#hotbar-macro-${i} > img`).attr("src", macro.data.img);
              $(`#hotbar-macro-${i} > img`).attr("data", macro.data.name || '');
              $(this).children(':first-child').css('opacity',' 1.0');
              //let srcId = e.originalEvent.srcElement.parentElement.id;
              
              $(`#${srcId}`).removeAttr("name");
              $(`#${srcId} > img`).attr("name", "");
              $(`#${srcId} > img`).attr("src",  '/ui/denim075.png');
              $(`#${srcId} > img`).css('opacity',' 0.0');
              $(`#${srcId} > img`).attr("data", "");
            });
            
            $(`#hotbar-macro-${i}`).contextmenu(async function(e){
                if ($(this).attr("name"))
                    game.macros.get($(this).attr("name")).sheet.render(true);
            });
            $(`#hotbar-macro-${i}`).hover( 
                ()=>{$(`#hotbar-macro-${i} > img`).attr('data');//[0].attr('title')
                    $(`#hotbar-macro-${i}`).append(`<span class="tooltip">${$(`#hotbar-macro-${i} > img`).attr('data')}</span>`)
                    
                }, 
                ()=>{$(`#hotbar-macro-${i}`).find('.tooltip').remove()} )
        }
    for (const [key, value] of Object.entries(game.users.getName('Gamemaster')?.data.hotbar)) {
            console.log(key, value);
            let macro = game.macros.get(value);
            if (macro) {
                $(`#hotbar-macro-${key}`).attr("name", value);
                $(`#hotbar-macro-${key} > img`).attr("src", macro?.data?.img);
                $(`#hotbar-macro-${key} > img`).attr("data", macro?.data?.name);
                $(`#hotbar-macro-${key} > img`).css('opacity',' 1.0');
            }
        }
    
    $(".user-label").contextmenu(async function(e){
        for (let i = 0; i <= 50; i++){
            $(`#hotbar-macro-${i}`).attr("name", "");
            $(`#hotbar-macro-${i} > img`).attr("src",  '/ui/denim075.png');
            $(`#hotbar-macro-${i} > img`).css('opacity', '0.0');
            $(`#hotbar-macro-${i} > img`).attr("data", "");
        }
        
        console.log(this)
        for (const [key, value] of Object.entries(game.users.get($(this).attr('name'))?.data.hotbar)) {
            console.log(key, value);
            let macro = game.macros.get(value);
            if (macro) {
                $(`#hotbar-macro-${key}`).attr("name", value);
                $(`#hotbar-macro-${key} > img`).attr("src", macro?.data?.img);
                $(`#hotbar-macro-${key} > img`).attr("data", macro?.data?.name);
                $(`#hotbar-macro-${key} > img`).css('opacity',' 1.0');
            }
        }
        
    });
    let header = `User Macro Manager`;
    header += `<a class="header-button" title="Instructions" style="float: right" id="macroselectinstructions"><i class="fas fa-question-circle">&nbsp;Instructions</i></a>`;
    $(`#macros-set-dialog > header > h4`).html(header);
    
    $("#macroselectinstructions").click(async function(e){
        let content = `<center>
    <p>Right click a user's player image to load bring in their macros</p>
    <p>Click a macro slot to bring up a dialog to select a macro for that slot</p>
    <p>Right click a macro slot with a macro to open it's sheet</p>
    <p>Left click a user image to select them for application on the apply button</p>
    <p>Click the Apply button to update the selected users.</p>
    <p><b>Only slots with macros in them will be applied to the selected users</b></p> 
    </center>
    `;
    let i = new Dialog({
      title: 'Player Macro Manager Instructions',
      content:  content,
      buttons: {
         
      },
      close:   html => {
          return}
        },{ 'width': '490', id: "macro-set-dialog-instructions"}
     ).render(true);
    });
        },
        buttons : {
            push: {   icon: '', 
                label: 'Push', 
                callback: async (html) => {
                        let users = [];
                        $('.macro-users:checked').each(function () {
                            users.push(`${$(this).attr('name')}`);
                        });
                        let hotbar = {};
                        $('[id*=hotbar-macro]').each(function() {
                                if ($(this).attr('name')){
                                    hotbar['hotbar.'+$(this).attr('data')] = $(this).attr('name');
                                }  
                        });
                        
                        for (let u of users){
                         await game.users.get(u).update(hotbar)
                            console.log('Set:', u, hotbar);
                        }
                    }   
            },
            overwrite: {   icon: '', 
                label: 'Overwrite', 
                callback: async (html) => {
                        let users = [];
                        $('.macro-users:checked').each(function () {
                            users.push(`${$(this).attr('name')}`);
                        });
                        console.log(users);
                        /*
                        let hotbar = {};
                        for (let i = 1; i <= 50; i++) {
                            hotbar[i] = null;
                          }*/
                        $('[id*=hotbar-macro]').each(function() {
                          
                                if ($(this).attr('name')){
                                    hotbar['hotbar.'+$(this).attr('data')] = $(this).attr('name');
                                }  
                        });
                        console.log(hotbar);
                        
                        for (let u of users){
                          let user = game.users.get(u);
                          /*
                          for (let i = 1; i <= 50; i++) {
                            await game.user.assignHotbarMacro(null, i);
                          }*/
                         await user.update({'-=hotbar': null});
                         await user.update(hotbar);
                            console.log('Set:', u, hotbar);
                        }
                    }   
            },
        },
        close:   html => {
        return}
    },{ 'width':'495' , 'height':'370' , id:`macros-set-dialog` }).render(true);


async function MacroSelect(){
  
    let list=`
    <style>
    #macro-select-list > p > input[type="radio"]:checked+label {
        border: 2px solid #ff6400;
        }
    </style>
    <input type="text" id="myMacroInput"  placeholder="Search names.." style="margin-bottom:.5em;">
    <div id="macro-select-list" style="overflow-y:scroll;height:300px;" >
    `;
    for (const macro of game.macros){
        if (macro)
            list += `<p><input type="radio" id="${macro.id}" name="macro" value="${macro.id}" style="display: none;"> 
                    <label for="${macro.id}"><img src="${macro.data.img}" height="18" style="vertical-align:middle; background: url(../ui/denim075.png) repeat;"/> &nbsp; ${macro.data.name} </label></p>`;
    }
    list += `</div>`;
    let macro = '' ;
    macro = await new Promise((resolve)=>{
        new Dialog({
         title: 'Macro Directory',
         content:  list,
         render: () => {
            $("input#myInput").focus();
            $("input#myMacroInput").keyup(function(){
                var input, filter, ul, li, a, i, txtValue;
                input = document.getElementById('myMacroInput');
                filter = input.value.toUpperCase();
                ul = document.getElementById("macro-select-list");
                li = ul.getElementsByTagName('p'); 
                
                for (i = 0; i < li.length; i++) {
                    a = li[i].getElementsByTagName("label")[0];
                    txtValue = a.textContent || a.innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        li[i].style.display = "";
                    } else {
                        li[i].style.display = "none";
                    }
                }
            }); 
         },
         buttons: {
             Ok : { label : `Ok`, callback : (html) => { 
                                   let macro = $('input[name="macro"]:checked').val();
                                   resolve(macro); 
                                   }
                               }
         },
         close:   html => {
             return}
           },{ 'height': '420', 'width':'440' , id: "macro-select"}
        ).render(true);
        
    });
return macro;   
}
