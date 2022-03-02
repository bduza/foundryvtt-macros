function tokenDistance(token1, token2){
  if(!(token1 instanceof Token) || !(token2 instanceof Token)) return;

  let distance = canvas.grid.measureDistance(token1, token2);
  if(token1.elevation !== token2.data.elevation){
    let h_diff = token2.data.elevation > token1.data.elevation 
      ? token2.data.elevation - token1.data.elevation 
      : token1.data.elevation - token2.data.elevation;

    return Math.sqrt(Math.pow(h_diff,2) + Math.pow(distance,2));
  }else
    return distance;
}

if (canvas.tokens.controlled.length != 1) return ui.notifications.warn('Select just one token to target for!');
let content=`
<style>
/*
label:before {
content: '';
  width: 32px;
  height: 32px;
  position: absolute;
  z-index: 100;
}
:checked+label::before  {
content: '';
  width: 32px;
  height: 32px;
  border: 1px solid #ff6400;
}
*/
.userTargets:before {
content: '';
  width: 32px;
  height: 32px;
  position: absolute;
  z-index: 100;
}
:checked+.userTargetedLabel > img {
content: '';
  /*width: 36px;*/
  height: 36px;
  border: 1px solid #ff6400;
}
.userTargetedLabel > img:hover{
content: '';
  /*width: 36px;*/
  height: 36px;
  border: 1px solid #aa2400;
}
</style>
`;

let visibleTokens = canvas.tokens.placeables.filter(t => t.visible);
content += `<center><div id="targets" style="height: ${Math.ceil(visibleTokens.length/7)*40}px">`;
for (const x of visibleTokens){
        content += `<input type="checkbox" class="userTargets" id="target-${x.id}" name="${x.id}" style="display: none;"/>
        <label class="userTargetedLabel" for="target-${x.id}" title="${x.data.name}\n${Math.floor(tokenDistance(token, x))} ft"><img height="36" src="${x.data.img}" name="${x.id}"/></label>`;
    }
content += `</div></center>`;
let d = new Dialog({
  title: 'Declare Targets for ' + canvas.tokens.controlled[0].data.name,
  content:  content + '</div>',
  buttons: {
    chat: {   icon: '', 
              label: 'Declare Targets to Chat', 
              callback: async (html) => {
                  if (game.user.targets.size === 0) return ui.notifications.warn('No targets selected!');
                  let message = `<div>`;
                  let targetIds = Array.from(game.user.targets).map(t => t.id);
                  console.log(targetIds);
                  for (let t of game.user.targets) {
                      message += `<a ><img class="${t.id}-target-img" src="${t.data.img}" width="${24*t.data.height}" style="border:unset"></a>`;
                  }
                  message += `</div>`;
                  ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({user: game.user}),
                    flavor: `targets`,
                    content: message,
                    flags: {targetIds}
                  });
              }
          }
        
  },
    render: (content) => {
        $('.userTargets:checkbox').each(function () {
          if (Array.from(game.user.targets).map(t => t.id).includes(this.name)) this.checked = true;
        });
        $(".userTargets").click(async function(){
            let t = [];
            $('.userTargets:checkbox:checked').each(function () {
                t.push(`${this.name}`);
            });
            console.log(t);
            game.user.updateTokenTargets(t);
            let panTarget = canvas.tokens.get(this.name);
            canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
        });
        $(".userTargetedLabel > img").hover((e) => {
            let panTarget = canvas.tokens.get(e.originalEvent.srcElement.attributes.getNamedItem('name').nodeValue);
            canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
        },() => {canvas.animatePan({x: token.data.x, y: token.data.y});});
    
    },
  close:   html => {
      return}
},{ 'width':'300' , height:  Math.ceil(visibleTokens.length/7)*40+50+30 , id:"targetting-dialog" });
d.render(true);