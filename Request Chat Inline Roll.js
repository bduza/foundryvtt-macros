let update = await game.macros.getName("Update Macro From Git").execute(this.name);
if (update.match) return this.execute();

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
  border: 2px solid darkred;
}
.mir, .mirm  {
      background: #DDD;
      padding: 1px 4px;
      border: 1px solid #4b4a44;
      border-radius: 2px;
      white-space: nowrap;
      word-break: break-all;
      text-align: center;
      margin-bottom: .5em;
    }
</style>
`;
content += `<center><div id="targets" >`;
for (const u of [...game.users].filter(u=>!u.isGM && u.name!=='test')){
        content += `<input type="checkbox" class="macro-users" id="user-${u.id}" name="${u.id}" style="display: none;"/>
        <label for="user-${u.id}" class="user-label" title="${u.name}" name="${u.id}"  /><img height="36" width="36" src="${u.character?u.character.data.img:'icons/svg/cowled.svg'}" style="cursor: pointer"></label>`;
}
content += `
<a id="built-roll" class="inline-roll roll" data-mode="roll" data-flavor="" data-formula="" style="display:none"></a>
  <div style="display: grid; grid-template-columns: repeat(8, 1fr ); margin-top: .5em; margin-bottom: .5em">
      <center></center><center></center>
      <center><a title="roll" class="mirm">/r</a></center>
      <center><a title="gmroll" class="mirm">/gmr</a></center>
      <center><a title="blindroll" class="mirm">/br</a></center>
      <center><a title="selfroll" class="mirm">/sr</a></center>
      <center></center><center></center>
  </div></div>`;
  //let a = u.character;
  let abilities = ``;
  let saves = ``;
  for (const [key, value] of Object.entries(CONFIG.DND5E['abilities'])){
      //let text = CONFIG.DND5E['abilities'][key] ;
      abilities += `<a title="${value} Test" class="mir" data-type="test" data-key="${key}"  style="margin: .1em;">${key.toUpperCase()}</a>`;
      saves += `<a title="${value} Save" class="mir" data-type="save" data-key="${key}" style="margin: .1em;">Save</a>`;
  }
  let skills = ``;
  for (const [key, value] of Object.entries(CONFIG.DND5E['skills'])){
      //let text = CONFIG.DND5E['skills'][key] ;
      skills += `
      <a title="${value} Check" class="mir" data-type="skill" data-key="${key}" style="margin: .1em;">${value}</a>
        `;
  }
  
  content += `
  <div style="display: grid; grid-template-rows: auto auto;">
	<div style="display: grid; grid-template-columns: repeat(6, 1fr);">
	  ${abilities}
	</div>
	<div style="display: grid; grid-template-columns: repeat(6, 1fr); margin-bottom: .25em">
	  ${saves}
	</div>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr);margin-bottom: .25em"">
    ${skills}
	</div>
	</div>
	<center><input id="roll-request-dc" style=" text-align: center; font-weight:bold;" placeholder="DC"></input></center>
  `;
let d = new Dialog({
  title: `Request Rolls`,
  content:  content,
  buttons: {},
  render: (content) => {
      let currentrollmode = game.settings.get("core", "rollMode")
    $(`#built-roll`).attr('data-mode', currentrollmode);
    $(`[title='${currentrollmode}']`).css('textShadow' , "0 0 8px red");
    $(`a.mir`).click(async function(e){
      let users = [];
      $('.macro-users:checked').each(function () {
          users.push(`${$(this).attr('name')}`);
      });
      for (let u of users){
        let dc = $("#roll-request-dc").val();
        let user = game.users.get(u);
        let a = user.character;
        console.log(u)
        let roll = '1d20';
        let flavor = $(this).attr('title');
        if (e.ctrlKey) 
            roll = '2d20kl';
        if (e.shiftKey)
            roll = '2d20klh';
        if (e.ctrlKey) 
            flavor += ' with disadvantage';
        if (e.shiftKey)
            flavor += ' with advantage';
        let bonus = '';
        let type = $(this).attr('data-type');
        console.log(type)
        switch (type) {
          case 'test':
            bonus += a.data.data.abilities[$(this).attr('data-key')].mod;
            break;
          case 'save':
            bonus += a.data.data.abilities[$(this).attr('data-key')].save;
            break;
          case 'skill':
            bonus += a.data.data.skills[$(this).attr('data-key')].total;
            break;
          default:
            return;
        }    
        let formula = roll + '+' + bonus;
        let content = `Roll ${flavor} [[${$('.mirm[title='+game.settings.get("core", "rollMode")+']').text()} ${formula} # ${flavor}]]`;
        if (dc)
          content += "<br>DC: " + dc;
        ChatMessage.create({
             speaker: ChatMessage.getSpeaker({actor:user.character}),
             //type: 4,
             content ,
             whisper: [u]
        });
      }
    });
    $('a.mirm').click(async function(e){
        $(`#built-roll`).attr('data-mode', $(this).attr('title'));
        $(`#built-roll`).attr('data-rm', $(this).text());
        game.settings.set("core", "rollMode", $(this).attr('title'));
        $("a.mirm").css('textShadow' , "unset");
        $(this).css('textShadow' , "0 0 8px red");
    });
  },
  close:   html => {
      return}
},{width: 330 , id:`request-roll-dialog` }
).render(true);