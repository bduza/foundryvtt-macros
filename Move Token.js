if (!args[0]||!args[1]) return;
token = args[0];
let target = args[1];
if (await game.macros.getName('Dialog Yes/No').execute(`Move ${target.name} away from ${token.name}?`))
  await canvas.tokens.moveMany({dx:target.data.x/canvas.grid.size-token.data.x/canvas.grid.size, dy:target.data.y/canvas.grid.size-token.data.y/canvas.grid.size, ids: [target.id]});