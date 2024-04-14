import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { splitmix32 } from "./helpers/splitmix32";
import { generateStar } from "./helpers/starGenerator";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { ColorGradientShader } from "./ColorGradientShader";

const starColors = ["#68c2d3", "#a2dcc7"];
const MAX_SHIP_SPEED = 20000;
const NUM_STARS = 2000;
const baseGeometry = new THREE.CircleGeometry(1, 6);
baseGeometry.rotateZ(Math.PI / 2);

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
  const [inputSpeed, setInputSpeed] = React.useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shipSpeed = useRef<number>(0.5);

  useEffect(() => {
    shipSpeed.current = inputSpeed;
  }, [inputSpeed]);

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
    camera.position.z = 500; // adjust accordingly

    for (const star of stars) {
      scene.add(star);
    }

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setClearColor("#3a3858");
    const adjustCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth * dpr;
      height = window.innerHeight * dpr;
      renderer.setSize(width, height, false);
      camera.updateProjectionMatrix();
    };
    adjustCanvas();

    // const composer = new EffectComposer(renderer);
    // composer.addPass(new RenderPass(scene, camera));
    // const colorGradientShader = new ShaderPass(ColorGradientShader);
    // composer.addPass(colorGradientShader);

    let lastTime = 0;
    const render = () => {
      // colorGradientShader.uniforms.speed.value =
      //   shipSpeed.current * shipSpeed.current * shipSpeed.current;

      const time = performance.now();
      const delta_s = (time - lastTime) / 1000;
      lastTime = performance.now();
      stars.forEach((star) => {
        // exponentially map from 0 to MAX_SHIP_SPEED
        const speed = shipSpeed.current * MAX_SHIP_SPEED * star.position.z;
        star.scale.x = Math.max(
          1,
          shipSpeed.current * shipSpeed.current * star.position.z * 600
        );
        star.position.x -= speed * delta_s;
        if (star.position.x < -width) {
          star.position.x = width;
          star.position.y = (Math.random() * 2 - 1) * height;
        }
      });

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
    <>
      <div className="fixed left-[50%] bottom-[50%] transform translate-x-[-50%] translate-y-[-50%] flex flex-col space-y-4">
        <div className="text-white text-3xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          {Math.trunc(inputSpeed * 299792).toLocaleString()} km/s
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step=".01"
          value={inputSpeed}
          onChange={(e) => setInputSpeed(parseFloat(e.target.value))}
          className="w-96 h-4 bg-neutral-600 rounded-full appearance-none"
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </>
  );
};

export default ThreeCanvas;
