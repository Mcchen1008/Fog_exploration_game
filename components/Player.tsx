import React, { useRef, useEffect } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  onPositionChange: (pos: THREE.Vector3) => void;
}

export const Player: React.FC<PlayerProps> = ({ onPositionChange }) => {
  const { camera } = useThree();
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    position: [0, 5, 0], 
    fixedRotation: true,
    linearDamping: 0.5
  }));

  // Movement state
  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 0, 0]);
  
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);
  useEffect(() => api.position.subscribe((p) => {
      position.current = p;
      onPositionChange(new THREE.Vector3(p[0], p[1], p[2]));
  }), [api.position, onPositionChange]);

  // Input handling
  const keys = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    // Movement Logic
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
        0, 
        0, 
        (keys.current['ArrowDown'] || keys.current['KeyS'] ? 1 : 0) - (keys.current['ArrowUp'] || keys.current['KeyW'] ? 1 : 0)
    );
    const sideVector = new THREE.Vector3(
        (keys.current['ArrowLeft'] || keys.current['KeyA'] ? 1 : 0) - (keys.current['ArrowRight'] || keys.current['KeyD'] ? 1 : 0),
        0, 
        0
    );

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(5);

    // Apply velocity
    api.velocity.set(direction.x, velocity.current[1], direction.z);

    // Jump
    if (keys.current['Space'] && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], 5, velocity.current[2]);
    }

    // Camera Follow Logic (God View / Isometric)
    const pos = new THREE.Vector3(position.current[0], position.current[1], position.current[2]);
    
    // Smooth lerp for camera
    // Camera is offset by [10, 10, 10] relative to player
    const offset = new THREE.Vector3(12, 12, 12); 
    const targetCameraPos = pos.clone().add(offset);
    
    camera.position.lerp(targetCameraPos, 0.1);
    camera.lookAt(pos);
  });

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[0.8, 1.5, 0.8]} />
      <meshStandardMaterial color="#ef4444" /> {/* Red Explorer */}
      {/* Backpack */}
      <mesh position={[0, 0.2, -0.5]}>
         <boxGeometry args={[0.6, 0.8, 0.3]} />
         <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2, 0.4, 0.41]}>
         <boxGeometry args={[0.1, 0.1, 0.05]} />
         <meshStandardMaterial color="black" />
      </mesh>
       <mesh position={[-0.2, 0.4, 0.41]}>
         <boxGeometry args={[0.1, 0.1, 0.05]} />
         <meshStandardMaterial color="black" />
      </mesh>
    </mesh>
  );
};
