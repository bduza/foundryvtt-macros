$('#sidebar-tabs').css('display', 'flex')
$('#taskbar').remove();
//if (!Hooks._hooks.closeApplication || Hooks._hooks.closeApplication?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
if (!game.user.data.flags.world.pinnedTaskbarDocuments)
  game.user.setFlag('world', 'pinnedTaskbarDocuments', []);

//if (!Hooks._hooks.addWindowToTaskbar || Hooks._hooks.addWindowToTaskbar?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
Hooks._hooks.addWindowToTaskbar = [];
Hooks.on(`addWindowToTaskbar`, async function addWindowToTaskbar(app)  {
  //addWindowToTaskbar
  console.log(app);
  
  //console.log(app.title === "" , $(`#taskbar-app-${app.appId}`) , !app.options.popOut)
  if (app.title === "" ||  $(`#taskbar-app-${app.appId}`).length>0 ) return;
  //console.log('RENDER APP:', app);
  let uuidAttr = '';
  let pinned = '';
  let pin = ``;
  if (app.document?.uuid) {
    uuidAttr = `data-uuid="${app.document?.uuid}"`;
    if (game.user.data.flags.world.pinnedTaskbarDocuments.includes(app.document.uuid)) {
      pinned = `pinned`;
      pin = `<i class="fas fa-thumbtack"></i>`;
    }
  }
  
  $('#taskbar > div.taskbar-items').append(`<a class="taskbar-app ${pinned}" id="taskbar-app-${app.appId}" name="${app.appId}" ${uuidAttr}><div>${pin}${app.title}</div></a>`);
 
  $(`#taskbar-app-${app.appId}`).click(async function(e){
    let id = $(this).attr('name');
    console.log(id)
    if (e.ctrlKey || e.shiftKey) {
      console.log($(this).hasClass('pinned'))
      if ($(this).hasClass('pinned')) {
        $(this).removeClass('pinned').find('div i').remove();
        let flag = game.user.data.flags.world.pinnedTaskbarDocuments;
        if (flag.includes($(this).attr('data-uuid'))) flag.splice(flag.indexOf($(this).attr('data-uuid')),1)
        await game.user.setFlag('world', 'pinnedTaskbarDocuments', flag);
      } else {
        $(this).addClass('pinned').find('div').prepend('<i class="fas fa-thumbtack"></i>');
        let flag = game.user.data.flags.world.pinnedTaskbarDocuments;
        flag.push($(this).attr('data-uuid'))
        await game.user.setFlag('world', 'pinnedTaskbarDocuments', flag);
      }
      return console.log(game.user.data.flags.world.pinnedTaskbarDocuments);
    }
    
    let w = ui.windows[id];
    if (!w) {
      let d = await fromUuid($(this).attr('data-uuid'));
      let w = await d.sheet.render(true);
      return Hooks.call(`addWindowToTaskbar`, w)
    }
    if (w===ui.activeWindow) {
      $(`#${w.id}`).toggle();
    }
    else {
      $(`#${w.id}`).show();
      w.bringToTop();
    }
    if ($(`#${w.id}`).is(":hidden"))
      $(this).addClass('dormant');
    else
      $(this).removeClass('dormant');
      
    $(`.taskbar-app.active`).removeClass('active');
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  });
  $(`#taskbar-app-${app.appId}`).contextmenu( function(){
    let id = $(this).attr('name');
    let w = ui.windows[id];
    if ($(this).hasClass('pinned')) {
      $(`#${w.id}`).hide();
      $(this).addClass('dormant');
    }
    else { 
      $(`#taskbar-app-${id}`).remove();
      w.close();
    }
    $(`.taskbar-app.active`).removeClass('active');
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  });
  $(`.taskbar-app.active`).removeClass('active');
  $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
});


let $taskbar = $(`
<div class="taskbar" id="taskbar">
<style id="taskbar-style">
:root {
  --ft-scale: 1;
  --ft-sidebar: 315px;
  --ft-height: 50px;
  --ft-background-color: rgba(95, 158, 160, 0.644);
  --ft-text-color: #fff;
  --ft-start-menu-item-size: 30px;
}
#ui-left {
    height: calc(100% - 26px);
}
#ui-right {
    height: calc(100% - 45px);
}
#ui-bottom {
  margin-bottom: 27px;
}
#taskbar {
  color: var(--ft-text-color);
  position: absolute;
  transform-origin: bottom left;
  transform: scale(var(--ft-scale));
  /*width: calc((100vw - var(--ft-sidebar)) / var(--ft-scale));*/
  width: calc((100vw - 10px)) ;
  height: 30px;
  bottom: 5px;
  left: 5px;
  padding: 5px;
  z-index: 100;
  display: flex;
  flex-direction: row;
  background: url(../ui/denim075.png);
  border: 1px solid #000;
  border-radius: 3px;
  transition: bottom 0.2s ease-in-out;
  box-shadow: 0 0 20px var(--color-shadow-dark);
}
.taskbar-app {
  padding-left: 6px;
  padding-right: 3px;
  margin-left: 3px;
  border-left: 2px solid #BBB;
  height: 100%;
}
.taskbar-app div {
  height: 30px;
}
.taskbar-app.active {
  background-color: #444; 
}
#taskbar-start-menu {
  width: aut0; position: absolute; left: 5px;
  background: url(../ui/denim075.png);
  border: 1px solid #000;
  border-radius: 3px;
  padding: 5px 7px 5px 4px;
  bottom: 35px;
  color: #FFF;
  box-shadow: 0 0 20px var(--color-shadow-dark);
  z-index:1000;
}
div.taskbar-items {
  display: flex; flex-direction: row;
  
}
#calendar-time-taskbar {
 margin-left: auto;
}
span.start-menu-item {
  vertical-align: middle;font-size: 20px; margin:5px; width:100%;
}
.fas.fa-thumbtack {
  margin-right: .25em;
}
.dormant {
  color: #888;
}
.taskbar-sidebar-tab {
  display:inline-block;
  margin: 0 .44em
}
.taskbar-sidebar-tab.active {
  color: #ff6400; 
}
</style>
<div class="taskbar-items"></div>
<a style="" id="calendar-time-taskbar"></a>
<a style="margin-left:.5em" id="taskbar-hide-all"><div style="height: 30px"><i class="fas fa-tv"></i></div></a>
<div id="taskbar-sidebar-tabs" style=" margin-left: 5px;"></div>
</div>
`);

$("body").append($taskbar);

$('#taskbar > div.taskbar-items').empty();
let icons = `
<a id="taskbar-menu-toggle" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 40px; left: -20px; margin-right:-20px; position: relative;"><i style="margin-left: 20px; " class="fas fa-list"></i></div></a>
<a id="taskbar-players-toggle" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 20px;"><i class="fas fa-users"></i></div></a>
<a id="taskbar-macro-toggle" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 20px;"><i class="fas fa-code" ></i></div></a>
`;

$('#taskbar > div.taskbar-items').append(icons);
$('#sidebar-tabs').css('display', 'none');



for (let w of Object.entries(ui.windows).filter(w=> w[1].title !== '' && w[1].options.popOut && !game.user.data.flags.world.pinnedTaskbarDocuments.includes(w.document?.uuid))) {
  Hooks.call(`addWindowToTaskbar`, (w[1]));
}

//$("#BigButton").clone().appendTo("#rightDiv");

for (let doc of game.user.data.flags.world.pinnedTaskbarDocuments) {
  let d = await fromUuid(doc);
  let w = await d.sheet.render(true);
  await Hooks.call(`addWindowToTaskbar`, w);
  //windows += `<a class="taskbar-app dormant pinned" data-uuid="${doc}"  ><div><i class="fas fa-thumbtack"></i>${doc}</div></a>`;
}

$("#taskbar-hide-all").click(function() { 
  $('.taskbar-app').each(function(){ 
    let id = $(this).attr('name');
    if (!id) return;
    let w = ui.windows[id];
    if (w) $(`#${w.id}`).hide();
    $(this).addClass('dormant');
  });
});

$("#calendar-time-taskbar").click(async function() { 
  Gametime.showCalendar();
});
let dateTime = window.SimpleCalendar.api.timestampToDate(window.SimpleCalendar.api.timestamp());
$("#calendar-time-taskbar").html(`<div style="height: 30px">${dateTime.currentSeason.name}, ${dateTime.display.date} | ${dateTime.display.time}</div>`);

$('#sidebar-tabs > a.item').clone().removeClass('item').removeClass('active').addClass('taskbar-sidebar-tab').click(function(){
  ui.sidebar.activateTab($(this).attr('data-tab'));
  $('.taskbar-sidebar-tab.active').removeClass('active');
  $(this).addClass('active');
}).contextmenu(function(){
  ui[$(this).attr('data-tab')].renderPopout()
}).appendTo($('#taskbar-sidebar-tabs'));
$(`.taskbar-sidebar-tab[data-tab="${ui.sidebar._tabs[0].active}"]`).addClass('active');

$("#taskbar-menu-toggle").click(async function(e) {
  if ($(`#taskbar-start-menu`).length===0) {
    let macros = [];
    for (let i = 1; i <= 5; i ++)
      macros = macros.concat(Object.values(game.user.getHotbarMacros(i)).filter(m=>!!m.macro).map(m=>`<a id="start-${m.macro.data._id}" class="start-menu-macro" name="${m.macro.data._id}" ><img src="${m.macro.data.img}" width="18" style="vertical-align: middle;"><span class="start-menu-item">${m.macro.data.name}</span></a>`));
    let content = `<div id="taskbar-start-menu" style="height: ${macros.length*25+10}px">${macros.join('<br>')} </div>`;

    $("body").append(content);
    $(`#ui-left`).css('height', 'calc(100% + 100px)');
    $('.start-menu-macro').click(function(){ 
      let id = $(this).attr('name');
      game.macros.get(id).execute();
      if (e.shiftKey) return;
      $(`#taskbar-start-menu`).remove();
    });
    $('.start-menu-macro').contextmenu(function(e){ 
      let id = $(this).attr('name');
      let macro = game.macros.get(id);
      if (e.ctrlKey) {
        var blob = new Blob([macro.data.command], {type: "text/plain;charset=utf-8"});
        saveAs(blob, macro.data.name + '.js')
        return;
      }
      macro.sheet.render(true);
      if (e.shiftKey) return;
      $(`#taskbar-start-menu`).remove();
    });
    $("#taskbar-start-menu").mouseleave(function(e){
      if (e.shiftKey) return;
      $(`#taskbar-start-menu`).remove();
    });
  }
  else
  {
    $(`#taskbar-start-menu`).remove();
  }
  //new Dialog({title:'', content, buttons:{}, close: ()=>{return}}).render(true);
});


$(`#ui-left`).css('height', 'calc(100% + 100px)');

$('#taskbar-players-toggle').click(async function() {
  let currentHeight = parseInt($(`#ui-left`).css('height').replace('px', ''));
  if (window.innerHeight < currentHeight)
    $(`#ui-left`).css('height', 'calc(100% - 26px)');
  else
    $(`#ui-left`).css('height', 'calc(100% + 100px)');
});

$(`#hotbar`).hide();

$('#taskbar-macro-toggle').click(async function() {
  $(`#hotbar`).toggle();
});

$('.taskbar-app').each(function(){ 
  let id = $(this).attr('name');
  if (!id) return $(this).addClass('dormant');
  let w = ui.windows[id];
  if (!w) return;
  if ($(`#${w.id}`).is(":hidden"))
    $(this).addClass('dormant')
  else
    $(this).removeClass('dormant')
});

while (Hooks._hooks.closeApplication && Hooks._hooks.closeApplication.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))>-1)
    Hooks._hooks.closeApplication.splice(Hooks._hooks.closeApplication.findIndex(f=>f.toString().includes('removeWindowFromTaskbar')), 1)
    
Hooks.on(`closeApplication`, async (app) => {
  //removeWindowFromTaskbar
  $(`.taskbar-app.active`).removeClass('active');
  $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) $(`#taskbar-app-${app.appId}`).addClass('dormant');//.removeAttr('name').removeAttr('id');
  else $(`#taskbar-app-${app.appId}`).remove();
});

if (!Hooks._hooks.renderApplication || Hooks._hooks.renderApplication?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderApplication`, async (app) => { 
    //addWindowToTaskbar
    if (app.options?.id === "players") return;
    Hooks.call(`addWindowToTaskbar`, (app))
  });
  
if (!Hooks._hooks.renderActorSheet || Hooks._hooks.renderActorSheet?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderActorSheet`, async (app) => { 
    //addWindowToTaskbar
    Hooks.call(`addWindowToTaskbar`, (app))
  });
if (!Hooks._hooks.closeActorSheet || Hooks._hooks.closeActorSheet?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeActorSheet`, async (app) => {
    //removeWindowFromTaskbar
    $(`#taskbar-app-${app.appId}`).remove();
  });
  
if (!Hooks._hooks.renderItemSheet || Hooks._hooks.renderItemSheet?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderItemSheet`, async (app) => { 
    //addWindowToTaskbar
    Hooks.call(`addWindowToTaskbar`, (app))
  });
if (!Hooks._hooks.closeItemSheet || Hooks._hooks.closeItemSheet?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeItemSheet`, async (app) => {
    //removeWindowFromTaskbar
    $(`#taskbar-app-${app.appId}`).remove();
  });
  
if (!Hooks._hooks.renderSidebarTab || Hooks._hooks.renderSidebarTab?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderSidebarTab`, async (app) => { 
    //addWindowToTaskbar
    if (!app.options.popOut) return;
    Hooks.call(`addWindowToTaskbar`, (app))
  });
if (!Hooks._hooks.closeSidebarTab || Hooks._hooks.closeSidebarTab?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeSidebarTab`, async (app) => {
    //removeWindowFromTaskbar
    $(`#taskbar-app-${app.appId}`).remove();
  });
  
if (!Hooks._hooks.pseudoclockSet || Hooks._hooks.pseudoclockSet?.findIndex(f=>f.toString().includes('calendar-time-taskbar'))==-1) 
  Hooks.on(`pseudoclockSet`, async (time) => {
    let dateTime = window.SimpleCalendar.api.timestampToDate(time)
    $("#calendar-time-taskbar").html(`<div style="height: 30px">${dateTime.currentSeason.name}, ${dateTime.display.date} | ${dateTime.display.time}</div>`);
  });
