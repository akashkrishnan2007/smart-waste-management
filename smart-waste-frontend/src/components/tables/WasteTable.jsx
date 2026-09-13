import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from 'react-icons/md';

const BADGE_COLORS = {
  Organic:   'bg-green-100 text-green-800',
  Plastic:   'bg-blue-100 text-blue-800',
  Paper:     'bg-yellow-100 text-yellow-800',
  Metal:     'bg-gray-100 text-gray-700',
  'E-Waste': 'bg-red-100 text-red-800',
  Glass:     'bg-teal-100 text-teal-800',
  Hazardous: 'bg-purple-100 text-purple-800',
  Mixed:     'bg-orange-100 text-orange-800',
};

const DISPOSAL_COLORS = {
  Landfill:          'bg-red-50 text-red-600',
  Recycling:         'bg-green-50 text-green-700',
  Composting:        'bg-yellow-50 text-yellow-700',
  Incineration:      'bg-purple-50 text-purple-700',
  'Waste-to-Energy': 'bg-blue-50 text-blue-700',
};

const SortIcon = ({ direction }) => {
  if (direction === 'asc')  return <MdArrowUpward size={13} />;
  if (direction === 'desc') return <MdArrowDownward size={13} />;
  return <MdUnfoldMore size={13} className="opacity-40" />;
};

const WasteTable = ({ data = [] }) => {
  const [sortKey, setSortKey] = useState('city');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
    return (aVal - bVal) * dir;
  });

  const columns = [
    { key: 'city',              label: 'City'              },
    { key: 'year',              label: 'Year'              },
    { key: 'wasteType',         label: 'Waste Type'        },
    { key: 'wasteGenerated',    label: 'Generated (T)'     },
    { key: 'recyclingRate',     label: 'Recycling Rate'    },
    { key: 'disposalMethod',    label: 'Disposal Method'   },
    { key: 'populationDensity', label: 'Pop. Density'      },
    { key: 'managementCost',    label: 'Cost (₹/T)'        },
    { key: 'municipalEfficiency', label: 'Efficiency'      },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="table-header text-left cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  <SortIcon direction={sortKey === col.key ? sortDir : null} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                No records found
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <motion.tr
                key={row.id}
                className="hover:bg-slate-50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <td className="table-cell font-medium text-textPrimary">{row.city}</td>
                <td className="table-cell text-slate-500">{row.year}</td>
                <td className="table-cell">
                  <span className={`badge ${BADGE_COLORS[row.wasteType] ?? 'bg-gray-100 text-gray-700'}`}>
                    {row.wasteType}
                  </span>
                </td>
                <td className="table-cell font-medium">{row.wasteGenerated?.toLocaleString()}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[50px]">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(row.recyclingRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-textPrimary w-10 text-right">
                      {row.recyclingRate}%
                    </span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${DISPOSAL_COLORS[row.disposalMethod] ?? 'bg-gray-100 text-gray-700'}`}>
                    {row.disposalMethod}
                  </span>
                </td>
                <td className="table-cell text-slate-500">
                  {row.populationDensity?.toLocaleString()}/km²
                </td>
                <td className="table-cell">₹{row.managementCost}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        row.municipalEfficiency >= 75 ? 'bg-green-500' :
                        row.municipalEfficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{row.municipalEfficiency}%</span>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WasteTable;
