import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, SoftShadows, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import * as THREE from 'three';

import { World } from './components/World';
import { Player } from './components/Player';
import { PropsLayer } from './components/Props';
import { UI } from './components/UI';
import { BiomeType } from './types';
import { generateJournalEntry } from './services/geminiService';

export default function App() {
  const [seed, setSeed] = useState(Math.random() * 1000);
  const [currentBiome, setCurrentBiome] = useState<BiomeType>(BiomeType.GRASSLAND);
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const [log, setLog] = useState<string | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);

  // Callback when entering a "mine" (reset world)
  const handleEnterMine = useCallback(() => {
    // Simple transition effect logic could go here
    const newSeed = Math.random() * 1000;
    setSeed(newSeed);
    setLog("I've emerged from the caverns into a new land...");
  }, []);

  // AI Journal Logic
  const handleGenerateLog = async () => {
    setLoadingLog(true);
    // Determine context based on biome and random chance of features
    const nearby = [];
    if (Math.random() > 0.5) nearby.push("strange glowing mushrooms");
    if (Math.random() > 0.5) nearby.push("distant roar of a beast");
    if (playerPos.y > 10) nearby.push("thin air");
    if (playerPos.y < 0) nearby.push("salty spray");

    const text = await generateJournalEntry(currentBiome, "Dusk", nearby);
    setLog(text);
    setLoadingLog(false);
  };

  return (
    <div className="relative w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 10, 10], fov: 45 }}>
        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} inclination={0.6} azimuth={0.1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
        >
            <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
        </directionalLight>

        <SoftShadows size={10} samples={8} focus={0.5} />

        {/* Mist/Fog: The "Fog of War" effect. 
            Using simple exponential fog creates the "surrounded by mist" effect 
            that clears as you get closer (visually, things emerge from fog)
        */}
        <fog attach="fog" args={['#d4d4d8', 5, 30]} />

        {/* Physics World */}
        <Physics gravity={[0, -9.8, 0]}>
            <Player onPositionChange={setPlayerPos} />
            <World 
                seed={seed} 
                onBiomeChange={setCurrentBiome} 
                playerPos={playerPos} 
            />
        </Physics>

        {/* Decor */}
        <PropsLayer seed={seed} onEnterMine={handleEnterMine} playerPos={playerPos} />
      </Canvas>

      <UI 
        currentBiome={currentBiome} 
        onGenerateLog={handleGenerateLog}
        log={log}
        loading={loadingLog}
      />
    </div>
  );
}
