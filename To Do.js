/*

add images folder for screenshots of macros

git download 
  put into folder
git update 
  move to folder if not in one

make these into a module...
let macros = [...]
for (let macro of macros)
  toFile(macro.data.name+'.js') ... macro.command.replace("game.macros.getName(`macroName`).execute", `scope.functionName`, `${scope}.${macro.data.name.replace(' ', '')}`)

taskbar module/macro
  check if pinned document exists when trying to pin it
  if clicked and document is gone, remove
  
5e Dialogs Module
  actor menu header link to open raw character dialog
  sidebar button for Chat Messages Dialog
  hook to load css at start if setting
  clicking token closes other actor menus and opens the selected token's (be sure to turn off click select token to avoid loops
  add delay to mouseleave on dialogs similar to start menu
  make a settings dialog to set mouseleave delay on user flag
    

*/
