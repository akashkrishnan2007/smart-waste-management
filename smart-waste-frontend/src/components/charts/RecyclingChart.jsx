import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { recyclingRateData } from '../../utils/dummyData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rate = payload.find((p) => p.dataKey === 'rate');
  const target = payload.find((p) => p.dataKey === 'target');
  const gap = (target?.value ?? 60) - (rate?.value ?? 0);
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-textPrimary mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-600" />
          <span className="text-slate-500">Recycling Rate:</span>
          <span className="font-medium">{rate?.value}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-slate-500">Target:</span>
          <span className="font-medium">{target?.value}%</span>
        </div>
        <div className={`flex items-center gap-2 mt-1 pt-1 border-t border-slate-100`}>
          <span className="text-slate-500">Gap to target:</span>
          <span className={`font-semibold ${gap > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {gap > 0 ? `-${gap.toFixed(1)}%` : `+${Math.abs(gap).toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

const RecyclingChart = ({ data = recyclingRateData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barSize={22}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="city"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 70]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
        />
        <ReferenceLine
          y={60}
          stroke="#F59E0B"
          strokeDasharray="6 3"
          label={{ value: 'Target 60%', position: 'insideTopRight', fontSize: 10, fill: '#F59E0B' }}
        />
        <Bar dataKey="rate" name="Recycling Rate %" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.rate >= 50 ? '#16A34A' : entry.rate >= 38 ? '#22C55E' : '#86EFAC'}
            />
          ))}
        </Bar>
        <Bar dataKey="target" name="Target %" fill="#FEF3C7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RecyclingChart;
