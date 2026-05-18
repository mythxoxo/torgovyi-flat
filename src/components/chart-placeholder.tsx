"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi } from "lightweight-charts";
import type { TradeRecord } from "../lib/shared";

function buildCandles(trades: TradeRecord[]) {
  const grouped = new Map<string, number[]>();
  trades.forEach((trade) => {
    const date = new Date(trade.createdAt);
    const bucket = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
    const price = trade.spotPriceTon || (trade.tonAmountGross > 0 && trade.tokenAmount > 0 ? trade.tonAmountGross / trade.tokenAmount : 0);
    if (!grouped.has(bucket)) grouped.set(bucket, []);
    grouped.get(bucket)?.push(price);
  });

  return Array.from(grouped.entries()).map(([time, values]) => ({
    time: time.replace(" ", "T") as never,
    open: values[0] ?? 0,
    high: Math.max(...values),
    low: Math.min(...values),
    close: values[values.length - 1] ?? 0
  }));
}

export function ChartPlaceholder({ trades }: { trades: TradeRecord[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 260,
      layout: { background: { color: "#111827" }, textColor: "#8ba3c1" },
      grid: { vertLines: { color: "#1e3a5f" }, horzLines: { color: "#1e3a5f" } }
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00c896",
      downColor: "#ff4757",
      borderUpColor: "#00c896",
      borderDownColor: "#ff4757",
      wickUpColor: "#00c896",
      wickDownColor: "#ff4757"
    });
    const candles = buildCandles(trades);
    if (candles.length) series.setData(candles);
    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      if (ref.current && chartRef.current) {
        chartRef.current.applyOptions({ width: ref.current.clientWidth });
      }
    });
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [trades]);

  return <div className="glass-card p-3"><div ref={ref} className="w-full" /></div>;
}
