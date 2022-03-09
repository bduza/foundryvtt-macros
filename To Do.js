/*

add images folder for screenshots of macros

Actor Menu
  header button for Actor Menu to toggle horizontal and vertical layout and set user flag for preference



git download 
  put into folder
git update 
  move to folder if not in one

make these into a module...
let macros = [...]
for (let macro of macros)
  toFile(macro.data.name+'.js') ... macro.command.replace("game.macros.getName(`macroName`).execute", `scope.functionName`, `${scope}.${macro.data.name.replace(' ', '')}`)

taskbar macro or just make a module
  get hbs template file for app from github?
  hide player and macro bar elements by id in style
  re-populate open windows by hooking all application type renders?
  start menu : populated from macro hotbar.
  users in the notification area
  copy calendar tool code from control bar
  taskbar color based on pause state?
*/
