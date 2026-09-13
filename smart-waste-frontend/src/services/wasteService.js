import api from './api';
import { wasteDataset, wasteTrendData, cityWasteComparison } from '../utils/dummyData';

// Fetch all waste records (falls back to dummy data if backend unavailable)
export const fetchWasteData = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/waste?${params}`);
  } catch {
    return wasteDataset;
  }
};

// Fetch trend data for charts
export const fetchWasteTrend = async () => {
  try {
    return await api.get('/waste/trend');
  } catch {
    return wasteTrendData;
  }
};

// Fetch city comparison data
export const fetchCityComparison = async () => {
  try {
    return await api.get('/waste/city-comparison');
  } catch {
    return cityWasteComparison;
  }
};

// Submit a prediction request — uses real ML API, no dummy fallback
export const submitPrediction = async (payload) => {
  return await api.post('/predict', payload);
};

// Fetch landfill data
export const fetchLandfills = async () => {
  try {
    return await api.get('/landfills');
  } catch {
    const { landfillsData } = await import('../utils/dummyData');
    return landfillsData;
  }
};

// Fetch reports list
export const fetchReports = async () => {
  try {
    return await api.get('/reports');
  } catch {
    const { reportsData } = await import('../utils/dummyData');
    return reportsData;
  }
};
