// src/components/ThreeCanvas.tsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { splitmix32 } from "./helpers/splitmix32";
import { generateStar } from "./helpers/starGenerator";

const ThreeCanvas: React.FC = () => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const [shipSpeed, setShipSpeed] = React.useState(0);

 useEffect(() => {
  if (!canvasRef.current) return;

  let dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth * dpr;
  let height = window.innerHeight * dpr;
  let stars: THREE.Mesh[] = [];

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
   width / -2,
   width / 2,
   height / 2,
   height / -2,
   1,
   1000
  );
  camera.position.z = 500; // adjust accordingly

  const renderer = new THREE.WebGLRenderer({
   canvas: canvasRef.current,
  });

  const generateStars = () => {
   scene.clear();

   stars = [];
   const rng = splitmix32(0x12345678);
   for (let i = 0; i < 1000; i++) {
    const star = generateStar(rng);
    const size = 1 + star.z * 2;
    const geometry = new THREE.CircleGeometry(size, 6);
    geometry.rotateZ(Math.PI / 2);
    const color =
     Math.random() > 0.5 ? "#6d58e1" : "#ffde67";
    const material = new THREE.MeshBasicMaterial({
     color: color,
     side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.position.x = star.x * width;
    circle.position.y = star.y * height;
    circle.position.z = star.z;
    scene.add(circle);
    stars.push(circle);
   }
  };

  const adjustCanvas = () => {
   dpr = window.devicePixelRatio || 1;
   width = window.innerWidth * dpr;
   height = window.innerHeight * dpr;
   renderer.setSize(width, height, false);
   camera.updateProjectionMatrix();

   generateStars();
  };

  const render = () => {
   stars.forEach((star) => {
    const speed = star.position.z * 80 * shipSpeed;
    star.scale.x = 1 + speed / 4;
    star.position.x -= speed;
    if (star.position.x < -width) {
     star.position.x = width;
    }
   });

   requestAnimationFrame(render);
   renderer.render(scene, camera);
  };

  window.addEventListener("resize", adjustCanvas, false);
  adjustCanvas();
  render();

  return () => {
   window.removeEventListener("resize", adjustCanvas);
   scene.clear();
   renderer.dispose();
  };
 }, [shipSpeed]);

 return (
  <>
   <input
    type="range"
    min="0"
    max="1"
    step=".01"
    className="bg-black"
    value={shipSpeed}
    onChange={(e) =>
     setShipSpeed(parseFloat(e.target.value))
    }
   />
   <canvas
    ref={canvasRef}
    style={{ width: "100%", height: "100%" }}
   />
  </>
 );
};

export default ThreeCanvas;
