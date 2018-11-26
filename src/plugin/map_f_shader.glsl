#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926
#define TWO_PI 6.2831852

uniform vec2 u_resolution;
uniform float u_time;

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float n11(float seed){
  return fract(sin(seed * 1234.0) * 4567.0);
}

float n21(vec2 st){
  return n11(st.x) * n11(st.y);
}

vec3 hsb2rgb( in vec3 c ){
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                            6.0)-3.0)-1.0,
                    0.0,
                    1.0 );
  rgb = rgb*rgb*(3.0-2.0*rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st.x *= 3.0;
  st.y *= 3.0;

  vec3 color = vec3(0.0, 0.0, 0.0);

  vec2 i_st = floor(st);
  vec2 f_st = fract(st);


  float min_dist = 2.0;

  for(int y = -1; y <= 1; y++){
    for(int x = -1; x <= 1; x++){
      vec2 neighbor = vec2(float(x), float(y));
      vec2 seed = i_st + neighbor;
      vec2 point = random2(seed);
      point = 0.5 + 0.5 * sin(u_time / 5.0 + TWO_PI * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if(dist < min_dist){
        min_dist = dist;
      }
    }
  }

  vec3 l_color = hsb2rgb(vec3(sin(u_time / 200.0), 0.5, 1.0));
  // color = mix(vec3(1.0), color, sec_min_dist - min_dist);

  color += min_dist * min_dist * l_color;
  // color += 1.0 - step(0.02, min_dist);

  gl_FragColor = vec4(color, 1.0);

  // st = gl_FragCoord.xy / u_resolution;
  // gl_FragColor = vec4(st, 0.0, 1.0);
}