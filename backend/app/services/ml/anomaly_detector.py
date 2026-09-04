import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class SpacecraftAnomalyDetector:
    """
    Intelligent Spacecraft Component Anomaly Detector.
    Combines Scikit-Learn IsolationForest with multi-dimensional statistical metrics:
    - Lot-relative robust deviation (robust z-score)
    - Baseline burn-in delta (delta_0h, pct_change)
    - Drift trajectory slope & acceleration
    - Datasheet limit proximity (utilization)
    """

    def __init__(self, random_state: int = 42, contamination: float = 0.15):
        self.random_state = random_state
        self.contamination = contamination
        self.model_version = "v1.0.0-isoforest-lotrobust"
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=self.random_state
        )
        self.scaler = StandardScaler()

    def fit_predict(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Runs anomaly detection on engineered features dataframe.
        Produces deterministic, reproducible anomaly scores in range [0.0, 1.0].
        """
        df = features_df.copy()
        
        # Feature columns for Isolation Forest
        feature_cols = [
            "lot_robust_zscore",
            "delta_0h",
            "drift_rate",
            "datasheet_utilization",
            "lot_trend_deviation"
        ]
        
        # Ensure all columns exist and fill NaNs
        X = df[feature_cols].copy()
        X = X.fillna(0.0)

        # Scale features
        if len(df) >= 3:
            X_scaled = self.scaler.fit_transform(X)
            self.iso_forest.fit(X_scaled)
            
            # decision_function yields raw anomaly scores (lower = more abnormal)
            raw_scores = self.iso_forest.decision_function(X_scaled)
            # Invert and normalize to [0.0, 1.0] where 1.0 = highly anomalous
            min_s, max_s = np.min(raw_scores), np.max(raw_scores)
            if max_s - min_s > 1e-6:
                iso_scores = 1.0 - (raw_scores - min_s) / (max_s - min_s)
            else:
                iso_scores = np.full(len(df), 0.2)
        else:
            iso_scores = np.zeros(len(df))

        df["iso_forest_score"] = iso_scores

        # Combine Isolation Forest with direct statistical outlier indicators
        # A component that is +3.0σ above lot baseline is an anomaly regardless of sample size!
        anomaly_scores = []
        for i, row in df.iterrows():
            iso = float(row["iso_forest_score"])
            z_rob = abs(float(row.get("lot_robust_zscore", 0.0)))
            util = float(row.get("datasheet_utilization", 0.0)) / 100.0
            drift = abs(float(row.get("drift_rate", 0.0)))
            
            # Statistical component: normalized z-score (3.0+ is severe)
            z_component = min(1.0, z_rob / 3.5)
            
            # Proximity component: higher weight if close to datasheet limit (>70% utilization)
            util_component = max(0.0, (util - 0.5) * 2.0) if util > 0.5 else 0.0
            
            # Drift component: high drift rate
            drift_component = min(1.0, drift * 10.0)

            # Blended anomaly score: 40% Isolation Forest + 40% Lot Z-score + 10% Drift + 10% Proximity
            combined_score = (
                0.40 * iso +
                0.40 * z_component +
                0.10 * drift_component +
                0.10 * util_component
            )
            anomaly_scores.append(round(float(np.clip(combined_score, 0.0, 1.0)), 3))

        df["anomaly_score"] = anomaly_scores
        return df


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print(" >>> RUNNING: SpacecraftAnomalyDetector Demonstration")
    print("=" * 70 + "\n")
    sample_data = pd.DataFrame([
        {"component_id": "COMP-FC-01", "lot_robust_zscore": 0.2, "delta_0h": 0.5, "drift_rate": 0.003, "datasheet_utilization": 42.0, "lot_trend_deviation": 0.1},
        {"component_id": "COMP-FC-02", "lot_robust_zscore": -0.4, "delta_0h": 0.4, "drift_rate": 0.002, "datasheet_utilization": 41.5, "lot_trend_deviation": -0.1},
        {"component_id": "COMP-FC-03", "lot_robust_zscore": 3.4, "delta_0h": 16.0, "drift_rate": 0.110, "datasheet_utilization": 76.8, "lot_trend_deviation": 2.9},
        {"component_id": "COMP-FC-04", "lot_robust_zscore": 0.1, "delta_0h": 0.6, "drift_rate": 0.004, "datasheet_utilization": 43.0, "lot_trend_deviation": 0.0},
        {"component_id": "COMP-FC-05", "lot_robust_zscore": -0.3, "delta_0h": 0.3, "drift_rate": 0.002, "datasheet_utilization": 41.0, "lot_trend_deviation": -0.2},
    ])
    detector = SpacecraftAnomalyDetector(random_state=42)
    result_df = detector.fit_predict(sample_data)
    cols = ["component_id", "lot_robust_zscore", "drift_rate", "datasheet_utilization", "iso_forest_score", "anomaly_score"]
    print(result_df[cols].to_string(index=False))
    print("\nDemonstration completed successfully.")

