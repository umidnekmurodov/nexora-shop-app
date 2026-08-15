import { useState } from "react";
import "./AuthModal.css";
import { LuX, LuEye, LuEyeOff, LuUser } from "react-icons/lu";
import { loginUser, registerUser } from "../../api";

type Tab = "login" | "register";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AuthModalProps {
  onClose: () => void;
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export default function AuthModal({ onClose, user, onLogin, onLogout }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regErrors, setRegErrors] = useState<{
    first_name?: string; last_name?: string; email?: string; password?: string;
  }>({});

  const switchTab = (t: Tab) => {
    setTab(t);
    setAlert(null);
    setLoginErrors({});
    setRegErrors({});
  };

  // ── Validation ────────────────────────────────────────────
  const validateLogin = () => {
    const errs: typeof loginErrors = {};
    if (!loginEmail.trim()) errs.email = "Email kiritilmagan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errs.email = "Email noto'g'ri";
    if (!loginPassword) errs.password = "Parol kiritilmagan";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs: typeof regErrors = {};
    if (!regFirstName.trim()) errs.first_name = "Ism kiritilmagan";
    if (!regLastName.trim()) errs.last_name = "Familiya kiritilmagan";
    if (!regEmail.trim()) errs.email = "Email kiritilmagan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = "Email noto'g'ri";
    if (!regPassword) errs.password = "Parol kiritilmagan";
    else if (regPassword.length < 6) errs.password = "Kamida 6 ta belgi";
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Login ─────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    setAlert(null);
    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      setAlert({ type: "success", message: "Muvaffaqiyatli kirildi! 👋" });
      onLogin(data.user);
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Login muvaffaqiyatsiz" });
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    setAlert(null);
    try {
      const data = await registerUser({
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        password: regPassword,
      });
      setAlert({ type: "success", message: "Ro'yxatdan o'tildi! 🎉" });
      onLogin(data.user);
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Ro'yxatdan o'tish muvaffaqiyatsiz" });
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-panel">
        <button className="auth-close" onClick={onClose} aria-label="Yopish">
          <LuX />
        </button>

        {/* ── Logged-in view ── */}
        {user ? (
          <div className="auth-profile">
            <div className="auth-avatar">
              {user.first_name ? user.first_name[0].toUpperCase() : <LuUser />}
            </div>
            <p className="auth-profile-name">
              {user.first_name} {user.last_name}
            </p>
            <p className="auth-profile-email">{user.email}</p>
            <span className="auth-profile-role">{user.role}</span>
            <button className="auth-logout" onClick={handleLogout}>
              Chiqish
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                id="tab-login"
                className={`auth-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => switchTab("login")}
              >
                Kirish
              </button>
              <button
                id="tab-register"
                className={`auth-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => switchTab("register")}
              >
                Ro'yxat
              </button>
            </div>

            <div className="auth-body">
              {/* ── LOGIN ── */}
              {tab === "login" && (
                <>
                  <h2 className="auth-title">Xush kelibsiz</h2>
                  <p className="auth-subtitle">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>

                  {alert && <div className={`auth-alert ${alert.type}`}>{alert.message}</div>}

                  <form className="auth-form" onSubmit={handleLogin} noValidate>
                    <div className="auth-field">
                      <label htmlFor="login-email">Email</label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="email@misol.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={loginErrors.email ? "input-error" : ""}
                        autoComplete="email"
                      />
                      {loginErrors.email && <span className="auth-field-error">{loginErrors.email}</span>}
                    </div>

                    <div className="auth-field">
                      <label htmlFor="login-password">Parol</label>
                      <div className="auth-password-wrap">
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={loginErrors.password ? "input-error" : ""}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="auth-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Parolni ko'rsat"
                        >
                          {showPassword ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {loginErrors.password && <span className="auth-field-error">{loginErrors.password}</span>}
                    </div>

                    <div className="auth-forgot">
                      <button type="button">Parolni unutdingizmi?</button>
                    </div>

                    <button id="login-submit" className="auth-submit" type="submit" disabled={loading}>
                      {loading ? <><span className="auth-spinner" /> Yuklanmoqda...</> : "Kirish"}
                    </button>
                  </form>

                  <div className="auth-divider">yoki</div>
                  <p className="auth-switch">
                    Hisobingiz yo'qmi?
                    <button onClick={() => switchTab("register")}>Ro'yxatdan o'ting</button>
                  </p>
                </>
              )}

              {/* ── REGISTER ── */}
              {tab === "register" && (
                <>
                  <h2 className="auth-title">Ro'yxat</h2>
                  <p className="auth-subtitle">Yangi hisob yarating va xarid qilishni boshlang</p>

                  {alert && <div className={`auth-alert ${alert.type}`}>{alert.message}</div>}

                  <form className="auth-form" onSubmit={handleRegister} noValidate>
                    <div className="auth-row">
                      <div className="auth-field">
                        <label htmlFor="reg-firstname">Ism</label>
                        <input
                          id="reg-firstname"
                          type="text"
                          placeholder="Ism"
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          className={regErrors.first_name ? "input-error" : ""}
                          autoComplete="given-name"
                        />
                        {regErrors.first_name && <span className="auth-field-error">{regErrors.first_name}</span>}
                      </div>
                      <div className="auth-field">
                        <label htmlFor="reg-lastname">Familiya</label>
                        <input
                          id="reg-lastname"
                          type="text"
                          placeholder="Familiya"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          className={regErrors.last_name ? "input-error" : ""}
                          autoComplete="family-name"
                        />
                        {regErrors.last_name && <span className="auth-field-error">{regErrors.last_name}</span>}
                      </div>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="reg-email">Email</label>
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="email@misol.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={regErrors.email ? "input-error" : ""}
                        autoComplete="email"
                      />
                      {regErrors.email && <span className="auth-field-error">{regErrors.email}</span>}
                    </div>

                    <div className="auth-field">
                      <label htmlFor="reg-password">Parol</label>
                      <div className="auth-password-wrap">
                        <input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Kamida 6 ta belgi"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className={regErrors.password ? "input-error" : ""}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="auth-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Parolni ko'rsat"
                        >
                          {showPassword ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {regErrors.password && <span className="auth-field-error">{regErrors.password}</span>}
                    </div>

                    <button id="register-submit" className="auth-submit" type="submit" disabled={loading}>
                      {loading ? <><span className="auth-spinner" /> Yuklanmoqda...</> : "Ro'yxatdan o'tish"}
                    </button>
                  </form>

                  <div className="auth-divider">yoki</div>
                  <p className="auth-switch">
                    Hisobingiz bormi?
                    <button onClick={() => switchTab("login")}>Kirish</button>
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
