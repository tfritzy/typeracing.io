import React, { useRef, useEffect } from "react";
import { splitmix32 } from "./helpers/splitmix32";

type Star = {
 x: number;
 y: number;
 z: number;
 size: number;
 speed: number;
};

const generateStar = (
 rng: ReturnType<typeof splitmix32>,
 x?: number
) => {
 const U = rng.next();
 const lambda = 1;
 let z = -Math.log(1 - U) / lambda;
 z = 0.5 + z / 2;
 let baseSize = rng.next() * 2 + 1;
 baseSize = 0.75 + baseSize / 4;
 const distanceModifier = 0.75 + z / 4;
 const size = baseSize * distanceModifier;

 return {
  x: x || rng.next() * 4 - 2,
  y: rng.next() * 2 - 1,
  z: z,
  size: size,
  speed: 0,
 };
};

export const Stars: React.FC = () => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const speedRef = useRef<HTMLInputElement>(null);

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

  const vsSource = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform vec2 uScale;
      void main() {
        gl_Position = vec4(aVertexPosition * uScale, 0, 1.0);
      }
    `;

  const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
      }
    `;

  // Load and compile shaders
  const vertexShader = loadShader(
   gl.VERTEX_SHADER,
   vsSource
  );
  const fragmentShader = loadShader(
   gl.FRAGMENT_SHADER,
   fsSource
  );

  // Link shaders to create our program
  const shaderProgram = gl.createProgram();
  if (!shaderProgram || !vertexShader || !fragmentShader) {
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

  // Create buffers
  const positionBuffer = gl.createBuffer();
  const textureCoordBuffer = gl.createBuffer();

  const positionLocation = gl.getAttribLocation(
   shaderProgram,
   "aVertexPosition"
  );
  const textureCoordLocation = gl.getAttribLocation(
   shaderProgram,
   "aTextureCoord"
  );
  const scaleLocation = gl.getUniformLocation(
   shaderProgram,
   "uScale"
  );

  let lastTime = Date.now();
  const numStarsOnScreen = 1000;
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

   const starBaseMovementSpeed: number =
    speedRef.current?.valueAsNumber || 0;
   stars.forEach((star) => {
    star.speed =
     star.z * starBaseMovementSpeed +
     starBaseMovementSpeed / 40;
    star.x -= star.speed * deltaTime_s;
    if (star.x < -2) {
     star.y = rng.next() * 2 - 1;
     star.x = 2;
    }
   });

   const positions = [];
   const textureCoords = [];
   for (let star of stars) {
    const x1 =
     star.x -
     star.size * 0.001 * Math.max(star.speed, 0.1) * 10;
    const x2 =
     star.x +
     star.size * 0.001 * Math.max(star.speed, 0.1) * 10;
    const y1 = star.y - star.size * 0.001;
    const y2 = star.y + star.size * 0.001;
    positions.push(
     x1,
     y1,
     x2,
     y1,
     x1,
     y2,
     x1,
     y2,
     x2,
     y1,
     x2,
     y2
    );
    textureCoords.push(0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1);
   }

   const positionsArray = new Float32Array(positions);
   const textureCoordsArray = new Float32Array(
    textureCoords
   );

   // Set positions
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.bufferData(
    gl.ARRAY_BUFFER,
    positionsArray,
    gl.STATIC_DRAW
   );
   gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
   );
   gl.enableVertexAttribArray(positionLocation);

   // Set texture coordinates
   gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
   gl.bufferData(
    gl.ARRAY_BUFFER,
    textureCoordsArray,
    gl.STATIC_DRAW
   );
   gl.vertexAttribPointer(
    textureCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
   );
   gl.enableVertexAttribArray(textureCoordLocation);

   // Set uniform
   gl.uniform2f(scaleLocation, 1.0, 1.0); // Adjust scale if needed

   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(shaderProgram);

   // Draw quads
   gl.drawArrays(gl.TRIANGLES, 0, stars.length * 6);

   requestAnimationFrame(drawScene);
  };

  requestAnimationFrame(drawScene);

  return () => {
   if (shaderProgram) gl.deleteProgram(shaderProgram);
   if (positionBuffer) gl.deleteBuffer(positionBuffer);
   if (textureCoordBuffer)
    gl.deleteBuffer(textureCoordBuffer);
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
   <input
    ref={speedRef}
    type="range"
    min="0"
    max="5"
    step="0.01"
    defaultValue={0.1}
    style={{
     position: "fixed",
     bottom: "47%",
     left: "25%",
     width: "50%",
     zIndex: 100,
    }}
   />
  </>
 );
};
