"use strict";

let scale_x = 1.0;
let scale_y = 1.0;
let scale_z = 1.0;
let rotate_x = 0.0; //1 5 16
let rotate_y = 0.0;
let rotate_z = 0.0;
let delta_x = 0.0;
let delta_y = 0.0;
let delta_z = 0.0;

main();

//
// Start here
//
function main() {
  const canvas = document.getElementById('draw_surface');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      // projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  drawScene(gl, programInfo, buffers);

  document.getElementById("delta_x").addEventListener("mousemove", 
    function() {
      delta_x = document.getElementById("delta_x").value;
      drawScene(gl, programInfo, buffers);
      console.log(delta_x);
    });
  document.getElementById("delta_y").addEventListener("mousemove", 
    function() {
      delta_y = document.getElementById("delta_y").value;
      drawScene(gl, programInfo, buffers);
      console.log(delta_y);
    });
  document.getElementById("delta_z").addEventListener("mousemove", 
    function() {
      delta_z = document.getElementById("delta_z").value;
      drawScene(gl, programInfo, buffers);
      console.log(delta_z);
    });
  document.getElementById("rotate_x").addEventListener("mousemove", 
    function() {
      rotate_x = document.getElementById("rotate_x").value;
      drawScene(gl, programInfo, buffers);
      console.log(rotate_x);
    });
  document.getElementById("rotate_y").addEventListener("mousemove", 
    function() {
      rotate_y = document.getElementById("rotate_y").value;
      drawScene(gl, programInfo, buffers);
      console.log(rotate_y);
    });
  document.getElementById("rotate_z").addEventListener("mousemove", 
    function() {
      rotate_z = document.getElementById("rotate_z").value;
      drawScene(gl, programInfo, buffers);
      console.log(rotate_z);
    });
  document.getElementById("scale_x").addEventListener("mousemove", 
    function() {
      scale_x = document.getElementById("scale_x").value;
      drawScene(gl, programInfo, buffers);
      console.log(scale_x);
    });
  document.getElementById("scale_y").addEventListener("mousemove", 
    function() {
      scale_y = document.getElementById("scale_y").value;
      drawScene(gl, programInfo, buffers);
      console.log(scale_y);
    });
  document.getElementById("scale_z").addEventListener("mousemove", 
    function() {
      scale_z = document.getElementById("scale_z").value;
      drawScene(gl, programInfo, buffers);
      console.log("scale_z", scale_z);
    });

  // Unbind the buffer for safety
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
  const positions = [
    // Front face
    -0.3, -0.3,  0.3,
     0.3, -0.3,  0.3,
     0.3,  0.3,  0.3,
    -0.3,  0.3,  0.3,

    // Back face
    -0.3, -0.3, -0.3,
    -0.3,  0.3, -0.3,
     0.3,  0.3, -0.3,
     0.3, -0.3, -0.3,

    // Top face
    -0.3,  0.3, -0.3,
    -0.3,  0.3,  0.3,
     0.3,  0.3,  0.3,
     0.3,  0.3, -0.3,

    // Bottom face
    -0.3, -0.3, -0.3,
     0.3, -0.3, -0.3,
     0.3, -0.3,  0.3,
    -0.3, -0.3,  0.3,

    // Right face
     0.3, -0.3, -0.3,
     0.3,  0.3, -0.3,
     0.3,  0.3,  0.3,
     0.3, -0.3,  0.3,

    // Left face
    -0.3, -0.3, -0.3,
    -0.3, -0.3,  0.3,
    -0.3,  0.3,  0.3,
    -0.3,  0.3, -0.3,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.
  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.
  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  //gl.bindBuffer(gl.ARRAY_BUFFER, null); 
  //unbind the buffer 
  
  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [delta_x, delta_y, delta_z]);  // amount to translate
  
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              rotate_x,     // amount to rotate in radians
              [1, 0, 0]);       // axis to rotate around (X)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              rotate_z,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)

  mat4.scale(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to scale
              [scale_x, scale_y, scale_z]); // amount to scale
  
  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  // gl.uniformMatrix4fv(
  //     programInfo.uniformLocations.projectionMatrix,
  //     false,
  //     projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}