// JavaScript Code to draw a simple Triangle
// Using WebGL
// 1. Create Canvas
// 2. get a drawing context
// 4. set 3D coordinates for each vertex of triangle
// 5. create vertex buffer/populate with data/send to GPU
// 6. create vertex shader code
// 7. create buffer to hold vertex shader
// 8. compile vertex shader code
// 9. repeat for fragment shader
// 10 create GPU program (combine/link vertex/fragment code)
// 11. Specify and Configure vertex attributes on GPU
// 12. set clear color
// 13. clear canvas
// 14. draw triangle
// 15. Poor design, but it works. We will improve the design
//     as we progress :-)

// Vertex Shader

var gl;

function startWebGL()
{
   /*================Creating a canvas=================*/
   var canvas = document.getElementById('draw_surface');
   gl = canvas.getContext('experimental-webgl'); 
   createVertexBuffers();
   createShadersPrograms();
   drawObjects();
}      
/*==========Defining and storing the geometry=======*/
function createVertexBuffers()
{
   var vertices = [
   //  X        Y       Z
   	-.5, 0, 0,    // point 1
   	0, .5, 0,    // point 2
   	.5, 0, 0,    // point 3

      -.5, 0, 0,
      0, -.5, 0,
      .5, 0, 0
   ];

   // Create an empty buffer object to store the vertex buffer
   var vertex_buffer = gl.createBuffer();

   //Bind appropriate array buffer to it
   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

   // Pass the vertex data to the buffer
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/*=========================Shaders========================*/
function createShadersPrograms()
{
   // vertex shader source code
   var vertCode =
      'attribute vec3 coordinates;' +

      'void main(void) {' +
         ' gl_Position = vec4(coordinates, 1.0);' +
         ' gl_PointSize = 10.0;'+
      '}';

   // Create a vertex shader object
   var vertShader = gl.createShader(gl.VERTEX_SHADER);

   // Attach vertex shader source code
   gl.shaderSource(vertShader, vertCode);

   // Compile the vertex shader
   gl.compileShader(vertShader);

   // fragment shader source code
   var fragCode =
      'void main(void) {' +
      //                       RED, Green,  Blue,   Alpha
         ' gl_FragColor = vec4(1, 0,    0,    1);' +
      '}';

   // Create fragment shader object
   var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

   // Attach fragment shader source code
   gl.shaderSource(fragShader, fragCode);

   // Compile the fragmentt shader
   gl.compileShader(fragShader);

   // Create a shader program object to store
   // the combined shader program
   var shaderProgram = gl.createProgram();

   // Attach a vertex shader
   gl.attachShader(shaderProgram, vertShader); 
    
   // Attach a fragment shader
   gl.attachShader(shaderProgram, fragShader);

   // Link both programs
   gl.linkProgram(shaderProgram);

   // Use the combined shader program object
   gl.useProgram(shaderProgram);

   // Get the attribute location
   var coord = gl.getAttribLocation(shaderProgram, "coordinates");

   // Point an attribute to the currently bound VBO
   gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

   // Enable the attribute
   gl.enableVertexAttribArray(coord);
}

function drawObjects()
{
   // Clear the canvas
   gl.clearColor(0.5, 0.5, 0.5, 0.9);

   // Enable the depth test
   gl.enable(gl.DEPTH_TEST);

   // Clear the color buffer bit
   gl.clear(gl.COLOR_BUFFER_BIT);

   // Draw the triangle
   gl.drawArrays(gl.TRIANGLES, 0, 6);
}