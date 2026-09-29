import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { ShaderGradientCanvas, ShaderGradient } from 'https://esm.sh/@shadergradient/react@2.4.20?deps=react@18.3.1,react-dom@18.3.1,three@0.160.0,@react-three/fiber@8.17.10';

const mount = document.querySelector('#site-shader-gradient');

if (mount) {
  const root = createRoot(mount);
  const motionIsAllowed = () => !document.documentElement.classList.contains('motion-off');
  let readyTimer;

  const revealCanvas = () => {
    if (!mount.querySelector('canvas') || mount.classList.contains('shader-ready')) return;
    clearTimeout(readyTimer);
    readyTimer = setTimeout(() => {
      requestAnimationFrame(() => mount.classList.add('shader-ready'));
    }, 1200);
  };

  const canvasObserver = new MutationObserver(revealCanvas);
  canvasObserver.observe(mount, { childList: true, subtree: true });

  const render = () => root.render(
    React.createElement(
      ShaderGradientCanvas,
      {
        style: { position: 'absolute', inset: 0 },
        pixelDensity: 1,
        fov: 45,
        gl: { antialias: true, powerPreference: 'high-performance' }
      },
      React.createElement(ShaderGradient, {
        animate: motionIsAllowed() ? 'on' : 'off',
        axesHelper: 'off',
        bgColor1: '#000000',
        bgColor2: '#000000',
        brightness: 1.2,
        cAzimuthAngle: 180,
        cDistance: 3.6,
        cPolarAngle: 90,
        cameraZoom: 1,
        color1: '#ff5005',
        color2: '#dbba95',
        color3: '#d0bce1',
        envPreset: 'city',
        grain: 'on',
        lightType: '3d',
        positionX: -1.4,
        positionY: 0,
        positionZ: 0,
        range: 'disabled',
        rangeEnd: 40,
        rangeStart: 0,
        reflection: 0.1,
        rotationX: 0,
        rotationY: 10,
        rotationZ: 50,
        shader: 'defaults',
        type: 'plane',
        uAmplitude: 1,
        uDensity: 1.3,
        uFrequency: 5.5,
        uSpeed: 0.4,
        uStrength: 4,
        uTime: 0,
        wireframe: false
      })
    )
  );

  render();
  revealCanvas();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
