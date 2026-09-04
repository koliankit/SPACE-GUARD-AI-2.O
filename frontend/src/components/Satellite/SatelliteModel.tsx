import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ComponentResult, DecisionType } from '../../types';
import { getComponentSpatialMapping } from '../../config/satelliteMapping';

interface SatelliteModelProps {
  selectedComponentId?: string | null;
  componentResults?: Record<string, ComponentResult>;
  onSelectComponent?: (componentId: string) => void;
  isRotating?: boolean;
}

export const SatelliteModel: React.FC<SatelliteModelProps> = ({
  selectedComponentId,
  componentResults = {},
  onSelectComponent,
  isRotating = true,
}) => {
  const mainGroupRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);
  const solarWingsRef = useRef<THREE.Group>(null);
  const hudRingRef = useRef<THREE.Group>(null);
  const pulseTimer = useRef<number>(0);

  // Smooth, rational rotational motion & gyroscopic spin (Lag-free 60 FPS)
  useFrame((state, delta) => {
    pulseTimer.current += delta * 3.5;

    if (mainGroupRef.current && isRotating) {
      // Continuous, rational orbital rotation that never stutters or hangs
      mainGroupRef.current.rotation.y += delta * 0.22;
      // Gentle micro-attitude float
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.025;
    }

    // Solar array micro-tracking
    if (solarWingsRef.current) {
      solarWingsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.04;
    }

    // Rotating 3D holographic targeting reticle
    if (hudRingRef.current) {
      hudRingRef.current.rotation.z += delta * 1.5;
    }
  });

  // Active component spatial lookup and status
  const activeTarget = selectedComponentId
    ? getComponentSpatialMapping(selectedComponentId)
    : null;

  const getComponentStatus = (compId: string): DecisionType => {
    return componentResults[compId]?.decision || 'SAFE';
  };

  const activeDecision: DecisionType = selectedComponentId
    ? getComponentStatus(selectedComponentId)
    : 'SAFE';

  const isReject = activeDecision === 'REJECT';
  const isMonitor = activeDecision === 'MONITOR';

  // Universal target color
  const targetHighlightColor = isReject ? '#FF0055' : isMonitor ? '#FFB800' : '#00E5FF';

  // Subsystem active test
  const activeSubsystem = activeTarget?.physicalModelId || '';

  const isFCActive = activeSubsystem === 'flightComputer' || (selectedComponentId && selectedComponentId.includes('FC'));
  const isPwrActive = activeSubsystem === 'powerDistribution' || (selectedComponentId && selectedComponentId.includes('PWR'));
  const isBatActive = activeSubsystem === 'batteryModule' || (selectedComponentId && selectedComponentId.includes('BAT'));
  const isComActive = activeSubsystem === 'rfTransceiver' || (selectedComponentId && selectedComponentId.includes('COM'));
  const isNavActive = activeSubsystem === 'navigationIMU' || (selectedComponentId && selectedComponentId.includes('NAV'));
  const isTelActive = activeSubsystem === 'telemetryUnit' || (selectedComponentId && selectedComponentId.includes('TEL'));
  const isThmActive = activeSubsystem === 'thermalController' || (selectedComponentId && (selectedComponentId.includes('THM') || selectedComponentId.includes('PROP')));
  const isPayActive = activeSubsystem === 'payloadSensor' || (selectedComponentId && selectedComponentId.includes('PAY'));
  const isRwActive = activeSubsystem === 'reactionWheels' || (selectedComponentId && selectedComponentId.includes('RW'));
  const isSolActive = activeSubsystem.includes('solarArray') || (selectedComponentId && selectedComponentId.includes('SOL'));

  return (
    <group ref={mainGroupRef} dispose={null}>
      {/* ==================================================================== */}
      {/* 1. PRIMARY SATELLITE CORE (Gold Kapton MLI Blanket Bus)              */}
      {/* ==================================================================== */}
      <group position={[0, 0, 0]}>
        {/* Main Cuboid Core Chassis */}
        <mesh>
          <boxGeometry args={[1.3, 1.5, 1.3]} />
          <meshStandardMaterial
            color="#D97706"
            metalness={0.92}
            roughness={0.25}
          />
        </mesh>

        {/* Quilted Thermal MLI Facets (Gold Foil Thermal Shield) */}
        {[-0.66, 0.66].map((xOffset, i) => (
          <mesh key={`mli-x-${i}`} position={[xOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.2, 1.4]} />
            <meshStandardMaterial
              color="#B45309"
              metalness={0.95}
              roughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Aluminized Silver Mylar Radiator Panel (Zenith & Nadir Deck) */}
        <mesh position={[0, 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.28, 1.28]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.28, 1.28]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* ISRO Insignia / Mission Identification Plate */}
        <mesh position={[0, 0.45, 0.66]}>
          <planeGeometry args={[0.9, 0.22]} />
          <meshStandardMaterial color="#0A1120" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Tricolor Accent Line (Saffron, White, Green) */}
        <mesh position={[0, 0.54, 0.665]}>
          <planeGeometry args={[0.8, 0.02]} />
          <meshBasicMaterial color="#FF7700" />
        </mesh>
        <mesh position={[0, 0.51, 0.665]}>
          <planeGeometry args={[0.8, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.48, 0.665]}>
          <planeGeometry args={[0.8, 0.02]} />
          <meshBasicMaterial color="#00FF9D" />
        </mesh>

        {/* Titanium Internal Propellant Tanks */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`tank-${i}`} position={[0, 0, z]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 2. REACTION WHEEL ASSEMBLY (AOCS Momentum Wheels)                    */}
      {/* ==================================================================== */}
      <group position={[0, -0.05, 0]}>
        {[
          { pos: [0.15, 0, 0], rot: [0, 0, Math.PI / 2] },
          { pos: [-0.15, 0.15, 0], rot: [Math.PI / 2, 0, 0] },
          { pos: [0, -0.15, 0.15], rot: [0, 0, 0] },
        ].map((rw, i) => (
          <mesh key={`rw-${i}`} position={rw.pos as [number, number, number]} rotation={rw.rot as [number, number, number]}>
            <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
            <meshStandardMaterial
              color={isRwActive ? targetHighlightColor : '#334155'}
              emissive={isRwActive ? targetHighlightColor : '#000000'}
              emissiveIntensity={isRwActive ? 0.8 : 0.0}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 3. MAIN PROPULSION (ISRO 440N Liquid Apogee Motor - LAM)             */}
      {/* ==================================================================== */}
      <group
        position={[0, -0.76, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-THM-01');
        }}
      >
        {/* Engine Gimbal Mount Ring */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.1, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* LAM Conical Nozzle Bell */}
        <mesh position={[0, -0.32, 0]}>
          <coneGeometry args={[0.32, 0.48, 24, 1, true]} />
          <meshStandardMaterial
            color={isThmActive ? targetHighlightColor : '#1C1917'}
            emissive={isThmActive ? targetHighlightColor : '#000000'}
            emissiveIntensity={isThmActive ? 0.7 : 0.0}
            metalness={0.95}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Combustion Chamber Core Glow */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.12, 16]} />
          <meshStandardMaterial color="#B45309" emissive="#FF7700" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* 4. REACTION CONTROL SYSTEM (RCS Thruster Pods on 4 Corners)          */}
      {/* ==================================================================== */}
      {[
        [0.72, 0.65, 0.72],
        [-0.72, 0.65, 0.72],
        [0.72, 0.65, -0.72],
        [-0.72, 0.65, -0.72],
      ].map((pos, i) => (
        <group key={`rcs-pod-${i}`} position={pos as [number, number, number]}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.08, 10]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <coneGeometry args={[0.03, 0.08, 10]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ==================================================================== */}
      {/* 5. DUAL PHOTOVOLTAIC SOLAR ARRAYS (Port & Starboard Wings)           */}
      {/* ==================================================================== */}
      <group ref={solarWingsRef}>
        {/* --- STARBOARD (RIGHT) SOLAR WING --- */}
        <group
          position={[0.65, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.('COMP-SOL-02');
          }}
        >
          {/* SADM Motor */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 14]} />
            <meshStandardMaterial color="#64748B" metalness={0.9} />
          </mesh>

          {/* Graphite Yoke */}
          <mesh position={[0.45, 0, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>

          {/* 3 High-Efficiency Solar Panels */}
          {[0.8, 1.5, 2.2].map((xPos, idx) => (
            <group key={`sp-right-${idx}`} position={[xPos, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.66, 0.025, 1.55]} />
                <meshStandardMaterial color="#0A0F1D" metalness={0.6} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.015, 0]}>
                <boxGeometry args={[0.62, 0.005, 1.48]} />
                <meshStandardMaterial
                  color={isSolActive ? targetHighlightColor : '#024C82'}
                  emissive={isSolActive ? targetHighlightColor : '#000000'}
                  emissiveIntensity={isSolActive ? 0.4 : 0.0}
                  metalness={0.88}
                  roughness={0.15}
                />
              </mesh>
              {/* Busbars */}
              {[-0.6, -0.2, 0.2, 0.6].map((zLine, j) => (
                <mesh key={`busbar-r-${idx}-${j}`} position={[0, 0.019, zLine]}>
                  <boxGeometry args={[0.62, 0.002, 0.008]} />
                  <meshBasicMaterial color="#E5A93B" />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* --- PORT (LEFT) SOLAR WING --- */}
        <group
          position={[-0.65, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.('COMP-SOL-01');
          }}
        >
          {/* SADM Motor */}
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 14]} />
            <meshStandardMaterial color="#64748B" metalness={0.9} />
          </mesh>

          {/* Graphite Yoke */}
          <mesh position={[-0.45, 0, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>

          {/* 3 Panels */}
          {[-0.8, -1.5, -2.2].map((xPos, idx) => (
            <group key={`sp-left-${idx}`} position={[xPos, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.66, 0.025, 1.55]} />
                <meshStandardMaterial color="#0A0F1D" metalness={0.6} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.015, 0]}>
                <boxGeometry args={[0.62, 0.005, 1.48]} />
                <meshStandardMaterial
                  color={isSolActive ? targetHighlightColor : '#024C82'}
                  emissive={isSolActive ? targetHighlightColor : '#000000'}
                  emissiveIntensity={isSolActive ? 0.4 : 0.0}
                  metalness={0.88}
                  roughness={0.15}
                />
              </mesh>
              {[-0.6, -0.2, 0.2, 0.6].map((zLine, j) => (
                <mesh key={`busbar-l-${idx}-${j}`} position={[0, 0.019, zLine]}>
                  <boxGeometry args={[0.62, 0.002, 0.008]} />
                  <meshBasicMaterial color="#E5A93B" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 6. PHYSICAL SUBSYSTEM MODULES (Clickable + Highlightable)            */}
      {/* ==================================================================== */}

      {/* --- FLIGHT COMPUTER & AVIONICS BAY (Front Zenith) --- */}
      <group
        position={[0, 0.25, 0.67]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-FC-03');
        }}
      >
        <mesh>
          <boxGeometry args={[0.55, 0.35, 0.12]} />
          <meshStandardMaterial
            color={isFCActive ? targetHighlightColor : '#38BDF8'}
            emissive={isFCActive ? targetHighlightColor : '#0284C7'}
            emissiveIntensity={isFCActive ? 0.9 : 0.15}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Heat dissipation fins */}
        {[-0.12, -0.04, 0.04, 0.12].map((y, k) => (
          <mesh key={`fc-fin-${k}`} position={[0, y, 0.07]}>
            <boxGeometry args={[0.5, 0.01, 0.03]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* --- POWER DISTRIBUTION UNIT (Starboard) --- */}
      <group
        position={[0.67, -0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PWR-02');
        }}
      >
        <mesh>
          <boxGeometry args={[0.12, 0.45, 0.45]} />
          <meshStandardMaterial
            color={isPwrActive ? targetHighlightColor : '#F59E0B'}
            emissive={isPwrActive ? targetHighlightColor : '#B45309'}
            emissiveIntensity={isPwrActive ? 0.9 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* --- BATTERY ENERGY MODULE (Port) --- */}
      <group
        position={[-0.67, -0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-BAT-01');
        }}
      >
        <mesh>
          <boxGeometry args={[0.12, 0.45, 0.45]} />
          <meshStandardMaterial
            color={isBatActive ? targetHighlightColor : '#10B981'}
            emissive={isBatActive ? targetHighlightColor : '#059669'}
            emissiveIntensity={isBatActive ? 0.9 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* --- HIGH GAIN DISH ANTENNA (Zenith Deck) --- */}
      <group
        ref={dishRef}
        position={[0, 1.25, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-COM-02');
        }}
      >
        {/* Gimbal Mast */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.5, 14]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>

        {/* Parabolic Reflector Dish */}
        <group rotation={[Math.PI / 6, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
            <meshStandardMaterial
              color={isComActive ? targetHighlightColor : '#E2E8F0'}
              emissive={isComActive ? targetHighlightColor : '#000000'}
              emissiveIntensity={isComActive ? 0.8 : 0.0}
              side={THREE.DoubleSide}
              metalness={0.92}
              roughness={0.15}
            />
          </mesh>
          {/* Feedhorn */}
          <mesh position={[0, 0.18, 0.18]}>
            <coneGeometry args={[0.07, 0.14, 12]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* --- DUAL STAR TRACKERS (AOCS) --- */}
      <group
        position={[0.5, 0.72, -0.45]}
        rotation={[Math.PI / 5, Math.PI / 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-NAV-01');
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.1, 0.14, 0.28, 16]} />
          <meshStandardMaterial
            color={isNavActive ? targetHighlightColor : '#38BDF8'}
            emissive={isNavActive ? targetHighlightColor : '#000000'}
            emissiveIntensity={isNavActive ? 0.8 : 0.0}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 14, 1, true]} />
          <meshStandardMaterial color="#0A0F1D" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      </group>

      {/* --- TELEMETRY & S-BAND MAST --- */}
      <group
        position={[-0.5, 0.72, -0.45]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-TEL-01');
        }}
      >
        <mesh>
          <boxGeometry args={[0.26, 0.24, 0.26]} />
          <meshStandardMaterial
            color={isTelActive ? targetHighlightColor : '#94A3B8'}
            emissive={isTelActive ? targetHighlightColor : '#000000'}
            emissiveIntensity={isTelActive ? 0.8 : 0.0}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 10]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.95} />
        </mesh>
      </group>

      {/* --- THERMAL RADIATOR SYSTEM (Base) --- */}
      <group
        position={[0, -0.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-THM-01');
        }}
      >
        <mesh>
          <boxGeometry args={[0.85, 0.12, 0.85]} />
          <meshStandardMaterial
            color={isThmActive ? targetHighlightColor : '#475569'}
            emissive={isThmActive ? targetHighlightColor : '#000000'}
            emissiveIntensity={isThmActive ? 0.8 : 0.0}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* --- EARTH OBSERVATION OPTICAL PAYLOAD --- */}
      <group
        position={[0, -0.2, 0.78]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PAY-01');
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.22, 0.26, 0.42, 24]} />
          <meshStandardMaterial
            color={isPayActive ? targetHighlightColor : '#0284C7'}
            emissive={isPayActive ? targetHighlightColor : '#000000'}
            emissiveIntensity={isPayActive ? 0.9 : 0.0}
            metalness={0.92}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={0.8}
            metalness={0.95}
            roughness={0.02}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* 7. UNIVERSAL 3D HOLOGRAPHIC TARGET BEACON (Locks to Selected Item!)   */}
      {/* ==================================================================== */}
      {activeTarget && (
        <group position={activeTarget.position}>
          {/* Pulsing Target Ring */}
          <group ref={hudRingRef}>
            <mesh>
              <ringGeometry args={[0.24, 0.28, 32]} />
              <meshBasicMaterial
                color={targetHighlightColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Crosshair Brackets */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[0.18, 0.21, 4]} />
              <meshBasicMaterial
                color={targetHighlightColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.95}
              />
            </mesh>
          </group>

          {/* Vertical Laser Guidance Pointer */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.55, 8]} />
            <meshBasicMaterial color={targetHighlightColor} transparent opacity={0.75} />
          </mesh>
          {/* Laser Beacon Sparkle Point */}
          <mesh position={[0, 0.56, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={targetHighlightColor} />
          </mesh>

          {/* High-Visibility 3D Target Marker Plaque */}
          <group position={[0, 0.68, 0]}>
            <mesh>
              <planeGeometry args={[0.85, 0.22]} />
              <meshBasicMaterial color="#030712" side={THREE.DoubleSide} transparent opacity={0.9} />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(0.85, 0.22)]} />
              <lineBasicMaterial color={targetHighlightColor} linewidth={2} />
            </lineSegments>
          </group>
        </group>
      )}
    </group>
  );
};
