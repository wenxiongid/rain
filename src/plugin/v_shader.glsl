attribute vec2 a_Position;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
  v_texCoord = a_Position / 2.0 + 0.5;
}