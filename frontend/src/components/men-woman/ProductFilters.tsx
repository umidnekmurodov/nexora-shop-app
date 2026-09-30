import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ProductFilters.css';

export default function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentSearch = searchParams.get('search') || '';

  const updateSearch = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set('search', value) : newParams.delete('search');
    setSearchParams(newParams);
  };

  return (
    <>
      <button
        type="button"
        className="mobile-filter-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? 'Qidiruvni berkitish' : 'Qidiruv'}
      </button>

      <aside className={`filters-sidebar ${mobileOpen ? 'open-mobile' : ''}`}>
        <div className="filters-header">
          <h3>Mahsulot qidirish</h3>
          {currentSearch && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={() => updateSearch('')}
            >
              Tozalash
            </button>
          )}
        </div>

        <div className="filter-group">
          <label htmlFor="product-search">Mahsulot nomi</label>
          <input
            id="product-search"
            type="text"
            className="filter-input"
            placeholder="Kiyim nomini kiriting..."
            value={currentSearch}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
      </aside>
    </>
  );
}
