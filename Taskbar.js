$('#taskbar').remove();
let moveSidebarTabs = 0;
let autoHideMenu = 1;
if (!moveSidebarTabs) $('#sidebar-tabs').css('display', 'flex');
//if (!Hooks._hooks.closeApplication || Hooks._hooks.closeApplication?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
if (!game.user.data.flags?.world?.pinnedTaskbarDocuments)
  await game.user.setFlag('world', 'pinnedTaskbarDocuments', []);

async function setWindowOnClick (appid) {
  let waitRender = Math.floor(1000 / 10);
  while ($(`.window-app[data-appid="${appid}"]`).length === 0 && waitRender-- > 0) {
    console.log('waiting', $(`.window-app[data-appid=${appid}]`).length === 0 , waitRender-- > 0);
    await new Promise((r) => setTimeout(r, 50));
  }
  if ($(`.window-app[data-appid="${appid}"]`).length === 0) {
    this.log("Timeout out waiting for app to render");
  }
  //console.log($(`.window-app[data-appid="${appid}"]`) );
  $(`.window-app[data-appid="${appid}"]`).click(async function (){
    //console.log('clicked: ',$(this).attr('data-appid'));
    $(this).off('click')
    $(`.taskbar-app.active`).removeClass('active');
    $(`#taskbar-app-${$(this).attr('data-appid')}`).addClass('active');
  });
}

//if (!Hooks._hooks.addWindowToTaskbar || Hooks._hooks.addWindowToTaskbar?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
Hooks._hooks.addWindowToTaskbar = [];
Hooks.on(`addWindowToTaskbar`, async function addWindowToTaskbar(app)  {
  //addWindowToTaskbar
  //console.log(app);
  if (!app.title ) return;
  if ($(`.taskbar-app[data-id="${app.id}"]`).length>0 || $(`#taskbar-app-${app.appId}`).length>0) {
    $(`.taskbar-app[data-id="${app.id}"]`).removeClass('hidden');
    return $(`#${app.id}`).show();;
  }
  //console.log('RENDER APP:', app);
  let isPinned = game.user.data.flags.world?.pinnedTaskbarDocuments.includes(app.document?.uuid);
  let uuidAttr = '';
  let pinned = '';
  let pin = ``;
  if (app.document?.uuid) {
    uuidAttr = `data-uuid="${app.document?.uuid}"`;
    if (isPinned) {
      pinned = `pinned`;
      pin = `<i class="fas fa-thumbtack"></i>`;
    }
  }
    
  $('#taskbar > div.taskbar-items').append(`<a class="taskbar-app ${pinned}" id="taskbar-app-${app.appId}" data-id="${app.id}" name="${app.appId}" ${uuidAttr}><div class="app-title-div" title="${app.title}">${pin}${app.title}</div></a>`);
  
  setWindowOnClick(app.appId);
  
  $(`#taskbar-app-${app.appId}`).click(async function(e){
    let id = $(this).attr('data-id');
    let appId = $(this).attr('name');
    let w = ui.windows[appId];
    
    if (!w) {
      let d = await fromUuid($(this).attr('data-uuid'));
      let w = await d.sheet.render(true);
      
      console.log('rendering', w)
      return Hooks.call(`addWindowToTaskbar`, w)
    }
    
    console.log(appId, id)
    if (e.ctrlKey || e.shiftKey) {
      if (!$(this).attr('data-uuid')) return;
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
    if ($(this).hasClass('hidden')) {
      $(`#${w.id}`).show();
    }
    
    
    
    if (w===ui.activeWindow) {
      $(`#${w.id}`).hide();
      ui.activeWindow = null;
    } else {
      $(`#${w.id}`).show();
      w.bringToTop();
      ui.activeWindow = w;
    }
      
    if ($(`#${w.id}`).is(":hidden")) $(this).addClass('hidden');
    else $(this).removeClass('hidden');
    $(`.taskbar-app.active`).removeClass('active');
    if (!ui.activeWindow) return;
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  });
  
  $(`#taskbar-app-${app.appId}`).contextmenu( function(){
    let id = $(this).attr('data-id');
    let appId = $(this).attr('name');
    
    if ($(this).hasClass('pinned')) {
      $(`#${id}`).hide();
      $(this).addClass('hidden');
    }
    else { 
      let w = ui.windows[$(this).attr('name')];
      if (w) w.close();
      $(`#taskbar-app-${appId}`).remove();
    }
    $(`.taskbar-app.active`).removeClass('active');
    if ($(this).hasClass('pinned')) return ui.activeWindow = null;;
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  });
  
  if (ui.activeWindow?.appId === app.appId) {
    $(`.taskbar-app.active`).removeClass('active');
    $(`#taskbar-app-${app.appId}`).addClass('active');
  }
    
});


let taskbar = $(`
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
    height: calc(100% - 22px);
            
}
#ui-right {
    height: calc(100% - 40px);
}
#ui-bottom {
  margin-bottom: 22px;
}
#taskbar {
  color: var(--ft-text-color);
  position: absolute;
  transform-origin: bottom left;
  transform: scale(var(--ft-scale));
  /*width: calc((100vw - var(--ft-sidebar)) / var(--ft-scale));*/
  /*width: calc((100vw - 10px)) ;*/
  width: 100vw;
  /*max-width: calc((100vw - 10px)) ;*/
  height: 30px;
  bottom: 0px;
  left: 0px;
  padding: 5px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  background: url(../ui/denim075.png);
  border-top: 1px solid #000;
  border-radius: 3px;
  transition: bottom 0.2s ease-in-out;
  box-shadow: 0 0 20px var(--color-shadow-dark);
}
.taskbar-app {
  padding-left: 3px;
  padding-right: 3px;
  margin-left: 7px;
  border-bottom: 2px solid rgba(255,255,255,.1);
  height: 100%;
  
}
.taskbar-app.active {
  /*background-color:  rgba(255,255,255,.1);*/
  border-bottom: 2px solid rgba(255,255,255,1);
}
.taskbar-app div {
  height: 30px;
}
.taskbar-app.hidden {
  color: #aaa;
}

#taskbar-start-menu {
   
  position: absolute; 
  left: 0px;
  background: url(../ui/denim075.png);
  border: 1px solid #000;
  border-radius: 3px;
  padding: 5px 7px 5px 4px;
  bottom: 30px;
  color: #FFF;
  box-shadow: 0 0 20px var(--color-shadow-dark);
  z-index:1000;
  height: auto;
  width: auto;
  min-width: 300px;
  min-height: 600px;; 
}
div.taskbar-items {
  display: flex; flex-direction: row;
  
}
#calendar-time-taskbar {
 margin-left: auto;
}

.start-menu-item  {
  border: 1px solid rgba(255,255,255,0);
}
.start-menu-item:hover {
  border: 1px solid rgba(255,255,255,1);
  background-color: rgba(0,0,0,.3);
}
.start-menu-item span {
  vertical-align: middle;font-size: 20px; margin:5px; width:100%;
}


.fas.fa-thumbtack {
  margin-right: .25em;
}

.taskbar-sidebar-tab {
  display:inline-block;
  margin: 0 .44em
}
.taskbar-sidebar-tab.active {
  color: #ff6400; 
}
.app-title-div {
  white-space: nowrap; overflow: hidden;  text-overflow: ellipsis;
}
</style>
<div class="taskbar-items"></div>
<a style="" id="calendar-time-taskbar"></a>
<a style="" id="taskbar-hide-all"><div style="height: 30px; margin-left: 8px; ${moveSidebarTabs?'width:25px;':'width:30px; right: -5px; position: relative;'}"><i class="fas fa-tv"></i></div></a>
</div>
`);

$("body").append(taskbar);

$('#taskbar > div.taskbar-items').empty();
let icons = `
<a id="taskbar-menu-toggle" title="Macro List" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 40px; left: -20px; margin-right:-20px; position: relative;"><i style="margin-left: 20px; " class="fas fa-list"></i></div></a>
<a id="taskbar-players-toggle" title="Player List" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 25px;"><i class="fas fa-users"></i></div></a>
<a id="taskbar-macro-toggle" title="Macro Hotbar" class="taskbar-button" style="margin-left:.25em"><div style="height: 30px; width: 25px;"><i class="fas fa-terminal"></i></div></a>
`;

$('#taskbar > div.taskbar-items').append(icons);

for (let w of Object.entries(ui.windows).filter(w=> w[1].title !== '' && w[1].options.popOut && !game.user.data.flags.world.pinnedTaskbarDocuments.includes(w.document?.uuid))) {
  Hooks.call(`addWindowToTaskbar`, (w[1]));
}

//$("#BigButton").clone().appendTo("#rightDiv");

for (let doc of game.user.data.flags.world.pinnedTaskbarDocuments) {
  let d = await fromUuid(doc);
  let w = await d.sheet.render(true);
  let waitRender = Math.floor(1000 / 50);
  while (w._state !== Application.RENDER_STATES.RENDERED && waitRender-- > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
  // eslint-disable-next-line no-undef
  if (w._state !== Application.RENDER_STATES.RENDERED) {
    this.log("Timeout out waiting for app to render");
  }
  await Hooks.call(`addWindowToTaskbar`, w);
  if (w.id !== ui.activeWindow.id) {
    $(`#${w.id}`).hide();
    $(`#taskbar-app-${w.appId}`).addClass('hidden');
  }
  //windows += `<a class="taskbar-app hidden pinned" data-uuid="${doc}"  ><div><i class="fas fa-thumbtack"></i>${doc}</div></a>`;
}

$("#taskbar-hide-all").click(function() { 
  $('.taskbar-app').each(function(){ 
    $(`#${$(this).attr('data-id')}`).hide();
    $(this).addClass('hidden');
    $(this).removeClass('active');
    ui.activeWindow = null;
  });
});

$("#calendar-time-taskbar").click(async function() { 
  Gametime.showCalendar();
});
let dateTime = window.SimpleCalendar.api.timestampToDate(window.SimpleCalendar.api.timestamp());
$("#calendar-time-taskbar").html(`<div style="height: 30px" title="${dateTime.currentSeason.name}, ${dateTime.display.date}">${dateTime.display.time}</div>`);

if (moveSidebarTabs) {
  $('#sidebar-tabs').css('display', 'none');
  $('#taskbar').append(`<div id="taskbar-sidebar-tabs" style=" margin-left: 5px; height: 30px"></div>`);
  $('#sidebar-tabs > a.item').each(function(){$(this).clone().removeClass('item').removeClass('active').addClass('taskbar-sidebar-tab').click(function(){
    ui.sidebar.activateTab($(this).attr('data-tab'));
    $('.taskbar-sidebar-tab.active').removeClass('active');
    $(this).addClass('active');
  }).contextmenu(function(){
    ui[$(this).attr('data-tab')].renderPopout()
  }).appendTo($('#taskbar-sidebar-tabs'))});
  $('.taskbar-sidebar-tab i').wrap($('<div style="height: 30px;"></div>'));
  $(`.taskbar-sidebar-tab[data-tab="${ui.sidebar._tabs[0].active}"]`).addClass('active');
}
//.wrap($('<div style="height: 30px></div>'))
$("#taskbar-menu-toggle").click(async function(e) {
  if ($(`#taskbar-start-menu`).length===0) {
    let macros = [];
    for (let i = 1; i <= 5; i ++)
      macros = macros.concat(Object.values(game.user.getHotbarMacros(i)).filter(m=>!!m.macro).map(m=>`
      <a id="start-${m.macro.data._id}" class="start-menu-macro" name="${m.macro.data._id}" >
        <div class="start-menu-item" style="">
          <img src="${m.macro.data.img}" width="18" style="vertical-align: middle;">
          <span>${m.macro.data.name}</span>
        </div>
      </a>`));
    let content = `<div id="taskbar-start-menu">
      <div id="start-menu-search-results" style="color: black; margin-bottom: 25px;"></div>
      <div id="start-menu-macros" style="margin-bottom: 25px;">${macros.join('')}</div>
      <input type="text" style="color: white; position: absolute; bottom: 0px; left: -1px; width: 99%"></input>
    </div>`;
    
//height: ${macros.length*25+10}px
    $("body").append(content);
    $(`#start-menu-search-results`).hide();
    $(`#ui-left`).css('height', `calc(100% + 100px + (${$('#player-list > li').length*20}px))`);
    $('.start-menu-macro').click(function(){ 
      let id = $(this).attr('name');
      game.macros.get(id).execute();
      if (!autoHideMenu) return;
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
      if (!autoHideMenu) return;
      if (e.shiftKey) return;
      $(`#taskbar-start-menu`).remove();
    });
    
    $("#taskbar-start-menu").mouseleave(function(e){
      if (!autoHideMenu) return;
      if (e.shiftKey) return;
      $(`#taskbar-start-menu`).remove();
    });
    
    $("#taskbar-start-menu > input").keyup(function(){
      $("#taskbar-start-menu").off('mouseleave');
      let input = '';
      let docs = ['actors','items', 'scenes', 'journal', 'tables', 'macros', 'cards'];
      input = $(this).val();
      if (input.length < 3) {
        $("#start-menu-macros").show();
        $("#start-menu-search-results").hide();
        return;
      } else {
        $("#start-menu-macros").hide();
        $("#start-menu-search-results").show();
        let filter = input.toUpperCase();
        let links = [];
        for (let doc of docs)
          links = links.concat(game[doc.toLowerCase()].filter(a=>a.name.toUpperCase().includes(input.toUpperCase())).map(x=>`<p>${x.link}</p>`));
        
        $("#start-menu-search-results").html(TextEditor.enrichHTML(links.join('')));
      }
    });
    $("#taskbar-start-menu > input").focus();
    
  } else {
    $(`#taskbar-start-menu`).remove();
  }
  //new Dialog({title:'', content, buttons:{}, close: ()=>{return}}).render(true);
});


$(`#ui-left`).css('height', `calc(100% + 100px + (${$('#player-list > li').length*20}px))`);

$('#taskbar-players-toggle').click(async function() {
  let currentHeight = parseInt($(`#ui-left`).css('height').replace('px', ''));
  if (window.innerHeight < currentHeight) {
    $(`#ui-left`).css('height', `calc(100% - 20px )`);
    
  }
  else {
    $(`#ui-left`).css('height', `calc(100% + 100px + (${$('#player-list > li').length*20}px))`);
  }
});

$(`#hotbar`).hide();

$('#taskbar-macro-toggle').click(async function() {
  $(`#hotbar`).toggle();
});

$('.taskbar-app').each(function(){ 
  let id = $(this).attr('name');
  if (!id) return $(this).addClass('hidden');
  let w = ui.windows[id];
  if (!w) return;
  if ($(`#${w.id}`).is(":hidden"))
    $(this).addClass('hidden')
  else
    $(this).removeClass('hidden')
});


while (Hooks._hooks.closeApplication && Hooks._hooks.closeApplication.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))>-1)
    Hooks._hooks.closeApplication.splice(Hooks._hooks.closeApplication.findIndex(f=>f.toString().includes('removeWindowFromTaskbar')), 1)
    
Hooks.on(`closeApplication`, async (app) => {
  //removeWindowFromTaskbar
  $(`.taskbar-app.active`).removeClass('active');
  $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) $(`#taskbar-app-${app.appId}`).addClass('hidden');//.removeAttr('name').removeAttr('id');
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
    $("#calendar-time-taskbar").html(`<div style="height: 30px" title="${dateTime.currentSeason.name}, ${dateTime.display.date}">${dateTime.display.time}</div>`);
  });
