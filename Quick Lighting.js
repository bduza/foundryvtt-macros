let darkness = canvas.scene.data.darkness*100;
new Dialog({
  title:'Scene Lighting',
  content:`
    <form>
      <div class="form-group">
        100 &nbsp;
 <input type="range" min="0" max="100" value="${darkness}" class="slider" name="inputField">
        &nbsp;&nbsp;0
      </div>
    </form>`,
  buttons:{
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply Changes`
    }},
  default:'yes',
  close: html => {
    let result = html.find('input[name=\'inputField\']');
    if (result.val()!== '') {
        canvas.scene.update({ "darkness": (result.val()/100) },{ animateDarkness: false });
	  }
    }
}).render(true);