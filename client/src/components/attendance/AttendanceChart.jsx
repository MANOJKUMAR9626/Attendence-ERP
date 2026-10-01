// Reusable Attendance Line/Bar Chart using Recharts
import {
  ResponsiveContainer, LineChart, BarChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: <strong>{p.value}%</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AttendanceChart = ({
  data = [],
  type = 'line',        // 'line' | 'bar'
  dataKey = 'value',
  xKey = 'label',
  name = 'Attendance',
  color = '#6366f1',
  showThreshold = true,
  threshold = 75,
  height = 260,
}) => {
  const Chart = type === 'bar' ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        {showThreshold && (
          <ReferenceLine y={threshold} stroke="#f43f5e" strokeDasharray="4 4"
            label={{ value: `${threshold}% min`, fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
        )}
        {type === 'bar' ? (
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ) : (
          <Line dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5}
            dot={{ fill: color, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} type="monotone" />
        )}
      </Chart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
