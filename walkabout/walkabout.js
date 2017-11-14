'use strict';

let scene_delta_x = 0.0;
let scene_delta_y = 0.0;
let scene_delta_z = -90.0;
let sphere_radius = 1;
let sphere_slices = 32;
let sphere_stacks = 16;
let vertex_count = sphere_slices * sphere_stacks * 6;
let animation_signal = true;
let then = 0;
let deltaTime = 0;
let speed_scale = 0.1;
let camera = {
  moveSpeed: 1,
  rotateSpeed: 0.05,
  strafeSpeed: 0.01,
  // camera position
  position: vec3.fromValues(0.0, 0.0, 0.0),
  
  // camera watching direction
  view: vec3.fromValues(0.0, 0.0, -1.0),
  
  // camera y-axis
  up: vec3.fromValues(0.0, 1.0, 0.0),

  object_center: vec3.fromValues(scene_delta_x, scene_delta_y, scene_delta_z),

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

let sun = {
  position: { x: 0.0, y: 0.0, z: 0.0, },
  size: 3.03,
  color: { r: 1.0, g: 0.0, b: 0.0, }, //color red
  rotate: 0,
  rotate_speed: 1,
};
let mercury = {
  position: { x: -5.0, y: 0.0, z: 0.0, },
  size: 0.58,
  color: { r: 0.5, g: 0.5, b: 0.5, }, //color gray
  rotate: 0,
  rotate_speed: 1 / 0.241,
};
let venus = {
  position: { x: -10.0, y: 0.0, z: 0.0, },
  size: 0.98,
  color: { r: 1.0, g: 1.0, b: 0.3, }, //color pale yellow
  rotate: 0,
  rotate_speed: 1 / 0.615,
};
let earth = {
  position: { x: -15.0, y: 0.0, z: 0.0, },
  size: 1.0,
  color: { r: 0.0, g: 0.0, b: 1.0, }, //color blue
  rotate: 0,
  rotate_speed: 1 / 1,
};
let mars = {
  position: { x: -20.0, y: 0.0, z: 0.0, },
  size: 0.72,
  color: { r: 0.35, g: 0.0, b: 0.0, }, //color reddish brown
  rotate: 0,
  rotate_speed: 1 / 1.881,
};
let jupiter = {
  position: { x: -25.0, y: 0.0, z: 0.0, },
  size: 2.04,
  color: { r: 0.7, g: 0.7, b: 0.7, }, //color light gray
  rotate: 0,
  rotate_speed: 1 / 11.862,
};
let saturn = {
  position: { x: -30.0, y: 0.0, z: 0.0, },
  size: 1.96,
  color: { r: 0.9, g: 0.74, b: 0.54, }, //color pale gold
  rotate: 0,
  rotate_speed: 1 / 29.456,
};
let uranus = {
  position: { x: -35.0, y: 0.0, z: 0.0, },
  size: 1.60,
  color: { r: 0.54, g: 0.74, b: 0.9, }, //color pale blue
  rotate: 0,
  rotate_speed: 1 / 84.07,
};
let neptune = {
  position: { x: -40.0, y: 0.0, z: 0.0, },
  size: 1.58,
  color: { r: 0.54, g: 0.74, b: 0.9, }, //color pale blue
  rotate: 0,
  rotate_speed: 1 / 164.81,
};

main();

// Start here
function main()
{
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now
  if (!gl)
  {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  // Fragment shader program
  const fsSource = `
    uniform lowp vec4 uVertexColor;

    void main(void) {
      gl_FragColor = uVertexColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      vertexColor: gl.getUniformLocation(shaderProgram, 'uVertexColor'),
    },
  };

  // builds all the objects
  const buffers = initBuffers(gl);

  function render(now) {
    if (animation_signal)
    {
      now *= 0.001;
      deltaTime = now - then;
      then = now;
    
      drawScene(gl, programInfo, buffers, deltaTime);
    
      requestAnimationFrame(render);
    }
  }
  // if (animation_signal)
    requestAnimationFrame(render);

  document.addEventListener('keydown',
    function(event) {
      switch (event.keyCode)
      {
        // key 'd' and 'right arrow'
        case 68:
        case 39:
          camera.strafeLeft();
          break;
        // key 'a' and 'left arrow'
        case 65:
        case 37:
          camera.strafeRight();
          break;
        // key 'w' and 'up arrow'
        case 87:
        case 38:
          camera.moveForward();
          break;
        // key 's' and 'down arrow'
        case 83:
        case 40:
          camera.moveBackward();
          break;
        // key 'j' and 'left arrow'
        case 74:
          camera.rotateLeft();
          break;
        // key 'k' and 'right arrow'
        case 75:
          camera.rotateRight();
          break;
        case 32:
          animation_signal = !animation_signal;
          console.log(animation_signal);
          break;
      }
      requestAnimationFrame(render);
      // drawScene(gl, programInfo, buffers, deltaTime);
    });

  document.getElementById("scene_delta_x").addEventListener("input", 
    function() {
      scene_delta_x = document.getElementById("scene_delta_x").value;
      requestAnimationFrame(render);
      // drawScene(gl, programInfo, buffers, deltaTime);
    });
  document.getElementById("scene_delta_y").addEventListener("input", 
    function() {
      scene_delta_y = document.getElementById("scene_delta_y").value;
      requestAnimationFrame(render);
      // drawScene(gl, programInfo, buffers, deltaTime);
    });
  document.getElementById("scene_delta_z").addEventListener("input", 
    function() {
      scene_delta_z = document.getElementById("scene_delta_z").value;
      requestAnimationFrame(render);
      // drawScene(gl, programInfo, buffers, deltaTime);
    });
}

// Initialize the buffers.
function initBuffers(gl)
{
  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let sphere = uvSphere(sphere_radius, sphere_slices, sphere_stacks);

  // sphere position
  const positions = sphere.vertexPositions;

  // pass the list of positions into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // sphere indices
  const indices = sphere.indices;

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, programInfo, buffers, deltaTime)
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  // numComponents, data type, normalize, stride, offset
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
    3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Create a perspective matrix and see objects 0.1 - 150 units away
  const projectionMatrix = mat4.create();

  // fieldOfView, aspect, zNear, zFar
  mat4.perspective(projectionMatrix, 45 * Math.PI / 180,
    gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 150.0);

  // object center
  camera.object_center = vec3.fromValues(scene_delta_x, scene_delta_y, scene_delta_z);

  // multiply projectionMatrix and cameraTransformMx to save computation in GPU
  mat4.multiply(projectionMatrix, projectionMatrix, camera.getCameraTransformMatrix());
  
  // location, transpose, value
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
    false, projectionMatrix);

  if (animation_signal)
  {
    mercury.rotate += speed_scale * mercury.rotate_speed;
    venus.rotate += speed_scale * venus.rotate_speed;
    earth.rotate += speed_scale * earth.rotate_speed;
    mars.rotate += speed_scale * mars.rotate_speed;
    jupiter.rotate += speed_scale * jupiter.rotate_speed;
    saturn.rotate += speed_scale * saturn.rotate_speed;
    uranus.rotate += speed_scale * uranus.rotate_speed;
    neptune.rotate += speed_scale * neptune.rotate_speed;
  }
  console.log(mercury.rotate);
  drawPlanet(gl, programInfo, sun.position, sun.size, sun.color, sun.rotate);
  drawPlanet(gl, programInfo, mercury.position, mercury.size, mercury.color, mercury.rotate);
  drawPlanet(gl, programInfo, venus.position, venus.size, venus.color, venus.rotate);
  drawPlanet(gl, programInfo, earth.position, earth.size, earth.color, earth.rotate);
  drawPlanet(gl, programInfo, mars.position, mars.size, mars.color, mars.rotate);
  drawPlanet(gl, programInfo, jupiter.position, jupiter.size, jupiter.color, jupiter.rotate);
  drawPlanet(gl, programInfo, saturn.position, saturn.size, saturn.color, saturn.rotate);
  drawPlanet(gl, programInfo, uranus.position, uranus.size, uranus.color, uranus.rotate);
  drawPlanet(gl, programInfo, neptune.position, neptune.size, neptune.color, neptune.rotate);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawPlanet(gl, programInfo, position, size, color, rotate)
{
  var transformMx = mat4.create();

  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [scene_delta_x, scene_delta_y, scene_delta_z]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              rotate,
              [0, 1, 0])
  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [position.x, position.y, position.z]);  // amount to translate
  
  mat4.scale(transformMx,
            transformMx,
            [size, size, size]);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
      false, transformMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
      color.r, color.g, color.b, 1.0); //color red

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, vertex_count, gl.UNSIGNED_SHORT, 0);
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource)
{
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
  {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and
// compiles it.
function loadShader(gl, type, source)
{
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}