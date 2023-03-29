import { vMult, vAdd, vSub, vLen, vUnit, 
         intersect, intersectDist } from "./vecMath.js";


const svgNS = "http://www.w3.org/2000/svg";
  
export function svgEl(tagName, attributes, parent) {
  let el = document.createElementNS(svgNS, tagName);
  for (let [n,v] of Object.entries(attributes)) {
    el.setAttribute(n, v);
  }
  if (parent) {
    parent.appendChild(el);
  }
  return el;
}

export function curvedCornerPath(defaultRadius) {
  
  let p1 = null;
  let p2 = null;
  
  return {
    start: function(point1, point2) {
      p1 = point1;
      p2 = point2;
    },
    bend: function(p3, radius=defaultRadius) {
      let v1 = vUnit(vSub(p1,p2));
      let v2 = vUnit(vSub(p3,p2));
      let path = " L" + vAdd(p2,v1,radius).join(",") +
                 " Q " + p2.join(",") + " " + vAdd(p2,v2,radius).join(",");
                 //" L " + p3.join(",");
      p1 = p2;
      p2 = p3;
      return path;
    },
    straight: function(p3) {
      let path = " L" + p3.join(",");
      p1 = p2;
      p2 = p3;
      return path;      
    }
  }
}
  