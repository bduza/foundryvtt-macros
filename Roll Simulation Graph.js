let formula = '3d6cs=6';
let n = 100000;
let results = await Roll.simulate(formula,n);
//console.log(results);
let dist = {};
for (let r of results) {
  if (dist[r]) dist[r]+=1; 
  else dist[r]=1;
}
//console.log(dist);
let data = {values:[]};
for (let [key, value] of Object.entries(dist)) {
  data["values"].push({X: key, Y: value/n*100});
}
let minX = data.values.map(v=>v.X).reduce((a,b)=>Math.min(a, b));
let maxX = data.values.map(v=>v.X).reduce((a,b)=>Math.max(a, b));
let maxY = Math.ceil(data.values.map(v=>v.Y).reduce((a,b)=>Math.max(a, b)));
console.log(data.values);

var graph;
var xPadding = 30;
var yPadding = 30;

// Return the x pixel for a graph point
function getXPixel(val) {
    return ((graph.width() - xPadding) / (data.values.length+1/(maxX-minX)))  * (val-minX) + (xPadding * 1.5);
}
// Return the y pixel for a graph point
function getYPixel(val) {
    return graph.height() - (((graph.height() - yPadding ) / (maxY + 1)) * val) - yPadding;
}
let content = `<br>
  <canvas id="graph" width="1000" height="700">   
  </canvas> `;
  
new Dialog({
   title: `/r ${formula}  n=${n}`,
   content:  content,
   buttons: {},
   render: ()=>{
     graph = $('#graph');
      var c = graph[0].getContext('2d');            
      
      c.lineWidth = 2;
      c.strokeStyle = '#fff';
      c.font = 'italic 8pt sans-serif';
      c.fillStyle = "#fff";
      c.textAlign = "center";
      
      // Draw the axises
      c.beginPath();
      c.moveTo(xPadding, 0);
      c.lineTo(xPadding, graph.height() - yPadding);
      c.lineTo(graph.width(), graph.height() - yPadding);
      c.stroke();
      
      // Draw the X value texts
      for(var i = minX; i <= maxX; i++) {
          
          c.fillText(i, getXPixel(i), graph.height() - yPadding + 20);
      }
      
      // Draw the Y value texts
      c.textAlign = "right"
      c.textBaseline = "middle";
      
      for(var i = 0; i <= maxY; i++) {
          c.fillText(i+'%', xPadding - 10, getYPixel(i));
      }
      
      c.strokeStyle = '#f00';
      
      // Draw the line graph
      c.beginPath();
      c.moveTo(getXPixel(minX), getYPixel(data.values.filter(v=>v.X==minX)[0].Y));
      for(var i of data.values.map(v=>v.X)) {
          c.lineTo(getXPixel(i), getYPixel(data.values.filter(v=>v.X==i)[0].Y));
      }
      c.stroke();
      
      // Draw the dots
      c.fillStyle = '#fff';
      
      for(var i of data.values.map(v=>v.X)) {  
          c.beginPath();
          c.arc(getXPixel(i), getYPixel(data.values.filter(v=>v.X===i)[0].Y), 4, 0, Math.PI * 2, true);
          c.fill();
      }
   },
   close:   html => {
       return}
     },{width:1030, height: 770, id: "graph-dialog"}
  ).render(true);