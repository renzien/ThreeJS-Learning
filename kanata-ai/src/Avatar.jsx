import React, { useEffect, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

export default function Avatar({ isSpeaking }) {
  const gltf = useLoader(GLTFLoader, '/kanata_v1.1.vrm', (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const vrm = gltf.userData.vrm;

  const blinkTimer = useRef(0);
  const nextBlink = useRef(3);
  const isBlinking = useRef(false);

  useEffect(() => {
    if (vrm) {
      vrm.scene.rotation.y = Math.PI;
      const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
      if (leftArm) { leftArm.rotation.z = 1.3; leftArm.rotation.y = 0.5; }
      if (rightArm) { rightArm.rotation.z = -1.3; rightArm.rotation.y = -0.5; }
      if (vrm.expressionManager) {

        const smileIntensity = 0.2; 
        vrm.expressionManager.setValue('happy', smileIntensity);
        
        vrm.expressionManager.update();
      }
    }
  }, [vrm]);

  useFrame((state, delta) => {
    if (!vrm) return;

    const t = state.clock.getElapsedTime();
    const chest = vrm.humanoid.getNormalizedBoneNode('chest');
    if (chest) {
      chest.rotation.y = Math.sin(t * 2.0) * 0.05;
    }

    if (vrm.expressionManager) {
      blinkTimer.current += delta;
      if (blinkTimer.current > nextBlink.current) {
        isBlinking.current = true;
      }
      if (isBlinking.current) {
        vrm.expressionManager.setValue('blink', 1);
        if (blinkTimer.current > nextBlink.current + 0.1) {
          vrm.expressionManager.setValue('blink', 0);
          isBlinking.current = false;
          blinkTimer.current = 0;
          nextBlink.current = 2 + Math.random() * 3;
        }
      }
      vrm.expressionManager.update();
    }
    
    vrm.update(delta);
  });

  return (
    <primitive object={vrm.scene} position={[0, -1.5, 0]} />
  );
}