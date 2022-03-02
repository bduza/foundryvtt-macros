let ignoreApps = [
    "slideshow-display",
    "open-apps-dialog"
    ];
let content = '<ul>';
for (const [key, value] of Object.entries(ui.windows)){
    if (ignoreApps.includes(value.options.id)) continue;
    let element = value._element[0];
    let title = element.children[0].innerText.replace('Close','');
    let windowId = element.id;
    content += `<li id="appid-${value.appId}" style="font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
    <a title="close" id="close-${windowId}" name="${value.appId}" ><i class="fas fa-times"></i></a>
    <a title="toggle" id="toggle-${windowId}" name="${windowId}"  > <i class="fas fa-eye"></i></a>
    <a title="roll up" id="minimize-${windowId}" name="${value.appId}"  ><i class="fas fa-window-minimize"></i></a>
    <a title="restore" id="maximize-${windowId}" name="${value.appId}"  ><i class="fas fa-window-maximize"></i></a>
    <a title="top" id="top-${windowId}" name="${value.appId}" ><i class="fas fa-window-restore"></i>
    <span style="font-size: 20px; " title="">${value.title}</span></a></li>`;
}
content += `</ul>`;
let d = new Dialog({
  title: 'Open Apps',
  content:  content,
  buttons: {},
  render: (content) => {
    $('#open-apps-dialog')[0].style.display = 'block';
    ui.windows[$('#open-apps-dialog').attr('data-appid')].bringToTop();
    
    $(`a[id^=top-]`).click(async function(e){
        console.log($(`div#${this.name}`));
        ui.windows[this.name].bringToTop();
        ui.windows[$('#open-apps-dialog').attr('data-appid')].bringToTop();
    });
    /*
    $(`a[id^=top-]`).contextmenu(async function(e){
      console.log($(`div#${this.name}`));
      const contextmenu = $(`<div></div>`);
      contextmenu.append(`<a><i class="fas fa-angle-double-right" style="width: 1.5em"></i>Close</a>`).click(async function(e){
        console.log($(`div#${this.name}`));
        ui.windows[this.name].close()
        $(this).parent().remove();
        });
      contextmenu.css({
                    top: e.clientY,
                    left: e.clientX,
                });
      $("body").append(contextmenu);
    });
    */
    $(`a[id^=close-]`).click(async function(e){
        console.log($(`div#${this.name}`));
        ui.windows[this.name].close()
        $(this).parent().remove();
    });
    $(`a[id^=toggle-]`).click(async function(e){
        console.log($(`div#${this.name}`));
        $(`div#${this.name}`).toggle();
    });
    $(`a[id^=minimize-]`).click(async function(e){
        console.log($(`div#${this.name}`));
        ui.windows[this.name].minimize();
    });
    $(`a[id^=maximize-]`).click(async function(e){
        console.log($(`div#${this.name}`));
        ui.windows[this.name].maximize();
    });
  },
  close:   html => {
      return}
},{ width: 500,  id:"open-apps-dialog" }
).render(true);