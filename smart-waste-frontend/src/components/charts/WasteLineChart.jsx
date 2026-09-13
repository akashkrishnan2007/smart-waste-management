import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Dot,
} from 'recharts';
import { wasteTrendData } from '../../utils/dummyData';
import { CHART_COLORS } from '../../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-textPrimary mb-2">{label} 2023</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}</span>
          </div>
          <span className="font-medium text-textPrimary">{entry.value} T</span>
        </div>
      ))}
    </div>
  );
};

const WasteLineChart = ({ data = wasteTrendData, showAll = false }) => {
  const lines = showAll
    ? [
        { key: 'organic',  color: CHART_COLORS.primary,   name: 'Organic'  },
        { key: 'plastic',  color: CHART_COLORS.blue,      name: 'Plastic'  },
        { key: 'paper',    color: CHART_COLORS.yellow,    name: 'Paper'    },
        { key: 'metal',    color: CHART_COLORS.gray,      name: 'Metal'    },
        { key: 'eWaste',   color: CHART_COLORS.red,       name: 'E-Waste'  },
      ]
    : [
        { key: 'organic',  color: CHART_COLORS.primary,   name: 'Organic'  },
        { key: 'plastic',  color: CHART_COLORS.blue,      name: 'Plastic'  },
        { key: 'paper',    color: CHART_COLORS.yellow,    name: 'Paper'    },
      ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          {lines.map((l) => (
            <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={l.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={l.color} stopOpacity={0}    />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
        />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WasteLineChart;
