import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from scipy import stats

def compute_lot_relative_metrics(features_df: pd.DataFrame) -> pd.DataFrame:
    """
    Performs lot-relative statistical analysis.
    Groups components by (lot_id, parameter) and evaluates each component
    relative to peer components from the exact same production lot.
    """
    df = features_df.copy()
    
    # New metric columns
    df["lot_mean"] = 0.0
    df["lot_std"] = 0.0
    df["lot_median"] = 0.0
    df["lot_mad"] = 0.0
    df["lot_zscore"] = 0.0
    df["lot_robust_zscore"] = 0.0
    df["lot_percentile"] = 50.0
    df["lot_drift_mean"] = 0.0
    df["lot_trend_deviation"] = 0.0

    for (lot, param), group in df.groupby(["lot_id", "parameter"]):
        idx = group.index
        n_comps = len(group)
        
        current_vals = group["current_value"].values
        drift_rates = group["drift_rate"].values

        # Lot Baseline Statistics
        l_mean = float(np.mean(current_vals))
        l_std = float(np.std(current_vals, ddof=1)) if n_comps > 1 else 0.0
        l_median = float(np.median(current_vals))
        
        # Median Absolute Deviation (MAD) for robust z-score
        # 1.4826 makes MAD asymptotically normal
        abs_deviations = np.abs(current_vals - l_median)
        med_abs_dev = float(np.median(abs_deviations))
        if med_abs_dev > 1e-6:
            l_mad = med_abs_dev * 1.4826
        else:
            # When >50% points are identical, use central trimmed scale to prevent outlier masking
            q75, q25 = np.percentile(current_vals, [75, 25])
            iqr_scale = float((q75 - q25) / 1.349)
            if iqr_scale > 1e-6:
                l_mad = iqr_scale
            else:
                central_vals = current_vals[abs_deviations <= np.percentile(abs_deviations, 80)]
                c_std = float(np.std(central_vals, ddof=1)) if len(central_vals) > 1 else 0.0
                l_mad = c_std if c_std > 1e-6 else (float(l_std) if l_std > 1e-6 else 1.0)
        
        # Lot Mean Drift Rate
        l_drift_mean = float(np.mean(drift_rates))
        
        df.loc[idx, "lot_mean"] = l_mean
        df.loc[idx, "lot_std"] = l_std
        df.loc[idx, "lot_median"] = l_median
        df.loc[idx, "lot_mad"] = l_mad
        df.loc[idx, "lot_drift_mean"] = l_drift_mean

        # Per-component deviations
        for i, row in group.iterrows():
            c_val = row["current_value"]
            c_drift = row["drift_rate"]
            
            # Standard z-score
            if l_std > 1e-6:
                z = (c_val - l_mean) / l_std
            else:
                z = 0.0
                
            # Robust z-score
            if l_mad > 1e-6:
                rob_z = (c_val - l_median) / l_mad
            else:
                rob_z = z
                
            # Trend deviation vs lot average drift
            trend_dev = c_drift - l_drift_mean
            
            # Percentile in lot
            if n_comps > 1:
                pct = float(stats.percentileofscore(current_vals, c_val, kind="weak"))
            else:
                pct = 50.0

            df.loc[i, "lot_zscore"] = float(z)
            df.loc[i, "lot_robust_zscore"] = float(rob_z)
            df.loc[i, "lot_trend_deviation"] = float(trend_dev)
            df.loc[i, "lot_percentile"] = float(pct)

    return df
