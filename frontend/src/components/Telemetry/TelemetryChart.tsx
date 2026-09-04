import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { ComponentDetail, ComponentResult } from '../../types';

interface TelemetryChartProps {
  componentDetail?: ComponentDetail | null;
  componentResult?: ComponentResult | null;
  lotMean?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  componentDetail,
  componentResult,
  lotMean = 21.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const measurements = componentDetail?.measurements || [];
    const limit = componentResult?.datasheet_limit ?? (measurements[0]?.datasheet_limit ?? 50.0);
    const param = componentResult?.parameter || measurements[0]?.stage || 'Reading';

    // Parse stages to numeric hours
    const observedHours: number[] = [];
    const observedValues: number[] = [];

    measurements.forEach((m) => {
      const match = m.stage.match(/(\d+)/);
      const hr = match ? parseInt(match[1], 10) : 0;
      observedHours.push(hr);
      observedValues.push(m.value);
    });

    // If no measurements, provide standard default or placeholder
    const xObserved = observedHours.length > 0 ? observedHours : [0, 24, 96, 168];
    const yObserved = observedValues.length > 0 ? observedValues : [20, 20.5, 21, 21.5];

    // Projected trajectory data (from last observed point to 250h)
    const lastHour = xObserved[xObserved.length - 1];
    const lastVal = yObserved[yObserved.length - 1];
    const predVal = componentResult?.predicted_value ?? (lastVal + (lastVal - yObserved[0]) * 0.5);

    const xPred = [lastHour, 250];
    const yPred = [lastVal, predVal];

    // Plotly traces
    const traces: Plotly.Data[] = [
      // 1. Observed Component Burn-In Readings
      {
        x: xObserved,
        y: yObserved,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${componentDetail?.component_id || 'COMP'} SENSOR RAW`,
        line: { color: componentResult?.decision === 'REJECT' ? '#FF0055' : '#00E5FF', width: 2.5 },
        marker: { size: 7, color: componentResult?.decision === 'REJECT' ? '#FF0055' : '#00E5FF', symbol: 'circle' },
      },
      // 2. Extrapolated Future Drift Trajectory
      {
        x: xPred,
        y: yPred,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'AI KALMAN/DRIFT (250h)',
        line: { color: '#FFB800', width: 2, dash: 'dot' },
        marker: { size: 6, symbol: 'diamond', color: '#FFB800' },
      },
      // 3. Lot Baseline Mean
      {
        x: [0, 250],
        y: [lotMean, lotMean],
        type: 'scatter',
        mode: 'lines',
        name: 'LOT POPULATION MEAN',
        line: { color: '#64748B', width: 1.5, dash: 'dash' },
      },
      // 4. Datasheet Upper Limit
      {
        x: [0, 250],
        y: [limit, limit],
        type: 'scatter',
        mode: 'lines',
        name: `ISRO SPEC THRESHOLD (${limit.toFixed(1)})`,
        line: { color: '#FF0055', width: 2, dash: 'dashdot' },
      },
    ];

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      height: 195,
      margin: { l: 48, r: 20, t: 28, b: 35 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(3, 7, 18, 0.6)',
      font: { family: "'Share Tech Mono', 'JetBrains Mono', monospace", size: 10, color: '#94A3B8' },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.25,
        font: { size: 9, color: '#CBD5E1' },
      },
      xaxis: {
        title: 'STAGE SEQUENCE (HOURS: 0h → 250h)',
        color: '#64748B',
        gridcolor: 'rgba(30, 41, 59, 0.6)',
        zerolinecolor: '#1E293B',
        tickvals: [0, 24, 96, 168, 250],
        range: [-5, 260],
      },
      yaxis: {
        title: `${param} [VALUE]`,
        color: '#64748B',
        gridcolor: 'rgba(30, 41, 59, 0.6)',
        zerolinecolor: '#1E293B',
      },
      hovermode: 'closest',
    };

    Plotly.newPlot(containerRef.current, traces, layout, {
      responsive: true,
      displayModeBar: false,
    });

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [componentDetail, componentResult, lotMean]);

  return <div ref={containerRef} className="w-full h-full min-h-[170px]" />;
};
