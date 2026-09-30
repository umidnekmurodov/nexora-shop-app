import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories } from '../../api';
import type { Category } from '../../type/producttype';
import './ProductFilters.css';

interface ProductFiltersProps {
  onFilterChange: () => void;
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Read URL query parameters
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => {});
  }, []);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    onFilterChange();
  };

  const handleClearAll = () => {
    setSearchParams({});
    onFilterChange();
  };

  const hasActiveFilters = currentSearch || currentCategory || currentMinPrice || currentMaxPrice;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-filter-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span>⚙️</span> {mobileOpen ? 'Filtrlarni berkitish' : 'Filtrlar va Qidiruv'}
      </button>

      <aside className={`filters-sidebar ${mobileOpen ? 'open-mobile' : ''}`}>
        <div className="filters-header">
          <h3>
            <span>🔍</span> Qidiruv
          </h3>
          {hasActiveFilters && (
            <button className="btn-clear-filters" onClick={handleClearAll}>
              Tozalash
            </button>
          )}
        </div>

        {/* Search Query */}
        <div className="filter-group">
          <label>Qidiruv</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Kiyim nomini kiriting..."
            value={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
          />
        </div>

        
      
      </aside>
    </>
  );
}
