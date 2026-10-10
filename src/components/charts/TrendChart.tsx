import { useId } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatCurrency } from '../../lib/format';
import type { TrendPoint } from '../../types/api';

interface Props {
  data: TrendPoint[];
  formatLabel: (label: string) => string;
  height?: number;
  variant?: 'bar' | 'area';
}

const BRAND = '#6366f1';

const axisProps = {
  tick: { fontSize: 12, fill: '#94a3b8' },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
  fontSize: 13,
};

export default function TrendChart({ data, formatLabel, height = 260, variant = 'bar' }: Props) {
  const gradientId = `trend-${useId().replace(/:/g, '')}`;

  const tooltip = (
    <Tooltip
      cursor={variant === 'bar' ? { fill: '#eef2ff' } : { stroke: BRAND, strokeDasharray: '4 4' }}
      formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
      labelFormatter={(label) => formatLabel(String(label))}
      contentStyle={tooltipStyle}
    />
  );

  const xAxis = (
    <XAxis dataKey="label" tickFormatter={formatLabel} interval="preserveStartEnd" minTickGap={16} {...axisProps} />
  );
  const yAxis = <YAxis tickFormatter={formatCompact} width={60} allowDecimals={false} {...axisProps} />;
  const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'area' ? (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          <Area
            type="monotone"
            dataKey="total"
            stroke={BRAND}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          <Bar dataKey="total" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
