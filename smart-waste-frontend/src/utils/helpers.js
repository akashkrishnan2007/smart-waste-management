// Utility helper functions

/**
 * Format large numbers with commas
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toLocaleString('en-IN') ?? '0';
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get color based on percentage value
 */
export const getStatusColor = (value, thresholds = { danger: 30, warning: 60 }) => {
  if (value >= thresholds.warning) return 'text-green-600 bg-green-100';
  if (value >= thresholds.danger) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Get landfill status badge color
 */
export const getLandfillStatusColor = (status) => {
  switch (status) {
    case 'Normal':   return 'bg-green-100 text-green-800';
    case 'Warning':  return 'bg-yellow-100 text-yellow-800';
    case 'Critical': return 'bg-red-100 text-red-800';
    default:         return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get activity type icon color
 */
export const getActivityColor = (type) => {
  const colors = {
    collection: 'bg-blue-100 text-blue-700',
    recycling:  'bg-green-100 text-green-700',
    alert:      'bg-red-100 text-red-700',
    composting: 'bg-yellow-100 text-yellow-700',
    'e-waste':  'bg-purple-100 text-purple-700',
    report:     'bg-slate-100 text-slate-700',
    hazardous:  'bg-orange-100 text-orange-700',
    system:     'bg-teal-100 text-teal-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

/**
 * Calculate capacity percentage
 */
export const calcCapacityPercentage = (used, capacity) => {
  return Math.min(Math.round((used / capacity) * 100), 100);
};

/**
 * Truncate long strings
 */
export const truncate = (str, length = 30) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Sort data by key
 */
export const sortBy = (arr, key, order = 'asc') => {
  return [...arr].sort((a, b) => {
    if (order === 'asc') return a[key] > b[key] ? 1 : -1;
    return a[key] < b[key] ? 1 : -1;
  });
};

/**
 * Filter dataset by multiple criteria
 */
export const filterDataset = (data, filters) => {
  return data.filter((item) => {
    const cityMatch     = !filters.city     || item.city === filters.city;
    const yearMatch     = !filters.year     || item.year === Number(filters.year);
    const typeMatch     = !filters.wasteType || item.wasteType === filters.wasteType;
    const searchMatch   = !filters.search   ||
      item.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.wasteType.toLowerCase().includes(filters.search.toLowerCase());
    return cityMatch && yearMatch && typeMatch && searchMatch;
  });
};

/**
 * Generate a simple mock prediction
 */
export const generatePrediction = ({ city, wasteType, populationDensity, municipalEfficiency, year }) => {
  const baseFactor = populationDensity * 0.18;
  const efficiencyFactor = (100 - municipalEfficiency) / 100;
  const yearFactor = (year - 2023) * 0.03 + 1;
  const typeMultiplier = {
    Organic: 1.2, Plastic: 0.7, Paper: 0.4, Metal: 0.2,
    'E-Waste': 0.15, Glass: 0.1, Hazardous: 0.08, Mixed: 0.9,
  };
  const mult = typeMultiplier[wasteType] ?? 1.0;
  const predicted = Math.round(baseFactor * efficiencyFactor * yearFactor * mult * 10) / 10;
  const confidence = Math.min(96, 80 + Math.random() * 15).toFixed(1);
  return { predictedWaste: Math.max(predicted, 50), confidence: parseFloat(confidence) };
};

/**
 * Export data as CSV string
 */
export const exportToCSV = (data, filename = 'waste_data.csv') => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) => Object.values(row).join(',')).join('\n');
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Debounce function for search inputs
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
