export const ColorGradientShader = {
  uniforms: {
    tDiffuse: { value: null },
    width: { value: window.innerWidth },
    height: { value: window.innerHeight },
    speed: { value: 1.0 }, // New uniform for controlling intensity
  },
  vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float width;  
      uniform float speed;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float xPosition = vUv.x;
        vec3 leftColor = vec3(1, .75, .75);
        vec3 rightColor = vec3(.75, .75, 1); // Blue
        vec3 color = mix(leftColor, rightColor, xPosition);
        color = mix(vec3(1.0, 1.0, 1.0), color, speed * speed); // Interpolate based on speed
        gl_FragColor = vec4(texel.rgb * color, texel.a);
      }
    `,
};
