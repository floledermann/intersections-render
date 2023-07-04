
import { vMult, vAdd, vSub, vLen, vUnit, 
         degRad, radDeg, normalizeAngle } from "./vecMath.js";

import { arr, valOrFunc } from "./util.js";

/*
This computes the topology for an intersection specified by street lanes.
TODO: clean up options, remove geometry aspects as far as not needed for topology
*/
         
export default function(streets, options) {
  
  options = Object.assign({
    laneDefaults: {},
    lanePriorities: [
      "rail",
      "car",
      "cycle",
      "pedestrian",
      "car-access",
      "green",
      "parking",
      // what to do with bus and tram?
    ],
    expand: {
      parking: {
        type: ["pedestrian","cycle","car"],
        length: 50
      }
    },
    crossing: {
      pedestrian: ["straight", "left", "right"] // this should be default
    },
    style: {
      defaultWidth: l => l.width,
    }
  }, options);

  const INVALID_CUTOFF_ANGLE = 30;
  const STRAIGHT_ANGLE = 45;

  let streetsGeom = [];
  let streetCounter = 1;
  
  for (let street of streets) {
    let geom = {
      id: "street" + streetCounter,
      index: streetCounter-1,
      angle: normalizeAngle(street.angle),
      end: [0,0],
      length: street.length || 280,
      lanesGeom: [],
      street: street,
      invalid: false,
    };
    geom.start = [
      -geom.length * Math.cos(degRad(geom.angle)),
      -geom.length * Math.sin(degRad(geom.angle))
    ];
    geom.vector = vSub(geom.end, geom.start);
    geom.unit = vMult(geom.vector, 1/geom.length);
    geom.normal = [geom.unit[1], -geom.unit[0]];
    
    streetsGeom.push(geom);
    streetCounter++;
  }
  
  // first pass:
  //   - relative street angles
  //   - angle classification (left, stright, right, invalid)
  //   - lane y' position

  for (let geom of streetsGeom) {
    let street = geom.street;
    // figure out relationship of other streets
    // order by angle, check if left, straight continuation or right
    let otherStreets = [];
    let index = 0;
    for (let s of streets) {
      if (s == street) {
        index++;
        continue;
      }
      let relAngle = normalizeAngle(s.angle - street.angle);
      let rel = (relAngle <= INVALID_CUTOFF_ANGLE || relAngle >= 360 - INVALID_CUTOFF_ANGLE) ? "invalid" :
                (relAngle >= STRAIGHT_ANGLE && relAngle <= 180 - STRAIGHT_ANGLE) ? "left" :
                (relAngle >= 180 - STRAIGHT_ANGLE && relAngle <= 180 + STRAIGHT_ANGLE) ? "straight" :
                "right";
      if (rel == "invalid") {
        console.warn("Invalid crossing angle: " + relAngle + "°");
        geom.invalid = true;
      }

      otherStreets.push({
        rel,
        relAngle,
        streetGeom: streetsGeom[index]
      });
      index++;
    }
    otherStreets.filter(a => a.rel != "invalid")
    otherStreets.sort((a,b) => a.relAngle-b.relAngle);

    geom.otherStreets = otherStreets;
    
    let streetWidth = 0;
    let laneCounter = 1;

    for (let lane of street.lanes) {
      // store basic lane geometry
      let laneDef = Object.assign({}, options.laneDefaults[lane.type], lane);
      let laneWidth = valOrFunc(options.style.widths?.[lane.type], lane) || valOrFunc(options.style.defaultWidth, lane) || 20;
      
      geom.lanesGeom.push({
        id: geom.id + "-lane" + laneCounter,
        index: laneCounter-1,
        streetIndex: geom.index,
        width: laneWidth,
        offset: streetWidth,
        unit: geom.unit,
        normal: geom.normal,
        lane: lane,
        streetGeom: geom,
        connectedLanes: new Set(),
        stoppedBy: [],
        priority: options.lanePriorities.indexOf(lane.type)
      });
      
      streetWidth += laneWidth;
      laneCounter++;
    }
    
    geom.width = streetWidth;
    
    let lastLane = null;
    for (let laneGeom of geom.lanesGeom) {
      // start left, check clockwise with other streets
      laneGeom.offset -= streetWidth/2;
      Object.assign(laneGeom, {
        startLeft: vAdd(geom.start, geom.normal, -laneGeom.offset),
        startRight: vAdd(geom.start, geom.normal, -laneGeom.offset-laneGeom.width),
        //endRight: vAdd(geom.end, geom.normal, -laneGeom.offset),
        //endLeft: vAdd(geom.end, geom.normal, -laneGeom.offset-laneGeom.width),
        // we can use this to sort all lanes going around the crossing
        // use lane position as fractional part added to street angle
        clockwiseOrder: geom.angle + (1-(laneGeom.offset/streetWidth)),
        laneLeft: lastLane,
        laneRight: null
      });
      if (lastLane) {
        lastLane.laneRight = laneGeom;
      }
      lastLane = laneGeom;
    }
    
    // wire expansion areas
    for (let laneGeom of geom.lanesGeom) {
      let expandConfig = options.expand?.[laneGeom.lane.type];
      if (!expandConfig) continue;
      for (let type of arr(expandConfig.type)) {
        if (laneGeom.laneLeft?.lane.type == type && !laneGeom.laneLeft.expandRight) {
          laneGeom.laneLeft.expandRight = laneGeom;
          laneGeom.expandedLeft = laneGeom.laneLeft;
        }
        if (laneGeom.laneRight?.lane.type == type && !laneGeom.laneRight.expandLeft) {
          laneGeom.laneRight.expandLeft = laneGeom;
          laneGeom.expandedRight = laneGeom.laneRight;
        }
        laneGeom.expanded = laneGeom.expandedRight || laneGeom.expandedLeft;
        if (laneGeom.expanded) break;
      }
    }
  }
  
  // second pass:
  streetsGeom = calculateLaneTopology(streetsGeom, options);
  
  return streetsGeom;
  
}

function calculateLaneTopology(streetsGeom, options) {

  // establish lanes connectivity, and which lane stops it
 
  // assumption: each lane has only one continuation in each other street

  // connect lanes in decreasing order of priority
  // go clockwise and counter-clockwise around all lanes, 
  // and connect lanes not separated by higher priority lane
  
  streetsGeom.sort((a,b) => a.angle-b.angle);

  // add first street again at last position to ensure 
  // comparison across all corners
  let streetsGeomWrap = Array.from(streetsGeom);
  streetsGeomWrap.push(streetsGeom[0]);
  // clockwise and counter-clockwise order
  let streetsGeomOrder = [streetsGeomWrap, Array.from(streetsGeomWrap).reverse()];
  
  for (let laneType of options.lanePriorities) {
    let targetPriority = options.lanePriorities.indexOf(laneType);
    let reverse = true;
    for (let order of streetsGeomOrder) {
      // last lane of current type processed
      let lastLane = null;
      // lanes that need to be passed before connecting to other lanes
      let lanesToPass = new Set();
      // higher-priority lanes that potentially separate the lane from connecting
      // TODO: is this the same as lanesToPass? - I can't remember, test this ;)
      let separatingLanes = new Set();
      // lanes in parallel to the current one 
      // that "shield" the lane from being stopped
      let shieldingLanes = []; 
      let connectedLanes = null;
      let laneStack = []; // a stack of lanes to pass
      for (let streetGeom of order) {
        let lanesGeom = streetGeom.lanesGeom;
        if (reverse) lanesGeom = Array.from(lanesGeom).reverse();
        for (let laneGeom of lanesGeom) {
//if (laneGeom.id == "street2-lane5" && laneGeom.priority == targetPriority && !reverse) debugger;

          // higher-priority lane -> set up passing and shielding
          if (laneGeom.priority < targetPriority) {
            if (lastLane && lanesToPass.size == 0 && (lastLane.streetGeom != laneGeom.streetGeom)) { 
              // TODO: fix case when going around 0° (needs one more iteration "around")
              //let index = reverse ? 0 : 1;
              //if ((reverse && lastLane.stoppedBy.length == 0) ||
              //    (!reverse && lastLane.stoppedBy.length == 1)) {
              
                // for now, just use the first lane we encounter
                // in a crossing street as the stopping lane, 
                // in each direction
                // first higher-priority lane -> set stoppedBy
                
                // only if the other lane is not stopped by one of our shielding lanes
                if (!laneGeom.stoppedBy.some(l => shieldingLanes.includes(l))) {
                  lastLane.stoppedBy.push(laneGeom);
                }
              //}
            }
            // higher-priority lanes in parallel might shield the lane from being stopped
            if (lastLane && lastLane.streetGeom == laneGeom.streetGeom) {
              shieldingLanes.push(laneGeom);
            }
            // shielding lanes stopped by current lane? -> remove
            shieldingLanes = shieldingLanes.filter(sl => {
              sl.stoppedBy.includes(laneGeom);
            })
            // higher-priority lane -> must be passed first
            if (lanesToPass.has(laneGeom)) {
              // already in lanesToPass -> remove
              lanesToPass.delete(laneGeom);                
            }
            else {
              // not in lanesToPass -> add this and all connected lanes
              // to lanesToPass
              laneGeom.connectedLanes.forEach(l => {
                lanesToPass.add(l);
              });
              /*
              laneGeom.stoppedBy.forEach(l => {
                lanesToPass.add(l);
              });
              */
              // immediately remove the current lane (we have passed it)
              lanesToPass.delete(laneGeom);
            }
            if (separatingLanes.has(laneGeom)) {
              separatingLanes.delete(laneGeom);
              if (separatingLanes.size == 0) {
                ({lastLane, lanesToPass, separatingLanes} = laneStack.pop());
              }
            }
          }
          // same or lower priority lane
          else {
            // same priority
            if (laneGeom.lane.type == laneType) {
              if (lanesToPass.size > 0) {
                // still lanes to clear, so push on stack and start new connected lanes
                laneStack.push({lastLane, lanesToPass, separatingLanes});
                separatingLanes = new Set(lanesToPass);
                lanesToPass = new Set();
                lastLane = null;
                connectedLanes = null;
              }
              // if connected lanes have already been found on reverse pass
              // add to those
              if (!connectedLanes) {
                connectedLanes = lastLane?.connectedLanes || laneGeom.connectedLanes;
              }
              if (!connectedLanes.has(laneGeom)) {
                connectedLanes.add(laneGeom);
              }
              laneGeom.connectedLanes = connectedLanes;
              shieldingLanes = [];
              lastLane = laneGeom;
            }
          }
        }
      }
      reverse = false;
    }
  }
  
  return streetsGeom;


}

