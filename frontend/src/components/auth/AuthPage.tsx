import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuArrowLeft, LuEye, LuEyeOff, LuUser } from "react-icons/lu";
import { loginUser, registerUser } from "../../api";
import nexoraFace from "../../assets/img/nexoraface.jpg";
import "./AuthPage.css";

type Tab = "login" | "register";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AuthPageProps {
  initialTab?: Tab;
}

export default function AuthPage({ initialTab = "login" }: AuthPageProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // ── Restore session ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // ── Login state ───────────────────────────────────────────
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErr, setLoginErr] = useState<Record<string, string>>({});

  // ── Register state ────────────────────────────────────────
  const [regData, setRegData] = useState({
    first_name: "", last_name: "", email: "", password: "",
  });
  const [regErr, setRegErr] = useState<Record<string, string>>({});

  // ── Helpers ───────────────────────────────────────────────
  const switchTab = (t: Tab) => {
    setTab(t);
    setAlert(null);
    setLoginErr({});
    setRegErr({});
    setShowPass(false);
  };

  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // ── Validate login ────────────────────────────────────────
  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginData.email.trim()) e.email = "Email kiritilmagan";
    else if (!emailOk(loginData.email)) e.email = "Email noto'g'ri formatda";
    if (!loginData.password) e.password = "Parol kiritilmagan";
    setLoginErr(e);
    return !Object.keys(e).length;
  };

  // ── Validate register ─────────────────────────────────────
  const validateReg = () => {
    const e: Record<string, string> = {};
    if (!regData.first_name.trim()) e.first_name = "Ism kiritilmagan";
    if (!regData.last_name.trim()) e.last_name = "Familiya kiritilmagan";
    if (!regData.email.trim()) e.email = "Email kiritilmagan";
    else if (!emailOk(regData.email)) e.email = "Email noto'g'ri formatda";
    if (!regData.password) e.password = "Parol kiritilmagan";
    else if (regData.password.length < 6) e.password = "Kamida 6 ta belgi bo'lishi kerak";
    setRegErr(e);
    return !Object.keys(e).length;
  };

  // ── Submit login ──────────────────────────────────────────
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateLogin()) return;
  setLoading(true);
  setAlert(null);
  try {
    const data = await loginUser({ email: loginData.email, password: loginData.password });
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setAlert({ type: "success", msg: `Xush kelibsiz, ${data.user.first_name}! 👋` });

    const isAdmin = data.user.role === "admin" || data.user.role === "superadmin";
    setTimeout(() => navigate(isAdmin ? "/admin" : "/"), 1100);
  } catch (err: any) {
    setAlert({ type: "error", msg: err.message || "Email yoki parol noto'g'ri" });
  } finally {
    setLoading(false);
  }
};

  // ── Submit register ───────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReg()) return;
    setLoading(true);
    setAlert(null);
    try {
      const data = await registerUser(regData);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setAlert({ type: "success", msg: "Ro'yxatdan muvaffaqiyatli o'tdingiz! 🎉" });
      setTimeout(() => navigate("/"), 1100);
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "Ro'yxatdan o'tishda xatolik yuz berdi" });
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAlert(null);
  };

  return (
    <main className="auth-page">
      {/* ── LEFT: Visual ── */}
      <div className="auth-visual">
        <img className="auth-visual-bg" src={nexoraFace} alt="NEXORA fashion" />
        <div className="auth-visual-overlay" />

        <Link to="/" className="auth-visual-brand">NEXORA</Link>

        <div className="auth-visual-content">
          <p className="auth-visual-tagline">Yangi kolleksiya — 2026</p>
          <h2 className="auth-visual-title">
            Uslub —<br />bu sizning<br />imzongiz
          </h2>
          <p className="auth-visual-desc">
            Erkaklar va ayollar uchun zamonaviy moda. Sifat, did va nafosatning uyg'unligi.
          </p>
          <div className="auth-visual-dots">
            <div className="auth-visual-dot active" />
            <div className="auth-visual-dot" />
            <div className="auth-visual-dot" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="auth-form-panel">
        <button className="auth-back" onClick={() => navigate("/")}>
          <LuArrowLeft /> Asosiy sahifa
        </button>

        <div className="auth-form-inner">
          {/* ── LOGGED IN ── */}
          {user ? (
            <div className="auth-profile-view">
              <div className="auth-avatar-circle">
                {user.first_name ? user.first_name[0].toUpperCase() : <LuUser />}
              </div>
              <p className="auth-profile-name">{user.first_name} {user.last_name}</p>
              <p className="auth-profile-email">{user.email}</p>
              <span className="auth-profile-badge">{user.role}</span>
              <button className="auth-logout-btn" onClick={handleLogout}>
                Hisobdan chiqish
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  id="tab-login"
                  className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
                  onClick={() => switchTab("login")}
                >
                  Kirish
                </button>
                <button
                  id="tab-register"
                  className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
                  onClick={() => switchTab("register")}
                >
                  Ro'yxatdan o'tish
                </button>
              </div>

              {/* ── LOGIN FORM ── */}
              {tab === "login" && (
                <>
                  <div className="auth-heading">
                    <h1>Xush kelibsiz</h1>
                    <p>Hisobingizga kirish uchun ma'lumotlarni kiriting</p>
                  </div>

                  {alert && <div className={`auth-alert ${alert.type}`}>{alert.msg}</div>}

                  <form className="auth-form" onSubmit={handleLogin} noValidate>
                    {/* Email */}
                    <div className="auth-field">
                      <label htmlFor="l-email">Email manzil</label>
                      <div className="auth-input-wrap">
                        <input
                          id="l-email"
                          type="email"
                          placeholder="example@mail.com"
                          className={`auth-input ${loginErr.email ? "is-error" : ""}`}
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          autoComplete="email"
                        />
                      </div>
                      {loginErr.email && <span className="auth-error-msg">{loginErr.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                      <label htmlFor="l-password">Parol</label>
                      <div className="auth-input-wrap">
                        <input
                          id="l-password"
                          type={showPass ? "text" : "password"}
                          placeholder="••••••••"
                          className={`auth-input has-icon ${loginErr.password ? "is-error" : ""}`}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          autoComplete="current-password"
                        />
                        <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)}>
                          {showPass ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {loginErr.password && <span className="auth-error-msg">{loginErr.password}</span>}
                    </div>

                    <div className="auth-extra-row">
                      <button type="button" className="auth-forgot-btn">Parolni unutdingizmi?</button>
                    </div>

                    <button id="login-submit" className="auth-submit-btn" type="submit" disabled={loading}>
                      {loading ? <><span className="auth-spin" /> Tekshirilmoqda...</> : "Kirish"}
                    </button>
                  </form>

                  <div className="auth-or">yoki</div>
                  <p className="auth-switch-text">
                    Hisobingiz yo'qmi?
                    <button className="auth-switch-btn" onClick={() => switchTab("register")}>
                      Ro'yxatdan o'ting
                    </button>
                  </p>
                </>
              )}

              {/* ── REGISTER FORM ── */}
              {tab === "register" && (
                <>
                  <div className="auth-heading">
                    <h1>Yangi hisob</h1>
                    <p>Ro'yxatdan o'ting va xarid qilishni boshlang</p>
                  </div>

                  {alert && <div className={`auth-alert ${alert.type}`}>{alert.msg}</div>}

                  <form className="auth-form" onSubmit={handleRegister} noValidate>
                    {/* Name row */}
                    <div className="auth-form-row">
                      <div className="auth-field">
                        <label htmlFor="r-fname">Ism</label>
                        <div className="auth-input-wrap">
                          <input
                            id="r-fname"
                            type="text"
                            placeholder="Ism"
                            className={`auth-input ${regErr.first_name ? "is-error" : ""}`}
                            value={regData.first_name}
                            onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                            autoComplete="given-name"
                          />
                        </div>
                        {regErr.first_name && <span className="auth-error-msg">{regErr.first_name}</span>}
                      </div>

                      <div className="auth-field">
                        <label htmlFor="r-lname">Familiya</label>
                        <div className="auth-input-wrap">
                          <input
                            id="r-lname"
                            type="text"
                            placeholder="Familiya"
                            className={`auth-input ${regErr.last_name ? "is-error" : ""}`}
                            value={regData.last_name}
                            onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                            autoComplete="family-name"
                          />
                        </div>
                        {regErr.last_name && <span className="auth-error-msg">{regErr.last_name}</span>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                      <label htmlFor="r-email">Email manzil</label>
                      <div className="auth-input-wrap">
                        <input
                          id="r-email"
                          type="email"
                          placeholder="example@mail.com"
                          className={`auth-input ${regErr.email ? "is-error" : ""}`}
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          autoComplete="email"
                        />
                      </div>
                      {regErr.email && <span className="auth-error-msg">{regErr.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                      <label htmlFor="r-password">Parol</label>
                      <div className="auth-input-wrap">
                        <input
                          id="r-password"
                          type={showPass ? "text" : "password"}
                          placeholder="Kamida 6 ta belgi"
                          className={`auth-input has-icon ${regErr.password ? "is-error" : ""}`}
                          value={regData.password}
                          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                          autoComplete="new-password"
                        />
                        <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)}>
                          {showPass ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {regErr.password && <span className="auth-error-msg">{regErr.password}</span>}
                    </div>

                    <button id="register-submit" className="auth-submit-btn" type="submit" disabled={loading}>
                      {loading ? <><span className="auth-spin" /> Yuklanmoqda...</> : "Ro'yxatdan o'tish"}
                    </button>
                  </form>

                  <div className="auth-or">yoki</div>
                  <p className="auth-switch-text">
                    Hisobingiz bormi?
                    <button className="auth-switch-btn" onClick={() => switchTab("login")}>
                      Kirish
                    </button>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
