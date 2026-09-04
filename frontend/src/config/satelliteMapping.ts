export interface ComponentSpatialConfig {
  subsystem: string;
  physicalModelId: string;
  position: [number, number, number];
  description: string;
}

export const SATELLITE_COMPONENTS: Record<string, ComponentSpatialConfig> = {
  // Flight Computer (Central Core Upper)
  "COMP-FC-01": {
    subsystem: "Flight Computer",
    physicalModelId: "flightComputer",
    position: [0.0, 0.4, 0.6],
    description: "Primary Flight Guidance & Attitude Processor"
  },
  "COMP-FC-02": {
    subsystem: "Flight Computer",
    physicalModelId: "flightComputer",
    position: [0.0, 0.4, 0.6],
    description: "Redundant Flight Control Processor"
  },
  "COMP-FC-03": {
    subsystem: "Flight Computer",
    physicalModelId: "flightComputer",
    position: [0.0, 0.4, 0.6],
    description: "Critical Flight Telemetry & Command Processor"
  },
  "COMP-FC-04": {
    subsystem: "Flight Computer",
    physicalModelId: "flightComputer",
    position: [0.0, 0.4, 0.6],
    description: "Payload Interface & Bus Arbiter"
  },
  "COMP-FC-05": {
    subsystem: "Flight Computer",
    physicalModelId: "flightComputer",
    position: [0.0, 0.4, 0.6],
    description: "Auxiliary Watchdog & Health Unit"
  },

  // Power Distribution (Starboard Side)
  "COMP-PWR-01": {
    subsystem: "Power System",
    physicalModelId: "powerDistribution",
    position: [0.8, -0.3, 0.0],
    description: "Main Bus Voltage Regulator (28V Bus)"
  },
  "COMP-PWR-02": {
    subsystem: "Power System",
    physicalModelId: "powerDistribution",
    position: [0.8, -0.3, 0.0],
    description: "Solar Array Drive Assembly & Shunt Regulator"
  },
  "COMP-PWR-03": {
    subsystem: "Power System",
    physicalModelId: "powerDistribution",
    position: [0.8, -0.3, 0.0],
    description: "DC-DC Solid State Power Switch"
  },
  "COMP-PWR-04": {
    subsystem: "Power System",
    physicalModelId: "powerDistribution",
    position: [0.8, -0.3, 0.0],
    description: "Emergency Power Separation Pyrotechnic Controller"
  },

  // Battery Bank (Port Side)
  "COMP-BAT-01": {
    subsystem: "Battery Module",
    physicalModelId: "batteryModule",
    position: [-0.8, -0.3, 0.0],
    description: "Li-Ion Energy Storage Cell Bank 1"
  },
  "COMP-BAT-02": {
    subsystem: "Battery Module",
    physicalModelId: "batteryModule",
    position: [-0.8, -0.3, 0.0],
    description: "Li-Ion Energy Storage Cell Bank 2"
  },

  // RF Communication Transceiver (Zenith Dish)
  "COMP-COM-01": {
    subsystem: "Communication Module",
    physicalModelId: "rfTransceiver",
    position: [0.0, 1.2, 0.0],
    description: "S-Band Telecommand Transponder"
  },
  "COMP-COM-02": {
    subsystem: "Communication Module",
    physicalModelId: "rfTransceiver",
    position: [0.0, 1.2, 0.0],
    description: "X-Band High-Rate Downlink Transmitter"
  },
  "COMP-COM-03": {
    subsystem: "Communication Module",
    physicalModelId: "rfTransceiver",
    position: [0.0, 1.2, 0.0],
    description: "Low-Noise RF Front-End Amplifier"
  },

  // Navigation IMU & Star Tracker (Aft-Starboard)
  "COMP-NAV-01": {
    subsystem: "Navigation Unit",
    physicalModelId: "navigationIMU",
    position: [0.5, 0.5, -0.5],
    description: "3-Axis Fibre Optic Gyroscope & Accelerometer"
  },
  "COMP-NAV-02": {
    subsystem: "Navigation Unit",
    physicalModelId: "navigationIMU",
    position: [0.5, 0.5, -0.5],
    description: "Star Tracker Optical Head 1"
  },
  "COMP-NAV-03": {
    subsystem: "Navigation Unit",
    physicalModelId: "navigationIMU",
    position: [0.5, 0.5, -0.5],
    description: "Star Tracker Optical Head 2"
  },

  // Telemetry Module (Aft-Port)
  "COMP-TEL-01": {
    subsystem: "Telemetry Module",
    physicalModelId: "telemetryUnit",
    position: [-0.5, 0.5, -0.5],
    description: "Housekeeping Telemetry Multiplexer"
  },
  "COMP-TEL-04": {
    subsystem: "Telemetry Module",
    physicalModelId: "telemetryUnit",
    position: [-0.5, 0.5, -0.5],
    description: "Radiation & Sensor Conditioning Unit"
  },

  // Thermal Control (Base Radiator)
  "COMP-THM-01": {
    subsystem: "Thermal Control",
    physicalModelId: "thermalController",
    position: [0.0, -0.8, 0.0],
    description: "Heat Pipe Loop & Louver Actuator"
  },

  // Earth Observation Payload (Nadir Deck)
  "COMP-PAY-01": {
    subsystem: "Payload",
    physicalModelId: "payloadSensor",
    position: [0.0, -0.2, 0.9],
    description: "Optical Earth Observation Imaging Sensor"
  },
  "COMP-PAY-02": {
    subsystem: "Payload",
    physicalModelId: "payloadSensor",
    position: [0.0, -0.2, 0.9],
    description: "Thermal Infrared Radiometer Sensor"
  },

  // Reaction Wheel Assembly (AOCS Internal Deck)
  "COMP-RW-01": {
    subsystem: "Attitude Control (RW)",
    physicalModelId: "reactionWheels",
    position: [0.0, 0.0, 0.0],
    description: "3-Axis Reaction Wheel Momentum Assembly"
  },

  // Solar Array Subsystems
  "COMP-SOL-01": {
    subsystem: "Solar Array Port",
    physicalModelId: "solarArrayPort",
    position: [-1.6, 0.0, 0.0],
    description: "Port Photovoltaic Solar Array Wing"
  },
  "COMP-SOL-02": {
    subsystem: "Solar Array Starboard",
    physicalModelId: "solarArrayStbd",
    position: [1.6, 0.0, 0.0],
    description: "Starboard Photovoltaic Solar Array Wing"
  },
};

export const getComponentSpatialMapping = (componentId: string): ComponentSpatialConfig => {
  if (!componentId) {
    return {
      subsystem: "Primary Bus Core",
      physicalModelId: "satelliteBus",
      position: [0, 0, 0],
      description: "Primary Spacecraft Bus Structure"
    };
  }

  // Exact match
  if (SATELLITE_COMPONENTS[componentId]) {
    return SATELLITE_COMPONENTS[componentId];
  }

  const upper = componentId.toUpperCase();

  // Prefix & Subsystem fuzzy matcher
  if (upper.includes('FC') || upper.includes('CPU') || upper.includes('OBC') || upper.includes('PROC') || upper.includes('MCU')) {
    return {
      subsystem: "Flight Computer / OBC",
      physicalModelId: "flightComputer",
      position: [0.0, 0.25, 0.72],
      description: `Flight Avionics Module [${componentId}]`
    };
  }
  if (upper.includes('PWR') || upper.includes('EPS') || upper.includes('REG') || upper.includes('VOLT') || upper.includes('DIST')) {
    return {
      subsystem: "Power Conditioning (EPS)",
      physicalModelId: "powerDistribution",
      position: [0.72, -0.2, 0.0],
      description: `Power Management Unit [${componentId}]`
    };
  }
  if (upper.includes('BAT') || upper.includes('CELL') || upper.includes('ENERGY') || upper.includes('STOR')) {
    return {
      subsystem: "Battery Energy Storage",
      physicalModelId: "batteryModule",
      position: [-0.72, -0.2, 0.0],
      description: `Li-Ion Storage Bank [${componentId}]`
    };
  }
  if (upper.includes('COM') || upper.includes('RF') || upper.includes('TX') || upper.includes('RX') || upper.includes('DISH') || upper.includes('HGA')) {
    return {
      subsystem: "RF Communications (HGA)",
      physicalModelId: "rfTransceiver",
      position: [0.0, 1.35, 0.0],
      description: `High Gain Antenna Assembly [${componentId}]`
    };
  }
  if (upper.includes('NAV') || upper.includes('AOCS') || upper.includes('GYRO') || upper.includes('STAR') || upper.includes('IMU')) {
    return {
      subsystem: "Navigation & Star Trackers",
      physicalModelId: "navigationIMU",
      position: [0.52, 0.75, -0.45],
      description: `Attitude Optical Tracker [${componentId}]`
    };
  }
  if (upper.includes('TEL') || upper.includes('TLM') || upper.includes('SENS') || upper.includes('ANT')) {
    return {
      subsystem: "Telemetry & Instrumentation",
      physicalModelId: "telemetryUnit",
      position: [-0.52, 0.75, -0.45],
      description: `Telemetry Multiplexer [${componentId}]`
    };
  }
  if (upper.includes('THM') || upper.includes('THERM') || upper.includes('HEAT') || upper.includes('PROP') || upper.includes('LAM')) {
    return {
      subsystem: "Thermal & LAM Propulsion",
      physicalModelId: "thermalController",
      position: [0.0, -0.85, 0.0],
      description: `Thermal Control & Propulsion [${componentId}]`
    };
  }
  if (upper.includes('PAY') || upper.includes('CAM') || upper.includes('OPT') || upper.includes('IMG') || upper.includes('RAD')) {
    return {
      subsystem: "Earth Observation Payload",
      physicalModelId: "payloadSensor",
      position: [0.0, -0.2, 0.9],
      description: `Optical Imaging Payload [${componentId}]`
    };
  }
  if (upper.includes('SOL') || upper.includes('WING') || upper.includes('PANEL')) {
    return {
      subsystem: "Solar Array Wing",
      physicalModelId: "solarArrayPort",
      position: [-1.6, 0.0, 0.0],
      description: `Photovoltaic Wing [${componentId}]`
    };
  }

  // Consistent hash placement across known key physical points on the spacecraft
  const positions: [number, number, number][] = [
    [0.0, 0.25, 0.72],   // Avionics front
    [0.72, -0.2, 0.0],   // Starboard power
    [-0.72, -0.2, 0.0],  // Port battery
    [0.0, 1.35, 0.0],    // Zenith dish
    [0.52, 0.75, -0.45], // Star tracker
    [-0.52, 0.75, -0.45],// Telemetry mast
    [0.0, -0.85, 0.0],   // Base thruster
    [0.0, -0.2, 0.9],    // Nadir camera
  ];
  const hash = componentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pos = positions[hash % positions.length];

  return {
    subsystem: `Subsystem [${componentId.slice(0, 8)}]`,
    physicalModelId: "satelliteBus",
    position: pos,
    description: `Spacecraft Subsystem Component: ${componentId}`
  };
};
