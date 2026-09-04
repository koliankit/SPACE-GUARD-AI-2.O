import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Pause, Play, Compass, Crosshair } from 'lucide-react';
import { SatelliteModel } from './SatelliteModel';
import { ComponentResult } from '../../types';
import { getComponentSpatialMapping } from '../../config/satelliteMapping';

interface CameraControllerProps {
  targetPosition: [number, number, number] | null;
}

const CameraController: React.FC<CameraControllerProps> = ({ targetPosition }) => {
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTargetVec = useRef(new THREE.Vector3(0, 1.5, 4.5));

  useEffect(() => {
    if (targetPosition) {
      targetVec.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      // Position camera slightly offset from the focused component
      cameraTargetVec.current.set(
        targetPosition[0] * 1.5,
        targetPosition[1] + 0.8,
        targetPosition[2] + 2.0
      );
    } else {
      targetVec.current.set(0, 0, 0);
      cameraTargetVec.current.set(0, 1.5, 4.5);
    }
  }, [targetPosition]);

  useFrame(({ camera }) => {
    if (targetPosition) {
      camera.position.lerp(cameraTargetVec.current, 0.05);
      camera.lookAt(targetVec.current);
    }
  });

  return null;
};

interface SatelliteCanvasProps {
  selectedComponentId?: string | null;
  componentResults?: Record<string, ComponentResult>;
  onSelectComponent: (componentId: string) => void;
}

export const SatelliteCanvas: React.FC<SatelliteCanvasProps> = ({
  selectedComponentId,
  componentResults = {},
  onSelectComponent,
}) => {
  const [isRotating, setIsRotating] = useState(true);
  const controlsRef = useRef<any>(null);

  // Determine spatial target when component is selected
  const focusedMapping = selectedComponentId
    ? getComponentSpatialMapping(selectedComponentId)
    : null;

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-space-950 overflow-hidden select-none">
      {/* 3D R3F Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#070B14']} />
        
        {/* Aerospace Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Soft blue backlight from Earth reflection */}
        <pointLight position={[-5, -4, -5]} intensity={0.8} color="#0284C7" />
        {/* Accent cyan point light */}
        <pointLight position={[0, 4, 2]} intensity={0.5} color="#38BDF8" />

        {/* Space Background Stars */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        {/* 3D Spacecraft Mesh */}
        <SatelliteModel
          selectedComponentId={selectedComponentId}
          componentResults={componentResults}
          onSelectComponent={onSelectComponent}
          isRotating={isRotating}
        />

        {/* Camera glide controller */}
        <CameraController targetPosition={focusedMapping?.position || null} />

        {/* User Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={12}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Top HUD Banner */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-space-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg">
          <Crosshair className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">
            {selectedComponentId ? (
              <>
                TARGET: <span className="text-cyber-cyan font-bold">{selectedComponentId}</span> (
                {focusedMapping?.subsystem})
              </>
            ) : (
              <>PRIMARY BUS ATTITUDE: <span className="text-emerald-400 font-bold">NOMINAL 3-AXIS STABILIZED</span></>
            )}
          </span>
        </div>

        <div className="bg-space-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-slate-400">
          MISSION SIMULATION
        </div>
      </div>

      {/* Bottom Floating Interactive Controls */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-space-900/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-800 shadow-xl pointer-events-auto">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded text-xs transition flex items-center space-x-1 ${
            isRotating ? 'bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40' : 'text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause rotation' : 'Resume rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-mono">{isRotating ? 'PAUSE' : 'ROTATE'}</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1"
          title="Reset camera view"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">RESET VIEW</span>
        </button>
      </div>

      {/* Subsystem Callout Badge (if selected) */}
      {selectedComponentId && focusedMapping && (
        <div className="absolute bottom-3 right-3 bg-space-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-2xl pointer-events-none max-w-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              {focusedMapping.subsystem.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">{focusedMapping.description}</p>
        </div>
      )}
    </div>
  );
};
