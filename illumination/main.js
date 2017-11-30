'use strict';

let cube_side = 1;
let cube_vertex_count = 36;
let sphere_radius = 0.5;
let sphere_slices = 24;
let sphere_stacks = 12;
let sphere_vertex_count = sphere_slices * sphere_stacks * 6;
let cylinder_radius = 0.5;
let cylinder_height = 1;
let cylinder_slices = 24;
let cylinder_vertex_count = 12 * cylinder_slices;
let rotate_speed = 1;
let rotation = 0;
let then = Date.now() / 1000;
let animation_signal = true;

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

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  const info = {
    program: shaderProgram,
    attribLocations: {
      vertexPos: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMx: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMx: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      color: gl.getUniformLocation(shaderProgram, 'uColor'),
    },
  };

  // create a sphere
  let sphere = uvSphere(sphere_radius, sphere_slices, sphere_stacks);
  let cube = uvCube(cube_side);
  let cylinder = uvCylinder(cylinder_radius, cylinder_height, cylinder_slices);
  const buffers = 
  {
  	sphere: initBuffers(gl, sphere.vertexPositions, sphere.indices),
  	cube: initBuffers(gl, cube.vertexPositions, cube.indices),
  	cylinder: initBuffers(gl, cylinder.vertexPositions, cylinder.indices),
	}

  function render()
  {
    if (animation_signal)
    {
      let now = Date.now() / 1000;
      const deltatime = now - then;
      then = now;
      drawScene(gl, info, buffers, deltatime);
      requestAnimationFrame(render);
    }
    else
    {
      drawScene(gl, info, buffers, 0);
    }
  }
  requestAnimationFrame(render);

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
          then = Date.now() / 1000;
          break;
      }
      requestAnimationFrame(render);
  });
}

// Initialize the buffers.
function initBuffers(gl, vertex, index)
{
  // cube vertex positions buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = vertex;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // index buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indices = index;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, info, buffers, deltatime)
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas

  gl.useProgram(info.program);

  // perspective matrix: see objects 0.1 - 150 units away
  const projectionMx = mat4.create();
  // fieldOfView, aspect, zNear, zFar
  mat4.perspective(projectionMx, 45 * Math.PI / 180,
    gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 150.0);
  
  // multiply projectionMx and cameraTransformMx to save computation in GPU
  mat4.multiply(projectionMx, projectionMx, camera.getCameraTransformMatrix());
  // location, transpose, value
  gl.uniformMatrix4fv(info.uniformLocations.projectionMx, false, projectionMx);

  /************************draw sphere********************/
  useBuffers(gl, info, buffers.sphere.position, buffers.sphere.indices);

  // model view matrix
  const transformMx = mat4.create();
  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [2.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              rotation,
              [0, 1, 0]);
  gl.uniformMatrix4fv(info.uniformLocations.modelViewMx, false, transformMx);
  
  // color uniform yellow
  gl.uniform4f(info.uniformLocations.color, 1.0, 1.0, 0.0, 1.0);

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, sphere_vertex_count, gl.UNSIGNED_SHORT, 0);

  /************************draw cube********************/
  useBuffers(gl, info, buffers.cube.position, buffers.cube.indices);

  mat4.identity(transformMx);
  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              rotation,
              [0, 1, 0]);
  gl.uniformMatrix4fv(info.uniformLocations.modelViewMx, false, transformMx);

  // color uniform red
  gl.uniform4f(info.uniformLocations.color, 1.0, 0.0, 0.0, 1.0);

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, cube_vertex_count, gl.UNSIGNED_SHORT, 0);

  /************************draw cylinder********************/
  useBuffers(gl, info, buffers.cylinder.position, buffers.cylinder.indices);

  mat4.identity(transformMx);
  mat4.translate(transformMx,     // destination matrix
                 transformMx,     // matrix to translate
                 [-2.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(transformMx,
              transformMx,
              rotation,
              [0, 1, 0]);
  mat4.rotate(transformMx,
              transformMx,
              0.5 * Math.PI,
              [1, 0, 0]);
  gl.uniformMatrix4fv(info.uniformLocations.modelViewMx, false, transformMx);

  // color uniform
  gl.uniform4f(info.uniformLocations.color, 1.0, 0.0, 1.0, 1.0);

  //draw method, vertexCount, data type, offset
  gl.drawElements(gl.TRIANGLES, cylinder_vertex_count, gl.UNSIGNED_SHORT, 0);

  rotation += rotate_speed * deltatime;
}

function useBuffers(gl, info, pos, idx)
{
  // position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  // numComponents, data type, normalize, stride, offset
  gl.vertexAttribPointer(info.attribLocations.vertexPos,
    3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(info.attribLocations.vertexPos);

  // index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
}