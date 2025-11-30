import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { noise2D } from '../utils/noise';

interface PropsData {
  mines: [number, number, number][];
  trees: [number, number, number][];
  animals: [number, number, number][];
}

interface PropsLayerComponent {
  seed: number;
  onEnterMine: () => void;
  playerPos: THREE.Vector3;
}

export const PropsLayer: React.FC<PropsLayerComponent> = ({ seed, onEnterMine, playerPos }) => {
  const data: PropsData = useMemo(() => {
    const _mines: [number, number, number][] = [];
    const _trees: [number, number, number][] = [];
    const _animals: [number, number, number][] = [];
    
    const range = 80; // Scatter range

    for (let i = 0; i < 60; i++) {
        const x = (Math.random() - 0.5) * range * 2;
        const z = (Math.random() - 0.5) * range * 2;
        
        // Get height at this pos to place on ground
        let y = noise2D(x * 0.01, z * 0.01) * 10;
        y += noise2D(x * 0.03, z * 0.03) * 5;
        y += noise2D(x * 0.1, z * 0.1) * 1;
        
        if (y < 0) continue; // Don't place underwater

        const r = Math.random();
        if (r > 0.95 && y > 2) {
             _mines.push([x, y, z]);
        } else if (r > 0.6 && y > 1 && y < 12) {
            _trees.push([x, y, z]);
        } else if (r < 0.1 && y > 1) {
            _animals.push([x, y, z]);
        }
    }
    return { mines: _mines, trees: _trees, animals: _animals };
  }, [seed]);

  // Check mine proximity
  React.useEffect(() => {
    if(!playerPos) return;
    for(const m of data.mines) {
        const dist = playerPos.distanceTo(new THREE.Vector3(m[0], m[1], m[2]));
        if (dist < 2.5) {
            onEnterMine();
        }
    }
  }, [playerPos, data.mines, onEnterMine]);

  return (
    <group>
        {/* Mines */}
        {data.mines.map((pos, i) => (
            <group key={`mine-${i}`} position={new THREE.Vector3(...pos)}>
                <mesh position={[0, 1, 0]}>
                    <dodecahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial color="#1f2937" emissive="#000000" />
                </mesh>
                <pointLight distance={5} intensity={2} color="purple" />
                <mesh position={[0, 3, 0]}>
                     <boxGeometry args={[0.2, 2, 0.2]} />
                     <meshStandardMaterial color="brown" />
                </mesh>
                 <mesh position={[0, 4, 0]}>
                     <boxGeometry args={[1.5, 0.5, 0.1]} />
                     <meshStandardMaterial color="white" />
                </mesh>
            </group>
        ))}

        {/* Trees (Instanced logic simplified to simple map for demo clarity) */}
        {data.trees.map((pos, i) => (
             <group key={`tree-${i}`} position={new THREE.Vector3(...pos)}>
                {/* Trunk */}
                <mesh position={[0, 1, 0]} castShadow>
                    <cylinderGeometry args={[0.2, 0.3, 2]} />
                    <meshStandardMaterial color="#3f2c22" />
                </mesh>
                {/* Leaves */}
                <mesh position={[0, 2.5, 0]} castShadow>
                    <coneGeometry args={[1.2, 3, 4]} />
                    <meshStandardMaterial color="#166534" />
                </mesh>
             </group>
        ))}

        {/* Animals */}
        {data.animals.map((pos, i) => (
            <Animal key={`anim-${i}`} position={pos} />
        ))}
    </group>
  );
};

// Simple animated animal
const Animal: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const ref = React.useRef<THREE.Group>(null);
    const [offset] = React.useState(Math.random() * 100);
    
    useFrame(({ clock }) => {
        if(ref.current) {
            const t = clock.getElapsedTime() + offset;
            // Hop animation
            ref.current.position.y = position[1] + Math.abs(Math.sin(t * 5)) * 0.5;
            // Rotate
            ref.current.rotation.y = Math.sin(t * 0.5);
        }
    });

    return (
        <group ref={ref} position={new THREE.Vector3(...position)}>
            <mesh castShadow position={[0, 0.25, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.2, 0.6, 0.2]}>
                 <sphereGeometry args={[0.05]} />
                 <meshBasicMaterial color="black" />
            </mesh>
            <mesh position={[-0.2, 0.6, 0.2]}>
                 <sphereGeometry args={[0.05]} />
                 <meshBasicMaterial color="black" />
            </mesh>
        </group>
    )
}