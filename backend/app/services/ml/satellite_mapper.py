"""
Single Source of Truth for Spacecraft Physical Component Mapping.
Every physical component has an authoritative model ID, subsystem, and 3D spatial coordinate.
"""

from typing import Dict, Any, List

SATELLITE_COMPONENTS: Dict[str, Dict[str, Any]] = {
    # Flight Computer (Central Core Upper)
    "COMP-FC-01": {
        "subsystem": "Flight Computer",
        "physical_model_id": "flightComputer",
        "position": [0.0, 0.4, 0.6],
        "description": "Primary Flight Guidance & Attitude Processor"
    },
    "COMP-FC-02": {
        "subsystem": "Flight Computer",
        "physical_model_id": "flightComputer",
        "position": [0.0, 0.4, 0.6],
        "description": "Redundant Flight Control Processor"
    },
    "COMP-FC-03": {
        "subsystem": "Flight Computer",
        "physical_model_id": "flightComputer",
        "position": [0.0, 0.4, 0.6],
        "description": "Critical Flight Telemetry & Command Processor"
    },
    "COMP-FC-04": {
        "subsystem": "Flight Computer",
        "physical_model_id": "flightComputer",
        "position": [0.0, 0.4, 0.6],
        "description": "Payload Interface & Bus Arbiter"
    },
    "COMP-FC-05": {
        "subsystem": "Flight Computer",
        "physical_model_id": "flightComputer",
        "position": [0.0, 0.4, 0.6],
        "description": "Auxiliary Watchdog & Health Unit"
    },

    # Power Distribution & Solar Management (Starboard Side)
    "COMP-PWR-01": {
        "subsystem": "Power System",
        "physical_model_id": "powerDistribution",
        "position": [0.8, -0.3, 0.0],
        "description": "Main Bus Voltage Regulator (28V Bus)"
    },
    "COMP-PWR-02": {
        "subsystem": "Power System",
        "physical_model_id": "powerDistribution",
        "position": [0.8, -0.3, 0.0],
        "description": "Solar Array Drive Assembly & Shunt Regulator"
    },
    "COMP-PWR-03": {
        "subsystem": "Power System",
        "physical_model_id": "powerDistribution",
        "position": [0.8, -0.3, 0.0],
        "description": "DC-DC Solid State Power Switch"
    },
    "COMP-PWR-04": {
        "subsystem": "Power System",
        "physical_model_id": "powerDistribution",
        "position": [0.8, -0.3, 0.0],
        "description": "Emergency Power Separation Pyrotechnic Controller"
    },

    # Battery Module (Port Side)
    "COMP-BAT-01": {
        "subsystem": "Battery Module",
        "physical_model_id": "batteryModule",
        "position": [-0.8, -0.3, 0.0],
        "description": "Li-Ion Energy Storage Cell Bank 1"
    },
    "COMP-BAT-02": {
        "subsystem": "Battery Module",
        "physical_model_id": "batteryModule",
        "position": [-0.8, -0.3, 0.0],
        "description": "Li-Ion Energy Storage Cell Bank 2"
    },

    # Communication & RF Transceiver (Top Antenna Deck)
    "COMP-COM-01": {
        "subsystem": "Communication Module",
        "physical_model_id": "rfTransceiver",
        "position": [0.0, 1.2, 0.0],
        "description": "S-Band Telecommand Transponder"
    },
    "COMP-COM-02": {
        "subsystem": "Communication Module",
        "physical_model_id": "rfTransceiver",
        "position": [0.0, 1.2, 0.0],
        "description": "X-Band High-Rate Downlink Transmitter"
    },
    "COMP-COM-03": {
        "subsystem": "Communication Module",
        "physical_model_id": "rfTransceiver",
        "position": [0.0, 1.2, 0.0],
        "description": "Low-Noise RF Front-End Amplifier"
    },

    # Navigation, IMU & Star Tracker (Aft-Starboard)
    "COMP-NAV-01": {
        "subsystem": "Navigation Unit",
        "physical_model_id": "navigationIMU",
        "position": [0.5, 0.5, -0.5],
        "description": "3-Axis Fibre Optic Gyroscope & Accelerometer"
    },
    "COMP-NAV-02": {
        "subsystem": "Navigation Unit",
        "physical_model_id": "navigationIMU",
        "position": [0.5, 0.5, -0.5],
        "description": "Star Tracker Optical Head 1"
    },
    "COMP-NAV-03": {
        "subsystem": "Navigation Unit",
        "physical_model_id": "navigationIMU",
        "position": [0.5, 0.5, -0.5],
        "description": "Star Tracker Optical Head 2"
    },

    # Telemetry Module (Aft-Port)
    "COMP-TEL-01": {
        "subsystem": "Telemetry Module",
        "physical_model_id": "telemetryUnit",
        "position": [-0.5, 0.5, -0.5],
        "description": "Housekeeping Telemetry Multiplexer"
    },
    "COMP-TEL-04": {
        "subsystem": "Telemetry Module",
        "physical_model_id": "telemetryUnit",
        "position": [-0.5, 0.5, -0.5],
        "description": "Radiation & Sensor Conditioning Unit"
    },

    # Thermal Control (Bottom Radiator Deck)
    "COMP-THM-01": {
        "subsystem": "Thermal Control",
        "physical_model_id": "thermalController",
        "position": [0.0, -0.8, 0.0],
        "description": "Heat Pipe Loop & Louver Actuator"
    },

    # Payload (Nadir Facing Deck)
    "COMP-PAY-01": {
        "subsystem": "Payload",
        "physical_model_id": "payloadSensor",
        "position": [0.0, 0.0, 1.1],
        "description": "Optical Earth Observation Imaging Sensor"
    },
}

# Subsystem fallback map for dynamic or unlisted components
SUBSYSTEM_FALLBACKS: Dict[str, Dict[str, Any]] = {
    "flight computer": {"model_id": "flightComputer", "position": [0.0, 0.4, 0.6]},
    "computing": {"model_id": "flightComputer", "position": [0.0, 0.4, 0.6]},
    "power": {"model_id": "powerDistribution", "position": [0.8, -0.3, 0.0]},
    "power system": {"model_id": "powerDistribution", "position": [0.8, -0.3, 0.0]},
    "battery": {"model_id": "batteryModule", "position": [-0.8, -0.3, 0.0]},
    "battery module": {"model_id": "batteryModule", "position": [-0.8, -0.3, 0.0]},
    "communication": {"model_id": "rfTransceiver", "position": [0.0, 1.2, 0.0]},
    "communication module": {"model_id": "rfTransceiver", "position": [0.0, 1.2, 0.0]},
    "navigation": {"model_id": "navigationIMU", "position": [0.5, 0.5, -0.5]},
    "navigation unit": {"model_id": "navigationIMU", "position": [0.5, 0.5, -0.5]},
    "telemetry": {"model_id": "telemetryUnit", "position": [-0.5, 0.5, -0.5]},
    "telemetry module": {"model_id": "telemetryUnit", "position": [-0.5, 0.5, -0.5]},
    "thermal": {"model_id": "thermalController", "position": [0.0, -0.8, 0.0]},
    "thermal control": {"model_id": "thermalController", "position": [0.0, -0.8, 0.0]},
    "payload": {"model_id": "payloadSensor", "position": [0.0, 0.0, 1.1]},
}

def resolve_component_mapping(component_id: str, subsystem: str = "") -> Dict[str, Any]:
    """
    Returns the physical_model_id and 3D [x, y, z] coordinate for any component.
    """
    if component_id in SATELLITE_COMPONENTS:
        return SATELLITE_COMPONENTS[component_id]
    
    sub_clean = subsystem.strip().lower()
    if sub_clean in SUBSYSTEM_FALLBACKS:
        fb = SUBSYSTEM_FALLBACKS[sub_clean]
        return {
            "subsystem": subsystem or "General Subsystem",
            "physical_model_id": fb["model_id"],
            "position": fb["position"],
            "description": f"Component {component_id} ({subsystem})"
        }
    
    # Prefix-based heuristic
    comp_prefix = component_id.split("-")[1].upper() if "-" in component_id else component_id[:3].upper()
    prefix_map = {
        "FC": ("Flight Computer", "flightComputer", [0.0, 0.4, 0.6]),
        "PWR": ("Power System", "powerDistribution", [0.8, -0.3, 0.0]),
        "BAT": ("Battery Module", "batteryModule", [-0.8, -0.3, 0.0]),
        "COM": ("Communication Module", "rfTransceiver", [0.0, 1.2, 0.0]),
        "NAV": ("Navigation Unit", "navigationIMU", [0.5, 0.5, -0.5]),
        "TEL": ("Telemetry Module", "telemetryUnit", [-0.5, 0.5, -0.5]),
        "THM": ("Thermal Control", "thermalController", [0.0, -0.8, 0.0]),
        "PAY": ("Payload", "payloadSensor", [0.0, 0.0, 1.1]),
    }
    if comp_prefix in prefix_map:
        sub, model_id, pos = prefix_map[comp_prefix]
        return {
            "subsystem": sub,
            "physical_model_id": model_id,
            "position": pos,
            "description": f"Component {component_id}"
        }
    
    # Default spacecraft bus center
    return {
        "subsystem": subsystem or "General Subsystem",
        "physical_model_id": "satelliteBus",
        "position": [0.0, 0.0, 0.0],
        "description": f"Component {component_id}"
    }
