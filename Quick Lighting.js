let darkness = canvas.scene.data.darkness*100;
let darknessColor =canvas.scene.data.flags['perfect-vision'].darknessColor || "#ffffff";
let daylightColor =canvas.scene.data.flags['perfect-vision'].daylightColor || "#000000";
new Dialog({
  title:'Scene Lighting',
  content:`
    <form style="margin-top:-.5em;">
      <div class="form-group">
        <input class="daylightColor" type="color" value="${daylightColor}" data-edit="tint" style="border:unset;"> 
        &ensp; 100 &nbsp; <input type="range" min="0" max="100" value="${darkness}" class="darknessSlider" name="inputField">&nbsp;&nbsp;0 &nbsp;
        <input class="darknessColor" type="color" value="${darknessColor}" data-edit="tint" style="border:unset;"><br>
      </div>
      </form>
    `,
  buttons: {},
  render: (html) => {
    html.find('.daylightColor, .darknessColor, .darknessSlider').change(async function(){
      let darkness = html.find(`input.darknessSlider`).val()/100;
      let darknessColor = html.find('input.darknessColor').val();
      let daylightColor = html.find('input.daylightColor').val();
      canvas.scene.update({ darkness , 
      "flags.perfect-vision.darknessColor":darknessColor,
      "flags.perfect-vision.daylightColor":daylightColor 
      },{ animateDarkness: false });
    });
  },
  close: (html) => {return}
}).render(true);