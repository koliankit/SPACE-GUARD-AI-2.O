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
        name: `${componentDetail?.component_id || 'Component'} Observed`,
        line: { color: componentResult?.decision === 'REJECT' ? '#EF4444' : '#38BDF8', width: 2.5 },
        marker: { size: 7, color: componentResult?.decision === 'REJECT' ? '#EF4444' : '#38BDF8' },
      },
      // 2. Extrapolated Future Drift Trajectory
      {
        x: xPred,
        y: yPred,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'AI Projected Drift (250h)',
        line: { color: '#F59E0B', width: 2, dash: 'dot' },
        marker: { size: 6, symbol: 'diamond', color: '#F59E0B' },
      },
      // 3. Lot Baseline Mean
      {
        x: [0, 250],
        y: [lotMean, lotMean],
        type: 'scatter',
        mode: 'lines',
        name: 'Lot Peer Baseline Mean',
        line: { color: '#94A3B8', width: 1.5, dash: 'dash' },
      },
      // 4. Datasheet Upper Limit
      {
        x: [0, 250],
        y: [limit, limit],
        type: 'scatter',
        mode: 'lines',
        name: `Datasheet Spec Limit (${limit.toFixed(1)})`,
        line: { color: '#DC2626', width: 2, dash: 'dashdot' },
      },
    ];

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      height: 180,
      margin: { l: 45, r: 25, t: 25, b: 35 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'monospace', size: 10, color: '#94A3B8' },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.25,
        font: { size: 9, color: '#CBD5E1' },
      },
      xaxis: {
        title: 'Burn-In Hours (h)',
        color: '#64748B',
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        zerolinecolor: '#334155',
        tickvals: [0, 24, 96, 168, 250],
        range: [-5, 260],
      },
      yaxis: {
        title: param,
        color: '#64748B',
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        zerolinecolor: '#334155',
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
