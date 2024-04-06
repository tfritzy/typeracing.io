import React, { useRef, useEffect } from "react";

export const Stars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.error(
        "Unable to initialize WebGL. Your browser may not support it."
      );
      return;
    }

    // Function to compile shaders
    const loadShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) {
        console.error("Unable to create shader");
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
          "An error occurred compiling the shaders: " +
            gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    // Shader sources
    const vsSource = `
      uniform float uTime;
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
        gl_Position.x += sin(uTime);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform float uTime;
      void main() {
        gl_FragColor = vec4(abs(sin(uTime)), 0.0, 0.0, 1.0);
      }
    `;

    // Create and compile vertex and fragment shaders
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
      return;
    }

    // Link shaders to create our program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
      console.error("Unable to create shader program");
      return;
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(shaderProgram)
      );
      return;
    }

    const uTimeLocation = gl.getUniformLocation(shaderProgram, "uTime");
    let startTime = Date.now();

    // Set up vertex data (and buffer(s)) and attribute pointers
    const vertices = new Float32Array([
      -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position);

    // Index buffer for the quad
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Draw the scene
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    const drawScene = () => {
      const currentTime = (Date.now() - startTime) / 1000.0; // Time in seconds
      gl.uniform1f(uTimeLocation, currentTime); // Update the time uniform

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(shaderProgram);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(drawScene);
    };

    requestAnimationFrame(drawScene);

    // Cleanup
    return () => {
      if (shaderProgram) gl.deleteProgram(shaderProgram);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      if (indexBuffer) gl.deleteBuffer(indexBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    ></canvas>
  );
};
