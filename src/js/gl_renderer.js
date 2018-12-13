import { getWebGLContext, createProgram } from './cuon-utils';

const MAPSIZE = 1024;

class GLRenderer {
  constructor(canvas, vshader, fshader) {
    this.timestamp = (new Date()).getTime();
    this.canvas = canvas;
    this.gl = getWebGLContext(canvas, {
      preserveDrawingBuffer: false
    }, false);
    if (!this.gl) {
      console.log("Failed to get the rendering context for WebGL");
      return;
    }
    this.gl.getExtension('OES_standard_derivatives');
    this.gl.getExtension('EXT_shader_texture_lod');
    this.program = createProgram(this.gl, vshader, fshader);
    this.program.attributeLocation = {};
    this.program.uniformLocation = {};

    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    // this.gl.enable(this.gl.BLEND);
    this.gl.clearColor(1.0, 1.0, 1.0, 0.0);

    this.setAttribute(
      this.program,
      "a_Position",
      new Float32Array([
        -1.0,
        -1.0,

        1.0,
        -1.0,

        -1.0,
        1.0,

        -1.0,
        1.0,

        1.0,
        -1.0,

        1.0,
        1.0
      ]),
      2,
      "FLOAT"
    );
    this.setUniform2v(this.program, "u_resolution", [
      canvas.width,
      canvas.height
    ]);
  }
  setUniform2v(program, name, data) {
    let location;
    if (program.uniformLocation[name]) {
      location = program.uniformLocation[name];
    } else {
      location = this.gl.getUniformLocation(program, name);
      program[name] = location;
    }
    if (location < 0) {
      console.log(`Failed to get the storage location of ${name}`);
      return false;
    }
    let dataArray = new Float32Array(data);
    this.gl.useProgram(program);
    this.gl.uniform2fv.call(this.gl, location, dataArray);
  }
  setUniform1i(program, name, data){
    let location;
    if (program.uniformLocation[name]) {
      location = program.uniformLocation[name];
    } else {
      location = this.gl.getUniformLocation(program, name);
      program[name] = location;
    }
    if (location < 0) {
      console.log(`Failed to get the storage location of ${name}`);
      return false;
    }
    this.gl.useProgram(program);
    this.gl.uniform1i.call(this.gl, location, data);
  };
  setUniform1f(program, name, data) {
    let location;
    if (program.uniformLocation[name]) {
      location = program.uniformLocation[name];
    } else {
      location = this.gl.getUniformLocation(program, name);
      program[name] = location;
    }
    if (location < 0) {
      console.log(`Failed to get the storage location of ${name}`);
      return false;
    }
    this.gl.useProgram(program);
    this.gl.uniform1f.call(this.gl, location, data);
  };
  setAttribute(program, name, data, num, typeName) {
    let location;
    if (program.attributeLocation[name] && program.attributeLocation[name] >= 0) {
      location = program.attributeLocation[name];
    } else {
      location = this.gl.getAttribLocation(program, name);
      program.attributeLocation[name] = location;
    }
    if (location < 0) {
      console.log(`Failed to get the storage location of ${name}`);
      return false;
    }
    let buffer = this.gl.createBuffer();
    if (!buffer) {
      console.log("Failed to create the buffer object");
      return false;
    }
    this.gl.useProgram(program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(location, num, this.gl[typeName], false, 0, 0);
    this.gl.enableVertexAttribArray(location);

    return true;
  }
  initFramebufferObject() {
    let _this = this;
    let gl = _this.gl;
    let framebuffer, texture, depthBuffer;
    let OFFSCREEN_WIDTH = MAPSIZE,
      OFFSCREEN_HEIGHT = MAPSIZE;
    let error = function () {
      if (framebuffer) gl.deleteFramebuffer(framebuffer);
      if (texture) gl.deleteTexture(texture);
      if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
      return null;
    };
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      console.log("Failed to create frame buffer object");
      return error();
    }
    texture = gl.createTexture(); // Create a texture object
    if (!texture) {
      console.log("Failed to create texture object");
      return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      OFFSCREEN_WIDTH,
      OFFSCREEN_HEIGHT,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Create a renderbuffer object and Set its size and parameters
    depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
    if (!depthBuffer) {
      console.log("Failed to create renderbuffer object");
      return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      OFFSCREEN_WIDTH,
      OFFSCREEN_HEIGHT
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    framebuffer.texture = texture; // Store the texture object

    // Check if FBO is configured correctly
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
      console.log("Frame buffer object is incomplete: " + e.toString());
      return error();
    }

    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
  }
  loadMap(imageUrl){
    const _this = this;
    const gl = _this.gl;
    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      width, height, border, srcFormat, srcType,
      pixel);
    const img = new Image();
    img.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, img);
      if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    img.src = imageUrl;
    return texture;
  }
  drawScene() {
    let _this = this;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, _this.canvas.width, _this.canvas.height);
    this.gl.useProgram(this.program);
    this.setUniform1f(this.program, "u_time", (new Date().getTime() - this.timestamp) / 1000);
    this.setAttribute(this.program, "a_Position", new Float32Array([
        -1.0,
        -1.0,

        1.0,
        -1.0,

        -1.0,
        1.0,

        -1.0,
        1.0,

        1.0,
        -1.0,

        1.0,
        1.0
      ]), 2, "FLOAT");
    this.setUniform2v(this.program, "u_resolution", [
      this.canvas.width,
      this.canvas.height
    ]);
    this.gl.activeTexture(this.gl.TEXTURE0);
    if(this.texture){
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
    this.setUniform1f(this.program, "u_map", 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
  update() {
    this.drawScene();
  }
}

function isPowerOf2(val){
  return (val & (val - 1)) == 0;
}

export {
  GLRenderer as default
};