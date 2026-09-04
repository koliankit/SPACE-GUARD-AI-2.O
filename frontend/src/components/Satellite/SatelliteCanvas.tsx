import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Pause, Play, Crosshair, Radio, Shield, Eye, Maximize2, Compass } from 'lucide-react';
import { SatelliteModel } from './SatelliteModel';
import { ComponentResult } from '../../types';
import { getComponentSpatialMapping } from '../../config/satelliteMapping';

interface CameraControllerProps {
  targetPosition: [number, number, number] | null;
  cameraPreset?: string | null;
}

const CameraController: React.FC<CameraControllerProps> = ({ targetPosition, cameraPreset }) => {
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTargetVec = useRef(new THREE.Vector3(0, 1.4, 4.2));

  useEffect(() => {
    if (cameraPreset === 'nadir') {
      targetVec.current.set(0, -0.2, 0.7);
      cameraTargetVec.current.set(0, -0.2, 2.4);
    } else if (cameraPreset === 'dish') {
      targetVec.current.set(0, 1.2, 0);
      cameraTargetVec.current.set(0, 2.2, 2.6);
    } else if (cameraPreset === 'solar') {
      targetVec.current.set(1.5, 0, 0);
      cameraTargetVec.current.set(2.8, 1.2, 3.2);
    } else if (targetPosition) {
      targetVec.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      cameraTargetVec.current.set(
        targetPosition[0] * 1.5,
        targetPosition[1] + 0.8,
        targetPosition[2] + 2.0
      );
    } else {
      targetVec.current.set(0, 0, 0);
      cameraTargetVec.current.set(0, 1.4, 4.2);
    }
  }, [targetPosition, cameraPreset]);

  useFrame(({ camera }) => {
    camera.position.lerp(cameraTargetVec.current, 0.06);
    camera.lookAt(targetVec.current);
  });

  return null;
};

// Realistic Curved Earth Horizon with Atmospheric Limb Scattering
const EarthHorizon: React.FC = () => {
  return (
    <group position={[0, -22.5, -6]}>
      {/* Earth Surface Sphere */}
      <mesh receiveShadow>
        <sphereGeometry args={[20, 64, 64]} />
        <meshStandardMaterial
          color="#062846"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {/* Atmospheric Scattering Glow Shell */}
      <mesh>
        <sphereGeometry args={[20.3, 64, 64]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Cloud layer */}
      <mesh>
        <sphereGeometry args={[20.1, 48, 48]} />
        <meshStandardMaterial
          color="#E2E8F0"
          transparent
          opacity={0.25}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
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
  const [cameraPreset, setCameraPreset] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const focusedMapping = selectedComponentId
    ? getComponentSpatialMapping(selectedComponentId)
    : null;

  const handleResetCamera = () => {
    setCameraPreset(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden select-none hud-scanline">
      {/* 3D R3F Canvas */}
      <Canvas
        camera={{ position: [0, 1.4, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030712']} />

        {/* Realistic Space Lighting */}
        <ambientLight intensity={0.25} />
        {/* Direct Solar Radiation (Key Sun Light) */}
        <directionalLight
          position={[10, 12, 8]}
          intensity={2.0}
          color="#FFFDF7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {/* Earth Albedo Bounce Light (Cyan/Blue Reflection from below) */}
        <directionalLight
          position={[0, -6, -2]}
          intensity={0.8}
          color="#0284C7"
        />
        {/* Rim Backlight */}
        <pointLight position={[-6, 4, -8]} intensity={0.6} color="#00E5FF" />

        {/* Deep Space Background Stars */}
        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.8} />

        {/* Earth Horizon Below */}
        <EarthHorizon />

        {/* 3D ISRO Satellite Model */}
        <SatelliteModel
          selectedComponentId={selectedComponentId}
          componentResults={componentResults}
          onSelectComponent={onSelectComponent}
          isRotating={isRotating}
        />

        {/* Camera glide controller */}
        <CameraController
          targetPosition={focusedMapping?.position || null}
          cameraPreset={cameraPreset}
        />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1.6}
          maxDistance={11}
          dampingFactor={0.06}
        />
      </Canvas>

      {/* ==================================================================== */}
      {/* ISRO SDSC-SHAR TACTICAL MISSION CONTROL OVERLAYS                     */}
      {/* ==================================================================== */}

      {/* Top Left: ISRO Mission Telemetry Reticle */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col space-y-1.5">
        <div className="flex items-center space-x-2 bg-[#060D1A]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1E3A6E] shadow-2xl corner-box">
          <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#00E5FF]">
            ISRO // SDSC SHAR FLIGHT TELEMETRY
          </span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-[#101F3C] text-[#00FF9D] font-mono border border-[#00FF9D]/30">
            AOCS LOCKED
          </span>
        </div>

        <div className="bg-[#060D1A]/80 backdrop-blur-sm px-3 py-1.5 rounded border border-[#162A50] text-[10px] font-mono text-slate-300 space-y-0.5">
          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">NORAD / BUS:</span>
            <span className="text-[#00FF9D] font-bold">59482 (EOS-08 / ISRO)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">ORBIT / ALT:</span>
            <span className="text-white">SSO 541.2 KM (INC: 97.45°)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">VELOCITY:</span>
            <span className="text-white">7.61 KM/S (27,396 KM/H)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-slate-400">GROUND STATION:</span>
            <span className="text-[#00E5FF] font-semibold">ISTRAC BLR-01 [AOS]</span>
          </div>
        </div>
      </div>

      {/* Top Right: Selected Component Flight Target Lock */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <div className="bg-[#060D1A]/90 backdrop-blur-md px-3 py-2 rounded border border-[#1E3A6E] shadow-2xl max-w-xs corner-box text-right">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">AEROSPACE TARGET:</span>
            <span className="text-xs font-mono font-bold text-[#00E5FF]">
              {selectedComponentId || 'PRIMARY BUS CORE'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-300 mt-0.5">
            {focusedMapping ? (
              <span className="text-[#00FF9D] font-semibold">{focusedMapping.subsystem}</span>
            ) : (
              <span className="text-slate-400">3-Axis Sun-Pointing Nominal</span>
            )}
          </div>
        </div>
      </div>

      {/* Center Tactical Crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-16 h-16 border border-[#00E5FF]/40 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full" />
        </div>
      </div>

      {/* Bottom Center: Camera Tactical View Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-[#060D1A]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#1E3A6E] shadow-2xl pointer-events-auto">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition flex items-center space-x-1 ${
            isRotating
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause rotation' : 'Resume rotation'}
        >
          {isRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isRotating ? 'ORBIT ACTIVE' : 'ORBIT HOLD'}</span>
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A6E] mx-1" />

        <button
          onClick={() => setCameraPreset('dish')}
          className={`px-2 py-1 rounded text-[10px] font-mono transition ${
            cameraPreset === 'dish' ? 'bg-[#00E5FF] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          HGA DISH
        </button>

        <button
          onClick={() => setCameraPreset('nadir')}
          className={`px-2 py-1 rounded text-[10px] font-mono transition ${
            cameraPreset === 'nadir' ? 'bg-[#00E5FF] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          NADIR LENS
        </button>

        <button
          onClick={() => setCameraPreset('solar')}
          className={`px-2 py-1 rounded text-[10px] font-mono transition ${
            cameraPreset === 'solar' ? 'bg-[#00E5FF] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          SOLAR WING
        </button>

        <div className="w-[1px] h-4 bg-[#1E3A6E] mx-1" />

        <button
          onClick={handleResetCamera}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#101F3C] transition"
          title="Reset Camera View"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Right: Real-Time Telemetry Lock Bar */}
      <div className="absolute bottom-3 right-3 pointer-events-none hidden sm:block">
        <div className="bg-[#060D1A]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#162A50] text-[10px] font-mono text-slate-400 flex items-center space-x-2">
          <Radio className="w-3 h-3 text-[#00FF9D] animate-pulse" />
          <span>RF S-BAND:</span>
          <span className="text-[#00FF9D] font-bold">2.25 GHz (-82 dBm)</span>
        </div>
      </div>
    </div>
  );
};
