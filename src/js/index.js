import { getResizeEl } from "./helper";
import GLRenderer from './gl_renderer';
import vShader from "../plugin/v_shader.glsl";
import fShader from "../plugin/f_shader.glsl";
import Stats from 'stats-js';
import bgImg from '../img/sample.jpg';
// import bgImg from '../img/bg.jpg';

import '../sass/index.sass';

// init stats.js
let stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);
// init stats.js end

let canvas = getResizeEl(document.getElementById("webgl"));
function touchmoveHandler(e){
  e.preventDefault();
}
canvas.addEventListener('touchmove', touchmoveHandler, false);

let glRenderer;

let timeInfo = {
  time: 0
};

glRenderer = new GLRenderer(canvas, vShader, fShader);
glRenderer.loadMap(bgImg);

animate();

function animate(){
  stats && stats.begin();
  glRenderer && glRenderer.update(timeInfo.time);
  stats && stats.end();
  requestAnimationFrame(animate);
}