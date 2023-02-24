export const vMult = (vec, f) => vec.map(c => c*f);
export const vAdd = (v1, v2, v2mult=1) => v1.map((c, i) => c+v2[i]*v2mult);
export const vSub = (v1, v2, v2mult=1) => v1.map((c, i) => c-v2[i]*v2mult);
export const vLen = vec => Math.sqrt(vec.reduce((cur, val) => cur + val*val, 0));
export const vUnit = vec => vMult(vec, 1/vLen(vec));

export function intersect(p1, v1, p2, v2) {
  let d = intersectDist(p1, v1, p2, v2);
  return vAdd(p1, v1, d);
}

export function intersectLinesByPoints(l1p1, l1p2, l2p1, l2p2) {
  return intersect(l1p1, sub(l1p2, l1p1), l2p1, sub(l2p2, l2p1));
}

export function intersectDist(p1, v1, p2, v2) {
  // check for parallel lines
  if (va[0]*vb[1] == va[1]*vb[0]) return Infinity;
  // check for div 0 (vb[0]==0) -> swap x,y (gives same result)
  if (vb[0] == 0) {
    p1=[p1[1],p1[0]];
    p2=[p2[1],p2[0]];
    v1=[v1[1],v1[0]];
    v2=[v2[1],v2[0]];
  }
  let d = (p2[1] + (p1[0]-p2[0])*v2[1]/v2[0]-p1[1]) / (v1[1] - v1[0]*v2[1]/v2[0]);
  return d;
}

export const degRad = a => a * Math.PI / 180;
export const radDeg = a => a * 180 / Math.PI;

export function normalizeAngle(a) {
  while (a < 0) a+= 360;
  while (a > 360) a-= 360;
  return a;
}

export function normalizeAngle180(a) {
  while (a < -180) a+= 360;
  while (a > 180) a-= 360;
  return a;
}

export function normalizeAngle90(a) {
  while (a < -90) a+= 180;
  while (a > 90) a-= 180;
  return a;
}

// gives the two tangent points on a circle of radius r1 around p1, from point p2
// https://stackoverflow.com/a/49987361

export function tangentPoints(p1, r1, p2) {

  // tangent points on circle defined by p1, r1 from p2
  let len = Math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2);
  let th = Math.acos(r1 / len);  // theta
  let d = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);  // angle of p2 from p1
  let d1 = d + th;  // direction angle of tangent points from p1
  let d2 = d - th;  

  return [
    [p1[0] + r1 * Math.cos(d1), p1[1] + r1 * Math.sin(d1)],
    [p1[0] + r1 * Math.cos(d2), p1[1] + r1 * Math.sin(d2)]
  ];
}