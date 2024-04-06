import React, { useRef, useEffect } from "react";

import { splitmix32 } from "./helpers/splitmix32";

type Star = {
 x: number;
 y: number;
 z: number;
 size: number;
};

const generateStar = (
 rng: ReturnType<typeof splitmix32>,
 x?: number
) => {
 const U = rng.next();
 const lambda = 1;
 const z = -Math.log(1 - U) / lambda;
 let baseSize = rng.next() * 2 + 1;
 baseSize = 0.75 + baseSize / 4;
 const distanceModifier = 0.75 + z / 4;
 const size = baseSize * distanceModifier;

 return {
  x: x || rng.next() * 2 - 1,
  y: rng.next() * 2 - 1,
  z: z,
  size: size,
 };
};

export const Stars: React.FC = () => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const fpsRef = useRef<HTMLDivElement>(null);

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

  const loadShader = (
   type: number,
   source: string
  ): WebGLShader | null => {
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

  // Modified Vertex Shader Source to include size attribute
  const vsSource = `
      attribute vec4 aVertexPosition;
      attribute float aPointSize; // Added size attribute
      void main() {
        gl_Position = aVertexPosition;
        gl_PointSize = aPointSize; // Use the size attribute for the point size
      }
    `;

  const fsSource = `
      precision mediump float;
      void main() {
        // float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        // if (r > 0.5) {
        //   discard;
        // }
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
      }
    `;

  const vertexShader = loadShader(
   gl.VERTEX_SHADER,
   vsSource
  );
  const fragmentShader = loadShader(
   gl.FRAGMENT_SHADER,
   fsSource
  );
  if (!vertexShader || !fragmentShader) {
   return;
  }

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
   console.error("Unable to create shader program");
   return;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (
   !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)
  ) {
   alert(
    "Unable to initialize the shader program: " +
     gl.getProgramInfoLog(shaderProgram)
   );
   return;
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Setup for size attribute
  const sizeBuffer = gl.createBuffer();

  const position = gl.getAttribLocation(
   shaderProgram,
   "aVertexPosition"
  );
  const size = gl.getAttribLocation(
   shaderProgram,
   "aPointSize"
  );

  gl.enableVertexAttribArray(position);

  let lastTime = Date.now();
  const numStarsOnScreen = 1000;
  const starBaseMovementSpeed = 0.5;
  let stars: Star[] = [];
  const seed = Math.floor(Math.random() * 1000000);
  const rng = splitmix32(seed);
  for (let i = 0; i < numStarsOnScreen; i++) {
   stars.push(generateStar(rng));
  }

  const drawScene = () => {
   const deltaTime_s: number =
    (Date.now() - lastTime) / 1000;
   lastTime = Date.now();
   const fps = 1 / deltaTime_s;
   if (fpsRef.current) {
    fpsRef.current.innerText = `FPS: ${fps.toFixed(2)}`;
   }

   stars.forEach((star) => {
    star.x -=
     star.z * starBaseMovementSpeed * deltaTime_s +
     starBaseMovementSpeed / 40;
    if (star.x < -1) {
     star.y = rng.next() * 2 - 1;
     star.x = 1;
    }
   });

   const positions = new Float32Array(
    stars.flatMap((star) => [star.x, star.y])
   );
   const sizes = new Float32Array(
    stars.map((star) => star.size)
   );

   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.STATIC_DRAW
   );
   gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
   );

   // Bind and set size buffer data
   gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
   gl.enableVertexAttribArray(size); // Enable attribute after binding the correct buffer
   gl.vertexAttribPointer(size, 1, gl.FLOAT, false, 0, 0);

   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(shaderProgram);

   gl.drawArrays(gl.POINTS, 0, stars.length);

   requestAnimationFrame(drawScene);
  };

  requestAnimationFrame(drawScene);

  return () => {
   if (shaderProgram) gl.deleteProgram(shaderProgram);
   if (positionBuffer) gl.deleteBuffer(positionBuffer);
   if (sizeBuffer) gl.deleteBuffer(sizeBuffer); // Clean up the size buffer
  };
 }, []);

 return (
  <>
   <canvas
    ref={canvasRef}
    style={{
     position: "fixed",
     backgroundColor: "black",
     left: 0,
     top: 0,
     width: "100%",
     height: "100%",
     zIndex: -1,
    }}
   ></canvas>
   <div
    ref={fpsRef}
    style={{
     position: "fixed",
     color: "white",
     top: 0,
     right: 0,
     zIndex: 100,
    }}
   ></div>
  </>
 );
};
