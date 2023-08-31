import { svgEl, curvedCornerPath } from "./svgUtil.js";
import { normalizeAngle180 } from "./vecMath.js";
         
export function render(streetsGeom, parent, options) {
  
  options.laneColors = Object.assign({
    car: "#dddddd",
    pedestrian: "#cccccc",
    cycle: "#f5c5c5",
    parking: "#eeeeff", 
  }, options.laneColors);
  
  options = Object.assign({
    
  }, options);
  
  renderLaneBoxes(streetsGeom, parent, options);
  renderIntersectionPolygons(streetsGeom, parent, options);
  renderLaneMarkings(streetsGeom, parent, options);
  renderCurbs(streetsGeom, parent, options);
  renderInvalidStreetBoxes(streetsGeom, parent, options);
  if (options.labels !== false) renderLanesLabels(streetsGeom, parent, options);      
}

function renderLaneBoxes(streetsGeom, parent, options) {
  for (let sGeom of streetsGeom) {
    //if (sGeom.invalid) continue;
        
    let lanesGroup = svgEl("g", {
      "class": "lanes",
      transform: `translate(${sGeom.start.join(",")}) rotate(${sGeom.angle}) translate(0,0)`,
    }, parent);
    for (let lGeom of sGeom.lanesGeom) {
      //if (isNaN(lGeom.length)) debugger;
      svgEl("rect", {
        x: 0,
        y: lGeom.offset,
        height: lGeom.width,
        width: lGeom.length,
        "class": "lane " + lGeom.lane.type,
        fill: options.laneColors[lGeom.lane.type],
        "stroke": options.outlines ? "rgba(0,0,0,0.2)" : options.laneColors[lGeom.lane.type],
        "stroke-width": options.outlines ? 0.5 : 0.5,
        //"stroke-dasharray": "2 4"
      }, lanesGroup);      
    }
    
  }
}
  
function renderIntersectionPolygons(streetsGeom, parent, options) {
  // keep track of renderer lanes - render only one poly per connected lanes
  let rendered = [];
  for (let sGeom of streetsGeom) {
    for (let lGeom of sGeom.lanesGeom) {
      if (lGeom.intersectionPoly && !rendered.includes(lGeom)) {
        svgEl("polygon", {
          points: lGeom.intersectionPoly.map(p => p.join(",")).join(" "),
          "class": "intersection " + lGeom.lane.type,
          fill: options.laneColors[lGeom.expanded?.lane.type || lGeom.lane.type],
          "stroke": options.outlines ? "rgba(0,0,0,0.2)" : options.laneColors[lGeom.expanded?.lane.type || lGeom.lane.type],
          "stroke-width": options.outlines ? 0.5 : 0.5,
          //"stroke-dasharray": "2 4"
        }, parent);   
      }
      if (lGeom.expandPoly) {
        svgEl("polygon", {
          points: lGeom.expandPoly.map(p => p.join(",")).join(" "),
          "class": "retraction " + lGeom.lane.type,
          fill: options.laneColors[lGeom.expanded.lane.type],
          "stroke": options.outlines ? "rgba(0,0,0,0.2)" : options.laneColors[lGeom.expanded.lane.type],
          "stroke-width": options.outlines ? 0.5 : 1,
          //"stroke-dasharray": "2 4"
        }, parent);   
      }
      lGeom.connectedLanes.forEach(l => rendered.push(l));
      //rendered.push(lGeom.intersectionPoly);
    }
    
  }
}
  
function renderCurbs(streetsGeom, parent, options) {
  let rendered = [];
  let curve = curvedCornerPath(8);
  for (let sGeom of streetsGeom) {
    for (let lGeom of sGeom.lanesGeom) {
      if (lGeom.lane.type == "pedestrian") {
        if (lGeom.laneRight) {
          let path = `M ${lGeom.startRight.join(",")}` ;
          
          if (lGeom.expandRight) {
            let exLane = lGeom.expandRight;
            path += `L ${exLane.expandPoly[0].join(",")}`;
            //path += `L ${exLane.expandPoly[3].join(",")}`;
            //path += `L ${exLane.expandPoly[2].join(",")}`;
            curve.start(exLane.expandPoly[0], exLane.expandPoly[3]);
            //path += curve.bend(exLane.expandPoly[2]);
            if (exLane.intersectionPoly) {
              //path += curve.bend(exLane.intersectionPoly[0]);
              path += curve.bend(exLane.intersectionPoly[5]);
              if (exLane.connectedLanes.length > 1) {
                path += curve.straight(exLane.intersectionPoly[0]);
              }
              else {
                path += curve.bend(exLane.intersectionPoly[2]);
                path += curve.straight(exLane.intersectionPoly[2]);
              }
              //path += `L ${exLane.intersectionPoly[0].join(",")}`;
              //path += `L ${exLane.intersectionPoly[5].join(",")}`;
              //path += `L ${exLane.intersectionPoly[4].join(",")}`;
            }
            else {
              path += `L ${exLane.expandPoly[1].join(",")}`;
            }
          }
          else {
            path += `L ${lGeom.endRight.join(",")}`;
            if (lGeom.intersectionPoly) {
              path += `L ${lGeom.intersectionPoly[5].join(",")}`;
            }
          }
          
          svgEl("path", {
            d: path,
            fill: "none",
            "stroke": "#333333",
            "stroke-width": 1,
          }, parent);
        }
        if (lGeom.laneLeft) {
          let path = `M ${lGeom.startLeft.join(",")}` ;
          
          if (lGeom.expandLeft) {
            let exLane = lGeom.expandLeft;
            path += `L ${exLane.expandPoly[3].join(",")}`;
            //path += `L ${exLane.expandPoly[0].join(",")}`;
            //path += `L ${exLane.expandPoly[1].join(",")}`;
            curve.start(exLane.expandPoly[3], exLane.expandPoly[0]);
            //path += curve.bend(exLane.expandPoly[1]);
            if (exLane.intersectionPoly) {
              //path += `L ${exLane.intersectionPoly[2].join(",")}`;
              //path += `L ${exLane.intersectionPoly[2].join(",")}`;
              //path += `L ${exLane.intersectionPoly[3].join(",")}`;
              path += curve.bend(exLane.intersectionPoly[2]);
              path += curve.bend(exLane.intersectionPoly[3]);
              path += curve.straight(exLane.intersectionPoly[3]);
            }
            else {
              path += `L ${exLane.expandPoly[1].join(",")}`;
            }
          }
          else {
            path += `L ${lGeom.endLeft.join(",")}`;
            if (lGeom.intersectionPoly) {
              path += `L ${lGeom.intersectionPoly[2].join(",")}`;
            }
          }
          
          svgEl("path", {
            d: path,
            fill: "none",
            "stroke": "#333333",
            "stroke-width": 1,
          }, parent);
        }
      }
      /*
      if (lGeom.expandPoly) {
        svgEl("polygon", {
          points: lGeom.expandPoly.map(p => p.join(",")).join(" "),
          "class": "retraction " + lGeom.lane.type,
          fill: "none",
          //"stroke": "#000000",
          "stroke-width": 0.5,
          "stroke-dasharray": "2 4"
        }, parent);   
      }
      */
      rendered.push(lGeom.intersectionPoly);
    }
    
  }
}
  
function renderLaneMarkings(streetsGeom, parent, options) {
  for (let sGeom of streetsGeom) {
    let lanesGroup = svgEl("g", {
      "class": "lanes",
      transform: `translate(${sGeom.start.join(",")}) rotate(${sGeom.angle}) translate(0,0)`, // ${-sGeom.width/2}
    }, parent);
    for (let lGeom of sGeom.lanesGeom) {
      if (lGeom.lane.type == "parking") {
        let laneGroup = svgEl("g", {
          "class": "lane " + lGeom.lane.type,
          transform: `translate(0,${lGeom.offset + lGeom.width/2})`,
        }, lanesGroup);
        
        let strokeWidth = 3;
        let pos = 0;
        let w = lGeom.width;
        
        let accessSide = lGeom.lane.accessSide || "left";
        if (!lGeom.lane.accessSide) {
          if (lGeom.laneLeft?.lane.type != "car") {
            if (lGeom.laneRight?.lane.type == "car") {
              accessSide = "right";
            }
            else {
              // no car lane to left or right
              accessSide = "none";
            }
          }            
        }
        let direction = lGeom.lane.direction || "forward";
        // step length of various parking orientations as a factor of width
        let baseStep = {parallel:2.2,diagonal:0.75,orthogonal:0.5}[lGeom.lane.orientation||"parallel"];
        baseStep *= lGeom.width;
        // adjust so that hashes fit exactly within available space
        // (distribute remainder)
        let lengthAdjust = (lGeom.lane.orientation == "diagonal") ? -1 : 1;
        let remainder = (lGeom.length-strokeWidth-lengthAdjust) % baseStep;
        let numSteps = Math.floor((lGeom.length-strokeWidth-lengthAdjust) / baseStep);
        let step = baseStep + remainder / numSteps;
        let stepCount = 0;
        while (pos < lGeom.length) {
          switch (lGeom.lane.orientation) {
            case "diagonal":
              if (stepCount > 0) {
                svgEl("line", {x1: pos-baseStep, y1: -w/2, x2: pos, y2: w/2, stroke: "#bbf", "stroke-width": strokeWidth}, laneGroup);
                if (accessSide != "none") {
                
                  let y = w/2-1; //-strokeWidth/2;
                  let dx = baseStep-strokeWidth/2;
                  if (accessSide == "left") {
                    y *= -1;
                    dx = 0;
                  }
                  svgEl("line", {x1: pos-baseStep-strokeWidth+dx, y1: y, x2: pos-baseStep+5+dx, y2: y, stroke: "#bbf", "stroke-width": strokeWidth}, laneGroup);
                }
              }
              break;
            case "orthogonal":
              svgEl("circle", {r: strokeWidth, cx: pos, cy: 0, fill: "#99f"}, laneGroup);
              break;
            default: //parallel
                svgEl("line", {x1: pos+strokeWidth/2, y1: -w/2, x2: pos+strokeWidth/2, y2: w/2, stroke: "#bbf", "stroke-width": strokeWidth}, laneGroup);
                if (accessSide != "none") {
                  let x1=4, x2=4;
                  if (stepCount == 0) x1=1.5;
                  if (stepCount == numSteps) x2=1.5;
                  let y = w/2-strokeWidth/2;
                  if (accessSide == "left") y *= -1;
                  svgEl("line", {x1: pos-x1+strokeWidth/2, y1: y, x2: pos+x2+strokeWidth/2, y2: y, stroke: "#bbf", "stroke-width": strokeWidth}, laneGroup);
                }                
          }
          
          pos += step;
          stepCount++;
        }
      }
    }
  }       
}
  
function renderInvalidStreetBoxes(streetsGeom, parent, options) {    
  for (let sGeom of streetsGeom) {
    //svgEl("circle", {r: 3, cx: sGeom.start[0], cy: sGeom.start[1], fill: "#f00"}, parent);
    //svgEl("circle", {r: 3, cx: sGeom.end[0], cy: sGeom.end[1], fill: "#f00"}, parent);
    svgEl("rect", {
      transform: `translate(${sGeom.start.join(",")}) rotate(${sGeom.angle})`,
      x: 0,
      y: -sGeom.width/2-0.5,
      height: sGeom.width + 1,
      width: sGeom.length,
      fill: "none",
      "stroke": sGeom.invalid ? "#ff0000" : "none",
      "stroke-width": sGeom.invalid ? 2 : 0.2,
      "stroke-dasharray": "8 3"
    }, parent);        
  }
}
  
function renderLanesLabels(streetsGeom, parent, options) {
  let fontSize = 10;
  for (let sGeom of streetsGeom) {
    let laneGroup = svgEl("g", {
      "class": "lanes",
      transform: `translate(${sGeom.start.join(",")}) rotate(${sGeom.angle})`, // ${-sGeom.width/2}
    }, parent);
    let flipped = Math.abs(normalizeAngle180(sGeom.angle)) <= 90;
    for (let lGeom of sGeom.lanesGeom) {
      let textEl = svgEl("text", {
        transform: `translate(0,${lGeom.offset + lGeom.width/2}) rotate(${flipped ? 0 : 180})`,
        fill: "#000",
        x: flipped ? 5 : -5,
        y: fontSize/2 - 2,
        "text-anchor": flipped ? "start" : "end",
        "font-size": fontSize
      }, laneGroup);
      textEl.innerHTML = lGeom.id;
    }
  }
}
