import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/format';
import type { CategorySummary } from '../../types/api';

export default function CategoryPieChart({ data, height = 240 }: { data: CategorySummary[]; height?: number }) {
  const slices = data.filter((c) => c.spent > 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={slices} dataKey="spent" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">
          {slices.map((c) => (
            <Cell key={c.categoryId} fill={c.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [formatCurrency(Number(value)), name]}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
