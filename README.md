# foundryvtt-macros

<p>Some of these are 5e specific, especially the Character Dialog, Chat Messages Dialog, Health Vitaliy Change, and Vitality Change.</p>
<p>Those macros are designed for streamlining play using inline rolls and 'fake' inline roll styled buttons instead of automation.</p>
<p>I found that I disliked the constant treadmell of keeping up with automating the dnd5e system. </p>
<p>These macros aim to simplify play by keeping the system as much of a dice game as it can be while still using Foundry's powerful UI.</p>

<p><b>Requires Advanced Macros and Dfreds Convenient Effects</b></p>


# To Do
Actor Menu
  header button for Actor Menu to toggle horizontal and vertical layout and set user flag for preference

add images folder for screenshots of macros

git download 
  put into folder
git update 
  move to folder if not in one

make these into a module...
let macros = [...]
for (let macro of macros)
  toFile(macro.data.name+'.js') ... macro.command.replace("game.macros.getName(`macroName`).execute", `scope.functionName`, `${scope}.${macro.data.name.replace(' ', '')}`)
