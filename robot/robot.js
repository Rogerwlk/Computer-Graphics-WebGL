'use strict';

let robot_rotate_y = 0.0;
let robot_delta_x = 0.0;
let robot_delta_y = 0.0;
let robot_delta_z = 0.0;
let upper_arm_rotate_y = 0.0;
let upper_arm_rotate_z = 0.0;
let lower_arm_rotate_y = 0.0;
let lower_arm_rotate_z = 0.0;

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
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
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

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  drawScene(gl, programInfo, buffers);

  document.getElementById("robot_delta_x").addEventListener("mousemove", 
    function() {
      robot_delta_x = document.getElementById("robot_delta_x").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("robot_delta_y").addEventListener("mousemove", 
    function() {
      robot_delta_y = document.getElementById("robot_delta_y").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("robot_delta_z").addEventListener("mousemove", 
    function() {
      robot_delta_z = document.getElementById("robot_delta_z").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("robot_rotate_y").addEventListener("mousemove", 
    function() {
      robot_rotate_y = document.getElementById("robot_rotate_y").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("upper_arm_rotate_y").addEventListener("mousemove", 
    function() {
      upper_arm_rotate_y = document.getElementById("upper_arm_rotate_y").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("upper_arm_rotate_z").addEventListener("mousemove", 
    function() {
      upper_arm_rotate_z = document.getElementById("upper_arm_rotate_z").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("lower_arm_rotate_y").addEventListener("mousemove", 
    function() {
      lower_arm_rotate_y = document.getElementById("lower_arm_rotate_y").value;
      drawScene(gl, programInfo, buffers);
    });
  document.getElementById("lower_arm_rotate_z").addEventListener("mousemove", 
    function() {
      lower_arm_rotate_z = document.getElementById("lower_arm_rotate_z").value;
      drawScene(gl, programInfo, buffers);
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

  // Now create an array of positions for the cube.
  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  const indices = [
    0, 1, 2,	0, 2, 3, // front
    4, 5, 6,	4, 6, 7, // back
    0, 3, 5,	0, 5, 4, // left
    1, 2, 6,	1, 6, 7, // right
    3, 5, 6,	3, 6, 2, // top
    0, 4, 7,	0, 7, 1, // bottom
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, programInfo, buffers)
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

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  // fieldOfView, aspect, zNear, zFar
  mat4.perspective(projectionMatrix, 45 * Math.PI / 180,
    gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

  // location, transpose, value
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
      false, projectionMatrix);
  
  drawTorso(gl, programInfo);
  drawHead(gl, programInfo);

  // right use 1, left use -1
  drawUpperArm(gl, programInfo, 1);
  drawUpperArm(gl, programInfo, -1);
  drawLowerArm(gl, programInfo, 1);
  drawLowerArm(gl, programInfo, -1);
  drawHand(gl, programInfo, 1);
  drawHand(gl, programInfo, -1);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawTorso(gl, programInfo)
{
  var torsoMx = mat4.create();

  mat4.translate(torsoMx,     // destination matrix
                 torsoMx,     // matrix to translate
                 [robot_delta_x, robot_delta_y, robot_delta_z]);  // amount to translate
  mat4.translate(torsoMx,     // destination matrix
                 torsoMx,     // matrix to translate
                 [0, 0, -6.0]);  // amount to translate
  mat4.rotate(torsoMx,  // destination matrix
              torsoMx,  // matrix to rotate
              robot_rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)

  mat4.scale(torsoMx,
            torsoMx,
            [0.6, 1, 1]);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
      false, torsoMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
      1.0, 0.0, 0.0, 1.0); //color red

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawHead(gl, programInfo)
{
  var headMx = mat4.create();

  mat4.translate(headMx,     // destination matrix
                 headMx,     // matrix to translate
                 [robot_delta_x, robot_delta_y, robot_delta_z]);  // amount to translate
  mat4.translate(headMx,     // destination matrix
                 headMx,     // matrix to translate
                 [0, 1.3, -6.0]);  // amount to translate
  mat4.rotate(headMx,  // destination matrix
              headMx,  // matrix to rotate
              robot_rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)

  mat4.scale(headMx,
            headMx,
            [0.3, 0.3, 0.3]);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
      false, headMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
      1.0, 1.0, 0.0, 1.0); //color yellow

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawUpperArm(gl, programInfo, isRight)
{
  var upperArmMx = mat4.create();

  mat4.translate(upperArmMx,     // destination matrix
                 upperArmMx,     // matrix to translate
                 [robot_delta_x, robot_delta_y, robot_delta_z]); // amount to translate
  mat4.translate(upperArmMx,     // destination matrix
                 upperArmMx,     // matrix to translate
                 [0, 0.3, -6.0]); // amount to translate
  mat4.rotate(upperArmMx,  // destination matrix
              upperArmMx,  // matrix to rotate
              robot_rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)
  mat4.translate(upperArmMx,
                upperArmMx,
                [isRight * 0.6, 0, 0]);

  mat4.rotate(upperArmMx,
              upperArmMx,
              isRight * upper_arm_rotate_y,
              [0, 1, 0]);
  mat4.rotate(upperArmMx,
              upperArmMx,
              isRight * upper_arm_rotate_z,
              [0, 0, 1]);
  mat4.translate(upperArmMx,
                upperArmMx,
                [isRight * 0.4, 0, 0]);

  mat4.scale(upperArmMx,
            upperArmMx,
            [0.4, 0.3, 0.3]);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
    false, upperArmMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
    1.0, 1.0, 0.0, 1.0); //color yellow

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawLowerArm(gl, programInfo, isRight)
{
  var lowerArmMx = mat4.create();

  mat4.translate(lowerArmMx,     // destination matrix
                 lowerArmMx,     // matrix to translate
                 [robot_delta_x, robot_delta_y, robot_delta_z]);  // amount to translate
  mat4.translate(lowerArmMx,     // destination matrix
                 lowerArmMx,     // matrix to translate
                 [0, 0.3, -6.0]);  // amount to translate
  mat4.rotate(lowerArmMx,  // destination matrix
              lowerArmMx,  // matrix to rotate
              robot_rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)
  mat4.translate(lowerArmMx,
                lowerArmMx,
                [isRight * 0.6, 0, 0]);

  mat4.rotate(lowerArmMx,
              lowerArmMx,
              isRight * upper_arm_rotate_y,
              [0, 1, 0]);
  mat4.rotate(lowerArmMx,
              lowerArmMx,
              isRight * upper_arm_rotate_z,
              [0, 0, 1]);
  mat4.translate(lowerArmMx,
                lowerArmMx,
                [isRight * 0.8, 0, 0]);

  mat4.rotate(lowerArmMx,
              lowerArmMx,
              isRight * lower_arm_rotate_y,
              [0, 1, 0]);
  mat4.rotate(lowerArmMx,
              lowerArmMx,
              isRight * lower_arm_rotate_z,
              [0, 0, 1]);
  mat4.translate(lowerArmMx,
                lowerArmMx,
                [isRight * 0.4, 0, 0]);

  mat4.scale(lowerArmMx,
            lowerArmMx,
            [0.4, 0.2, 0.2]);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
    false, lowerArmMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
      1.0, 0.0, 0.0, 1.0); //color red

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawHand(gl, programInfo, isRight)
{
  var handMx = mat4.create();

  mat4.translate(handMx,     // destination matrix
                 handMx,     // matrix to translate
                 [robot_delta_x, robot_delta_y, robot_delta_z]);  // amount to translate
  mat4.translate(handMx,     // destination matrix
                 handMx,     // matrix to translate
                 [0, 0.3, -6.0]);  // amount to translate
  mat4.rotate(handMx,  // destination matrix
              handMx,  // matrix to rotate
              robot_rotate_y,     // amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (Y)
  mat4.translate(handMx,
                handMx,
                [isRight * 0.6, 0, 0]);

  mat4.rotate(handMx,
              handMx,
              isRight * upper_arm_rotate_y,
              [0, 1, 0]);
  mat4.rotate(handMx,
              handMx,
              isRight * upper_arm_rotate_z,
              [0, 0, 1]);
  mat4.translate(handMx,
                handMx,
                [isRight * 0.8, 0, 0]);

  mat4.rotate(handMx,
              handMx,
              isRight * lower_arm_rotate_y,
              [0, 1, 0]);
  mat4.rotate(handMx,
              handMx,
              isRight * lower_arm_rotate_z,
              [0, 0, 1]);
  mat4.translate(handMx,
                handMx,
                [isRight * 0.9, 0, 0]);

  mat4.scale(handMx,
            handMx,
            [0.1, 0.1, 0.1]);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
    false, handMx);

  gl.uniform4f(programInfo.uniformLocations.vertexColor,
      1.0, 1.0, 0.0, 1.0); //color yellow

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
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