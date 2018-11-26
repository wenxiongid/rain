import { getResizeEl } from "./helper";
import GLRenderer from './gl_renderer';
import anime from 'animejs';
import Shake from 'shake.js';
import vShader from "../plugin/v_shader.glsl";
import fShader from "../plugin/f_shader.glsl";
import mapVShader from "../plugin/map_v_shader.glsl";
import mapFShader from "../plugin/map_f_shader.glsl";

let stats;

if (window.Stats) {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

let canvas = getResizeEl(document.getElementById("webgl"));

let myShakeEvent = new Shake({
  threshold: 15,
  timeout: 1000
});
myShakeEvent.start();

let glRenderer;

let timeInfo = {
  time: 0
};

glRenderer = new GLRenderer(canvas, vShader, fShader, mapVShader, mapFShader);

function updateTime(){
  anime({
    targets: timeInfo,
    time: timeInfo.time + 10000,
    easing: 'linear',
    duration: 300
  });
}

animate();

function animate(){
  stats && stats.begin();
  glRenderer && glRenderer.update(timeInfo.time);
  stats && stats.end();
  requestAnimationFrame(animate);
}

document.addEventListener('touchend', updateTime, false);

window.addEventListener("shake", updateTime, false);