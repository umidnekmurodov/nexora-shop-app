import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getProductImages } from '../../api';
import type { productsType } from '../../type/producttype';
import { useCart } from '../../context/CartContext';
import ProductFilters from './ProductFilters';
import ProductDetailModal from './ProductDetailModal';
import './ProductCard.css';

export default function Mencard() {
  const [products, setProducts] = useState<productsType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  const { addToCart, decrementItem, getItemQuantity } = useCart();

  const fetchMenProducts = () => {
    setLoading(true);
    const params: Record<string, any> = {
      gender: 'men',
      is_active: true,
    };

    if (searchParams.get('search')) params.search = searchParams.get('search');

    Promise.all([
      getProducts(params),
      getProductImages().catch(() => []),
    ])
      .then(([prodsData, imagesData]) => {
        const enriched = (prodsData || []).map((item) => {
          let mainImg = item.main_image || item.images?.[0];
          let allImgs = item.images || [];

          if (!mainImg && imagesData && imagesData.length > 0) {
            const found = imagesData.find(
              (img: any) => String(img.product_id) === String(item.id) && img.is_main
            ) || imagesData.find(
              (img: any) => String(img.product_id) === String(item.id)
            );
            if (found) {
              mainImg = found.image_url;
              allImgs = [found.image_url];
            }
          }

          return {
            ...item,
            main_image: mainImg,
            images: allImgs,
          };
        });

        setProducts(enriched);
      })
      .catch((err) => {
        console.error("Men products fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenProducts();
  }, [searchParams]);

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>Men</h1>
        <p>Classic craftsmanship for the modern man</p>
      </div>

      <div className="products-content-layout">
        {/* Left Sidebar Filters */}
        <ProductFilters />

        {/* Right Products Area */}
        <div className="products-main-area">
          <div className="products-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-card">
                  <div className="product-card-placeholder products-skeleton" style={{ aspectRatio: '3/4' }} />
                  <div className="product-card-body">
                    <div className="products-skeleton" style={{ height: 16, marginBottom: 8, borderRadius: 4 }} />
                    <div className="products-skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="products-empty">
                <h3>Mahsulotlar topilmadi</h3>
                <p>Tanlangan shartlarga mos keladigan kiyimlar topilmadi.</p>
              </div>
            ) : (
              products.map((item) => {
                const imgUrl = item.main_image || item.images?.[0];
                const qty = getItemQuantity(item.id);
                const finalPrice = item.discount
                  ? item.price - (item.price * item.discount) / 100
                  : item.price;

                return (
                  <div
                    className="product-card"
                    key={item.id}
                    onClick={() => setSelectedProductId(item.id)}
                  >
                    <div className="product-card-img-wrap">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            const imgEl = e.currentTarget;
                            if (!imgEl.dataset.fallback) {
                              imgEl.dataset.fallback = 'true';
                              imgEl.src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80';
                            }
                          }}
                        />
                      ) : (
                        <div className="product-card-placeholder">
                          <span style={{ fontSize: 13, letterSpacing: 2, color: '#bbb' }}>NEXORA</span>
                        </div>
                      )}
                    </div>

                    <div className="product-card-body">
                      <h3>{item.name}</h3>
                      <p className="product-card-desc">{item.description || item.category_name || 'Kiyim'}</p>

                      {/* Sizes and Colors on Card */}
                      {((item.sizes && item.sizes.length > 0) || (item.colors && item.colors.length > 0)) && (
                        <div className="product-card-variants">
                          {item.sizes && item.sizes.length > 0 && (
                            <div className="product-card-sizes">
                              {item.sizes.map((s) => (
                                <span key={s.id} className="product-card-size-badge">
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.colors && item.colors.length > 0 && (
                            <div className="product-card-colors">
                              {item.colors.map((c) => (
                                <div
                                  key={c.id}
                                  className="product-card-color-dot"
                                  style={{ backgroundColor: c.hex || '#000' }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="product-card-footer">
                        <div>
                          <span className="product-card-price">
                            {finalPrice.toLocaleString()} so'm
                          </span>
                          {item.discount > 0 && (
                            <span className="product-card-price-old">
                              {item.price.toLocaleString()} so'm
                            </span>
                          )}
                        </div>

                        {/* Stepper Controls on Card */}
                        {qty > 0 ? (
                          <div
                            className="product-card-stepper"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => decrementItem(item.id)}>-</button>
                            <span>{qty}</span>
                            <button onClick={() => addToCart(item)}>+</button>
                          </div>
                        ) : (
                          <button
                            className="product-card-add"
                            aria-label="Add to cart"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </section>
  );
}