let d = new Dialog({
  title: 'Custom-CSS',
  content:  `<style>
${game.macros.getName('Custom CSS').data.command}
</style
  `,
  render: (app)=>{
    console.log(app);
    $("#Custom-CSS").hide();
  },
  buttons: {},
  close:   html => {return}
},
{ id: "Custom-CSS"});
d.render(true);
