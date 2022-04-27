Hooks._hooks.appbarRefresh = [];
Hooks.on('appbarRefresh', async () => {
$('#taskbar').remove();
$(`#taskbar-start-menu`).remove();
$(`#taskbar-settings-menu`).remove();
$('#ui-bottom').prepend($('#players'))
$('#ui-top').append($('#navigation'));
let moveSidebarTabs = 1;
let autohideMenu = 1;
//if (!moveSidebarTabs) $('#sidebar-tabs').css('display', 'flex');
if (!game.user.data.flags?.world?.pinnedTaskbarDocuments)
  await game.user.setFlag('world', 'pinnedTaskbarDocuments', []);
if (!game.user.data.flags?.world?.autohideTaskbar)
  await game.user.setFlag('world', 'autohideTaskbar', false);

let autohideTaskbar = game.user.data.flags.world.autohideTaskbar;

async function setWindowOnClick (appid) {
  let waitRender = Math.floor(1000 / 10);
  while ($(`.window-app[data-appid="${appid}"]`).length === 0 && waitRender-- > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if ($(`.window-app[data-appid="${appid}"]`).length === 0) {
    console.log("Timeout out waiting for app to render");
  }
  $(`.window-app[data-appid="${appid}"]`).click(async function (){
    return Hooks.call(`updateTaskbarClasses`);
  });
}

//for (let f of Hooks._hooks.updateTaskbarClasses) 
  //Hooks.off('updateTaskbarClasses', f);
Hooks._hooks.updateTaskbarClasses = [];

Hooks.on(`updateTaskbarClasses`, async function updateTaskbarClasses(app) {
  $(`.taskbar-app.active`).removeClass('active');
  $('.taskbar-app').each(async function(){
    if ($(`#${$(this).attr('data-id')}`).is(":hidden")) $(this).addClass('hidden');
    else $(this).removeClass('hidden');
    if ($(`#${$(this).attr('data-id')}`).length===0){
      if ($(this).hasClass('pinned')) $(this).addClass('hidden');
      else $(this).remove();
    }
  });
  if (!ui.activeWindow) return;
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
});

Hooks._hooks.addWindowToTaskbar = [];
Hooks.on(`addWindowToTaskbar`, async function addWindowToTaskbar(app)  {
  //addWindowToTaskbar
  if (!app.title || !app._element) return;
  //console.log(app);
  if (app._element) {
    app._element.find(`.window-header .minimize`).remove();
    app._element.find(`.window-header .pin`).remove();
  }
  let isPinned = game.user.data.flags.world?.pinnedTaskbarDocuments.includes(app.document?.uuid);
  let uuidAttr = '';
  let pinned = '';
  let pin = ``;
  let thumbnail = ``;
  if (app.document?.uuid) {
    if (app._element)
      app._element.find(`.header-button.close`).before($(`<a class="pin" style="color: ${game.user.data.flags.world?.pinnedTaskbarDocuments.includes(app.document?.uuid)?'#fff':'#aaa'}" title="Pin"><i class="fas fa-thumbtack"></i>Pin</a>`).click(function(e){
        e.ctrlKey=true;
        $(`#taskbar-app-${app.appId}`).trigger(e);
        if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) 
          $(this).css('color', '#fff');
        else
          $(this).css('color', '#aaa');
      }));
    uuidAttr = `data-uuid="${app.document?.uuid}"`;
    if (isPinned) {
      app._element.find(`.header-button.pin`).css('color', '#fff');
      pinned = `pinned`;
      pin = `<i class="fas fa-thumbtack"></i>`;
    }
    thumbnail = app.document.thumbnail?`<img src="${app.document.thumbnail}" style="vertical-align:top; margin-right: 3px; height:16px; width:16px; border: unset">`:'';
  }
  
  app._element.find(`.header-button.close`).before($(`<a class="minimize" title="Minimize"><i class="fas fa-window-minimize"></i>Minimize</a>`).click(function(e){
    $(`#taskbar-app-${app.appId}`).click();
  }));
  
   if (game.user.data.flags.world?.rmHeaderButtonText && app._element)
    app._element.find(`.window-header a`).each(function(){
      $(this).attr('title', $(this).text());
      $(this).html($(this).html().replace($(this).text(),''))
      
    });
  
  if ($(`.taskbar-app[data-id="${app.id}"]`).length>0 || $(`#taskbar-app-${app.appId}`).length>0) {
    $(`.taskbar-app[data-id="${app.id}"]`).removeClass('hidden');
    return $(`#${app.id}`).show();
  }
  
  $('#taskbar > div.taskbar-items').append(`<a class="taskbar-app ${pinned}" id="taskbar-app-${app.appId}" data-id="${app.id}" name="${app.appId}" ${uuidAttr}><div class="app-title-div" title="${app.appId} | ${app.id}">${pin}${thumbnail}${app.title}</div></a>`);
  
  setWindowOnClick(app.appId);
  
  $(`#taskbar-app-${app.appId}`).click(async function(e){
    let id = $(this).attr('data-id');
    let appId = $(this).attr('name');
    let w = ui.windows[appId];
    
    
    //console.log(appId, id)
    if (e.ctrlKey || e.shiftKey) {
      if (!$(this).attr('data-uuid')) return;
      //console.log($(this).hasClass('pinned'))
      if ($(this).hasClass('pinned')) {
        $(this).removeClass('pinned').find('div i').remove();
        $(`#${id} .window-header .pin`).css('color','#aaa');
        let flag = game.user.data.flags.world.pinnedTaskbarDocuments;
        if (flag.includes($(this).attr('data-uuid'))) flag.splice(flag.indexOf($(this).attr('data-uuid')),1)
        await game.user.setFlag('world', 'pinnedTaskbarDocuments', flag);
        if (!ui.windows[appId]) $(this).remove();
      } else {
        $(this).addClass('pinned').find('div').prepend('<i class="fas fa-thumbtack"></i>');
        $(`#${id} .window-header > .pin`).css('color','#fff');
        let flag = game.user.data.flags.world.pinnedTaskbarDocuments;
        flag.push($(this).attr('data-uuid'))
        await game.user.setFlag('world', 'pinnedTaskbarDocuments', flag);
      }
      return ;
    }
    
    if (!w) {
      let d = await fromUuid($(this).attr('data-uuid'));
      let w = await d.sheet.render(true);
      
      //console.log('rendering', w)
      return Hooks.call(`addWindowToTaskbar`, w)
    }
    
    
    
    if (w===ui.activeWindow) {
      $(`#${w.id}`).hide();
      ui.activeWindow = null;
    } else {
      $(`#${w.id}`).show();
      w.bringToTop();
      ui.activeWindow = w;
    }
    if ($(this).hasClass('hidden')) {
      $(`#${w.id}`).show();
      ui.activeWindow = w;
    }
    
    return Hooks.call(`updateTaskbarClasses`);
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
    return Hooks.call(`updateTaskbarClasses`);
    $(`.taskbar-app.active`).removeClass('active');
    if ($(this).hasClass('pinned')) return ui.activeWindow = null;;
    $(`#taskbar-app-${ui.activeWindow.appId}`).addClass('active');
  });
  return Hooks.call(`updateTaskbarClasses`);
});
let minimalCSS = `
#players, #hotbar {
  bottom: 24px !important;
}
`;

let taskbar = $(`
<div class="taskbar ${autohideTaskbar?'autohide':''}" id="taskbar">
<style id="taskbar-style">

#ui-top {
  /*min-height: 55px;*/
}
#ui-top, #players {
  margin-left: 5px !important;
}
#ui-left {
  width: 150px;
  /*margin-top: 65px;*/
}
#ui-bottom {
  display: flex;
  margin-left: -150px;
  margin-bottom: 23px;
}
#ui-right {
    height: calc(100% - 38px);
    position: absolute;
    right:0px;
    transition: right 0.2s ease-in-out;
}
#ui-right.hidden {
    right: -304px;
}
#controls {
  margin-bottom: 30px;
}
#logo {
  /*position: absolute;*/
}

#players {
  /*min-width: 150px;*/
}
#hotbar {
  margin:auto 0 12px 5px;
}
#nav-toggle {
  /*display: none;*/
}
#navigation {
  /*margin: auto  0 5px 20px;*/
}
#taskbar {
  color: #fff;
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
  z-index: 0;
  display: flex;
  flex-direction: row;
  background: url(../ui/denim075.png);
  border-top: 1px solid #000;
  border-radius: 3px;
  transition: bottom 0.2s ease-in-out;
  box-shadow: 0 0 20px var(--color-shadow-dark);
}
#taskbar.hidden {
  bottom: -24px;
}
#taskbar.paused {
 box-shadow: 0 0 20px var(--color-border-highlight-alt);
}
.taskbar-app {
  padding-left: 3px;
  padding-right: 3px;
  margin-left: 7px;
  border-bottom: 2px solid rgba(255,255,255,.1);
  height: 100%;
}
.taskbar-app.active {
  border-bottom: 2px solid rgba(255,255,255,1);
}
.taskbar-app div {
  height: 30px;
}
.taskbar-app.hidden {
  color: #aaa;
  
}
.taskbar-app.hidden > div > img {
  filter: grayscale(100%) opacity(50%);
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
  height: auto;
  width: auto;
  min-width: 300px;
  /*min-height: 600px;*/
}
div.taskbar-items {
  display: flex; flex-direction: row;
  
}
#calendar-time-taskbar {
  margin: 0 .25em;
}
#taskbar-right {
  margin-left: auto;
}
.start-menu-item  {
  border: 1px solid rgba(255,255,255,0);
}
.start-menu-item:hover {
  border: 1px solid rgba(255,255,255,.5);
  background-color: rgba(0,0,0,.3);
  box-shadow: 0 0 5px var(--color-shadow-primary);
}
.start-menu-item span {
  vertical-align: middle;font-size: 20px; margin:5px; width:100%;
}
.app-title-div > .fas.fa-thumbtack {
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
.taskbar-button {
  margin:0 .1em;
}
.taskbar-button > div {
  height: 30px; width: 25px;
}
#taskbar-logo-toggle > div > img:hover {
  filter: drop-shadow(0px 0px 3px rgb(0 255 255 / 0.9)) invert(100%) !important;
}
${(game.modules.get("minimal-ui")?.active)?minimalCSS:''}

</style>
<div class="taskbar-items">
<a id="taskbar-menu-toggle" title="Macro List" class="" style="margin-left:.25em"><div style="height: 30px; width: 40px; left: -20px; margin-right:-20px; position: relative;"><i style="margin-left: 20px; " class="fas fa-list"></i></div></a>
<a id="taskbar-logo-toggle" title="Logo Toggle" class="taskbar-button ui-toggle" name="logo" style="margin:-0.5px .25em"><div>
<img src="icons/anvil.png" style="height: 20px; filter: invert(100%); vertical-align: top; margin-top: -2px; border: unset;"></div></a>
<a id="taskbar-navigation-toggle" title="Scene Navigation" class="taskbar-button ui-toggle" name="navigation"><div><i class="fas fa-compass"></i></div></a>
<a id="taskbar-players-toggle" title="Player List" class="taskbar-button ui-toggle" name="players"><div><i class="fas fa-users"></i></div></a>
<a id="taskbar-macro-toggle" title="Macro Hotbar" class="taskbar-button ui-toggle" name="hotbar"><div ><i class="fas fa-code"></i></div></a>
</div>
<a id="taskbar-right"></a>
<a id="calendar-time-taskbar"></a>
<a id="taskbar-hide-all"><div style="height: 30px; margin:0 2px; width:30px; right: -10px; position: relative;"><i class="fas fa-tv"></i></div></a>
</div>
`);
//<a style="" id="toggle-autohide"><div style="height: 30px; margin:0 5px;">${autohideTaskbar?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-lock"></i>'}</div></a>
//
$("body").append(taskbar);



$('.taskbar-button.ui-toggle').click(async function(e){
  let uiId = $(this).attr('name');
    if ($(`#hide-ui-${uiId}`).length) {
      $(`#hide-ui-${uiId}`).remove();
      await game.user.setFlag('world', `autohide${uiId.capitalize()}`, false);
    } else { 
      $(`#taskbar`).append(`<style id="hide-ui-${uiId}">#${uiId}{display:none !important;}</style>`);
      await game.user.setFlag('world', `autohide${uiId.capitalize()}`, true);
    }
    if ($(`#hide-ui-${uiId}`).length) $(this).css('filter', 'opacity(50%)')
    else $(this).css('filter', 'opacity(100%)')
});

let uiElements = ['players', 'navigation', 'hotbar', 'logo'];
for (let e of uiElements)
  if (game.user.data.flags.world[`autohide${e.capitalize()}`]) $(`.taskbar-button.ui-toggle[name=${e}]`).click();

$('.taskbar-button.ui-toggle').each(function(){
  let uiId = $(this).attr('name');
  if ($(`#hide-ui-${uiId}`).length) $(this).css('filter', 'opacity(50%)');
  else $(this).css('filter', 'opacity(100%)')
});
  
if ($("#taskbar").hasClass('autohide')) $(`#taskbar-start-menu`).addClass('hide');

for (let w of Object.values(ui.windows).filter(w=> w.title !== '' && w.options.popOut && !game.user.data.flags.world?.pinnedTaskbarDocuments.includes(w.document?.uuid))) {
  Hooks.call(`addWindowToTaskbar`, (w));
}

let pinnedDocs = game.user.data.flags.world.pinnedTaskbarDocuments;
for (let doc of pinnedDocs) {
  let d = await fromUuid(doc);
  if (!d) {
    let flag = game.user.data.flags.world.pinnedTaskbarDocuments;
    if (flag.includes(doc)) flag.splice(flag.indexOf(doc),1)
    await game.user.setFlag('world', 'pinnedTaskbarDocuments', flag);
    continue;
  }
  let w = await d.sheet.render(true);
  let waitRender = Math.floor(1000 / 50);
  while (w._state !== Application.RENDER_STATES.RENDERED && waitRender-- > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
  // eslint-disable-next-line no-undef
  if (w._state !== Application.RENDER_STATES.RENDERED) {
    console.log("Timeout out waiting for app to render");
  }
  await Hooks.call(`addWindowToTaskbar`, w);
  //if (w.id !== ui.activeWindow.id) {
    $(`#${w.id}`).hide();
    $(`#taskbar-app-${w.appId}`).addClass('hidden');
    $(`#taskbar-app-${w.appId}`).removeClass('active');
  //}
  //windows += `<a class="taskbar-app hidden pinned" data-uuid="${doc}"  ><div><i class="fas fa-thumbtack"></i>${doc}</div></a>`;
}

$('#toggle-autohide').click(async function() {
  if($("#taskbar").hasClass("autohide")){
    $("#taskbar").removeClass("autohide");
    $(this).find('div').html('<i class="fas fa-lock"></i>');
    await game.user.setFlag('appbar', 'autohideTaskbar', false);
  } else {
    $("#taskbar").addClass("autohide");
    $(this).find('div').html('<i class="fas fa-lock-open"></i>');
    await game.user.setFlag('appbar', 'autohideTaskbar', true);
  }
});

$("#taskbar").mouseenter(function(e){
  $(`#taskbar`).removeClass('hide').removeClass('hidden');
  let currentHeight = parseInt($(`#ui-left`).css('height').replace('px', ''));
  /*if (window.innerHeight+20 > currentHeight) {
    $(`#ui-left`).css('height', `calc(100% - 22px )`);
  }
  else {
    $(`#ui-left`).css('height', `calc(100% + 110px + (${$('#player-list > li').length*25}px))`);
  }*/
  //$(`#ui-left`).css('height', `calc(100% - 23px )`);
  $(`#ui-right`).css(`height`,`calc(100% - 38px)`);
  $(`#ui-bottom`).css(`margin-bottom`,`23px`);
});
    
$("#taskbar").mouseleave(async function(e){
  if (!$("#taskbar").hasClass('autohide')) return;
  $(`#taskbar`).addClass('hide');
  await new Promise((r) => setTimeout(r, 1000));
  if ($(`#taskbar`).hasClass('hide') && $(`#taskbar`).hasClass('autohide')) {
    $(`#taskbar`).addClass('hidden');
    let currentHeight = parseInt($(`#ui-left`).css('height').replace('px', ''));
    console.log(window.innerHeight, currentHeight)
    /*if (window.innerHeight+20 > currentHeight) {
      $(`#ui-left`).css('height', `calc(100%)`);
    }
    else {
      $(`#ui-left`).css('height', `calc(100% + 110px + (${$('#player-list > li').length*25}px))`);
    }*/
    //$(`#ui-left`).css('height', `calc(100%)`);
    $(`#ui-right`).css(`height`,`calc(100% - 15px)`);
    $(`#ui-bottom`).css(`margin-bottom`,`1px`);

  }
});

$(`#ui-right`).css(`height`,`calc(100% - 38px)`);

if (game.modules.get("about-time")?.active) {
  $("#calendar-time-taskbar").click(async function() { 
    Gametime.showCalendar();
  });
  let dateTime = window.SimpleCalendar.api.timestampToDate(window.SimpleCalendar.api.timestamp());
  $("#calendar-time-taskbar").html(`<div style="height: 30px" title="${dateTime.currentSeason.name}, ${dateTime.display.date}">${dateTime.display.time}</div>`);
}

$("#taskbar-hide-all").click(function() { 
  $('.taskbar-app').each(function(){ 
    $(`#${$(this).attr('data-id')}`).hide();
    $(this).addClass('hidden');
    $(this).removeClass('active');
    ui.activeWindow = null;
  });
});
$("#taskbar-hide-all").contextmenu(function() { 
  if ($('#ui-right').hasClass('pinned')) 
    $('#ui-right').removeClass('pinned').addClass('hidden').addClass('hide');
  else
    $('#ui-right').addClass('pinned').removeClass('hidden').removeClass('hide');
});

if (game.user.data.flags.world?.moveSidebarTabs) {
    $('#sidebar-tabs').css('display', 'none');
    $('#taskbar').append(`<div id="taskbar-sidebar-tabs" style=" margin-left: 5px; height: 30px"></div>`);
    $('#sidebar-tabs > a.item').each(function(){$(this).clone().removeClass('item').removeClass('active').addClass('taskbar-sidebar-tab').click(function(){
      ui.sidebar.activateTab($(this).attr('data-tab'));
      $('.taskbar-sidebar-tab.active').removeClass('active');
      $(this).addClass('active');
      $('#ui-right').removeClass('hidden')
    }).contextmenu(function(){
      ui[$(this).attr('data-tab')].renderPopout();
      //$('#ui-right').addClass('hidden');
    }).appendTo($('#taskbar-sidebar-tabs'))});
    $('.taskbar-sidebar-tab i').wrap($('<div style="height: 30px;"></div>'));
    $(`.taskbar-sidebar-tab[data-tab="${ui.sidebar._tabs[0].active}"]`).addClass('active');
} else {
  $("#taskbar-sidebar-tabs").remove()
  $('#sidebar-tabs').css('display', 'flex')
}
$("#calendar-time-taskbar").after(`<a class="tasakbar-button" id="taskbar-settings-toggle"><div style="height: 30px; margin-left: 5px;"><i class="fas fa-cog"></i></div></a>`);
$("#taskbar-settings-toggle").contextmenu(async function(e) {
  if (!$("#taskbar").hasClass("autohide")) 
   $("#taskbar").addClass("autohide").addClass('hide').addClass('hidden');
  else 
    $("#taskbar").removeClass("autohide").removeClass('hide').removeClass('hidden');
});
$("#taskbar-settings-toggle").click(async function(e) {
  if ($(`#taskbar-settings-menu`).length===0) {
  $('#taskbar-settings-menu').remove();
  let settings = `
  <div id="taskbar-settings-menu" style="z-index:${_maxZ+1}">
  <style>
  #taskbar-settings-menu {
  position: absolute; 
  left: ${$(this).offset().left-170}px;
  background: url(../ui/denim075.png);
  border: 1px solid #000;
  border-radius: 3px;
  padding: 5px 7px 5px 4px;
  bottom: 30px;
  color: #FFF;
  box-shadow: 0 0 20px var(--color-shadow-dark);
  height: auto;
  width: 220px;
  }
  #taskbar-settings-menu input {
  vertical-align: top;
  margin-top: 2px;
  height: 14px;
  }
  #taskbar-settings-menu label {
  vertical-align: middle;
  }
  #taskbar-settings-menu label:hover {
  cursor: pointer;
  text-shadow: 0 0 8px var(--color-shadow-primary);
  }
  #taskbar-settings-menu input:hover {
  cursor: pointer;
  text-shadow: 0 0 8px var(--color-shadow-primary);
  }
  </style>
  <center style="border-bottom: 1px solid white; margin-bottom: .5em;">Taskbar Settings</center>
    
    <input id="autohideTaskbar" type="checkbox" ${game.user.data.flags.world?.autohideTaskbar?'checked':''}>
    <label for="autohideTaskbar">Auto-Hide Taskbar</label><br>
    
    <input id="autohideTaskbarMenu" type="checkbox" ${game.user.data.flags.world?.autoHideMenu?'checked':''}>
    <label for="autohideTaskbarMenu">Auto-Hide Menu</label><br>
    
    <input id="autohideSidebar" type="checkbox" ${game.user.data.flags.world?.autohideSidebar?'checked':''}>
    <label for="autohideSidebar">Auto-Hide Sidebar</label><br>
    
    <input id="moveSidebarTabs" type="checkbox" ${game.user.data.flags.world?.moveSidebarTabs?'checked':''}>
    <label for="moveSidebarTabs">Move Sidebar Tabs</label><br>
    
    <input id="rmHeaderButtonText" type="checkbox" ${game.user.data.flags.world?.rmHeaderButtonText?'checked':''}>
    <label for="rmHeaderButtonText">Remove Header Button Text</label>
    
    <center><p><button id="taskbar-settings-refresh" style="height: 20px; line-height: 16px;">Refresh</button></p><center>
  </div>`;
  /*
  <input id="autohideLogo" type="checkbox" ${game.user.data.flags.world?.autohideLogo?'checked':''}>
    <label for="autohideLogo">Hide Logo On Load</label><br>  
    
    <input id="autohideNavigation" type="checkbox" ${game.user.data.flags.world?.autohideNavigation?'checked':''}>
    <label for="autohideNavigation">Hide Scenes On Load</label><br>
    
    <input id="autohidePlayers" type="checkbox" ${game.user.data.flags.world?.autohidePlayers?'checked':''}>
    <label for="autohidePlayers">Hide Players On Load</label><br>
    
    <input id="autohideHotbar" type="checkbox" ${game.user.data.flags.world?.autohideHotbar?'checked':''}>
    <label for="autohideHotbar">Hide Hotbar On Load</label><br>
    */
  $("body").append(settings);
  $('#taskbar-settings-refresh').click(async function(e){
    $('#taskbar-settings-menu').remove();
    Hooks.call('appbarRefresh');
  });
  $("#taskbar-settings-menu").contextmenu(function(){
    $(this).remove();
  });
  $('#taskbar-settings-menu input').change(async function() {
    console.log($(this).attr('id'), $(this).is(':checked'));
    let setting = $(this).attr('id');
    let checked = $(this).is(':checked');
    await game.user.setFlag('world', setting, checked);
    switch (setting) {
      case 'autohideTaskbar':
        if (checked) {
          $("#taskbar").addClass("autohide").addClass('hide').addClass('hidden');
        } else {
          $("#taskbar").removeClass("autohide").removeClass('hide').removeClass('hidden');
        }
        break;
      case 'autohideSidebar':
        if (checked) {
          $('#ui-right').removeClass('pinned').addClass('hidden').addClass('hide');
        } else {
          $('#ui-right').addClass('pinned').removeClass('hidden').removeClass('hide');
        }
        break;
      case 'moveSidebarTabs':
        if (checked) {
          $('#sidebar-tabs').css('display', 'none');
          $('#taskbar').append(`<div id="taskbar-sidebar-tabs" style=" margin-left: 5px; height: 30px"></div>`);
          $('#sidebar-tabs > a.item').each(function(){$(this).clone().removeClass('item').removeClass('active').addClass('taskbar-sidebar-tab').click(function(){
            ui.sidebar.activateTab($(this).attr('data-tab'));
            $('.taskbar-sidebar-tab.active').removeClass('active');
            $(this).addClass('active');
            $('#ui-right').removeClass('hidden');
          }).contextmenu(function(){
            ui[$(this).attr('data-tab')].renderPopout();
            //$('#ui-right').addClass('hidden');
          }).appendTo($('#taskbar-sidebar-tabs'))});
          $('.taskbar-sidebar-tab i').wrap($('<div style="height: 30px;"></div>'));
          $(`.taskbar-sidebar-tab[data-tab="${ui.sidebar._tabs[0].active}"]`).addClass('active');
        } else {
          $("#taskbar-sidebar-tabs").remove();
          $('#sidebar-tabs').css('display', 'flex');
        }
    }
  });

  } else {
    $(`#taskbar-settings-menu`).remove();
  }
});

if (game.modules.get("gm-screen")?.active) {
  $("#calendar-time-taskbar").after($('<a id="gm-screen-open" style="height: 30px; margin:0 5px;" title="GM Screen"><div><i class="fas fa-book-reader"></i></div></a>').click(()=>{
    game.modules.get("gm-screen")?.api?.toggleGmScreenVisibility();
    if ($('body > div.gm-screen-app.window-app.gm-screen-drawer > div.gm-screen-actions.tabs > button.gm-screen-button').is(':hidden'))
      $('body > div.gm-screen-app.window-app.gm-screen-drawer > div.gm-screen-actions.tabs > button.gm-screen-button').show();
    else
      $('body > div.gm-screen-app.window-app.gm-screen-drawer > div.gm-screen-actions.tabs > button.gm-screen-button').hide();
  }));
  $('body > div.gm-screen-app.window-app.gm-screen-drawer > div.gm-screen-actions.tabs > button.gm-screen-button[data-action="toggle-gm-screen"]').click(function(){
    if ($('body div.gm-screen-drawer').hasClass('expanded')) $(this).hide();
    else $(this).show();
  });
  $('body > div.gm-screen-app.window-app.gm-screen-drawer > div.gm-screen-actions.tabs > button.gm-screen-button[data-action="toggle-gm-screen"]').hide()
}

if(game.user.data.flags.world?.autohideSidebar) $('#ui-right').addClass('hide').addClass('hidden').removeClass('pinned');
else   $('#ui-right').removeClass('hidden').removeClass('hide').addClass('pinned');

$("#ui-right").off('mouseenter').off('mouseleave');

$("#ui-right").mouseenter(function(e){
  $(this).removeClass('hidden');
  $(this).removeClass('hide');
});

$("#ui-right").mouseleave(async function(e){
  if (e.shiftKey || $(this).hasClass('pinned')) return;
  $(this).addClass('hide');
  await new Promise((r) => setTimeout(r, 1000));
  if (!($(this).hasClass('pinned')) && $(this).hasClass('hide'))
    $(this).addClass('hidden')
});

$("#taskbar-menu-toggle").click(async function(e) {
  if ($(`#taskbar-start-menu`).length) return $(`#taskbar-start-menu`).remove();
  
  let macros = [];
  for (let i = 1; i <= 5; i ++)
    macros = macros.concat(Object.values(game.user.getHotbarMacros(i)).filter(m=>!!m.macro).map(m=>`
    <a id="start-${m.macro.data._id}" class="start-menu-macro" name="${m.macro.data._id}" >
      <div class="start-menu-item" style="">
        <img src="${m.macro.data.img}" width="18" style="vertical-align: middle; margin-left: 3px;">
        <span>${m.macro.data.name}</span>
      </div>
    </a>`));
  let content = `<div id="taskbar-start-menu" style="z-index:${_maxZ+1};">
    <style> #players {display:none;}</style>
    <div id="start-menu-search-results" style="color: black; margin-bottom: 30px; max-height: calc(100vh - 75px); overflow: auto;"></div>
    <div id="start-menu-macros" style="max-height: calc(100vh - 75px); overflow: auto; ${game.user.isGM?'margin-bottom: 25px;':''}">${macros.join('')}</div>`;
  if (game.user.isGM) content += `<div style="position: absolute; bottom: 3px;  margin: 0px; width: calc(100% - 11px);"><input id="start-menu-search-input" type="text" style="width: 100%; color: white;"></input></div>`;
  content += `</div>`;
  $("body").append(content);
  $('#taskbar-start-menu').prepend(`<style>#hotbar {position: absolute; left:${$('#taskbar-start-menu').width() + 15}px; bottom: 22px;}</style>`);
  $(`#start-menu-search-results`).hide();
  //$(`#ui-left`).css('height', `calc(100% + 100px + (${$('#player-list > li').length*20}px))`);
  $('.start-menu-macro').click(function(){ 
    let id = $(this).attr('name');
    game.macros.get(id).execute();
    if (!game.user.data.flags.world?.autohideTaskbarMenu) return;
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
    if (!game.user.data.flags.world?.autohideTaskbarMenu) return;
    if (e.shiftKey) return;
    $(`#taskbar-start-menu`).remove();
  });
  
  $("#taskbar-start-menu").mouseenter(function(e){
    $(`#taskbar-start-menu`).removeClass('hide');
  });
  
  $("#taskbar-start-menu").mouseleave(async function(e){
    if (!game.user.data.flags.world?.autohideTaskbarMenu) return;
    if (e.shiftKey) return;
    $(`#taskbar-start-menu`).addClass('hide');
    await new Promise((r) => setTimeout(r, 2000));
    if ($(`#taskbar-start-menu`).hasClass('hide'))
      $(`#taskbar-start-menu`).remove();
  });
  
  $("#start-menu-search-input").keyup(function(){
    $("#taskbar-start-menu").off('mouseleave');
    if (!game.user.isGM) return;
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
        links += game[doc.toLowerCase()].filter(a=>a.name.toUpperCase().includes(input.toUpperCase())).reduce((acc,x,i,a)=>acc+=(a.length&&!i?`<h2 style="color: white">${doc.at(doc.length-1)=='s'?doc.capitalize():doc.capitalize()+'s'}</h2>`:``)+`<p><img src="${x.thumbnail?x.thumbnail:'icons/svg/book.svg'}" style="vertical-align:top;height:20px; margin-top: -2px;width: 18px; margin-right: .5em ">${x.link}</p>`,``);
        //links = links.concat(game[doc.toLowerCase()].filter(a=>a.name.toUpperCase().includes(input.toUpperCase())).map(x=>`<p><img src="${x.thumbnail}" style="vertical-align:top;height:18px; width: 18px; margin-right: .5em ">${x.link}</p>`));
      
      $("#start-menu-search-results").html(TextEditor.enrichHTML(links));
      $('#taskbar-start-menu').find('a.entity-link').contextmenu(async function() { 
        game.collections.get($(this).attr('data-entity')).get($(this).attr('data-id')).sheet.render(true);
      });
    }
  });
  $("#start-menu-search-input").focus();
});

if (!game.user.isGM) $("#calendar-time-taskbar").remove();

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
    

if (!Hooks._hooks.renderSidebarTab || Hooks._hooks.renderSidebarTab?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderSidebarTab`, async (app) => { 
    //addWindowToTaskbar
    if (!app.options.popOut) return;
    Hooks.call(`addWindowToTaskbar`, app)
  });
if (!Hooks._hooks.renderApplication || Hooks._hooks.renderApplication?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderApplication`, async (app) => { 
    //addWindowToTaskbar
    if (app.options?.id === "players") return;
    Hooks.call(`addWindowToTaskbar`, app)
  });
  
if (!Hooks._hooks.renderActorSheet || Hooks._hooks.renderActorSheet?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderActorSheet`, async (app) => { 
    //addWindowToTaskbar
    Hooks.call(`addWindowToTaskbar`, app)
  });
if (!Hooks._hooks.renderItemSheet || Hooks._hooks.renderItemSheet?.findIndex(f=>f.toString().includes('addWindowToTaskbar'))==-1)
  Hooks.on(`renderItemSheet`, async (app) => { 
    //addWindowToTaskbar
    Hooks.call(`addWindowToTaskbar`, app)
  });

if (!Hooks._hooks.closeSidebarTab || Hooks._hooks.closeSidebarTab?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeSidebarTab`, async (app) => {
    //removeWindowFromTaskbar
    $(`#taskbar-app-${app.appId}`).remove();
    Hooks.call(`updateTaskbarClasses`, app);
  });
Hooks.on(`closeApplication`, async (app) => {
  //removeWindowFromTaskbar
  if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) $(`#taskbar-app-${app.appId}`).addClass('hidden');//.removeAttr('name').removeAttr('id');
  else $(`#taskbar-app-${app.appId}`).remove();
  Hooks.call(`updateTaskbarClasses`, app);
});
if (!Hooks._hooks.closeActorSheet || Hooks._hooks.closeActorSheet?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeActorSheet`, async (app) => {
    //removeWindowFromTaskbar
    if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) $(`#taskbar-app-${app.appId}`).addClass('hidden');//.removeAttr('name').removeAttr('id');
    else $(`#taskbar-app-${app.appId}`).remove();
    Hooks.call(`updateTaskbarClasses`, app);
  });
if (!Hooks._hooks.closeItemSheet || Hooks._hooks.closeItemSheet?.findIndex(f=>f.toString().includes('removeWindowFromTaskbar'))==-1)
  Hooks.on(`closeItemSheet`, async (app) => {
    //removeWindowFromTaskbar
    if ($(`#taskbar-app-${app.appId}`).hasClass('pinned')) $(`#taskbar-app-${app.appId}`).addClass('hidden');//.removeAttr('name').removeAttr('id');
    else $(`#taskbar-app-${app.appId}`).remove();
    Hooks.call(`updateTaskbarClasses`, app);
  });


if (!Hooks._hooks.pseudoclockSet || Hooks._hooks.pseudoclockSet?.findIndex(f=>f.toString().includes('calendar-time-taskbar'))==-1) 
  Hooks.on(`pseudoclockSet`, async (time) => {
    let dateTime = window.SimpleCalendar.api.timestampToDate(time)
    $("#calendar-time-taskbar").html(`<div style="height: 30px" title="${dateTime.currentSeason.name}, ${dateTime.display.date}">${dateTime.display.time}</div>`);
  });
  

});
if (game?.ready) Hooks.call('appbarRefresh');
if (!Hooks._hooks.ready || Hooks._hooks.ready?.findIndex(f=>f.toString().includes('appbarRefresh'))==-1)
Hooks.once('ready', async () => {
  Hooks.call('appbarRefresh');
});