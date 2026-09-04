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
    position: [0.0, 0.0, 1.1],
    description: "Optical Earth Observation Imaging Sensor"
  },
};

export const getComponentSpatialMapping = (componentId: string): ComponentSpatialConfig => {
  if (SATELLITE_COMPONENTS[componentId]) {
    return SATELLITE_COMPONENTS[componentId];
  }
  // Default fallback to center of satellite bus
  return {
    subsystem: "General Subsystem",
    physicalModelId: "satelliteBus",
    position: [0, 0, 0],
    description: `Component ${componentId}`
  };
};
