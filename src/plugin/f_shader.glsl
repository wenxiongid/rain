#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926
#define TWO_PI 6.2831852
#define PIECE 12.0
#define sqart3 1.732050807568877

uniform vec2 u_resolution;
uniform sampler2D u_map;
// uniform float u_time;
varying vec2 v_texCoord;

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  // st.x -= 0.5;
  // st.x *= u_resolution.x / u_resolution.y;
  vec4 color = texture2D(u_map, v_texCoord);
  gl_FragColor = color;
}