// Realistic dummy data for Smart Waste Management Analytics System

export const citiesData = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal"
];

export const wasteTypes = ["Organic", "Plastic", "Paper", "Metal", "E-Waste", "Glass", "Hazardous", "Mixed"];

export const disposalMethods = ["Landfill", "Recycling", "Composting", "Incineration", "Waste-to-Energy"];

// Main waste dataset
export const wasteDataset = [
  { id: 1,  city: "Mumbai",    year: 2023, wasteType: "Organic",   wasteGenerated: 4520, recyclingRate: 38.2, disposalMethod: "Composting",      populationDensity: 20667, managementCost: 1240, municipalEfficiency: 78 },
  { id: 2,  city: "Mumbai",    year: 2023, wasteType: "Plastic",   wasteGenerated: 1830, recyclingRate: 42.5, disposalMethod: "Recycling",        populationDensity: 20667, managementCost: 980,  municipalEfficiency: 78 },
  { id: 3,  city: "Delhi",     year: 2023, wasteType: "Organic",   wasteGenerated: 5100, recyclingRate: 31.4, disposalMethod: "Landfill",         populationDensity: 11320, managementCost: 1380, municipalEfficiency: 65 },
  { id: 4,  city: "Delhi",     year: 2023, wasteType: "E-Waste",   wasteGenerated: 620,  recyclingRate: 55.0, disposalMethod: "Recycling",        populationDensity: 11320, managementCost: 760,  municipalEfficiency: 65 },
  { id: 5,  city: "Bangalore", year: 2023, wasteType: "Organic",   wasteGenerated: 3200, recyclingRate: 44.8, disposalMethod: "Composting",       populationDensity: 4381,  managementCost: 1100, municipalEfficiency: 82 },
  { id: 6,  city: "Bangalore", year: 2023, wasteType: "Paper",     wasteGenerated: 980,  recyclingRate: 61.2, disposalMethod: "Recycling",        populationDensity: 4381,  managementCost: 650,  municipalEfficiency: 82 },
  { id: 7,  city: "Chennai",   year: 2023, wasteType: "Plastic",   wasteGenerated: 1450, recyclingRate: 39.7, disposalMethod: "Recycling",        populationDensity: 6938,  managementCost: 870,  municipalEfficiency: 71 },
  { id: 8,  city: "Chennai",   year: 2023, wasteType: "Metal",     wasteGenerated: 540,  recyclingRate: 68.4, disposalMethod: "Recycling",        populationDensity: 6938,  managementCost: 490,  municipalEfficiency: 71 },
  { id: 9,  city: "Hyderabad", year: 2023, wasteType: "Organic",   wasteGenerated: 2870, recyclingRate: 36.1, disposalMethod: "Landfill",         populationDensity: 5839,  managementCost: 990,  municipalEfficiency: 69 },
  { id: 10, city: "Hyderabad", year: 2023, wasteType: "Hazardous", wasteGenerated: 310,  recyclingRate: 72.3, disposalMethod: "Incineration",     populationDensity: 5839,  managementCost: 1540, municipalEfficiency: 69 },
  { id: 11, city: "Kolkata",   year: 2023, wasteType: "Mixed",     wasteGenerated: 3940, recyclingRate: 28.5, disposalMethod: "Landfill",         populationDensity: 24252, managementCost: 820,  municipalEfficiency: 58 },
  { id: 12, city: "Pune",      year: 2023, wasteType: "Organic",   wasteGenerated: 2100, recyclingRate: 52.3, disposalMethod: "Composting",       populationDensity: 5765,  managementCost: 950,  municipalEfficiency: 85 },
  { id: 13, city: "Ahmedabad", year: 2023, wasteType: "Plastic",   wasteGenerated: 1680, recyclingRate: 41.6, disposalMethod: "Recycling",        populationDensity: 5765,  managementCost: 780,  municipalEfficiency: 73 },
  { id: 14, city: "Jaipur",    year: 2023, wasteType: "Paper",     wasteGenerated: 890,  recyclingRate: 47.9, disposalMethod: "Recycling",        populationDensity: 3085,  managementCost: 610,  municipalEfficiency: 76 },
  { id: 15, city: "Surat",     year: 2023, wasteType: "Organic",   wasteGenerated: 1960, recyclingRate: 49.2, disposalMethod: "Waste-to-Energy",  populationDensity: 6217,  managementCost: 1050, municipalEfficiency: 80 },
  // 2022 data
  { id: 16, city: "Mumbai",    year: 2022, wasteType: "Organic",   wasteGenerated: 4380, recyclingRate: 35.6, disposalMethod: "Composting",       populationDensity: 20500, managementCost: 1180, municipalEfficiency: 75 },
  { id: 17, city: "Delhi",     year: 2022, wasteType: "Organic",   wasteGenerated: 4950, recyclingRate: 29.8, disposalMethod: "Landfill",         populationDensity: 11200, managementCost: 1300, municipalEfficiency: 62 },
  { id: 18, city: "Bangalore", year: 2022, wasteType: "Organic",   wasteGenerated: 3050, recyclingRate: 42.1, disposalMethod: "Composting",       populationDensity: 4250,  managementCost: 1040, municipalEfficiency: 79 },
  { id: 19, city: "Chennai",   year: 2022, wasteType: "Plastic",   wasteGenerated: 1380, recyclingRate: 37.2, disposalMethod: "Recycling",        populationDensity: 6850,  managementCost: 820,  municipalEfficiency: 68 },
  { id: 20, city: "Hyderabad", year: 2022, wasteType: "Organic",   wasteGenerated: 2710, recyclingRate: 33.4, disposalMethod: "Landfill",         populationDensity: 5700,  managementCost: 940,  municipalEfficiency: 66 },
  { id: 21, city: "Kolkata",   year: 2022, wasteType: "Mixed",     wasteGenerated: 3820, recyclingRate: 26.1, disposalMethod: "Landfill",         populationDensity: 24100, managementCost: 790,  municipalEfficiency: 55 },
  { id: 22, city: "Pune",      year: 2022, wasteType: "Organic",   wasteGenerated: 1980, recyclingRate: 49.7, disposalMethod: "Composting",       populationDensity: 5620,  managementCost: 900,  municipalEfficiency: 82 },
  { id: 23, city: "Ahmedabad", year: 2022, wasteType: "Plastic",   wasteGenerated: 1590, recyclingRate: 38.9, disposalMethod: "Recycling",        populationDensity: 5620,  managementCost: 740,  municipalEfficiency: 70 },
  // 2021 data
  { id: 24, city: "Mumbai",    year: 2021, wasteType: "Organic",   wasteGenerated: 4210, recyclingRate: 32.4, disposalMethod: "Composting",       populationDensity: 20300, managementCost: 1120, municipalEfficiency: 72 },
  { id: 25, city: "Delhi",     year: 2021, wasteType: "Organic",   wasteGenerated: 4780, recyclingRate: 27.5, disposalMethod: "Landfill",         populationDensity: 11050, managementCost: 1240, municipalEfficiency: 59 },
  { id: 26, city: "Bangalore", year: 2021, wasteType: "Organic",   wasteGenerated: 2890, recyclingRate: 39.6, disposalMethod: "Composting",       populationDensity: 4120,  managementCost: 980,  municipalEfficiency: 76 },
  { id: 27, city: "Chennai",   year: 2021, wasteType: "Plastic",   wasteGenerated: 1310, recyclingRate: 34.8, disposalMethod: "Recycling",        populationDensity: 6760,  managementCost: 770,  municipalEfficiency: 65 },
  { id: 28, city: "Hyderabad", year: 2021, wasteType: "Organic",   wasteGenerated: 2560, recyclingRate: 31.2, disposalMethod: "Landfill",         populationDensity: 5560,  managementCost: 890,  municipalEfficiency: 63 },
  { id: 29, city: "Kolkata",   year: 2021, wasteType: "Mixed",     wasteGenerated: 3690, recyclingRate: 23.7, disposalMethod: "Landfill",         populationDensity: 23950, managementCost: 760,  municipalEfficiency: 52 },
  { id: 30, city: "Pune",      year: 2021, wasteType: "Organic",   wasteGenerated: 1860, recyclingRate: 46.8, disposalMethod: "Composting",       populationDensity: 5480,  managementCost: 855,  municipalEfficiency: 79 },
];

// Trend data for line chart
export const wasteTrendData = [
  { month: "Jan", organic: 420, plastic: 185, paper: 98, metal: 54, eWaste: 32 },
  { month: "Feb", organic: 398, plastic: 192, paper: 104, metal: 58, eWaste: 35 },
  { month: "Mar", organic: 445, plastic: 178, paper: 112, metal: 61, eWaste: 38 },
  { month: "Apr", organic: 410, plastic: 205, paper: 95,  metal: 49, eWaste: 41 },
  { month: "May", organic: 468, plastic: 212, paper: 118, metal: 67, eWaste: 44 },
  { month: "Jun", organic: 452, plastic: 198, paper: 108, metal: 72, eWaste: 39 },
  { month: "Jul", organic: 489, plastic: 224, paper: 124, metal: 65, eWaste: 47 },
  { month: "Aug", organic: 475, plastic: 218, paper: 115, metal: 58, eWaste: 52 },
  { month: "Sep", organic: 461, plastic: 208, paper: 109, metal: 63, eWaste: 48 },
  { month: "Oct", organic: 498, plastic: 231, paper: 131, metal: 70, eWaste: 55 },
  { month: "Nov", organic: 482, plastic: 219, paper: 121, metal: 68, eWaste: 50 },
  { month: "Dec", organic: 510, plastic: 245, paper: 138, metal: 75, eWaste: 58 },
];

// Waste type distribution for pie chart
export const wasteTypeDistribution = [
  { name: "Organic",   value: 42, color: "#16A34A" },
  { name: "Plastic",   value: 18, color: "#3B82F6" },
  { name: "Paper",     value: 12, color: "#F59E0B" },
  { name: "Metal",     value: 8,  color: "#6B7280" },
  { name: "E-Waste",   value: 6,  color: "#EF4444" },
  { name: "Glass",     value: 5,  color: "#14B8A6" },
  { name: "Hazardous", value: 4,  color: "#8B5CF6" },
  { name: "Mixed",     value: 5,  color: "#F97316" },
];

// City waste comparison bar chart
export const cityWasteComparison = [
  { city: "Mumbai",    waste: 6350, recycled: 2420, landfill: 3930 },
  { city: "Delhi",     waste: 5720, recycled: 1798, landfill: 3922 },
  { city: "Bangalore", waste: 4180, recycled: 1872, landfill: 2308 },
  { city: "Chennai",   waste: 1990, recycled: 782,  landfill: 1208 },
  { city: "Hyderabad", waste: 3180, recycled: 1148, landfill: 2032 },
  { city: "Kolkata",   waste: 3940, recycled: 1123, landfill: 2817 },
  { city: "Pune",      waste: 2100, recycled: 1098, landfill: 1002 },
  { city: "Ahmedabad", waste: 1680, recycled: 698,  landfill: 982  },
];

// Recycling rate by city
export const recyclingRateData = [
  { city: "Pune",      rate: 52.3, target: 60 },
  { city: "Bangalore", rate: 44.8, target: 60 },
  { city: "Mumbai",    rate: 38.2, target: 60 },
  { city: "Surat",     rate: 49.2, target: 60 },
  { city: "Jaipur",    rate: 47.9, target: 60 },
  { city: "Chennai",   rate: 39.7, target: 60 },
  { city: "Ahmedabad", rate: 41.6, target: 60 },
  { city: "Hyderabad", rate: 36.1, target: 60 },
  { city: "Delhi",     rate: 31.4, target: 60 },
  { city: "Kolkata",   rate: 28.5, target: 60 },
];

// Year-over-year comparison
export const yearlyTrendData = [
  { year: "2019", totalWaste: 28400, recycled: 8948,  landfill: 19452 },
  { year: "2020", totalWaste: 26800, recycled: 9112,  landfill: 17688 },
  { year: "2021", totalWaste: 29200, recycled: 10220, landfill: 18980 },
  { year: "2022", totalWaste: 31500, recycled: 11812, landfill: 19688 },
  { year: "2023", totalWaste: 33800, recycled: 13858, landfill: 19942 },
];

// Disposal method breakdown
export const disposalMethodData = [
  { method: "Landfill",         value: 38, color: "#EF4444" },
  { method: "Recycling",        value: 32, color: "#16A34A" },
  { method: "Composting",       value: 16, color: "#F59E0B" },
  { method: "Incineration",     value: 8,  color: "#8B5CF6" },
  { method: "Waste-to-Energy",  value: 6,  color: "#14B8A6" },
];

// Population density vs waste generated scatter data
export const densityVsWasteData = [
  { city: "Mumbai",    density: 20667, waste: 6350, size: 12 },
  { city: "Kolkata",   density: 24252, waste: 3940, size: 10 },
  { city: "Delhi",     density: 11320, waste: 5720, size: 11 },
  { city: "Chennai",   density: 6938,  waste: 1990, size: 7  },
  { city: "Hyderabad", density: 5839,  waste: 3180, size: 9  },
  { city: "Bangalore", density: 4381,  waste: 4180, size: 10 },
  { city: "Pune",      density: 5765,  waste: 2100, size: 7  },
  { city: "Ahmedabad", density: 5765,  waste: 1680, size: 6  },
  { city: "Surat",     density: 6217,  waste: 1960, size: 7  },
  { city: "Jaipur",    density: 3085,  waste: 890,  size: 5  },
];

// Landfill data
export const landfillsData = [
  { id: 1, name: "Deonar Dumping Ground",   city: "Mumbai",    capacity: 100, used: 96, lat: 19.0608, lng: 72.9247, status: "Critical",  openedYear: 1927, type: "Municipal Solid Waste" },
  { id: 2, name: "Ghazipur Landfill",       city: "Delhi",     capacity: 70,  used: 65, lat: 28.6279, lng: 77.3150, status: "Critical",  openedYear: 1984, type: "Municipal Solid Waste" },
  { id: 3, name: "Bellandur Dump",          city: "Bangalore", capacity: 50,  used: 38, lat: 12.9352, lng: 77.6245, status: "Warning",   openedYear: 2005, type: "Mixed Waste"           },
  { id: 4, name: "Perungudi Dumpyard",      city: "Chennai",   capacity: 45,  used: 39, lat: 12.9462, lng: 80.2468, status: "Warning",   openedYear: 1975, type: "Municipal Solid Waste" },
  { id: 5, name: "Jawaharnagar SLF",        city: "Hyderabad", capacity: 80,  used: 52, lat: 17.5325, lng: 78.4671, status: "Normal",    openedYear: 2009, type: "Sanitary Landfill"    },
  { id: 6, name: "Dhapa Dumping Ground",    city: "Kolkata",   capacity: 60,  used: 57, lat: 22.5726, lng: 88.4208, status: "Critical",  openedYear: 1996, type: "Municipal Solid Waste" },
  { id: 7, name: "Urse Landfill",           city: "Pune",      capacity: 40,  used: 22, lat: 18.6420, lng: 73.7148, status: "Normal",    openedYear: 2010, type: "Regional SLF"         },
  { id: 8, name: "Piplaj Dumpsite",         city: "Ahmedabad", capacity: 55,  used: 34, lat: 22.9564, lng: 72.5820, status: "Normal",    openedYear: 2003, type: "Municipal Solid Waste" },
  { id: 9, name: "Langadiyawas Landfill",   city: "Jaipur",    capacity: 35,  used: 21, lat: 26.8467, lng: 75.8071, status: "Normal",    openedYear: 2008, type: "Class I Landfill"     },
  { id: 10,name: "Khajod Landfill",         city: "Surat",     capacity: 48,  used: 26, lat: 21.1702, lng: 72.8311, status: "Normal",    openedYear: 2012, type: "Sanitary Landfill"    },
];

// Recent activity
export const recentActivity = [
  { id: 1,  action: "Waste collection completed",   city: "Mumbai",    amount: "245 tonnes", time: "2 hours ago",   type: "collection", status: "Completed" },
  { id: 2,  action: "Recycling center report filed", city: "Bangalore", amount: "89 tonnes",  time: "4 hours ago",   type: "recycling",  status: "Completed" },
  { id: 3,  action: "Landfill capacity alert",       city: "Delhi",     amount: "N/A",         time: "5 hours ago",   type: "alert",      status: "Warning"   },
  { id: 4,  action: "New composting unit added",     city: "Pune",      amount: "12 tonnes",  time: "8 hours ago",   type: "composting", status: "Active"    },
  { id: 5,  action: "E-waste drive completed",       city: "Chennai",   amount: "38 tonnes",  time: "10 hours ago",  type: "e-waste",    status: "Completed" },
  { id: 6,  action: "Monthly report generated",      city: "Hyderabad", amount: "N/A",         time: "12 hours ago",  type: "report",     status: "Completed" },
  { id: 7,  action: "Hazardous waste disposed",      city: "Kolkata",   amount: "15 tonnes",  time: "1 day ago",     type: "hazardous",  status: "Completed" },
  { id: 8,  action: "Route optimization updated",    city: "Surat",     amount: "N/A",         time: "1 day ago",     type: "system",     status: "Active"    },
];

// Prediction history
export const predictionHistory = [
  { id: 1, city: "Mumbai",    wasteType: "Organic", populationDensity: 21000, municipalEfficiency: 78, year: 2024, predictedWaste: 4820, confidence: 94.2, createdAt: "2024-01-15" },
  { id: 2, city: "Delhi",     wasteType: "Plastic", populationDensity: 11500, municipalEfficiency: 65, year: 2024, predictedWaste: 1980, confidence: 91.7, createdAt: "2024-01-14" },
  { id: 3, city: "Bangalore", wasteType: "Organic", populationDensity: 4500,  municipalEfficiency: 82, year: 2024, predictedWaste: 3380, confidence: 95.1, createdAt: "2024-01-13" },
  { id: 4, city: "Chennai",   wasteType: "Mixed",   populationDensity: 7100,  municipalEfficiency: 71, year: 2025, predictedWaste: 2210, confidence: 88.4, createdAt: "2024-01-12" },
  { id: 5, city: "Hyderabad", wasteType: "Organic", populationDensity: 6000,  municipalEfficiency: 69, year: 2025, predictedWaste: 3050, confidence: 90.3, createdAt: "2024-01-11" },
];

// Dashboard stats
export const dashboardStats = {
  totalWasteGenerated: "33,842",
  avgRecyclingRate: "41.3%",
  totalCities: 15,
  avgManagementCost: "₹924",
  municipalEfficiencyScore: 72.4,
};

// Reports data
export const reportsData = [
  { id: 1, name: "Annual Waste Report 2023",       type: "Annual",    generatedBy: "Admin",  date: "2024-01-10", size: "2.4 MB", status: "Ready"   },
  { id: 2, name: "Recycling Performance Q4 2023",  type: "Quarterly", generatedBy: "Admin",  date: "2024-01-05", size: "1.1 MB", status: "Ready"   },
  { id: 3, name: "Landfill Capacity Report",        type: "Monthly",   generatedBy: "System", date: "2023-12-31", size: "0.8 MB", status: "Ready"   },
  { id: 4, name: "City Waste Comparison 2023",      type: "Custom",    generatedBy: "Admin",  date: "2023-12-20", size: "1.6 MB", status: "Ready"   },
  { id: 5, name: "Prediction Accuracy Report",      type: "Analytics", generatedBy: "System", date: "2023-12-15", size: "0.5 MB", status: "Ready"   },
  { id: 6, name: "Municipal Efficiency Index",      type: "Annual",    generatedBy: "Admin",  date: "2023-12-01", size: "3.1 MB", status: "Ready"   },
];
