import React, { useEffect, useState } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  createProductImage,
  getSizes,
  createSize,
  getColors,
  createColor,
  createProductVariant,
} from '../../api';
import type { ProductSize, ProductColor } from '../../type/producttype';
import './AdminProducts.css';

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_main: boolean;
}

interface Product {
  id: number | string;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  gender: string;
  brand: string;
  is_active: boolean;
  image_url?: string;
  main_image?: string;
  images?: string[];
  sizes?: { id: number; name: string }[];
  colors?: { id: number; name: string; hex: string }[];
  created_at?: string;
}

interface ProductFormData {
  name: string;
  category_id: string | number | '';
  description: string;
  price: number | '';
  discount: number | '';
  gender: string;
  brand: string;
  is_active: boolean;
  image_url: string;
  selectedSizeIds: (number | string)[];
  selectedColorIds: (number | string)[];
}

const initialFormState: ProductFormData = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  discount: 0,
  gender: 'unisex',
  brand: '',
  is_active: true,
  image_url: '',
  selectedSizeIds: [],
  selectedColorIds: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [allSizes, setAllSizes] = useState<ProductSize[]>([]);
  const [allColors, setAllColors] = useState<ProductColor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick add size / color popup inputs
  const [newSizeInput, setNewSizeInput] = useState<string>('');
  const [showAddSize, setShowAddSize] = useState<boolean>(false);
  const [newColorName, setNewColorName] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState<string>('#000000');
  const [showAddColor, setShowAddColor] = useState<boolean>(false);

  // View mode switcher: 'table' | 'card'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete confirm modal state
  const [deletingProductId, setDeletingProductId] = useState<number | string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsData, catsData, imagesData, sizesData, colorsData] = await Promise.all([
        getProducts(),
        getCategories(),
        getProductImages().catch(() => []),
        getSizes().catch(() => []),
        getColors().catch(() => []),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setProductImages(imagesData || []);
      setAllSizes(sizesData || []);
      setAllColors(colorsData || []);
    } catch (err: any) {
      setError(err.message || 'Ma’lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Helper to get image URL for a product
  const getProductImageUrl = (product: Product): string | undefined => {
    if (product.main_image) return product.main_image;
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.image_url) return product.image_url;
    const foundImg = productImages.find((img) => String(img.product_id) === String(product.id) && img.is_main) ||
      productImages.find((img) => String(img.product_id) === String(product.id));
    return foundImg?.image_url;
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      category_id: categories.length > 0 ? categories[0].id : '',
      selectedSizeIds: [],
      selectedColorIds: [],
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const existingImgUrl = getProductImageUrl(product) || '';
    const existingSizeIds = product.sizes ? product.sizes.map((s) => s.id) : [];
    const existingColorIds = product.colors ? product.colors.map((c) => c.id) : [];

    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      price: product.price,
      discount: product.discount || 0,
      gender: product.gender || 'unisex',
      brand: product.brand || '',
      is_active: product.is_active ?? true,
      image_url: existingImgUrl,
      selectedSizeIds: existingSizeIds,
      selectedColorIds: existingColorIds,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  // Generate slug automatically from product name
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const toggleSizeSelection = (sizeId: number | string) => {
    setFormData((prev) => {
      const exists = prev.selectedSizeIds.includes(sizeId);
      return {
        ...prev,
        selectedSizeIds: exists
          ? prev.selectedSizeIds.filter((id) => id !== sizeId)
          : [...prev.selectedSizeIds, sizeId],
      };
    });
  };

  const toggleColorSelection = (colorId: number | string) => {
    setFormData((prev) => {
      const exists = prev.selectedColorIds.includes(colorId);
      return {
        ...prev,
        selectedColorIds: exists
          ? prev.selectedColorIds.filter((id) => id !== colorId)
          : [...prev.selectedColorIds, colorId],
      };
    });
  };

  const handleAddNewSize = async () => {
    if (!newSizeInput.trim()) return;
    try {
      const created = await createSize({ name: newSizeInput.trim() });
      setAllSizes((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        selectedSizeIds: [...prev.selectedSizeIds, created.id],
      }));
      setNewSizeInput('');
      setShowAddSize(false);
    } catch (err: any) {
      setError(err.message || "O'lcham qo'shishda xatolik");
    }
  };

  const handleAddNewColor = async () => {
    if (!newColorName.trim()) return;
    try {
      const created = await createColor({ name: newColorName.trim(), hex: newColorHex });
      setAllColors((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        selectedColorIds: [...prev.selectedColorIds, created.id],
      }));
      setNewColorName('');
      setNewColorHex('#000000');
      setShowAddColor(false);
    } catch (err: any) {
      setError(err.message || "Rang qo'shishda xatolik");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Mahsulot nomini kiriting');
      return;
    }
    if (!formData.category_id) {
      setError('Kategoriyani tanlang');
      return;
    }
    if (formData.price === '' || Number(formData.price) <= 0) {
      setError('To’g’ri narx kiriting');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const generatedSlug = createSlug(formData.name) || `product-${Date.now()}`;

    const payload = {
      name: formData.name,
      // Keep category_id as-is (UUID string or number)
      category_id: formData.category_id !== '' ? formData.category_id : null,
      description: formData.description,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      gender: formData.gender,
      brand: formData.brand,
      is_active: formData.is_active,
      slug: generatedSlug,
    };

    try {
      let savedProductId: number | string;

      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(editingProduct.id, payload);
        savedProductId = editingProduct.id || updated.id;
        setSuccessMsg('Mahsulot muvaffaqiyatli tahrirlandi');
      } else {
        // Create new product
        const created = await createProduct(payload);
        savedProductId = created.id;
        setSuccessMsg('Yangi mahsulot muvaffaqiyatli qo’shildi');
      }

      // Save Image URL to product_images if provided
      if (formData.image_url.trim() && savedProductId) {
        try {
          await createProductImage({
            product_id: savedProductId,
            image_url: formData.image_url.trim(),
            is_main: true,
          });
        } catch (imgErr) {
          console.warn('Rasmni saqlashda xabar:', imgErr);
        }
      }

      // Save Size & Color Variants
      if (savedProductId && (formData.selectedSizeIds.length > 0 || formData.selectedColorIds.length > 0)) {
        const sizeList = formData.selectedSizeIds.length > 0 ? formData.selectedSizeIds : [undefined];
        const colorList = formData.selectedColorIds.length > 0 ? formData.selectedColorIds : [undefined];

        for (const sId of sizeList) {
          for (const cId of colorList) {
            try {
              await createProductVariant({
                product_id: savedProductId,
                size_id: sId,
                color_id: cId,
                stock: 100,
              });
            } catch (varErr) {
              console.warn('Variant saqlash:', varErr);
            }
          }
        }
      }

      handleCloseModal();
      // Refresh list
      await fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Amalni bajarishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product logic
  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await deleteProduct(deletingProductId);
      setSuccessMsg('Mahsulot muvaffaqiyatli o’chirildi');
      setDeletingProductId(null);
      await fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Mahsulotni o’chirishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.brand && prod.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      prod.category_id === Number(selectedCategoryFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-products-container">
      {/* Alert Notifications */}
      {error && (
        <div className="admin-alert admin-alert-error">
          <span>⚠️ {error}</span>
          <button className="admin-alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMsg && (
        <div className="admin-alert admin-alert-success">
          <span>✅ {successMsg}</span>
          <button className="admin-alert-close" onClick={() => setSuccessMsg(null)}>×</button>
        </div>
      )}

      {/* Toolbar: Search, Filter, View Switcher & Add Button */}
      <div className="admin-products-toolbar">
        <div className="admin-toolbar-search">
          <input
            type="text"
            className="admin-input-search"
            placeholder="Qidiruv (nomi yoki brendi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-select-filter"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* View Mode Switcher */}
          <div className="admin-view-toggle">
            <button
              className={`admin-view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Karta ko'rinishi"
            >
              <span>🖼️</span> Kartalar
            </button>
            <button
              className={`admin-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Jadval ko'rinishi"
            >
              <span>☰</span> Jadval
            </button>
          </div>
        </div>

        <button className="admin-btn-primary" onClick={handleOpenCreateModal}>
          <span>+</span> Yangi mahsulot
        </button>
      </div>

      {/* Main Content: Table or Cards View */}
      {loading ? (
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <div className="admin-cards-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-card-item">
                <div className="skeleton-box" style={{ aspectRatio: '3/4', width: '100%' }}></div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton-box" style={{ height: '16px', width: '70%' }}></div>
                  <div className="skeleton-box" style={{ height: '14px', width: '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-table-card">
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👕</div>
            <h3>Hozircha mahsulot yo'q</h3>
            <p>Qidiruv shartlariga mos keladigan mahsulot topilmadi yoki hali mahsulot qo'shilmagan.</p>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="admin-cards-grid">
          {filteredProducts.map((prod) => {
            const categoryName =
              prod.category_name ||
              categories.find((c) => c.id === prod.category_id)?.name ||
              `Cat #${prod.category_id}`;

            const finalPrice = prod.discount
              ? prod.price - (prod.price * prod.discount) / 100
              : prod.price;

            const imageUrl = getProductImageUrl(prod);

            return (
              <div className="admin-card-item" key={prod.id}>
                <div className="admin-card-image-wrap">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const imgEl = e.currentTarget;
                        if (!imgEl.dataset.fallback) {
                          imgEl.dataset.fallback = 'true';
                          imgEl.src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80';
                        }
                      }}
                    />
                  ) : (
                    <div className="admin-card-image-placeholder">
                      <span className="icon">🛍️</span>
                      <span>Rasm yo'q</span>
                    </div>
                  )}

                  <div className="admin-card-badge-status">
                    {prod.is_active ? (
                      <span className="badge-pill badge-active">Faol</span>
                    ) : (
                      <span className="badge-pill badge-inactive">Nofaol</span>
                    )}
                  </div>
                </div>

                <div className="admin-card-body">
                  <div className="admin-card-meta">
                    <span>{categoryName}</span>
                    <span style={{ textTransform: 'capitalize' }}>{prod.gender || 'unisex'}</span>
                  </div>

                  <h3 className="admin-card-title">{prod.name}</h3>

                  {prod.description && (
                    <p className="admin-card-desc">{prod.description}</p>
                  )}

                  {/* Sizes & Colors in Admin Card */}
                  {((prod.sizes && prod.sizes.length > 0) || (prod.colors && prod.colors.length > 0)) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                      {prod.sizes && prod.sizes.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {prod.sizes.map((s) => (
                            <span key={s.id} className="badge-pill" style={{ fontSize: '11px', padding: '2px 6px', background: '#f1f5f9', color: '#475569' }}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {prod.colors && prod.colors.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          {prod.colors.map((c) => (
                            <span
                              key={c.id}
                              style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex || '#000', border: '1px solid rgba(0,0,0,0.2)', display: 'inline-block' }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="admin-card-price-row">
                    <div className="product-price-box">
                      <span className="product-price-current">
                        {finalPrice.toLocaleString()} so'm
                      </span>
                      {prod.discount > 0 && (
                        <span className="product-price-old">
                          {prod.price.toLocaleString()} so'm
                        </span>
                      )}
                    </div>

                    {prod.discount > 0 && (
                      <span className="badge-pill badge-discount">-{prod.discount}%</span>
                    )}
                  </div>
                </div>

                <div className="admin-card-actions">
                  <button
                    className="admin-btn-secondary"
                    onClick={() => handleOpenEditModal(prod)}
                  >
                    Tahrirlash
                  </button>
                  <button
                    className="admin-btn-danger"
                    onClick={() => setDeletingProductId(prod.id)}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Rasm</th>
                  <th>Mahsulot</th>
                  <th>Kategoriya</th>
                  <th>O'lcham / Rang</th>
                  <th>Brend / Jins</th>
                  <th>Narx / Chegirma</th>
                  <th>Holati</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const categoryName =
                    prod.category_name ||
                    categories.find((c) => c.id === prod.category_id)?.name ||
                    `Cat #${prod.category_id}`;

                  const finalPrice = prod.discount
                    ? prod.price - (prod.price * prod.discount) / 100
                    : prod.price;

                  const imageUrl = getProductImageUrl(prod);

                  return (
                    <tr key={prod.id}>
                      <td>#{prod.id}</td>
                      <td>
                        {imageUrl ? (
                          <img src={imageUrl} alt={prod.name} className="table-img-thumb" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="table-img-placeholder">👕</div>
                        )}
                      </td>
                      <td>
                        <strong>{prod.name}</strong>
                        {prod.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {prod.description.length > 40
                              ? prod.description.substring(0, 40) + '...'
                              : prod.description}
                          </div>
                        )}
                      </td>
                      <td>{categoryName}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {prod.sizes && prod.sizes.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                              {prod.sizes.map((s) => (
                                <span key={s.id} style={{ fontSize: '10px', padding: '1px 4px', background: '#e2e8f0', borderRadius: '3px' }}>
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {prod.colors && prod.colors.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {prod.colors.map((c) => (
                                <span
                                  key={c.id}
                                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.hex || '#000', border: '1px solid #ccc' }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          )}
                          {(!prod.sizes || prod.sizes.length === 0) && (!prod.colors || prod.colors.length === 0) && (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {prod.brand || '-'} / <span style={{ textTransform: 'capitalize' }}>{prod.gender || '-'}</span>
                      </td>
                      <td>
                        <div className="product-price-box">
                          <span className="product-price-current">
                            {finalPrice.toLocaleString()} so'm
                          </span>
                          {prod.discount > 0 && (
                            <span className="product-price-old">
                              {prod.price.toLocaleString()} so'm
                              <span className="badge-pill badge-discount">-{prod.discount}%</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {prod.is_active ? (
                          <span className="badge-pill badge-active">Faol</span>
                        ) : (
                          <span className="badge-pill badge-inactive">Nofaol</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="admin-btn-secondary"
                            onClick={() => handleOpenEditModal(prod)}
                          >
                            Tahrirlash
                          </button>
                          <button
                            className="admin-btn-danger"
                            onClick={() => setDeletingProductId(prod.id)}
                          >
                            O'chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group full-width">
                    <label>Mahsulot nomi *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Masalan: Erkaklar ko'ylagi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Image URL Input + Preview */}
                  <div className="admin-form-group full-width">
                    <label>Rasm havolasi (Image URL)</label>
                    <div className="image-preview-container">
                      <input
                        type="url"
                        className="admin-form-input"
                        style={{ flex: 1 }}
                        placeholder="https://images.unsplash.com/... yoki rasm yo'li"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                      <div className="image-preview-box">
                        {formData.image_url ? (
                          <img
                            src={formData.image_url}
                            alt="Oldindan ko'rish"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="image-preview-placeholder">📷</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size & Color Variants Picker */}
                  <div className="admin-form-group full-width">
                    <label>Mahsulot O'lchamlari va Ranglari (Variants)</label>
                    <div className="admin-variants-picker">
                      {/* Sizes Section */}
                      <div className="admin-variant-subgroup">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label>O'lchamlar (Sizes):</label>
                          <button
                            type="button"
                            className="admin-add-inline-btn"
                            onClick={() => setShowAddSize(!showAddSize)}
                          >
                            + Yangi o'lcham
                          </button>
                        </div>

                        {showAddSize && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <input
                              type="text"
                              className="admin-form-input"
                              placeholder="Masalan: XXL, 42..."
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              value={newSizeInput}
                              onChange={(e) => setNewSizeInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="admin-btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={handleAddNewSize}
                            >
                              Qo'shish
                            </button>
                          </div>
                        )}

                        <div className="admin-chip-group" style={{ marginTop: '6px' }}>
                          {allSizes.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>O'lchamlar topilmadi. "+ Yangi o'lcham" tugmasi orqali qo'shing.</span>
                          ) : (
                            allSizes.map((s) => {
                              const isSelected = formData.selectedSizeIds.includes(s.id);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  className={`admin-chip-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => toggleSizeSelection(s.id)}
                                >
                                  {isSelected && <span>✓</span>} {s.name}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Colors Section */}
                      <div className="admin-variant-subgroup" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label>Ranglar (Colors):</label>
                          <button
                            type="button"
                            className="admin-add-inline-btn"
                            onClick={() => setShowAddColor(!showAddColor)}
                          >
                            + Yangi rang
                          </button>
                        </div>

                        {showAddColor && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <input
                              type="text"
                              className="admin-form-input"
                              placeholder="Rang nomi (Black, Oq...)"
                              style={{ padding: '6px 10px', fontSize: '13px', flex: 1 }}
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                            />
                            <input
                              type="color"
                              value={newColorHex}
                              onChange={(e) => setNewColorHex(e.target.value)}
                              style={{ width: '38px', height: '34px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              title="Rangni tanlang"
                            />
                            <button
                              type="button"
                              className="admin-btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={handleAddNewColor}
                            >
                              Qo'shish
                            </button>
                          </div>
                        )}

                        <div className="admin-chip-group" style={{ marginTop: '6px' }}>
                          {allColors.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Ranglar topilmadi. "+ Yangi rang" tugmasi orqali qo'shing.</span>
                          ) : (
                            allColors.map((c) => {
                              const isSelected = formData.selectedColorIds.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  className={`admin-chip-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => toggleColorSelection(c.id)}
                                >
                                  <span
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: c.hex || '#000',
                                      border: '1px solid rgba(0,0,0,0.2)',
                                      display: 'inline-block',
                                    }}
                                  />
                                  {isSelected && <span>✓</span>} {c.name}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Kategoriya *</label>
                    <select
                      className="admin-form-select"
                      value={String(formData.category_id)}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                    >
                      <option value="">Kategoriyani tanlang...</option>
                      {categories.map((cat) => (
                        <option key={String(cat.id)} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Jins (Gender)</label>
                    <select
                      className="admin-form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="men">Erkak (Men)</option>
                      <option value="women">Ayol (Women)</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Narxi (so'm) *</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-input"
                      placeholder="150000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : '' })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Chegirma (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="admin-form-input"
                      placeholder="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value ? Number(e.target.value) : 0 })}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>Brend</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Masalan: Nike, Zara, Nexora"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>Tavsif (Description)</label>
                    <textarea
                      className="admin-form-textarea"
                      placeholder="Mahsulot haqida batafsil ma'lumot..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label className="admin-checkbox-group">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <span>Mahsulot faol holatda bo'lsin (Is Active)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saqlanmoqda...' : editingProduct ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="modal-overlay" onClick={() => setDeletingProductId(null)}>
          <div className="modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mahsulotni o'chirish</h2>
              <button className="modal-close-btn" onClick={() => setDeletingProductId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                Haqiqatan ham ushbu mahsulotni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="admin-btn-secondary"
                onClick={() => setDeletingProductId(null)}
                disabled={isSubmitting}
              >
                Bekor qilish
              </button>
              <button
                className="admin-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'O\'chirilmoqda...' : 'Haqiqatan o\'chirilsin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
