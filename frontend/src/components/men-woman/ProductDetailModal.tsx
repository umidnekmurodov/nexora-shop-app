import { useEffect, useState } from 'react';
import { getProductById, getProductImages } from '../../api';
import type { productsType } from '../../type/producttype';
import { useCart } from '../../context/CartContext';
import './ProductDetailModal.css';

interface ProductDetailModalProps {
  productId: number;
  onClose: () => void;
}

export default function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const [product, setProduct] = useState<productsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const { addToCart, getItemQuantity, decrementItem } = useCart();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProductById(productId),
      getProductImages().catch(() => []),
    ])
      .then(([data, imagesData]) => {
        let mainImg = data.main_image || data.images?.[0];
        let allImgs = data.images && data.images.length > 0 ? data.images : [];

        if ((!mainImg || allImgs.length === 0) && imagesData && imagesData.length > 0) {
          const matchingImages = imagesData.filter(
            (img: any) => String(img.product_id) === String(data.id)
          );
          if (matchingImages.length > 0) {
            const mainFound = matchingImages.find((img: any) => img.is_main) || matchingImages[0];
            mainImg = mainFound.image_url;
            allImgs = matchingImages.map((img: any) => img.image_url);
          }
        }

        setProduct({
          ...data,
          main_image: mainImg,
          images: allImgs,
        });

        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0].name);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].name);
        }
      })
      .catch((err) => {
        console.error('Failed to load product detail:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="detail-modal-overlay" onClick={onClose}>
        <div className="detail-modal-card" style={{ padding: '60px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '16px', color: '#64748b' }}>Mahsulot ma'lumotlari yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.main_image
    ? [product.main_image]
    : [];

  const mainDisplayImg = allImages[activeImageIndex] || product.main_image;

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const quantityInCart = getItemQuantity(product.id);

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="detail-modal-close" onClick={onClose}>×</button>

        <div className="detail-modal-grid">
          {/* Left: Gallery */}
          <div className="detail-gallery">
            <div className="detail-main-img-wrap">
              {mainDisplayImg ? (
                <img
                  src={mainDisplayImg}
                  alt={product.name}
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
                <div style={{ fontSize: '48px', color: '#cbd5e1' }}>👕</div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="detail-thumbnails-row">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`detail-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="detail-info">
            {product.category_name && (
              <span className="detail-category-tag">{product.category_name}</span>
            )}

            <h2 className="detail-title">{product.name}</h2>

            <div className="detail-price-box">
              <span className="detail-price-current">
                {finalPrice.toLocaleString()} so'm
              </span>
              {product.discount > 0 && (
                <span className="detail-price-old">
                  {product.price.toLocaleString()} so'm
                </span>
              )}
            </div>

            {product.description && (
              <p className="detail-desc">{product.description}</p>
            )}

            {/* Sizes selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="detail-options-group">
                <span className="detail-options-label">Mavjud O'lchamlar</span>
                <div className="detail-sizes-row">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      className={`detail-size-btn ${selectedSize === s.name ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s.name)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="detail-options-group">
                <span className="detail-options-label">Ranglar</span>
                <div className="detail-colors-row">
                  {product.colors.map((c) => (
                    <div
                      key={c.id}
                      className={`detail-color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                      style={{ backgroundColor: c.hex || '#000' }}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Stepper and Add to Cart */}
            <div className="detail-actions-row">
              {quantityInCart > 0 ? (
                <div className="detail-stepper-btn">
                  <button onClick={() => decrementItem(product.id)}>-</button>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>{quantityInCart}</span>
                  <button onClick={() => addToCart(product, selectedSize, selectedColor)}>+</button>
                </div>
              ) : (
                <button
                  className="detail-add-btn"
                  onClick={() => addToCart(product, selectedSize, selectedColor)}
                >
                  <span>🛍️</span> Savatchaga qo'shish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
