import Stats from 'stats-js';
import { getResizeEl } from "./helper";
import GLRenderer from './gl_renderer';
import vShader from "../plugin/v_shader.glsl";
import fShader from "../plugin/f_shader.glsl";
import mapVShader from "../plugin/map_v_shader.glsl";
import mapFShader from "../plugin/map_f_shader.glsl";

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

let canvas = getResizeEl(document.getElementById("webgl"));

let glRenderer;

let timeInfo = {
  time: 0
};

glRenderer = new GLRenderer(canvas, vShader, fShader, mapVShader, mapFShader);

animate();

function animate(){
  stats && stats.begin();
  glRenderer && glRenderer.update(timeInfo.time);
  stats && stats.end();
  requestAnimationFrame(animate);
}