function doOverlap( l1, r1 ,  l2 ,  r2 ) {
    if (l1.x == r1.x || l1.y == r1.y || l2.x == r2.x || l2.y == r2.y) {
        return false;
    }
    if (l1.x >= r2.x || l2.x >= r1.x) {
        return false;
    }
    if (r1.y <= l2.y || r2.y <= l1.y) {
        return false;
    }
    return true;
}
if (canvas.tokens.controlled.length !== 1) return 
let c = canvas.tokens.controlled[0];
let l1 = { x: c.x ,  y: c.y };
let r1 = { x: c.x + c.width, y: c.y + c.height };
let overlapping = [];
for (let t of canvas.tokens.placeables) {
    let l2 = { x: t.x , y: t.y };
    let r2 = { x: t.x + t.width , y: t.y + t.height };
    if (doOverlap( l1,  r1,  l2,  r2))
        overlapping.push(t);
}
console.log(overlapping);
let content = `<ul id="sortable" style="width:100%;  list-style-type: none; padding:0;">`;

for (const x of overlapping){
    content += `<li id="${x.id}" style="font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <a id="actor-open-${x.id}" name="${x.id}" >
            <img src="${x.data.img}" height="20" style="vertical-align:middle;"/><span style="font-size: 20px; "> ${x.data.name}</span></a></li>`;
}
content += `</ul>`;
let d = new Dialog({
  title: 'Overlapping Tokens',
  content:  content,
  buttons: {},
  render: (content) => {
        $("#sortable > li").click(async function() {
            $(this).insertBefore($(this).prev()); 
            console.log($(this).index());
            let updates = [];
            $( "#sortable > li" ).each(function( index ) {
                updates.push( {_id: $( this ).attr('id'), 'flags.token-z.zIndex': $( "#sortable > li" ).length - index});
            });
            console.log(updates);
            canvas.scene.updateEmbeddedDocuments('Token', updates);
        });
        $("#sortable > li").contextmenu(async function() {
            $(this).insertAfter($(this).next()); 
            let updates = [];
            $( "#sortable > li" ).each(function( index ) {
                updates.push( {_id: $( this ).attr('id'), 'flags.token-z.zIndex': $( "#sortable > li" ).length - index});
            });
            console.log(updates);
            canvas.scene.updateEmbeddedDocuments('Token', updates);
        });
    },
  close:   html => {
      return}
},{  width: 300 ,   id:"overlapping-tokens-dialog" }
).render(true);