import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { splitmix32 } from "./helpers/splitmix32";
import { generateStar } from "./helpers/starGenerator";
import {
 BackgroundColor,
 SpeedOfLightKmS,
} from "./constants";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

const starColors = ["#cccccc"];
const MAX_SHIP_SPEED = 20000;
const NUM_STARS = 2000;
const baseGeometry = new THREE.CircleGeometry(1, 6);
baseGeometry.rotateZ(Math.PI / 2);

function lerpColor(
 color1: string,
 color2: string,
 t: number
) {
 let r1 = parseInt(color1.substring(1, 3), 16);
 let g1 = parseInt(color1.substring(3, 5), 16);
 let b1 = parseInt(color1.substring(5, 7), 16);

 let r2 = parseInt(color2.substring(1, 3), 16);
 let g2 = parseInt(color2.substring(3, 5), 16);
 let b2 = parseInt(color2.substring(5, 7), 16);

 let r = Math.round(r1 + (r2 - r1) * t);
 let g = Math.round(g1 + (g2 - g1) * t);
 let b = Math.round(b1 + (b2 - b1) * t);

 return (
  "#" +
  ((1 << 24) + (r << 16) + (g << 8) + b)
   .toString(16)
   .slice(1)
 );
}

function shakeCamera(
 camera: THREE.Camera,
 duration = 500,
 magnitude = 0.05
) {
 const startTime = performance.now();
 const shake = () => {
  const elapsed = performance.now() - startTime;
  const remaining = duration - elapsed;

  if (remaining > 0) {
   const x = (Math.random() * 2 - 1) * magnitude;
   const y = (Math.random() * 2 - 1) * magnitude;

   camera.position.x += x;
   camera.position.y += y;

   requestAnimationFrame(shake);
  } else {
   camera.position.x = 0;
   camera.position.y = 0;
  }
 };
 shake();
}

const generateStars = (width: number, height: number) => {
 const stars = [];
 const rng = splitmix32(0x12345678);
 const materials = starColors.map(
  (color) =>
   new THREE.MeshBasicMaterial({
    color: color,
   })
 );
 for (let i = 0; i < NUM_STARS; i++) {
  const star = generateStar(rng);
  const size = 1 + star.z * 2;
  const geometry = new THREE.CircleGeometry(size, 6);
  geometry.rotateZ(Math.PI / 2);
  const circle = new THREE.Mesh(
   baseGeometry,
   materials[Math.floor(rng.next() * materials.length)]
  );
  circle.scale.setScalar(1 + star.z * 2);
  circle.position.x = star.x * width;
  circle.position.y = star.y * height;
  circle.position.z = star.z;
  stars.push(circle);
 }
 return stars;
};

const ThreeCanvas: React.FC = () => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const targetShipSpeed = useRef<number>(0);
 const shipSpeed = useRef<number>(0);
 const playerShipSpeed =
  useSelector(
   (state: RootState) =>
    state.game.players.find((p) => p.id === state.player.id)
     ?.velocity_km_s
  ) || 0;

 useEffect(() => {
  targetShipSpeed.current =
   playerShipSpeed / SpeedOfLightKmS;
 }, [playerShipSpeed]);

 useEffect(() => {
  if (!canvasRef.current) return;

  let dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth * dpr;
  let height = window.innerHeight * dpr;
  let stars = generateStars(width * 1.1, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
   width / -2,
   width / 2,
   height / 2,
   height / -2,
   1,
   1000
  );
  shakeCamera(camera, 500, 0.05);
  camera.position.z = 500; // adjust accordingly

  for (const star of stars) {
   scene.add(star);
  }

  const renderer = new THREE.WebGLRenderer({
   canvas: canvasRef.current,
   antialias: true,
  });
  renderer.setClearColor(BackgroundColor);
  const adjustCanvas = () => {
   dpr = window.devicePixelRatio || 1;
   width = window.innerWidth * dpr;
   height = window.innerHeight * dpr;
   renderer.setSize(width, height, false);
   camera.updateProjectionMatrix();
  };
  adjustCanvas();

  let lastTime = 0;
  const render = () => {
   const time = performance.now();
   const delta_s = (time - lastTime) / 1000;
   lastTime = performance.now();
   stars[0].material.color.set(
    lerpColor(
     "#ffffff",
     BackgroundColor,
     shipSpeed.current * 0.6
    )
   );
   stars.forEach((star) => {
    const speed =
     shipSpeed.current * MAX_SHIP_SPEED * star.position.z;
    star.scale.x = Math.max(
     star.scale.y,
     shipSpeed.current * star.position.z * 600
    );
    star.position.x -= speed * delta_s;
    if (star.position.x < -width) {
     star.position.x = width;
     star.position.y = (Math.random() * 2 - 1) * height;
    }
   });

   // lerp towards target speed
   shipSpeed.current +=
    (targetShipSpeed.current - shipSpeed.current) * 0.05;

   // Screen shake
   const x =
    (Math.random() * 2 - 1) *
    shipSpeed.current *
    shipSpeed.current *
    5;
   const y =
    (Math.random() * 2 - 1) *
    shipSpeed.current *
    shipSpeed.current *
    5;
   camera.position.x = x;
   camera.position.y = y;

   requestAnimationFrame(render);
   renderer.render(scene, camera);
   // composer.render();
  };

  window.addEventListener("resize", adjustCanvas, false);
  render();

  return () => {
   window.removeEventListener("resize", adjustCanvas);
   scene.clear();
   renderer.dispose();
   // composer.dispose();
  };
 }, []);

 return (
  <canvas
   ref={canvasRef}
   style={{
    width: "100%",
    height: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: -1,
   }}
  />
 );
};

export default ThreeCanvas;
