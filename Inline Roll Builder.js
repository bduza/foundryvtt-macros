let update = await game.macros.getName("Update Macro From Git").execute(this.name);
if (update.match) return this.execute();

if (!actor) actor = game.user.character;
//if (!actor) actor = _token?.actor;
//if (!actor) ui.notifications.warn('No Token!');


let content  = `<style>
  .mir {
    background: #DDD;
    padding: 1px 4px;
    border: 1px solid #4b4a44;
    border-radius: 2px;
    white-space: nowrap;
    word-break: break-all;
  }
</style>`;//<a id="built-roll-save">  Save<a>
content += `<table><tr><th style="height:2em">
<a id="built-roll" class="inline-roll roll" data-mode="roll" data-flavor="" data-formula=""><i class="fas fa-dice-d20"></i></a><br><input id="built-roll-flavor" style=" text-align: center; font-weight:bold;" placeholder="Flavor"></input>
  </th></tr>
  <tr><th>
    <a id="ib-dc" class="mir">dc</a>
    <a id="ib-d3" class="mir">df</a>
    <a id="ib-d2" class="mir">d2</a>
    <a id="ib-d4" class="mir">d4</a>
    <a id="ib-d6" class="mir">d6</a>
    <a id="ib-d8" class="mir">d8</a>
    <a id="ib-d10" class="mir">d10</a>
    <a id="ib-d12" class="mir">d12</a>
    <a id="ib-d20" class="mir">d20</a>
    <a id="ib-d100" class="mir">d100</a>
    <a id="ib-1" class="mir">#</a>
  </th></tr>
  
  `;
  if (actor)
    content += `<tr><th>
    <a id="ib-prof" class="mir">${actor.data.data.attributes.prof}[prof]</a>
    <a id="ib-str" class="mir">${actor.data.data.abilities.str.mod}[str]</a>
    <a id="ib-dex" class="mir">${actor.data.data.abilities.dex.mod}[dex]</a>
    <a id="ib-con" class="mir">${actor.data.data.abilities.con.mod}[con]</a>
    <a id="ib-int" class="mir">${actor.data.data.abilities.int.mod}[int]</a>
    <a id="ib-wis" class="mir">${actor.data.data.abilities.wis.mod}[wis]</a>
    <a id="ib-cha" class="mir">${actor.data.data.abilities.cha.mod}[cha]</a>
    
  </th></tr>`;
  content += `</table>`;
  let rollModeButtons = `

<div style="display: grid; grid-template-columns: 2fr repeat(7, 1fr) 2fr;">
    <i></i>
    <a title="publicroll" class="mirm publicroll">/pr</a>
    <i></i>
    <a title="gmroll" class="mirm gmroll">/gmr</a>
    <i></i>
    <a title="blindroll" class="mirm blindroll">/br</a>
    <i></i>
    <a title="selfroll" class="mirm selfroll">/sr</a>
    <i></i>
</div>`;
let d = new Dialog({
  title: `Inline Roll Builder ` + (actor?`[${actor.data.name}]`:''),
  content:  content + rollModeButtons,
  buttons: {},
  render: (content) => {
    
    $("input#built-roll-flavor").keyup(function(){
        $("#built-roll").attr('data-flavor',$(this).val())
    }); 
    $("#built-roll-save").click(async function(e){
      console.log(`/r ${$("#built-roll").attr('data-formula')} # ${$("#built-roll").attr('data-flavor')}`)
      $("textarea#chat-message").text(`/r ${$("#built-roll").attr('data-formula')} # ${$("#built-roll").attr('data-flavor')}`);
    });
    $('a.mirm').click(async function(e){
        $(`#built-roll`).attr('data-mode', $(this).attr('title'));
        //ChatLog._setRollMode($(this).attr('title'));
        game.settings.set("core", "rollMode", $(this).attr('title'));
        $("a.mirm").css('textShadow' , "unset");
        $(this).css('textShadow' , "0 0 8px red");
    });
    $(`a[id^=ib-]`).click(async function(e){
        let targetElement = $("#built-roll");
        let toAdd = $(this).text();
        let add = true;
        let remove = [];
        let rollArray = Roll.parse(targetElement.attr('data-formula'));
        //console.log(rollArray);
        if (rollArray.length > 0) {
          for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'Die') {
                //console.log('die detected', toAdd.replace('d',''))
                  if (rollArray[i].faces === parseInt(toAdd.replace('d',''))) {
                    //console.log('like die detected')
                    //console.log('i-1',rollArray[i-1]);
                    if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                      if (rollArray[i-1].operator === '-')
                        rollArray[i].number--;
                      else
                        rollArray[i].number++;
                    else
                      rollArray[i].number++;
                    if (rollArray[i].number === 0)
                      remove.push(i);
                    add = false;
                    break;
                  }
              }
          //}
          //for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'NumericTerm' && rollArray[i].options.flavor === undefined && !toAdd.includes('[') && !toAdd.includes('d')) {
                if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                  if (rollArray[i-1].operator === '-')
                    rollArray[i].number--;
                  else
                    rollArray[i].number++;
                else
                  rollArray[i].number++;
                if (rollArray[i].number === 0)
                  remove.push(i);
                add = false;
                //break;
              }
              
              if (rollArray[i].constructor?.name === 'NumericTerm' && toAdd.includes('[')) {
                if (rollArray[i].flavor === Roll.parse(toAdd)[0].flavor || rollArray[i].flavor === Roll.parse(toAdd)[1]?.flavor)
                  add = false;
                //break;
              }
          }
        }
        else
          rollArray = [];
        
        //console.log('remove', remove);
        for (let i of remove) {
          //console.log('removing', rollArray[i]);
          rollArray.splice(i, 1);
          if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
            rollArray.splice(i-1, 1);
        }
          
        if (add) {//&& !targetElement.attr('data-formula').includes('[')
          if (toAdd.includes('[') )
            toAdd = ' + '+toAdd;
          if (toAdd === '#')
            toAdd = ' + 1';
          if (toAdd.includes('d') && !toAdd.includes('['))
            toAdd = ' + 1'+toAdd;
        }
        console.log(rollArray, toAdd);
        if (add)
          rollArray = rollArray.concat(Roll.parse(toAdd))
        if (rollArray[0]?.constructor.name === 'OperatorTerm' && rollArray[0].operator === "+")
          rollArray.shift();
          
          
        //console.log(rollArray);
        let formula = '';
        if (rollArray.length > 0)
          formula = Roll.fromTerms(rollArray).formula;
        //console.log(formula);
        targetElement.attr('data-formula', formula);
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
    });
    
    //-------------------------------------------------------------------------------------------
    
    $(`a[id^=ib-]`).contextmenu(async function(e){
        let targetElement = $("#built-roll");
        let toAdd = $(this).text();
        let add = true;
        let remove = [];
        let rollArray = Roll.parse(targetElement.attr('data-formula'));
        //console.log(rollArray);
        if (rollArray.length > 0) {
          for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'Die') {
                //console.log('die detected', toAdd.replace('d',''))
                  if (rollArray[i].faces === parseInt(toAdd.replace('d',''))) {
                    //console.log('like die detected')
                    //console.log('i-1',rollArray[i-1]);
                    if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                      if (rollArray[i-1].operator === '-')
                        rollArray[i].number++;
                      else
                        rollArray[i].number--;
                    else
                      rollArray[i].number--;
                    if (rollArray[i].number === 0)
                      remove.push(i);
                    add = false;
                    //break;
                  }
              }
          //}
          //for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'NumericTerm' && rollArray[i].options.flavor === undefined && !toAdd.includes('[') && !toAdd.includes('d')) {
                //console.log('i-1',rollArray[i-1]);
                if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                  if (rollArray[i-1].operator === '-')
                    rollArray[i].number++;
                  else
                    rollArray[i].number--;
                else
                  rollArray[i].number--;
                if (rollArray[i].number === 0)
                  remove.push(i);
                add = false;
                //break;
              }
              if (rollArray[i].constructor?.name === 'NumericTerm' && toAdd.includes('[')) {
                if (rollArray[i].flavor !== "" && (rollArray[i].flavor === Roll.parse(toAdd)[0].flavor || rollArray[i].flavor === Roll.parse(toAdd)[1]?.flavor)) {
                  add = false;
                  remove.push(i);
                  if (rollArray[i-1]?.constructor?.name === 'OperatorTerm' && rollArray[i-1].operator === '-')
                    remove.push(i-1);
                }
                //break;
              }
          }
        }
        else
          rollArray = [];
          
        if (toAdd.includes('['))
          add = false;
        console.log('remove', remove);
        for (let i of remove) {
          console.log('removing', rollArray[i]);
          rollArray.splice(i, 1);
          if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
            rollArray.splice(i-1, 1);
        }
        
        if (add) {
          if (toAdd.includes('['))
            toAdd = ' - '+toAdd;
          if (toAdd === '#')
            toAdd = ' - 1';
          if (toAdd.includes('d') && !toAdd.includes('['))
            toAdd = ' - 1'+toAdd;
        }
        console.log(rollArray, toAdd);
        if (add)
          rollArray = rollArray.concat(Roll.parse(toAdd))
        if (rollArray[0]?.constructor.name === 'OperatorTerm' && rollArray[0].operator === "+")
          rollArray.shift();
        if (rollArray[rollArray.length-1]?.constructor.name === 'OperatorTerm' )
          rollArray.pop();
          
          
        //console.log(rollArray);
        let formula = '';
        if (rollArray.length > 0)
          formula = Roll.fromTerms(rollArray).formula;
        //console.log(formula);
        targetElement.attr('data-formula', formula);
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
    });
    $(`#built-roll`).contextmenu(async function(e){
        if (e.ctrlKey)
          console.log(Roll.parse($(this).attr('data-formula')));
        else {
          $(this).attr('data-formula', '');
          $(this).html(`<i class="fas fa-dice-d20"></i>`);
        }
    });
    let currentrollmode = game.settings.get("core", "rollMode");
    console.log(currentrollmode)
    $(`.${currentrollmode}`).click();
  },
  close:   html => {
    return}
},{ width: 400,  id:`inline-roll-dialog`, }).render(true);