let camera = {
  moveSpeed: 0.1,
  rotateSpeed: 0.05,
  strafeSpeed: 0.01,
  // camera position
  position: vec3.fromValues(0.0, 0.0, 0.0),
  
  // camera watching direction
  view: vec3.fromValues(0.0, 0.0, -1.0),
  
  // camera y-axis
  up: vec3.fromValues(0.0, 1.0, 0.0),

  object_center: vec3.fromValues(0.0, 0.0, 0.0),

  cameraTransformMx: mat4.create(),

  origin: vec3.create(),

  getCameraTransformMatrix: function() {
    let temp = vec3.create();

    vec3.add(temp, this.position, this.view);
    // center of projection, look at direction, top of camera
    mat4.lookAt(this.cameraTransformMx, this.position, temp, this.up);
    return this.cameraTransformMx;
  },
  moveForward: function() {
    let temp = vec3.create();
    vec3.scale(temp, this.view, this.moveSpeed);
    vec3.add(this.position, this.position, temp);
  },
  moveBackward: function() {
    let temp = vec3.create();
    vec3.scale(temp, this.view, -this.moveSpeed);
    vec3.add(this.position, this.position, temp);
  },
  rotateLeft: function() {
    vec3.rotateY(this.position, this.position, this.object_center, -this.rotateSpeed);
    vec3.rotateY(this.view, this.view, this.origin, -this.rotateSpeed);
  },
  rotateRight: function() {
    vec3.rotateY(this.position, this.position, this.object_center, this.rotateSpeed);
    vec3.rotateY(this.view, this.view, this.origin, this.rotateSpeed);
  },
  strafeLeft: function() {
    vec3.rotateY(this.view, this.view, this.origin, -this.strafeSpeed);
  },
  strafeRight: function() {
    vec3.rotateY(this.view, this.view, this.origin, this.strafeSpeed);
  },
};