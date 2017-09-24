"use strict";

let gl;
let delta_x = 0.0;

function main()
{
	const canvas = document.getElementById('draw_surface');
	gl = canvas.getContext('webgl');

	if (!gl)
	{
		alert(`Unable to initialize WebGL.
			Your browser or machine may not support it.`);
		return;
	}

	const buffers = initBuffers();
	
	const shaderProgram = initShaderProgram();

	drawScene(shaderProgram, buffers);

	document.getElementById("delta_x").addEventListener("mousemove", 
		function() {drawScene(shaderProgram, buffers);});
	// Unbind the buffer for safety
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initBuffers()
{
	var vertices = [
	//    X     Y     Z
		 -0.5,  0.25,  0.0,    // point 1
		-0.25,   0.0,  0.0,    // point 2
		 -0.5, -0.25,  0.0,    // point 3
	];

	// Create an empty buffer object to store the vertex buffer
	const vertex_buffer = gl.createBuffer();

	//Bind appropriate array buffer to it
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	// Pass the vertex data to the buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	return vertex_buffer;
}

function initShaderProgram()
{
	// vertex shader source code
	var vertCode = `
		attribute vec3 coordinates;
		uniform float delta_x;

		void main(void)
		{
	    	gl_Position = vec4(coordinates, 1.0);
	    	gl_Position.x = coordinates.x + delta_x;
	    	// gl_PointSize = 10.0;
		}`;

	// fragment shader source code
	var fragCode = `
		void main(void)
		{
	    	gl_FragColor = vec4(1, 0,    0,    1);
		}`;

	const vertShader = loadShader(gl.VERTEX_SHADER, vertCode);
	const fragShader = loadShader(gl.FRAGMENT_SHADER, fragCode);
	// Create a shader program object to store
	// the combined shader program
	const shaderProgram = gl.createProgram();

	// Attach a vertex shader
	gl.attachShader(shaderProgram, vertShader); 
	// Attach a fragment shader
	gl.attachShader(shaderProgram, fragShader);
	// Link both programs
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
	    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	    return;
	}

	return shaderProgram;
}

function loadShader(type, source)
{
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
	    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
	    gl.deleteShader(shader);
	    return;
	}
	return shader;
}

function drawScene(shaderProgram, buffers)
{
	delta_x = document.getElementById("delta_x").value;
	// Clear the canvas
	gl.clearColor(0, 0, 0, 1);
	// Clear the color buffer bit
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Enable the depth test
	gl.enable(gl.DEPTH_TEST);

	// Use the combined shader program object
	gl.useProgram(shaderProgram);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers);

	// Get the attribute location
	var coord = gl.getAttribLocation(shaderProgram, "coordinates");

	// Point an attribute to the currently bound VBO
	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

	// Enable the attribute
	gl.enableVertexAttribArray(coord);

	gl.uniform1f(gl.getUniformLocation(shaderProgram, "delta_x"), delta_x);
	
	// Draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}