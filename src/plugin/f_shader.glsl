#extension GL_OES_standard_derivatives : enable

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

vec3 N13(float p) {
  //  from DAVE HOSKINS
  vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float Saw(float b, float t) {
	return S(0., b, t)*S(1., b, t);
}

float N(float t) {
	return fract(sin(t*10234.324)*123423.23512);
}

vec4 Blur(sampler2D map, vec2 uv, float offset){
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

vec2 DropLayer2(vec2 uv, float t) {
    vec2 UV = uv;
    
    uv.y += t*0.75;
    vec2 a = vec2(6., 1.);
    vec2 grid = a*2.;
    vec2 id = floor(uv*grid);
    
    float colShift = N(id.x); 
    uv.y += colShift;
    
    id = floor(uv*grid);
    vec3 n = N13(id.x*35.2+id.y*2376.1);
    vec2 st = fract(uv*grid)-vec2(.5, 0);
    
    float x = n.x-.5;
    
    float y = UV.y*20.;
    float wiggle = sin(y+sin(y));
    x += wiggle*(.5-abs(x))*(n.z-.5);
    x *= .7;
    float ti = fract(t+n.z);
    y = (Saw(.85, ti)-.5)*.9+.5;
    vec2 p = vec2(x, y);
    
    float d = length((st-p)*a.yx);
    
    float mainDrop = S(.4, .0, d);
    
    float r = sqrt(S(1., y, st.y));
    float cd = abs(st.x-x);
    float trail = S(.23*r, .15*r*r, cd);
    float trailFront = S(-.02, .02, st.y-y);
    trail *= trailFront*r*r;
    
    y = UV.y;
    float trail2 = S(.2*r, .0, cd);
    float droplets = max(0., (sin(y*(1.-y)*120.)-st.y))*trail2*trailFront*n.z;
    y = fract(y*10.)+(st.y-.5);
    float dd = length(st-vec2(x, y));
    droplets = S(.3, 0., dd);
    float m = mainDrop+droplets*r*trailFront;
    
    //m += st.x>a.y*.45 || st.y>a.x*.165 ? 1.2 : 0.;
    return vec2(m, trail);
}

vec2 fog(vec2 st){
  vec2 uv = st;
  uv *= 100.0;
  vec2 id = floor(uv);
  uv = fract(uv);
  uv.x += N(id.y);
  
  id = floor(uv);
  uv = fract(uv);
  uv -= 0.5;
  float d = length(uv);
  float m = S(0.5, 0.0, d);
  // if(uv.x > 0.485 || uv.y > 0.485) m = 1.0;
  // return vec2(m);
  return uv * m;
}

float StaticDrops(vec2 uv, float t) {
  // grid
	uv *= 40.;
  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;
  // random point in grid
  vec3 n = N13(id.x * 123.4 + id.y * 456.4);
  vec2 p = (n.xy - 0.5) * 0.7;
  float d = length(uv - p);
  float c = S(0.3, 0.0, d);

  // quick in and slow out
  float fade = Saw(0.025, fract(t + n.z));
  c *= fade;

  // random weight
  c *= fract(n.z * 10.0);
  
  // if(uv.x > 0.485 || uv.y > 0.485) c = 1.0;
  return c;
}

vec3 Drops(vec2 uv, float t, float l1, float l2, float l3){
  float s = StaticDrops(uv, t) * l1;
  vec2 m1 = DropLayer2(uv, t) * l2;
  vec2 m2 = DropLayer2(uv * 1.85, t) * l3;
  float c = s + m1.x + m2.x;
  c = S(0.3, 1.0, c);
  return vec3(c);
}

void main(){
  vec2 st = v_texCoord;
  float t = u_time;

  float minBlur = 1.0;
  float maxBlur = 3.0;
  float focus = 0.0;

  vec2 fogDistord = fog(st) * 0.1;
  fogDistord += fog(st * 5.0) * 0.2;

  // st.x += sin(st.y * 70.0) * 0.0005;
  // st.y += sin(st.x * 170.0) * 0.0005;
  vec4 color = vec4(0.0);

  // color += Blur(u_map, st - rainDistord * 0.5, 2.0);
  // color += texture2D(u_map, st + fogDistord);
  // color = vec4(vec3(StaticDrops(st, t)), 1.0);

  vec3 c = Drops(st, t, 1.0, 0.75, 0.5);
  vec2 n = vec2(dFdx(c.x), dFdy(c.x));
  focus = mix(maxBlur - c.y, minBlur, S(0.1, 0.2, c.x));
  color += Blur(u_map, st + n, focus);

  gl_FragColor = color;
}