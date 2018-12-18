#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_imgResolution;
attribute vec2 a_Position;
varying vec2 v_texCoord;

void main() {
  float ratio = u_resolution.y / u_resolution.x;
  float imgRatio = u_imgResolution.y / u_imgResolution.x;
  if(imgRatio >= ratio){
    v_texCoord.x = a_Position.x * 0.5 + 0.5;
    v_texCoord.y = a_Position.y / imgRatio * ratio * 0.5 + 0.5;
  }else{
    float w = u_resolution.x / u_resolution.y;
    float imgW = u_imgResolution.x / u_imgResolution.y;
    v_texCoord.y = a_Position.y * 0.5 + 0.5;
    v_texCoord.x = a_Position.x / imgW * w * 0.5 + 0.5;
  }
  gl_Position = vec4(a_Position, 0.0, 1.0);
}