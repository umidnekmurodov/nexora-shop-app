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
            <span>🔍</span> Filtrlar
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

        {/* Category Dropdown */}
        <div className="filter-group">
          <label>Kategoriya</label>
          <select
            className="filter-select"
            value={currentCategory}
            onChange={(e) => updateParam('category', e.target.value)}
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug || cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label>Narx (so'm)</label>
          <div className="price-inputs-row">
            <input
              type="number"
              className="filter-input"
              placeholder="Min"
              value={currentMinPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              className="filter-input"
              placeholder="Max"
              value={currentMaxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
