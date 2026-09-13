// App-wide constants

export const APP_NAME = "SmartWaste";
export const APP_FULL_NAME = "Smart Waste Management Analytics System";
export const APP_VERSION = "1.0.0";

export const CHART_COLORS = {
  primary:  "#16A34A",
  secondary:"#22C55E",
  accent:   "#0F766E",
  blue:     "#3B82F6",
  yellow:   "#F59E0B",
  red:      "#EF4444",
  purple:   "#8B5CF6",
  orange:   "#F97316",
  teal:     "#14B8A6",
  gray:     "#6B7280",
};

export const CHART_PALETTE = [
  "#16A34A", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#14B8A6", "#F97316", "#6B7280",
];

export const WASTE_TYPES = [
  "Construction", "E-Waste", "Hazardous", "Organic", "Plastic",
];

export const DISPOSAL_METHODS = [
  "Landfill", "Recycling", "Composting", "Incineration", "Waste-to-Energy",
];

export const CITIES = [
  "Agra", "Ahmedabad", "Allahabad", "Amritsar", "Bengaluru", "Bhopal",
  "Chennai", "Coimbatore", "Delhi", "Guwahati", "Gwalior", "Hyderabad",
  "Indore", "Jabalpur", "Jaipur", "Jodhpur", "Kanpur", "Kolkata",
  "Lucknow", "Ludhiana", "Madurai", "Meerut", "Mumbai", "Nagpur",
  "Nashik", "Patna", "Pune", "Rajkot", "Ranchi", "Surat",
  "Thiruvananthapuram", "Vadodara", "Varanasi", "Visakhapatnam",
];

export const YEARS = ["2019", "2020", "2021", "2022", "2023"];

export const PREDICTION_YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

export const NAV_LINKS = [
  { label: "Dashboard",   path: "/dashboard",   icon: "MdDashboard"   },
  { label: "Waste Data",  path: "/waste-data",  icon: "MdDelete"      },
  { label: "Analytics",   path: "/analytics",   icon: "MdBarChart"    },
  { label: "Prediction",  path: "/prediction",  icon: "MdAutoGraph"   },
  { label: "Landfills",   path: "/landfills",   icon: "MdLocationOn"  },
  { label: "Reports",     path: "/reports",     icon: "MdAssignment"  },
  { label: "Profile",     path: "/profile",     icon: "MdPerson"      },
  { label: "Settings",    path: "/settings",    icon: "MdSettings"    },
];

export const ITEMS_PER_PAGE = 10;
