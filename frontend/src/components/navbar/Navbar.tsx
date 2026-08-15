import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { LuSearch, LuShoppingBag, LuUser } from "react-icons/lu";
import { useCart } from "../../context/CartContext";
import { getProducts } from "../../api";
import type { productsType } from "../../type/producttype";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const { cartItems, totalItems, totalPrice, addToCart, decrementItem, removeFromCart, clearCart } = useCart();

  // Dark text navbar on pages with light background (/Men, /Women, etc.)
  const isLightPage = location.pathname.toLowerCase().includes('/men') ||
                      location.pathname.toLowerCase().includes('/women') ||
                      location.pathname.toLowerCase().includes('/auth') ||
                      location.pathname.toLowerCase().includes('/login');

  // Cart Drawer state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<productsType[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    } else {
      setUser(null);
    }
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await getProducts({ search: searchQuery });
        setSearchResults(results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (product: productsType) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (product.gender === "men" || product.gender === "male") {
      navigate(`/Men?search=${encodeURIComponent(product.name)}`);
    } else {
      navigate(`/Women?search=${encodeURIComponent(product.name)}`);
    }
  };

  return (
    <>
      <nav className={`navbar ${isLightPage ? "navbar-light-theme" : ""}`}>
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">
            <h1>NEXORA</h1>
          </Link>
        </div>

        {/* Icons */}
        <div className="navbar-icons">
          <button
            className="navbar-btn"
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            title="Qidiruv"
          >
            <LuSearch />
          </button>

          <button
            className="navbar-btn"
            aria-label="Cart"
            onClick={() => setIsCartOpen(true)}
            title="Savatcha"
          >
            <LuShoppingBag />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          <button
            id="user-icon-btn"
            className={`navbar-btn navbar-user-btn ${user ? "navbar-user-loggedin" : ""}`}
            onClick={() => {
              if (user && (user.role === "admin" || user.role === "superadmin")) {
                navigate("/admin");
              } else {
                navigate("/auth");
              }
            }}
            aria-label="User account"
            title={user ? `${user.first_name || user.email} (${user.role})` : "Kirish / Ro'yxatdan o'tish"}
          >
            {user ? (
              <span className="navbar-user-initial">
                {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
              </span>
            ) : (
              <LuUser />
            )}
          </button>
        </div>
      </nav>

      {/* ── Slide-Over Cart Drawer ── */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>
                <span>🛍️</span> Savatcha ({totalItems})
              </h2>
              <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)}>
                ×
              </button>
            </div>

            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛍️</div>
                  <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "4px" }}>Savatchangiz bo'sh</h3>
                  <p style={{ fontSize: "13px" }}>Kiyimlarni tanlab sumkaga qo'shing.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const finalPrice = item.product.discount
                    ? item.product.price - (item.product.price * item.product.discount) / 100
                    : item.product.price;
                  const imgUrl = item.product.main_image || item.product.images?.[0];

                  return (
                    <div className="cart-item-row" key={item.product.id}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product.name} className="cart-item-img" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="cart-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>👕</div>
                      )}
                      <div className="cart-item-info">
                        <span className="cart-item-title">{item.product.name}</span>
                        <span className="cart-item-price">
                          {finalPrice.toLocaleString()} so'm
                        </span>
                        <div className="cart-item-stepper">
                          <button
                            className="cart-item-btn"
                            onClick={() => decrementItem(item.product.id)}
                          >
                            -
                          </button>
                          <span className="cart-item-qty">{item.quantity}</span>
                          <button
                            className="cart-item-btn"
                            onClick={() => addToCart(item.product)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.product.id)}
                        title="O'chirish"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-row">
                  <span>Jami summa:</span>
                  <span style={{ color: "#2563eb" }}>{totalPrice.toLocaleString()} so'm</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    style={{
                      padding: "12px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                    onClick={clearCart}
                  >
                    Tozalash
                  </button>
                  <button
                    className="cart-checkout-btn"
                    style={{ flex: 1 }}
                    onClick={() => {
                      alert("Buyurtma rasmiylashtirish sahifasi tez kunda!");
                    }}
                  >
                    Rasmiylashtirish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Global Search Overlay Modal ── */}
      {isSearchOpen && (
        <div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-input-wrap">
              <span className="search-modal-icon">🔍</span>
              <input
                type="text"
                className="search-modal-input"
                placeholder="Nexora do'konidan kiyimlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button className="search-modal-close" onClick={() => setIsSearchOpen(false)}>
                ×
              </button>
            </div>

            <div className="search-modal-results">
              {searching ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Qidirilmoqda...</div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  "{searchQuery}" bo'yicha mahsulot topilmadi
                </div>
              ) : (
                searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(prod)}
                  >
                    {prod.main_image || prod.images?.[0] ? (
                      <img
                        src={prod.main_image || prod.images?.[0]}
                        alt={prod.name}
                        className="search-result-thumb"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="search-result-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>👕</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {prod.category_name || "Kiyim"} • {prod.price.toLocaleString()} so'm
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}