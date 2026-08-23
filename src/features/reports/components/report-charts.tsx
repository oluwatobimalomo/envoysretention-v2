"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";
import type { DonutSlice, BarDatum, TrendPoint } from "../services/reports-service";

const PALETTE = ["var(--brand-green)", "var(--brand-gold)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--brand-green-mid)"];

export function ReportDonut({ data, centerValue, centerLabel }: { data: DonutSlice[]; centerValue: string | number; centerLabel: string }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl font-semibold">{centerValue}</p>
        <p className="max-w-[100px] text-center text-[10px] text-muted-foreground">{centerLabel}</p>
      </div>
      <Legend2 data={data} />
    </div>
  );
}

function Legend2({ data }: { data: DonutSlice[] }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
      {data.map((d, i) => (
        <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
          {d.name} ({d.value})
        </span>
      ))}
    </div>
  );
}

export function ReportBars({ data, height = 220 }: { data: BarDatum[]; height?: number }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" fill="var(--brand-green)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportTrend({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="reached" name="Reached" stroke="var(--success)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="callback" name="Call Back" stroke="var(--warning)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="notReached" name="Incorrect Contact" stroke="var(--destructive)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">No data in this range.</div>;
}
