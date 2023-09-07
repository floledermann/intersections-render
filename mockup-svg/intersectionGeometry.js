
import { vMult, vAdd, vSub, vLen, vUnit, 
         intersect, intersectDist, pointLineDist, tangentPoints, 
         normalizeAngle } from "./vecMath.js";
         
import { arrayMin, arrayMax } from "./util.js";

export default function(streetsGeom, options) {
  
  options = Object.assign({
    expand: {
      parking: {
        type: ["pedestrian","cycle","car"],
        length: 50
      }
    },
  }, options);

  for (let streetGeom of streetsGeom) {
    for (let laneGeom of streetGeom.lanesGeom) {
      // convert set to array
      laneGeom.connectedLanes = Array.from(laneGeom.connectedLanes);
      // disregard all "connected" lanes in the same street, 
      // including the current lane
      let connectedLanes = laneGeom.connectedLanes.filter(l => {
        return l.streetGeom != laneGeom.streetGeom;
      });
      if (connectedLanes.length == 0 || laneGeom.stoppedBy.length > 0) {
        // lane ends
        // find stop lane that actually stops the lane
        //laneGeom.connectedLanes = [];
        if (laneGeom.stoppedBy.length > 0) {
          let stopLanes = laneGeom.stoppedBy.map(otherLane => ({
            lane: otherLane,
            length: Math.min(
              intersectDist(laneGeom.startLeft, laneGeom.unit, otherLane.startLeft, otherLane.unit),
              intersectDist(laneGeom.startLeft, laneGeom.unit, otherLane.startRight, otherLane.unit),
              intersectDist(laneGeom.startRight, laneGeom.unit, otherLane.startLeft, otherLane.unit),
              intersectDist(laneGeom.startRight, laneGeom.unit, otherLane.startRight, otherLane.unit),
            )
          })).sort((a,b) => a.length - b.length);
          laneGeom.stopLane = stopLanes[0].lane;
          laneGeom.length = stopLanes[0].length;
        }
      }
      else {
        // lane connected
        laneGeom.length = arrayMin(connectedLanes.map(otherLane => {
          let rel = laneGeom.streetGeom.otherStreets.find(r => r.streetGeom == otherLane.streetGeom)?.rel;
          if (rel == "straight") {
            // if it is also connected to a non-straight lane both left and right,
            // ignore the straight intersection
            // (otherwise may intersect at a very shallow angle,
            //  degenerating the intersection point)
            // TODO: this should look only to the leftmost and rightmost connecting lanes
            //       (independent of "rel" classification)
            if (connectedLanes.some(l => laneGeom.streetGeom.otherStreets.find(r => r.streetGeom == l.streetGeom).rel == "left") &&
                connectedLanes.some(l => laneGeom.streetGeom.otherStreets.find(r => r.streetGeom == l.streetGeom).rel == "right")) {
              return Infinity;
            }
          }
          return Math.min(
            intersectDist(laneGeom.startRight, laneGeom.unit, otherLane.startLeft, otherLane.unit),
            intersectDist(laneGeom.startLeft, laneGeom.unit, otherLane.startRight, otherLane.unit),
          );
        }));
        //console.log(laneGeom.length);
      }
      laneGeom.endLeft = vAdd(laneGeom.startLeft, laneGeom.unit, laneGeom.length);
      laneGeom.endRight = vAdd(laneGeom.startRight, laneGeom.unit, laneGeom.length);
    }
  }
  
  function getNeighbourLanes(laneGeom, lanes, includeSameStreet) {
    lanes = lanes
              .filter(l => l != laneGeom && (includeSameStreet || l.streetGeom != laneGeom.streetGeom))
              .sort((a,b) => {
                return normalizeAngle(a.clockwiseOrder - laneGeom.clockwiseOrder) - normalizeAngle(b.clockwiseOrder - laneGeom.clockwiseOrder);
              });
    if (lanes.length < 1) return [null,null];
    return [lanes[0],lanes[lanes.length-1]];
  }
  
  // construct intersection polygons
  for (let streetGeom of streetsGeom) {
    for (let laneGeom of streetGeom.lanesGeom) {
      if (laneGeom.connectedLanes?.length > 1) {
        if (!laneGeom.intersectionPoly) {
          // sort lanes in clockwise direction relative to the current lane
          let connectedLanes = Array.from(laneGeom.connectedLanes)
              .sort((a,b) => {
                return normalizeAngle(a.clockwiseOrder - laneGeom.clockwiseOrder) - normalizeAngle(b.clockwiseOrder - laneGeom.clockwiseOrder);
              });
          let points = [];
          let lastLane = null;
          // TODO: use nextLane to figure out relationship to bend
          for (let [index, lGeom] of connectedLanes.entries()) {
            // add corner point
            if (lastLane) {
              if (lastLane.streetGeom != lGeom.streetGeom) {
                points.push(intersect(lastLane.endLeft, lastLane.unit, lGeom.endRight, lGeom.unit));
              }
              else {
                // in same street -> figure out connection based on the two lanes crossing it
                let [leftLane, rightLane] = getNeighbourLanes(lGeom, connectedLanes, false);
                if (leftLane != null) {
                  // figure out where bend is in relation to the lane (left, inside, right)
                  let bendPoint = intersect(leftLane.endRight, leftLane.unit, rightLane.endLeft, rightLane.unit);
                  let endCenter = vMult(vAdd(lGeom.endLeft, lGeom.endRight), 1/2);
                  let bendDist = pointLineDist(bendPoint, endCenter, lGeom.unit);
                  if (bendDist < lGeom.width/2) {
                    // bend inside -> intersect edge with neighbouring lane
                    points.push(intersect(lGeom.endRight, lGeom.unit, rightLane.endLeft, rightLane.unit));
                  }
                  else {
                    points.push(intersect(lastLane.endLeft, lastLane.unit, rightLane.endLeft, rightLane.unit));
                    points.push(bendPoint);
                    points.push(intersect(lGeom.endRight, lGeom.unit, leftLane.endRight, leftLane.unit));
                  }
                }
              }
            }
            points.push(lGeom.endRight);
            points.push(lGeom.endLeft);
            lastLane = lGeom;
          }
          // last corner point, connecting back to first lane
          if (lastLane.streetGeom != connectedLanes[0].streetGeom) {
            points.push(intersect(lastLane.endLeft, lastLane.unit, connectedLanes[0].endRight, connectedLanes[0].unit));
          }
          laneGeom.intersectionPoly = points;
          // intersection polygon should always have a well-defined topology of points
          // in relation to the lane -> store index of where intersection poly 
          // starts for each lane
          // TODO: calculate index and adapt curb rendering code in svgRenderer
          for (let [index, lGeom] of connectedLanes.entries()) {
            //lGeom.intersectionPoly = points;
            //lGeom.intersectionPolyIndex = index * 3;
          }          
        }
      }
      else {
       // no connected lanes -> needs stop polygon
        if (laneGeom.stopLane) {
        
          let points = [];
          // check which side is closer
          let leftDist = intersectDist(laneGeom.startLeft, laneGeom.unit, laneGeom.stopLane.startLeft, laneGeom.stopLane.unit);
          let rightDist = intersectDist(laneGeom.startLeft, laneGeom.unit, laneGeom.stopLane.startRight, laneGeom.stopLane.unit);
          let nearSide = (leftDist > rightDist) ? "Right" : "Left";
          
          // emulate points enumeration of proper intersection polygon
          points.push(laneGeom.endRight);
          points.push(laneGeom.endLeft);
          points.push(intersect(laneGeom.endLeft, laneGeom.unit, laneGeom.stopLane["end" + nearSide], laneGeom.stopLane.unit));
          //points.push(points[points.length-1]);
          points.push(intersect(laneGeom.endRight, laneGeom.unit, laneGeom.stopLane["end" + nearSide], laneGeom.stopLane.unit));
          points.push(points[points.length-1]);
          points.push(points[points.length-1]);
          //points.push(laneGeom.endRight);
          laneGeom.intersectionPoly = points;  
        }
      }
      
      // geometry of expansion polygons
      //laneGeom.retractedLength = laneGeom.length;
      if (laneGeom.retractedBy) {
        let retractLength = options.expand?.[laneGeom.lane.type]?.length;
        laneGeom.length = laneGeom.length - retractLength;
        laneGeom.expandPoly = [
          vAdd(laneGeom.startLeft, laneGeom.unit, laneGeom.length),
          laneGeom.endLeft,
          laneGeom.endRight,
          vAdd(laneGeom.startRight, laneGeom.unit, laneGeom.length),
        ];
      }
    }
  }
  
  return streetsGeom;

}