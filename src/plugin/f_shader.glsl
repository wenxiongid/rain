#ifdef GL_ES
precision mediump float;
#endif

#define S(x, y, z) smoothstep(x, y, z)
#define PI 3.1415926
#define TWO_PI 6.2831852
#define PI 3.1415926

uniform vec2 u_resolution;
uniform sampler2D u_map;
uniform float u_time;
varying vec2 v_texCoord;

float N(float t) {
	return fract(sin(t*10234.324)*123423.23512);
}

vec4 blur(sampler2D map, vec2 uv, float offset){
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(0.0, 5.0) * 1.3846153846;
  vec2 off2 = vec2(5.0, 0.0) * 3.2307692308;
  float angle = 0.0;
  const int segment = 5;
  for(int i = 0; i < segment; i++){
    angle = PI / float(segment) * float(i);
    off1 = vec2(cos(angle), sin(angle)) * 1.3846153846 * offset;
    off2 = vec2(sin(angle), cos(angle)) * 3.2307692308 * offset;
    color += texture2D(map, uv) * 0.2270270270;
    color += texture2D(map, uv + (off1 / u_resolution)) * 0.3162162162;
    color += texture2D(map, uv - (off1 / u_resolution)) * 0.3162162162;
    color += texture2D(map, uv + (off2 / u_resolution)) * 0.0702702703;
    color += texture2D(map, uv - (off2 / u_resolution)) * 0.0702702703;
  }
  color /= float(segment);

  return color;
}

vec2 rain(vec2 uv, float t){
  t *= 2.0;
  vec2 a = vec2(3.0, 1.0);
  vec2 st = uv * a;

  vec2 id = floor(st);

  st.y += t * 0.22;
  float n = N(id.x);
  st.y += n;
  uv.y += n;

  id = floor(st);
  st = fract(st) - 0.5;

  t += fract(sin(id.x * 712.67 + id.y * 2342.2) * 1223.2) * 6.23;
  float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.42;
  vec2 p1 = vec2(0.0, y);
  vec2 o1 = (st - p1) / a;
  float d = length(o1);
  float m1 = S(0.07, 0.0, d);

  vec2 a2 = vec2(1.0, 2.0);
  vec2 o2 = (fract(uv * a.x * a2) - 0.5) / a2;
  d = length(o2);
  float m2 = S(0.3 * (0.5 - st.y), 0.0, d) * S(-0.1, 0.1, st.y - p1.y);

  // if(st.x > 0.46 || st.y >0.485) m1 = 1.0;
  return vec2(m1 * o1 * 30.0 + m2 * o2 * 10.0);
}

void main(){
  vec2 st = v_texCoord;
  float t = u_time;
  vec2 rainDistord = rain(st * 15.0, t) * 0.2;
  rainDistord += rain(st * 12.0, t * 1.5) * 0.3;

  st.x += sin(st.y * 70.0) * 0.0005;
  st.y += sin(st.x * 170.0) * 0.0005;
  vec4 color = vec4(0.0);

  color += blur(u_map, st - rainDistord * 0.5, 2.0);
  // color += texture2D(u_map, st - rainDistord * 0.5) * 0.5;
  
  gl_FragColor = color;
}