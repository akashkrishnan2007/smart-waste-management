import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MdSearch, MdFilterList, MdFileDownload,
  MdFileUpload, MdClose, MdRefresh,
} from 'react-icons/md';
import WasteTable from '../components/tables/WasteTable';
import Button from '../components/common/Button';
import { Select } from '../components/common/Input';
import { wasteDataset } from '../utils/dummyData';
import { CITIES, WASTE_TYPES, YEARS, ITEMS_PER_PAGE } from '../utils/constants';
import { filterDataset, exportToCSV } from '../utils/helpers';
import useDebounce from '../hooks/useDebounce';
import usePagination from '../hooks/usePagination';

const WasteData = () => {
  const [search, setSearch]    = useState('');
  const [filters, setFilters]  = useState({ city: '', year: '', wasteType: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting]     = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = filterDataset(wasteDataset, { ...filters, search: debouncedSearch });

  const {
    currentPage, totalPages, currentData, goToPage,
    nextPage, prevPage, hasNext, hasPrev,
    totalItems, startIndex, endIndex, reset,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  // Reset pagination when filters/search change
  useEffect(() => { reset(); }, [debouncedSearch, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ city: '', year: '', wasteType: '' });
    setSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(Boolean) || search;

  const handleExport = () => exportToCSV(filtered, 'waste_data_export.csv');

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => setImporting(false), 1500); // Mock import
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Waste Data</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage and explore waste management records across cities
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="white"
            size="sm"
            icon={<MdFileUpload />}
            loading={importing}
            onClick={handleImport}
          >
            Import CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<MdFileDownload />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button size="sm" icon={<MdRefresh />} onClick={() => setSearch('')}>
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Search + Filter Bar */}
      <motion.div
        className="card p-4 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, waste type..."
              className="input-field pl-9 pr-4"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'white'}
            size="sm"
            icon={<MdFilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-red-400 rounded-full inline-block" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" icon={<MdClose />} onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Select
              label="Filter by City"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              options={CITIES}
              placeholder="All Cities"
            />
            <Select
              label="Filter by Year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              options={YEARS}
              placeholder="All Years"
            />
            <Select
              label="Filter by Waste Type"
              name="wasteType"
              value={filters.wasteType}
              onChange={handleFilterChange}
              options={WASTE_TYPES}
              placeholder="All Types"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Data Table */}
      <motion.div
        className="card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Table Header Info */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-textPrimary">Records</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {totalItems > 0 ? startIndex : 0}–{endIndex} of {totalItems} records
            </p>
          </div>
          {hasActiveFilters && (
            <span className="badge bg-primary-100 text-primary-700">
              {totalItems} filtered result{totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <WasteTable data={currentData} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
                disabled={!hasPrev}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={!hasNext}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records',    value: wasteDataset.length,                                color: 'text-primary-600' },
          { label: 'Cities Covered',   value: [...new Set(filtered.map((d) => d.city))].length,   color: 'text-blue-600'    },
          { label: 'Years Covered',    value: [...new Set(filtered.map((d) => d.year))].length,   color: 'text-purple-600'  },
          { label: 'Waste Types',      value: [...new Set(filtered.map((d) => d.wasteType))].length, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="card py-3 px-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WasteData;
