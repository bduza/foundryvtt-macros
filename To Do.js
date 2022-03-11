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

taskbar macro or just make a module
  set add remove hooks at start, call them for each window on init (resolves code duplication problem
  Shift Click a window to pin. 
    get document data-uuid and save to attribute
    if data-uuid attribute exists on creation, update that element id with the appId
    then apply events
    add pinned class: adds pin?
    set user flag of current pins, just getting elements that have a data-uuid and adding them to an array of uuids
    when taskbar loads, create elements NOT with addWindowToTaskbar, but a simple loop. Window information will be added if necessary
      Do I need to check for a pinned window with that document uuid in addWindowToTaskbar? Probably
  taskbar color based on pause state?
  

*/
