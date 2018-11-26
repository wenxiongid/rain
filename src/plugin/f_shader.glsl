#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926
#define TWO_PI 6.2831852
#define PIECE 12.0
#define sqart3 1.732050807568877

uniform vec2 u_resolution;
uniform sampler2D u_map;
uniform float u_time;
varying vec2 v_texCoord;

vec2 hexagon(vec2 center, vec2 st){
  vec2 toCenter = center - st;
  // toCenter.x *= u_resolution.x / u_resolution.y;
  float theta = atan(toCenter.y, toCenter.x);
  theta = theta / TWO_PI + 0.5;
  theta *= PIECE;
  float index = floor(theta);
  theta = fract(theta);
  if(mod(index, 2.0) > 0.0){
    theta = 1.0 - theta;
  }
  theta *= TWO_PI / PIECE;
  float d = length(toCenter);
  return vec2(cos(theta) * d, sin(theta) * d);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st.x *= u_resolution.x / u_resolution.y;
  st.y *= 2.0 * sqart3;
  st.x *= 3.0;
  // st.x *= 3.0;


  vec2 i_st = floor(st);
  vec2 f_st = fract(st);
  if(mod(i_st.y, 2.0) > 0.0){
    f_st.x += 0.5;
  }
  f_st = fract(st);

  vec3 color = vec3(0.0);
  color += step(0.98, f_st.x);
  color += step(0.98, f_st.y);
  vec2 center = vec2(0.0);

  float min_dist = 1.0;

  for(int i = 0; i < 7; i++){
    vec2 i_diff = vec2(0.0);
    if(i == 0){
      i_diff = vec2(-1.0, -1.0);
    }
    if(i == 1){
      i_diff = vec2(0.0, -1.0);
    }
    if(i == 2){
      i_diff = vec2(-1.0, 0.0);
    }
    if(i == 3){
      i_diff = vec2(0.0, 0.0);
    }
    if(i == 4){
      i_diff = vec2(1.0, 0.0);
    }
    if(i == 5){
      i_diff = vec2(-1.0, 1.0);
    }
    if(i == 6){
      i_diff = vec2(0.0, 1.0);
    }
    vec2 neighbor = i_st + i_diff;
    if(mod(neighbor.y, 2.0) > 0.0){
      neighbor.x += 0.5;
    }
    vec2 point = neighbor + 0.5;
    vec2 diff = point - st;
    diff.y /= 1.15;
    float dist = length(diff);
    if(dist < min_dist){
      min_dist = dist;
      center = point;
    }
  }

  vec2 hex_st = hexagon(center, st);
  hex_st = fract(hex_st);

  // color += min_dist;
  color += 1.0 - step(0.2, min_dist);
  gl_FragColor = vec4(color, 1.0);
  // gl_FragColor = vec4(hex_st, 0.0, 1.0);
  // gl_FragColor = texture2D(u_map, hex_st);
  // gl_FragColor = texture2D(u_map, v_texCoord);
}