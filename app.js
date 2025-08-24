const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---- Shader setup ----
function compileShader(id, type) {
  const src = document.getElementById(id).text;
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

const vs = compileShader("vertex-shader", gl.VERTEX_SHADER);
const fs = compileShader("fragment-shader", gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link error:", gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// ---- Buffers ----
const posBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]),
  gl.STATIC_DRAW
);

const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

// ---- Uniforms ----
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_center = gl.getUniformLocation(program, "u_center");
const u_zoom = gl.getUniformLocation(program, "u_zoom");
const u_maxIter = gl.getUniformLocation(program, "u_maxIter");

let centerX = -0.5, centerY = 0.0;
let zoom = 1.0;
let maxIter = 300;

// ---- Eventos mouse ----
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoom *= 1.1;
    maxIter += 5;
  } else {
    zoom /= 1.1;
    maxIter = Math.max(50, maxIter - 5);
  }
});

let dragging = false;
let lastX, lastY;

canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    const dx = (e.clientX - lastX) / canvas.height / zoom;
    const dy = (e.clientY - lastY) / canvas.height / zoom;
    centerX -= dx;
    centerY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

// ---- Render loop ----
function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(u_resolution, canvas.width, canvas.height);
  gl.uniform2f(u_center, centerX, centerY);
  gl.uniform1f(u_zoom, zoom);
  gl.uniform1i(u_maxIter, maxIter);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
