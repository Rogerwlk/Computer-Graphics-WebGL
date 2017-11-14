'use strict';
  
let scene_delta_x = 0.0;
let scene_delta_y = 0.0;
let scene_delta_z = -75.0;
let sphere_radius = 1;
let sphere_slices = 50;
let sphere_stacks = 25;
let vertex_count = sphere_slices * sphere_stacks * 6;
let animation_signal = true;
let speed_scale = 1;
let then = Date.now() / 1000;

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
  size: 8.0,
  rotate: 0.0,
  rotate_speed: 0,
};
let mercury = {
  position: { x: -11.0, y: 0.0, z: 0.0, },
  size: 0.58,
  rotate: 0.1,
  rotate_speed: 1 / 0.241,
};
let venus = {
  position: { x: -15.0, y: 0.0, z: 0.0, },
  size: 0.98,
  rotate: 0.2,
  rotate_speed: 1 / 0.615,
};
let earth = {
  position: { x: -19.0, y: 0.0, z: 0.0, },
  size: 1.0,
  rotate: 0.3,
  rotate_speed: 1 / 1,
};
let mars = {
  position: { x: -23.0, y: 0.0, z: 0.0, },
  size: 0.72,
  rotate: 0.4,
  rotate_speed: 1 / 1.881,
};
let jupiter = {
  position: { x: -29.0, y: 0.0, z: 0.0, },
  size: 2.04,
  rotate: 0.5,
  rotate_speed: 1 / 11.862,
};
let saturn = {
  position: { x: -35.0, y: 0.0, z: 0.0, },
  size: 1.96,
  rotate: 0.6,
  rotate_speed: 1 / 29.456,
};
let uranus = {
  position: { x: -41.0, y: 0.0, z: 0.0, },
  size: 1.60,
  rotate: 0.7,
  rotate_speed: 1 / 84.07,
};
let neptune = {
  position: { x: -47.0, y: 0.0, z: 0.0, },
  size: 1.58,
  rotate: 0.8,
  rotate_speed: 1 / 164.81,
};

main();

function main()
{
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');

  if (!gl)
  {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program
  const fsSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // builds all the objects
  const buffers = initBuffers(gl);
  
  // load textures
  sun.texture = loadTexture(gl, 'images/sun.jpg');
  mercury.texture = loadTexture(gl, 'images/mercury.jpg');
  venus.texture = loadTexture(gl, 'images/venus.jpg');
  earth.texture = loadTexture(gl, 'images/earth.jpg');
  mars.texture = loadTexture(gl, 'images/mars.jpg');
  jupiter.texture = loadTexture(gl, 'images/jupiter.jpg');
  saturn.texture = loadTexture(gl, 'images/saturn.jpg');
  uranus.texture = loadTexture(gl, 'images/uranus.jpg');
  neptune.texture = loadTexture(gl, 'images/neptune.jpg');

  function render()
  {
  	let now = Date.now() / 1000;
  	const deltatime = now - then;
  	then = now;
    drawScene(gl, programInfo, buffers, deltatime);
    if (animation_signal)
    {
      requestAnimationFrame(render);
    }
  };
  
  requestAnimationFrame(render);

  function setThen(time) {
  	then = time;
  }

  document.addEventListener('keydown',
    function(event) {
      switch (event.keyCode)
      {
        case 68:
        case 39: // key 'd' and 'right arrow'
          camera.strafeLeft();
          break;
        case 65:
        case 37: // key 'a' and 'left arrow'
          camera.strafeRight();
          break;
        case 87:
        case 38: // key 'w' and 'up arrow'
          camera.moveForward();
          break;
        case 83:
        case 40: // key 's' and 'down arrow'
          camera.moveBackward();
          break;
        case 74: // key 'j'
          camera.rotateLeft();
          break;
        case 75: // key 'k'
          camera.rotateRight();
          break;
        case 32: // key 'space'
          animation_signal = !animation_signal;
          if (animation_signal)
          	then = Date.now() / 1000;

          break;
      }
      requestAnimationFrame(render);
    });

  document.getElementById("scene_delta_x").addEventListener("input", 
    function() {
      scene_delta_x = document.getElementById("scene_delta_x").value;
      requestAnimationFrame(render);
    });
  document.getElementById("scene_delta_y").addEventListener("input", 
    function() {
      scene_delta_y = document.getElementById("scene_delta_y").value;
      requestAnimationFrame(render);
    });
  document.getElementById("speed").addEventListener("input", 
    function() {
      speed_scale = document.getElementById("speed").value;
      requestAnimationFrame(render);
    });
}

// Initialize the buffers.
function initBuffers(gl)
{
  // create a sphere
  let sphere = uvSphere(sphere_radius, sphere_slices, sphere_stacks);

  // vertex positions buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = sphere.vertexPositions;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // texture coordinates buffer
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  const textureCoords = sphere.vertexTextureCoords;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
                gl.STATIC_DRAW);
  
  // index buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indices = sphere.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, programInfo, buffers, deltatime)
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas

  // position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  // numComponents, data type, normalize, stride, offset
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
    3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  // texture coord buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(programInfo.attribLocations.textureCoord,
    2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

  // index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.useProgram(programInfo.program);

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

  drawPlanet(gl, programInfo, sun, deltatime);
  drawPlanet(gl, programInfo, mercury, deltatime);
  drawPlanet(gl, programInfo, venus, deltatime);
  drawPlanet(gl, programInfo, earth, deltatime);
  drawPlanet(gl, programInfo, mars, deltatime);
  drawPlanet(gl, programInfo, jupiter, deltatime);
  drawPlanet(gl, programInfo, saturn, deltatime);
  drawPlanet(gl, programInfo, uranus, deltatime);
  drawPlanet(gl, programInfo, neptune, deltatime);
 }

function drawPlanet(gl, programInfo, planet, deltatime)
{
  if (animation_signal)
  {
    planet.rotate += deltatime * planet.rotate_speed * speed_scale;
  }
 
  var transformMx = mat4.create();

  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [scene_delta_x, scene_delta_y, scene_delta_z]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              planet.rotate,
              [0, 1, 0])
  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [planet.position.x, planet.position.y, planet.position.z]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              0.5 * Math.PI,
              [1, 0, 0])
  mat4.scale(transformMx,
            transformMx,
            [planet.size, planet.size, planet.size]);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
      false, transformMx);

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, planet.texture);
  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

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

function loadTexture(gl, url)
{
  // create a texture buffer object and bind the buffer
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // texture, level, internal format, width, height, border,
  // source format, source type, pixel
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  
  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // texture, level, internal format, source format,
    // source type, image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
      gl.UNSIGNED_BYTE, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height))
    {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       // Prevents s-coordinate wrapping (repeating)
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       // Prevents t-coordinate wrapping (repeating)
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}