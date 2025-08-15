import React, { useState } from 'react';
import '../styles/SearchFilter.css';

const SearchFilter = ({ nodes, onFilteredNodesChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, selectedType, selectedYear);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    applyFilters(searchTerm, type, selectedYear);
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year);
    applyFilters(searchTerm, selectedType, year);
  };

  const applyFilters = (search, type, year) => {
    let filtered = nodes;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(node =>
        node.label.toLowerCase().includes(search.toLowerCase()) ||
        (node.data.description && node.data.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(node => node.type === type);
    }

    // Apply year filter (extract year from module codes)
    if (year !== 'all') {
      filtered = filtered.filter(node => {
        if (node.type === 'course') return true;
        const yearMatch = node.label.match(/\\d/);
        return yearMatch && yearMatch[0] === year;
      });
    }

    onFilteredNodesChange(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedYear('all');
    onFilteredNodesChange(nodes);
  };

  return (
    <div className="search-filter">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search modules..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-row">
        <div className="filter-group">
          <label>Type:</label>
          <select value={selectedType} onChange={(e) => handleTypeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="course">Courses</option>
            <option value="module">Modules</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Year:</label>
          <select value={selectedYear} onChange={(e) => handleYearFilter(e.target.value)}>
            <option value="all">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
          </select>
        </div>
        
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
