from typing import Dict, Any, List
from backend.app.config import settings

def evaluate_screening_decision(
    risk_score: float,
    current_value: float,
    datasheet_limit: float,
    predicted_value: float,
    lot_robust_zscore: float,
    lot_mean: float,
    drift_rate: float,
    parameter: str,
    lot_id: str
) -> Dict[str, Any]:
    """
    Evaluates screening decision (SAFE, MONITOR, REJECT) and generates
    detailed engineering diagnosis ("WHY FLAGGED").
    """
    reasons: List[str] = []
    
    # 1. Datasheet limit check (Traditional screening)
    violates_datasheet = current_value >= datasheet_limit
    predicted_limit_breach = predicted_value is not None and predicted_value >= datasheet_limit
    
    # 2. Lot-relative check
    is_lot_outlier = abs(lot_robust_zscore) >= settings.LOT_ZSCORE_THRESHOLD
    if is_lot_outlier:
        sign = "+" if lot_robust_zscore > 0 else "-"
        reasons.append(
            f"{sign}{abs(lot_robust_zscore):.1f}σ deviation from {lot_id} baseline "
            f"(Lot mean: {lot_mean:.1f}, Component: {current_value:.1f})"
        )

    # 3. Drift trajectory check
    if abs(drift_rate) >= 0.05:
        dir_str = "Positive acceleration" if drift_rate > 0 else "Degradation drift"
        reasons.append(f"{dir_str} rate of {drift_rate:+.4f} units/hr detected across burn-in stages.")

    # 4. Predicted future breach
    if predicted_limit_breach:
        reasons.append(
            f"Projected future value ({predicted_value:.1f}) breaches datasheet limit ({datasheet_limit:.1f}) at operational horizon."
        )
    elif predicted_value is not None and (predicted_value / datasheet_limit) > 0.85:
        reasons.append(
            f"Projected future value ({predicted_value:.1f}) approaches within 85% of limit ({datasheet_limit:.1f})."
        )

    # 5. Determine Decision
    if violates_datasheet or predicted_limit_breach or risk_score >= settings.RISK_MONITOR_MAX:
        decision = "REJECT"
        if violates_datasheet:
            reasons.insert(0, f"Critical: Current reading ({current_value}) exceeds datasheet limit ({datasheet_limit}).")
        elif not violates_datasheet and predicted_limit_breach:
            reasons.insert(0, "Latent Failure: Currently inside datasheet limit, but predicted to fail in mission operation.")
    elif risk_score >= settings.RISK_SAFE_MAX:
        decision = "MONITOR"
        reasons.insert(0, "Moderate drift or lot deviation detected; requires continuous operational monitoring.")
    else:
        decision = "SAFE"
        reasons.append("Component operating stably within expected lot distribution and datasheet limits.")

    # Format explanation text
    explanation_text = " • " + "\n • ".join(reasons)

    # Traditional vs AI Comparison
    traditional_decision = "FAIL" if violates_datasheet else "PASS"
    within_limit_not_healthy = (not violates_datasheet) and (decision in ["MONITOR", "REJECT"])

    return {
        "decision": decision,
        "explanation": explanation_text,
        "traditional_decision": traditional_decision,
        "within_limit_not_healthy": within_limit_not_healthy,
        "reasons": reasons
    }
