// Critically damped motion retains velocity when a user reverses direction or
// jumps between product anchors. Values are plain {x,y,z} objects.
export function dampVector3(current, target, velocity, smoothTime, deltaTime, maxSpeed = 150) {
  const dt = Math.max(0, Math.min(deltaTime, .05));
  if (!dt) return;
  const omega = 2 / Math.max(.05, smoothTime);
  const x = omega * dt;
  const decay = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
  let cx = current.x - target.x, cy = current.y - target.y, cz = current.z - target.z;
  const length = Math.hypot(cx, cy, cz), limit = maxSpeed * smoothTime;
  if (length > limit) { const scale = limit / length; cx *= scale; cy *= scale; cz *= scale; }
  const ax = current.x - cx, ay = current.y - cy, az = current.z - cz;
  const tx = (velocity.x + omega * cx) * dt, ty = (velocity.y + omega * cy) * dt, tz = (velocity.z + omega * cz) * dt;
  const nx = ax + (cx + tx) * decay, ny = ay + (cy + ty) * decay, nz = az + (cz + tz) * decay;
  velocity.x = (velocity.x - omega * tx) * decay;
  velocity.y = (velocity.y - omega * ty) * decay;
  velocity.z = (velocity.z - omega * tz) * decay;
  if ((target.x - current.x) * (nx - target.x) + (target.y - current.y) * (ny - target.y) + (target.z - current.z) * (nz - target.z) > 0) {
    current.x = target.x; current.y = target.y; current.z = target.z;
    velocity.x = velocity.y = velocity.z = 0;
  } else { current.x = nx; current.y = ny; current.z = nz; }
}

export function smoothProgress(value, start = 0, end = 1) {
  const t = Math.max(0, Math.min(1, (value - start) / Math.max(.0001, end - start)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
