async function dialogYesNo(prompt) {
  if (!args[0]) return false;
  let response = await new Promise((resolve)=>{
      new Dialog({
       title: prompt,
       content:  '',
       buttons: {
         yes: { label : `Yes`, callback : () => { resolve(true); }},
         no:  { label : `No`,  callback : () => { resolve(false); }}
       },
       close:   html => { resolve(false); }
        },{ id: "yes-no-dialog"}
      ).render(true);
  });
  return response;
}
let prompt = '':
if (args[0]) prompt = args[0];
return await dialogYesNo(prompt);