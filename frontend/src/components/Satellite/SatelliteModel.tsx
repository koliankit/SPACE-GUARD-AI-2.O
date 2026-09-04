import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ComponentResult, DecisionType } from '../../types';

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

  // Realistic micro-movements & orbital dynamics
  useFrame((state, delta) => {
    pulseTimer.current += delta * 3;

    if (mainGroupRef.current) {
      if (isRotating && !selectedComponentId) {
        mainGroupRef.current.rotation.y += delta * 0.15;
      }
      // Subtle orbital attitude oscillation
      mainGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }

    // Gentle sun-tracking solar array articulation
    if (solarWingsRef.current) {
      solarWingsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }

    // Rotating HUD targeting reticle
    if (hudRingRef.current) {
      hudRingRef.current.rotation.z += delta * 1.2;
    }
  });

  const getComponentStatus = (compId: string): DecisionType => {
    return componentResults[compId]?.decision || 'SAFE';
  };

  const getStatusColor = (status: DecisionType, isSelected: boolean) => {
    if (status === 'REJECT') return '#FF0055';   // ISRO Critical Crimson
    if (status === 'MONITOR') return '#FFB800';  // ISRO Telemetry Amber
    if (isSelected) return '#00E5FF';            // Tactical Laser Cyan
    return '#00FF9D';                            // ISRO Flight Safe Emerald
  };

  // Subsystem statuses
  const fcStatus = getComponentStatus('COMP-FC-03');
  const pwrStatus = getComponentStatus('COMP-PWR-02');
  const batStatus = getComponentStatus('COMP-BAT-01');
  const comStatus = getComponentStatus('COMP-COM-02');
  const navStatus = getComponentStatus('COMP-NAV-01');
  const telStatus = getComponentStatus('COMP-TEL-01');
  const thmStatus = getComponentStatus('COMP-THM-01');
  const payStatus = getComponentStatus('COMP-PAY-01');

  const isFCSelected = selectedComponentId?.startsWith('COMP-FC');
  const isPwrSelected = selectedComponentId?.startsWith('COMP-PWR');
  const isBatSelected = selectedComponentId?.startsWith('COMP-BAT');
  const isComSelected = selectedComponentId?.startsWith('COMP-COM');
  const isNavSelected = selectedComponentId?.startsWith('COMP-NAV');
  const isTelSelected = selectedComponentId?.startsWith('COMP-TEL');
  const isThmSelected = selectedComponentId?.startsWith('COMP-THM');
  const isPaySelected = selectedComponentId?.startsWith('COMP-PAY');

  return (
    <group ref={mainGroupRef} dispose={null}>
      {/* ==================================================================== */}
      {/* 1. PRIMARY ISRO SATELLITE STRUCTURE (Gold Kapton MLI Blanket Bus)    */}
      {/* ==================================================================== */}
      <group position={[0, 0, 0]}>
        {/* Main Cuboid Core Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.5, 1.3]} />
          <meshStandardMaterial
            color="#D97706"
            metalness={0.92}
            roughness={0.25}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Quilted Thermal MLI Facets (Authentic Corrugated Gold Foil) */}
        {[-0.66, 0.66].map((xOffset, i) => (
          <mesh key={`mli-x-${i}`} position={[xOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.2, 1.4, 4, 4]} />
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

        {/* Titanium Internal Propellant Tanks (Dual Spheres visible in cutout) */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`tank-${i}`} position={[0, 0, z]}>
            <sphereGeometry args={[0.32, 24, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 2. MAIN PROPULSION (ISRO 440N Liquid Apogee Motor - LAM)             */}
      {/* ==================================================================== */}
      <group position={[0, -0.76, 0]}>
        {/* Engine Gimbal Mount Ring */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.1, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* LAM Conical Nozzle Bell (Niobium Alloy Heat-Treated) */}
        <mesh position={[0, -0.32, 0]}>
          <coneGeometry args={[0.32, 0.48, 32, 1, true]} />
          <meshStandardMaterial
            color="#1C1917"
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
      {/* 3. REACTION CONTROL SYSTEM (RCS Thruster Pods on 4 Corners)          */}
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
          {/* Micro-thruster nozzles in pitch and yaw directions */}
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.08, 12]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <coneGeometry args={[0.03, 0.08, 12]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ==================================================================== */}
      {/* 4. DUAL PHOTOVOLTAIC SOLAR ARRAYS (Port & Starboard Wings)           */}
      {/* ==================================================================== */}
      <group ref={solarWingsRef}>
        {/* --- STARBOARD (RIGHT) SOLAR WING --- */}
        <group position={[0.65, 0, 0]}>
          {/* Solar Array Drive Mechanism (SADM) Motor */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 16]} />
            <meshStandardMaterial color="#64748B" metalness={0.9} />
          </mesh>

          {/* Graphite Structural Yoke */}
          <mesh position={[0.45, 0, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>

          {/* 3 High-Efficiency Photovoltaic Solar Panels */}
          {[0.8, 1.5, 2.2].map((xPos, idx) => (
            <group key={`sp-right-${idx}`} position={[xPos, 0, 0]}>
              {/* Carbon Fiber Backing Plate */}
              <mesh>
                <boxGeometry args={[0.66, 0.025, 1.55]} />
                <meshStandardMaterial color="#0A0F1D" metalness={0.6} roughness={0.6} />
              </mesh>
              {/* Blue Monocrystalline Silicon Cells (Top & Bottom for Albedo) */}
              <mesh position={[0, 0.015, 0]}>
                <boxGeometry args={[0.62, 0.005, 1.48]} />
                <meshStandardMaterial
                  color="#024C82"
                  metalness={0.88}
                  roughness={0.12}
                  envMapIntensity={2.0}
                />
              </mesh>
              {/* Metallic Current Collector Busbars */}
              {[-0.6, -0.2, 0.2, 0.6].map((zLine, j) => (
                <mesh key={`busbar-r-${idx}-${j}`} position={[0, 0.019, zLine]}>
                  <boxGeometry args={[0.62, 0.002, 0.008]} />
                  <meshBasicMaterial color="#E5A93B" />
                </mesh>
              ))}
              {/* Panel Hinge Assembly */}
              <mesh position={[0.33, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.08, 10]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>

        {/* --- PORT (LEFT) SOLAR WING --- */}
        <group position={[-0.65, 0, 0]}>
          {/* SADM Motor */}
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 16]} />
            <meshStandardMaterial color="#64748B" metalness={0.9} />
          </mesh>

          {/* Graphite Structural Yoke */}
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
                  color="#024C82"
                  metalness={0.88}
                  roughness={0.12}
                  envMapIntensity={2.0}
                />
              </mesh>
              {[-0.6, -0.2, 0.2, 0.6].map((zLine, j) => (
                <mesh key={`busbar-l-${idx}-${j}`} position={[0, 0.019, zLine]}>
                  <boxGeometry args={[0.62, 0.002, 0.008]} />
                  <meshBasicMaterial color="#E5A93B" />
                </mesh>
              ))}
              <mesh position={[-0.33, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.08, 10]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 5. INTERACTIVE SUBSYSTEM UNITS (Precision Flight Target Modules)     */}
      {/* ==================================================================== */}

      {/* --- FLIGHT COMPUTER BAY (COMP-FC-03) --- */}
      <group
        position={[0, 0.15, 0.67]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-FC-03');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.35, 0.12]} />
          <meshStandardMaterial
            color={getStatusColor(fcStatus, Boolean(isFCSelected))}
            emissive={getStatusColor(fcStatus, Boolean(isFCSelected))}
            emissiveIntensity={fcStatus === 'REJECT' ? 0.9 : isFCSelected ? 0.7 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Heat dissipation fins */}
        {[-0.15, -0.05, 0.05, 0.15].map((y, k) => (
          <mesh key={`fc-fin-${k}`} position={[0, y, 0.07]}>
            <boxGeometry args={[0.5, 0.01, 0.03]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} />
          </mesh>
        ))}
        {/* Holographic Radar Target Reticle for COMP-FC-03 */}
        {(fcStatus === 'REJECT' || isFCSelected) && (
          <group ref={hudRingRef} position={[0, 0, 0.18]}>
            <mesh>
              <ringGeometry args={[0.32, 0.36, 32]} />
              <meshBasicMaterial
                color={fcStatus === 'REJECT' ? '#FF0055' : '#00E5FF'}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[0.26, 0.28, 4]} />
              <meshBasicMaterial
                color={fcStatus === 'REJECT' ? '#FF0055' : '#00E5FF'}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* --- POWER DISTRIBUTION UNIT (COMP-PWR-02) --- */}
      <group
        position={[0.67, -0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PWR-02');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.45, 0.45]} />
          <meshStandardMaterial
            color={getStatusColor(pwrStatus, Boolean(isPwrSelected))}
            emissive={getStatusColor(pwrStatus, Boolean(isPwrSelected))}
            emissiveIntensity={pwrStatus === 'REJECT' ? 0.9 : isPwrSelected ? 0.6 : 0.15}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* --- BATTERY STORAGE MODULE (COMP-BAT-01) --- */}
      <group
        position={[-0.67, -0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-BAT-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.45, 0.45]} />
          <meshStandardMaterial
            color={getStatusColor(batStatus, Boolean(isBatSelected))}
            emissive={getStatusColor(batStatus, Boolean(isBatSelected))}
            emissiveIntensity={isBatSelected ? 0.6 : 0.15}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* --- HIGH GAIN DISH ANTENNA (COMP-COM-02) --- */}
      <group
        ref={dishRef}
        position={[0, 1.25, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-COM-02');
        }}
      >
        {/* Steerable Gimbal Mast */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.5, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>

        {/* Dual Axis Rotary Joints */}
        <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Carbon Fiber Parabolic Reflector Dish */}
        <group rotation={[Math.PI / 6, 0, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.55, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
            <meshStandardMaterial
              color={getStatusColor(comStatus, Boolean(isComSelected))}
              emissive={comStatus === 'MONITOR' ? '#FFB800' : isComSelected ? '#00E5FF' : '#000000'}
              emissiveIntensity={comStatus === 'MONITOR' ? 0.5 : isComSelected ? 0.5 : 0.0}
              side={THREE.DoubleSide}
              metalness={0.92}
              roughness={0.15}
            />
          </mesh>
          {/* Gold Sub-Reflector Feedhorn on Tripod Struts */}
          <mesh position={[0, 0.18, 0.18]}>
            <coneGeometry args={[0.07, 0.14, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Feedhorn Tripod Struts */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, k) => (
            <mesh
              key={`strut-${k}`}
              position={[Math.sin(angle) * 0.2, 0.08, Math.cos(angle) * 0.2]}
              rotation={[0.3, angle, 0]}
            >
              <cylinderGeometry args={[0.008, 0.008, 0.35, 8]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- DUAL STAR TRACKERS (COMP-NAV-01) --- */}
      <group
        position={[0.5, 0.72, -0.45]}
        rotation={[Math.PI / 5, Math.PI / 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-NAV-01');
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.28, 20]} />
          <meshStandardMaterial
            color={getStatusColor(navStatus, Boolean(isNavSelected))}
            emissive={isNavSelected ? '#00E5FF' : '#000000'}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        {/* Anti-Glare Optical Sun Baffle */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 16, 1, true]} />
          <meshStandardMaterial color="#0A0F1D" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      </group>

      {/* --- TELEMETRY & DATA HANDLING (COMP-TEL-01) --- */}
      <group
        position={[-0.5, 0.72, -0.45]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-TEL-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.24, 0.26]} />
          <meshStandardMaterial
            color={getStatusColor(telStatus, Boolean(isTelSelected))}
            emissive={isTelSelected ? '#00E5FF' : '#000000'}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
        {/* Helical S-Band Telemetry Antenna Mast */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.95} />
        </mesh>
      </group>

      {/* --- THERMAL RADIATOR SYSTEM (COMP-THM-01) --- */}
      <group
        position={[0, -0.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-THM-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.12, 0.85]} />
          <meshStandardMaterial
            color={getStatusColor(thmStatus, Boolean(isThmSelected))}
            emissive={isThmSelected ? '#00E5FF' : '#000000'}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* --- EARTH OBSERVATION OPTICAL PAYLOAD (COMP-PAY-01) --- */}
      <group
        position={[0, -0.2, 0.78]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PAY-01');
        }}
      >
        {/* Telescope Sensor Barrel */}
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.42, 32]} />
          <meshStandardMaterial
            color={getStatusColor(payStatus, Boolean(isPaySelected))}
            emissive={isPaySelected ? '#00E5FF' : '#000000'}
            metalness={0.92}
            roughness={0.1}
          />
        </mesh>
        {/* Lens Sunshade Baffle Ring */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.08, 32, 1, true]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Anti-Reflective Optical Sapphire Lens */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={0.6}
            metalness={0.95}
            roughness={0.02}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* 6. MAGNETOMETER EXTENSION BOOM                                       */}
      {/* ==================================================================== */}
      <group position={[0, 0, -0.66]} rotation={[-Math.PI / 6, 0, 0]}>
        {/* Deployable Lattice Boom */}
        <mesh position={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.015, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        {/* Fluxgate Magnetic Sensor Canister */}
        <mesh position={[0, 0, -1.2]}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color="#E5A93B" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
