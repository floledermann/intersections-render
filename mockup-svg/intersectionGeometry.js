
import { vMult, vAdd, vSub, vLen, vUnit, 
         intersect, intersectDist, tangentPoints, 
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
  
  // find intersection polygons
  for (let streetGeom of streetsGeom) {
    for (let laneGeom of streetGeom.lanesGeom) {
      if (laneGeom.connectedLanes?.length > 1) {
        if (!laneGeom.intersectionPoly) {
          // sort lanes in clockwise direction relative to the current lane
          let connectedLanes = Array.from(laneGeom.connectedLanes).sort((a,b) => {
            return normalizeAngle(a.clockwiseOrder - laneGeom.clockwiseOrder) - normalizeAngle(b.clockwiseOrder - laneGeom.clockwiseOrder);
          });
          let points = [];
          let lastLane = null;
          for (let lGeom of connectedLanes) {
            // add corner point
            if (lastLane && lastLane.streetGeom != lGeom.streetGeom) {
              points.push(intersect(lastLane.endLeft, lastLane.unit, lGeom.endRight, lGeom.unit));
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
          // intersection polygon should always have the same topology of points
          // in relation to the lane -> compute for every lane
          for (let lGeom of connectedLanes) {
            //lGeom.intersectionPoly = points;
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
      if (laneGeom.expanded) {
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