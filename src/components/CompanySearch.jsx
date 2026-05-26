import React, { useState } from 'react';
import { Search } from 'lucide-react';

/**
 * CompanySearch Component
 * Displays top 100 internship companies with real-time search filtering
 * Features: Search bar, responsive grid, loading skeleton, empty state
 */
const CompanySearch = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load companies data on mount
  React.useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/data/top100-internship-companies.json');
        if (!response.ok) throw new Error('Failed to load companies');
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        console.error('Error loading companies:', error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Handle search input with real-time filtering
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(term) ||
          company.industry.toLowerCase().includes(term)
      );
      setFilteredCompanies(filtered);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="h-10 bg-[#1a1a1a] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4 animate-pulse">
              <div className="h-12 bg-[#1a1a1a] rounded mb-3"></div>
              <div className="h-4 bg-[#1a1a1a] rounded mb-2"></div>
              <div className="h-8 bg-[#1a1a1a] rounded mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-[#888]" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-[#EDEDED] placeholder-[#666] focus:border-[#D4AF37] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCompanies.map((company, index) => (
            <CompanyCard key={index} company={company} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * CompanyCard Component - Individual company display
 */
const CompanyCard = ({ company }) => {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#D4AF37] transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20">
      {/* Company Logo */}
      <div className="mb-3 h-12 flex items-center justify-center bg-[#0A0A0A] rounded">
        <img
          src={company.logo}
          alt={company.name}
          className="max-h-10 max-w-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span className="text-[#D4AF37] font-bold text-2xl hidden">
          {company.name.charAt(0)}
        </span>
      </div>

      {/* Company Info */}
      <h3 className="text-[#EDEDED] font-bold text-sm mb-1 truncate">{company.name}</h3>
      <p className="text-[#888] text-xs mb-3">{company.industry}</p>

      {/* Action Button */}
      <a
        href={company.careers}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2 px-3 bg-[#D4AF37] text-[#0A0A0A] rounded font-semibold text-sm text-center hover:bg-[#E8C547] transition-colors"
      >
        View Openings
      </a>
    </div>
  );
};

/**
 * EmptyState Component - Displayed when no companies match search
 */
const EmptyState = ({ searchTerm }) => {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="text-[#EDEDED] font-semibold mb-1">No companies found</h3>
      <p className="text-[#888]">
        {searchTerm ? `No results for "${searchTerm}". Try another search.` : 'Loading companies...'}
      </p>
    </div>
  );
};

export default CompanySearch;
