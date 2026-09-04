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
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<number>(0);

  // Slow rotation animation if auto-rotate is active
  useFrame((_, delta) => {
    if (isRotating && groupRef.current && !selectedComponentId) {
      groupRef.current.rotation.y += delta * 0.2;
    }
    pulseRef.current += delta * 4;
  });

  const getComponentStatus = (compId: string): DecisionType => {
    return componentResults[compId]?.decision || 'SAFE';
  };

  const getStatusColor = (status: DecisionType, isSelected: boolean) => {
    if (status === 'REJECT') return '#EF4444';   // Crimson red
    if (status === 'MONITOR') return '#F59E0B';  // Amber orange
    if (isSelected) return '#38BDF8';            // Cyan focus
    return '#10B981';                            // Emerald safe
  };

  // Status for physical units
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
    <group ref={groupRef} dispose={null}>
      {/* 1. CENTRAL SATELLITE MAIN BUS (Octagonal Core) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 1.2, 8]} />
        <meshStandardMaterial
          color="#1E293B"
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Gold Multi-Layer Insulation (MLI) Thermal Foil Accents */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.71, 0.71, 0.5, 8]} />
        <meshStandardMaterial
          color="#D97706"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* 2. SOLAR ARRAYS (Port & Starboard Wings) */}
      {/* Starboard Wing (Right) */}
      <group position={[1.8, 0, 0]}>
        {/* Support Truss */}
        <mesh position={[-0.7, 0, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.05]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} />
        </mesh>
        {/* Solar Panel Panels (3 segments) */}
        {[-0.6, 0, 0.6].map((offset, i) => (
          <group key={`sp-right-${i}`} position={[offset, 0, 0]}>
            {/* Panel Frame */}
            <mesh>
              <boxGeometry args={[0.55, 0.03, 1.3]} />
              <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Blue Photovoltaic Cells */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.5, 0.01, 1.2]} />
              <meshStandardMaterial color="#0369A1" metalness={0.7} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Port Wing (Left) */}
      <group position={[-1.8, 0, 0]}>
        {/* Support Truss */}
        <mesh position={[0.7, 0, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.05]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} />
        </mesh>
        {/* Solar Panel Panels (3 segments) */}
        {[-0.6, 0, 0.6].map((offset, i) => (
          <group key={`sp-left-${i}`} position={[offset, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.55, 0.03, 1.3]} />
              <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.5, 0.01, 1.2]} />
              <meshStandardMaterial color="#0369A1" metalness={0.7} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. FLIGHT COMPUTER BAY (COMP-FC-03) - Top Front */}
      <group
        position={[0, 0.4, 0.6]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-FC-03');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.3, 0.25]} />
          <meshStandardMaterial
            color={getStatusColor(fcStatus, Boolean(isFCSelected))}
            emissive={fcStatus === 'REJECT' ? '#EF4444' : isFCSelected ? '#38BDF8' : '#000000'}
            emissiveIntensity={fcStatus === 'REJECT' ? 0.8 : isFCSelected ? 0.5 : 0.0}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Pulsing indicator ring if REJECT or selected */}
        {(fcStatus === 'REJECT' || isFCSelected) && (
          <mesh position={[0, 0, 0.15]}>
            <ringGeometry args={[0.22, 0.26, 32]} />
            <meshBasicMaterial
              color={fcStatus === 'REJECT' ? '#EF4444' : '#38BDF8'}
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>

      {/* 4. POWER DISTRIBUTION (COMP-PWR-02) - Starboard side */}
      <group
        position={[0.8, -0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PWR-02');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.35, 0.35]} />
          <meshStandardMaterial
            color={getStatusColor(pwrStatus, Boolean(isPwrSelected))}
            emissive={pwrStatus === 'REJECT' ? '#EF4444' : isPwrSelected ? '#38BDF8' : '#000000'}
            emissiveIntensity={pwrStatus === 'REJECT' ? 0.8 : isPwrSelected ? 0.5 : 0.0}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 5. BATTERY MODULE (COMP-BAT-01) - Port side */}
      <group
        position={[-0.8, -0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-BAT-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.35, 0.35]} />
          <meshStandardMaterial
            color={getStatusColor(batStatus, Boolean(isBatSelected))}
            emissive={isBatSelected ? '#38BDF8' : '#000000'}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 6. RF COMMUNICATION DISH & FEEDHORN (COMP-COM-02) - Zenith */}
      <group
        position={[0, 1.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-COM-02');
        }}
      >
        {/* Antenna Mast */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} />
        </mesh>
        {/* Parabolic Dish */}
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <sphereGeometry args={[0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial
            color={getStatusColor(comStatus, Boolean(isComSelected))}
            emissive={comStatus === 'MONITOR' ? '#F59E0B' : isComSelected ? '#38BDF8' : '#000000'}
            emissiveIntensity={comStatus === 'MONITOR' ? 0.6 : 0.0}
            side={THREE.DoubleSide}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Feedhorn */}
        <mesh position={[0, 0.1, 0.15]}>
          <coneGeometry args={[0.06, 0.12, 12]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
        </mesh>
      </group>

      {/* 7. NAVIGATION UNIT / STAR TRACKER (COMP-NAV-01) - Aft-Starboard */}
      <group
        position={[0.5, 0.5, -0.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-NAV-01');
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.25, 16]} />
          <meshStandardMaterial
            color={getStatusColor(navStatus, Boolean(isNavSelected))}
            emissive={isNavSelected ? '#38BDF8' : '#000000'}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 8. TELEMETRY MODULE (COMP-TEL-01) - Aft-Port */}
      <group
        position={[-0.5, 0.5, -0.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-TEL-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.25, 0.2]} />
          <meshStandardMaterial
            color={getStatusColor(telStatus, Boolean(isTelSelected))}
            emissive={isTelSelected ? '#38BDF8' : '#000000'}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 9. THERMAL RADIATOR (COMP-THM-01) - Bottom Nadir Base */}
      <group
        position={[0, -0.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-THM-01');
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.15, 0.7]} />
          <meshStandardMaterial
            color={getStatusColor(thmStatus, Boolean(isThmSelected))}
            emissive={isThmSelected ? '#38BDF8' : '#000000'}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* 10. EARTH OBSERVATION PAYLOAD (COMP-PAY-01) - Front Nadir Sensor */}
      <group
        position={[0, 0, 1.1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('COMP-PAY-01');
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.45, 24]} />
          <meshStandardMaterial
            color={getStatusColor(payStatus, Boolean(isPaySelected))}
            emissive={isPaySelected ? '#38BDF8' : '#000000'}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Optical Glass Lens */}
        <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.05} metalness={0.9} opacity={0.8} transparent />
        </mesh>
      </group>
    </group>
  );
};
