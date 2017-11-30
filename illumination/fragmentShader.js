// Fragment shader program
const fsSource = `
precision mediump float;
uniform vec4 uColor;

void main(void) {
  gl_FragColor = uColor;
}
`;