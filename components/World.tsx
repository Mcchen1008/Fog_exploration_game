import React, { useMemo, useRef, useEffect } from 'react';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { initNoise, noise2D } from '../utils/noise';
import { BiomeType } from '../types';

interface WorldProps {
  seed: number;
  onBiomeChange: (biome: BiomeType) => void;
  playerPos: THREE.Vector3;
}

// Colors for biomes
const COLORS = {
  deepWater: new THREE.Color('#1e40af'),
  water: new THREE.Color('#3b82f6'),
  sand: new THREE.Color('#fcd34d'),
  grass: new THREE.Color('#4ade80'),
  forest: new THREE.Color('#15803d'),
  rock: new THREE.Color('#57534e'),
  snow: new THREE.Color('#f3f4f6'),
};

export const World: React.FC<WorldProps> = ({ seed, onBiomeChange, playerPos }) => {
  // Physics body for the ground
  // We use a simple flat plane for physics collision to prevent complexity/falling through mesh holes
  // In a full game, this would use a heightfield physics body.
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -2, 0], // Slightly below visual mesh to allow "sinking" into water slightly
    material: { friction: 0.1 }
  }));

  const meshRef = useRef<THREE.Mesh>(null);
  const size = 128; // Size of the world chunk
  const segments = 128; // Resolution

  // Generate Geometry Data
  const { positions, colors, biomeMap } = useMemo(() => {
    initNoise(seed);
    const posAttribute = new Float32Array((segments + 1) * (segments + 1) * 3);
    const colAttribute = new Float32Array((segments + 1) * (segments + 1) * 3);
    const bMap: BiomeType[] = [];

    const width = segments + 1;
    const depth = segments + 1;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < depth; j++) {
        const x = (i - segments / 2) * 1.5; // Scale world
        const z = (j - segments / 2) * 1.5;
        
        // Multi-octave noise
        let y = noise2D(x * 0.01, z * 0.01) * 10;
        y += noise2D(x * 0.03, z * 0.03) * 5;
        y += noise2D(x * 0.1, z * 0.1) * 1;
        
        // Flatten water areas
        if (y < -2) y = -2; 

        const index = (i * width + j);
        
        // Position
        posAttribute[index * 3] = x;
        posAttribute[index * 3 + 1] = y;
        posAttribute[index * 3 + 2] = z;

        // Determine Biome & Color
        let color = COLORS.grass;
        let biome = BiomeType.GRASSLAND;

        if (y <= -2) { color = COLORS.deepWater; biome = BiomeType.OCEAN; }
        else if (y < 0) { color = COLORS.water; biome = BiomeType.OCEAN; }
        else if (y < 1.5) { color = COLORS.sand; biome = BiomeType.BEACH; }
        else if (y < 6) { color = COLORS.grass; biome = BiomeType.GRASSLAND; }
        else if (y < 12) { color = COLORS.forest; biome = BiomeType.FOREST; }
        else if (y < 18) { color = COLORS.rock; biome = BiomeType.MOUNTAIN; }
        else { color = COLORS.snow; biome = BiomeType.SNOW; }

        colAttribute[index * 3] = color.r;
        colAttribute[index * 3 + 1] = color.g;
        colAttribute[index * 3 + 2] = color.b;
        
        bMap.push(biome);
      }
    }

    return { positions: posAttribute, colors: colAttribute, biomeMap: bMap };
  }, [seed]);

  // Update logic to detect current biome based on player position
  useEffect(() => {
    if (!playerPos) return;
    
    // Map player x/z to grid index
    // Note: This matches the generation logic scaling above
    const gridScale = 1.5;
    const halfSize = (segments * gridScale) / 2;
    
    const localX = playerPos.x + halfSize;
    const localZ = playerPos.z + halfSize;
    
    const gridX = Math.floor(localX / gridScale);
    const gridZ = Math.floor(localZ / gridScale);

    const width = segments + 1;
    
    if (gridX >= 0 && gridX < width && gridZ >= 0 && gridZ < width) {
      const index = gridZ + gridX * width; // Transposed access logic depending on loop order
      const current = biomeMap[index];
      if (current) onBiomeChange(current);
    }
  }, [playerPos.x, playerPos.z, biomeMap, onBiomeChange]);

  // Set geometry attributes manually to ensure updates
  useEffect(() => {
    if (meshRef.current) {
      const geom = meshRef.current.geometry;
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geom.computeVertexNormals();
    }
  }, [positions, colors]);

  return (
    <group>
      {/* Visual Terrain */}
      <mesh ref={meshRef} receiveShadow castShadow>
        <planeGeometry args={[size * 1.5, size * 1.5, segments, segments]} />
        <meshStandardMaterial 
          vertexColors 
          flatShading 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Physics Plane (Invisible) */}
      <mesh ref={ref as any}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Water Surface for visual effect at sea level */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
