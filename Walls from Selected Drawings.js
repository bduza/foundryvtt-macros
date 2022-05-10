/**
 * @author cole#9640
 * @version 2
 * Converts all selected rectangular and polygonal drawings to walls.
 */
let drawings = canvas.drawings.controlled.filter(d=>!d.data.hidden);

drawings = drawings.map(drawing => {
    switch (drawing.data.type) {
        case "f":
        case "p": {
            let { id, points, rotation, x, y, width, height } = drawing.data;
            return { id, valid: true, points, rotation, x, y, width, height };
        }
        case "r": {
            let { id, rotation, x, y, width, height } = drawing.data;
            const points = [
                [0, 0],
                [width, 0],
                [width, height],
                [0, height],
                [0, 0],
            ];
            return { id, valid: true, points, rotation, x, y, width, height };
        }
        case "e": {
            let { id, rotation, x, y, width, height } = drawing.data;
            let size = (drawing.data.height>drawing.data.width?drawing.data.height:drawing.data.width)/canvas.grid.size*60;
            let segmentCount = Math.max(Math.ceil(Math.sqrt(size/2)), 4);
            let step = 2*Math.PI/segmentCount;  // see note 1
            let h = drawing.center.x-x;
            let k = drawing.center.y-y;
            let r = drawing.data.width/2;
            let t = drawing.data.height/drawing.data.width;
            let points = [];
            let segment = [];
            let start = [];
            for(let theta=0;  theta < 2*Math.PI;  theta+=step) { 
              let x = h +     r*Math.cos(theta);
              let y = k - t * r*Math.sin(theta); 
              
              
              if (theta==0) 
                start = [Math.round(x), Math.round(y)]
              
              points.push([Math.round(x),Math.round(y)])
              
              if (segment.length > 2)
               points.push(segment.map(p=>p))
            }
            points.push(start)
            return { id, valid: true, points, rotation, x, y, width, height };
          }
        default:
            return { id: drawing.data._id, valid: false }; 
    }
}).filter(drawing => {
    if (!drawing.valid) {
        ui.notifications.warn(`Drawing "${drawing.id}" is not a valid drawing type`);
        return false;
    }
    return true;
});

if (drawings.length) {
    const newWalls = drawings.flatMap((drawing) => {
        const { x, y, width, height } = drawing;
        const xCenterOffset = width/2;
        const yCenterOffset = height/2;
        
        const θ = Math.toRadians(drawing.rotation);
        const cosθ = Math.cos(θ);
        const sinθ = Math.sin(θ);
        
        const points = drawing.points.map((point) => {
            const offsetX = point[0] - xCenterOffset;
            const offsetY = point[1] - yCenterOffset;
            const rotatedX = (offsetX * cosθ - offsetY * sinθ);
            const rotatedY = (offsetY * cosθ + offsetX * sinθ);
            return [rotatedX + x + xCenterOffset, rotatedY + y + yCenterOffset];
        });
        
        return points
            .slice(0, points.length - 1)
            .map((point, i) => ({ c: point.concat(points[i + 1]) }));
    });
    
    canvas.scene.createEmbeddedDocuments("Wall", newWalls);
    canvas.walls.activate();
} else {
    ui.notifications.error("No polygon drawings selected!");
}