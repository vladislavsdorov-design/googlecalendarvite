import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  update,
  get,
} from "firebase/database";
import EmployeeView from "./EmployeeView.jsx";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import "./App.css";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
// Добавьте эти состояния в AdminApp

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Цвета Google Calendar
const GOOGLE_COLORS = [
  { id: 1, name: "Lavender", hex: "#a4bdfc" },
  { id: 2, name: "Sage", hex: "#7ae7bf" },
  { id: 3, name: "Grape", hex: "#dbadff" },
  { id: 4, name: "Flamingo", hex: "#ff887c" },
  { id: 5, name: "Banana", hex: "#fbd75b" },
  { id: 6, name: "Tangerine", hex: "#ffb878" },
  { id: 7, name: "Peacock", hex: "#46d6db" },
  { id: 8, name: "Graphite", hex: "#e1e1e1" },
  { id: 9, name: "Blueberry", hex: "#5484ed" },
  { id: 10, name: "Basil", hex: "#51b749" },
  { id: 11, name: "Tomato", hex: "#dc2127" },
];

const USER_COLORS = GOOGLE_COLORS.map((c) => c.hex);
const COLOR_MAPPING = {};
GOOGLE_COLORS.forEach((color) => {
  COLOR_MAPPING[color.hex] = color.id;
});

const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ============= КОМПОНЕНТ ВХОДА =============
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (email !== "b.lewandowski@jetzone24.com") {
        throw new Error("Доступ разрешён только администратору");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onLogin(userCredential.user);
    } catch (error) {
      console.error("Ошибка входа:", error);
      setError(error.message || "Ошибка входа. Проверьте данные");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">JetZone24</div>
          <h1 className="login-title">Kalendarz zmian</h1>
          <p className="login-subtitle">Logowanie do panelu administratora</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <i className="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                className="login-input"
                placeholder="admin@jetzone24.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Hasło</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <i className="fa-solid fa-shield-halved"></i>{" "}
              </span>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Tylko dla administratorów</p>
          <div className="employee-link">
            <Link to="/employee">➔ Panel pracownika</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= НОВЫЙ КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// ============= НОВЫЙ КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ С ДНЯМИ И ИСТОРИЕЙ =============
// ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
const AvailabilitySettings = ({
  show,
  onClose,
  settings, // это currentMonthSettings из родителя
  onSave,
  user,
  db,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(31);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthSettings, setMonthSettings] = useState(null);

  // Загружаем настройки для выбранного месяца при открытии или смене месяца
  useEffect(() => {
    if (show) {
      loadMonthSettings();
    }
  }, [show, selectedMonth, selectedYear]);

  const loadMonthSettings = async () => {
    setLoading(true);
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}`;
      console.log("Загрузка настроек для месяца:", monthKey);

      // Загружаем настройки для конкретного месяца
      const settingsRef = ref(db, `settings/availability/${monthKey}`);
      const snapshot = await get(settingsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Найдены настройки:", data);
        setMonthSettings(data);
        setEnabled(data.enabled || false);
        setStartDay(data.startDay || 1);
        setEndDay(data.endDay || 31);
      } else {
        console.log("Нет настроек для этого месяца");
        setMonthSettings(null);
        setEnabled(false);
        setStartDay(1);
        setEndDay(31);
      }

      // Загружаем историю
      await loadHistory();
    } catch (error) {
      console.error("Ошибка загрузки настроек месяца:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}`;
      const historyRef = ref(db, `settings/availability_history/${monthKey}`);
      const snapshot = await get(historyRef);

      if (snapshot.exists()) {
        const historyData = snapshot.val();
        const historyArray = Object.entries(historyData)
          .map(([timestamp, data]) => ({
            ...data,
            timestamp: timestamp,
            id: timestamp,
          }))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setHistory(historyArray);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}`;

      const settingsData = {
        enabled,
        startDay: parseInt(startDay),
        endDay: parseInt(endDay),
        month: selectedMonth,
        year: selectedYear,
        monthKey,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email,
      };

      // Сохраняем в Firebase
      const settingsRef = ref(db, `settings/availability/${monthKey}`);
      await set(settingsRef, settingsData);

      // Сохраняем в историю ТОЛЬКО если изменилось состояние enabled
      const lastHistoryItem = history[0];
      if (!lastHistoryItem || lastHistoryItem.enabled !== enabled) {
        const timestamp = Date.now();
        const historyRef = ref(
          db,
          `settings/availability_history/${monthKey}/${timestamp}`
        );
        await set(historyRef, {
          ...settingsData,
          timestamp,
          action: enabled ? "🔓 Odblokowano" : "🔒 Zablokowano",
        });
      }

      // Обновляем родительский компонент
      await onSave(settingsData);

      // Обновляем историю
      await loadHistory();

      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Zapisano dla ${months[selectedMonth]} ${selectedYear}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("❌ Błąd podczas zapisywania");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć WSZYSTKIE ustawienia dla ${months[selectedMonth]} ${selectedYear}?`
      )
    )
      return;

    setSaving(true);
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}`;

      // Удаляем основные настройки
      const settingsRef = ref(db, `settings/availability/${monthKey}`);
      await remove(settingsRef);

      // Удаляем историю
      const historyRef = ref(db, `settings/availability_history/${monthKey}`);
      await remove(historyRef);

      // Очищаем состояние
      setEnabled(false);
      setStartDay(1);
      setEndDay(31);
      setMonthSettings(null);
      setHistory([]);

      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Usunięto wszystkie ustawienia dla ${months[selectedMonth]} ${selectedYear}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      onClose();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("❌ Błąd podczas usuwania");
    } finally {
      setSaving(false);
    }
  };
  // Функция для подтверждения доступности и изменения названия на "Recepcja"

  const handleQuickAction = (action) => {
    if (action === "enable") {
      setEnabled(true);
    } else if (action === "disable") {
      setEnabled(false);
    }
  };

  if (!show) return null;

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal availability-modal" style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <h3 className="modal-title">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{ marginRight: "8px" }}
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                strokeWidth="1.5"
              />
              <path d="M8 2v4M16 2v4M3 10h18" strokeWidth="1.5" />
            </svg>
            Zarządzanie dostępnością
          </h3>
          <div className="modal-header-actions">
            <button
              className={`btn-icon-small ${showHistory ? "active" : ""}`}
              onClick={() => setShowHistory(!showHistory)}
              title="Historia blokad"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V10L14 12M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-content">
          {/* Селектор месяца и года ВСЕГДА сверху */}
          <div className="month-selector-panel">
            <div className="month-year-selector">
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                }}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-input year-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2024"
                max="2030"
              />
            </div>

            {loading && <div className="loading-indicator">Ładowanie...</div>}
          </div>

          {showHistory ? (
            // История изменений
            <div className="history-section">
              <h4>
                Historia blokad - {months[selectedMonth]} {selectedYear}
              </h4>

              {loading ? (
                <div className="loading-spinner-small">
                  Ładowanie historii...
                </div>
              ) : history.length === 0 ? (
                <div className="empty-state small">
                  <p>
                    Brak historii blokad dla {months[selectedMonth]}{" "}
                    {selectedYear}
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <div key={item.timestamp} className="history-item">
                      <div className="history-item-date">
                        {new Date(item.updatedAt).toLocaleString("pl-PL", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="history-item-status">
                        <span
                          className={`status-badge ${
                            item.enabled ? "enabled" : "disabled"
                          }`}
                        >
                          {item.enabled ? "🔓 Odblokowano" : "🔒 Zablokowano"}
                        </span>
                      </div>
                      <div className="history-item-range">
                        {item.startDay} - {item.endDay}
                      </div>
                      <div className="history-item-user">
                        {item.updatedBy?.split("@")[0] || "admin"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-secondary btn-block"
                onClick={() => setShowHistory(false)}
              >
                ← Powrót do ustawień
              </button>
            </div>
          ) : (
            // Основные настройки
            <div className="availability-controls">
              {/* Статус месяца */}
              <div className="month-status">
                <div
                  className={`status-indicator ${
                    enabled ? "active" : "inactive"
                  }`}
                >
                  {enabled ? (
                    <>
                      {" "}
                      <i
                        className="fa-solid fa-check"
                        style={{ color: "rgb(29, 155, 0)" }}
                      ></i>{" "}
                      Odblokowany{" "}
                    </>
                  ) : (
                    <>
                      <i
                        className="fa-solid fa-ban"
                        style={{
                          color: "rgb(217, 160, 4)",
                          marginRight: "6px",
                        }}
                      ></i>
                      Zablokowany
                    </>
                  )}
                </div>
                {monthSettings && (
                  <div className="last-updated">
                    Ostatnia zmiana:{" "}
                    {new Date(monthSettings.updatedAt).toLocaleString("pl-PL")}
                  </div>
                )}
              </div>

              {/* Диапазон дней */}
              <div className="form-section">
                <label className="form-label">Zakres dni w miesiącu</label>
                <div className="date-range-inputs">
                  <div className="date-input-group">
                    <span className="date-input-label">Od</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="form-input date-input"
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)}
                    />
                  </div>
                  <div className="date-input-group">
                    <span className="date-input-label">Do</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="form-input date-input"
                      value={endDay}
                      onChange={(e) => setEndDay(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Быстрые действия */}
              <div className="quick-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleQuickAction("enable")}
                  disabled={enabled}
                >
                  🔓 Odblokuj
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => handleQuickAction("disable")}
                  disabled={!enabled}
                >
                  🔒 Zablokuj
                </button>
                <button className="btn btn-danger" onClick={handleDeleteAll}>
                  <i
                    className="fa-regular fa-trash-can"
                    style={{ color: "rgb(222, 222, 222)" }}
                  ></i>{" "}
                  Usuń wszystko
                </button>
              </div>

              <p className="input-hint">
                {enabled ? (
                  <>
                    <i
                      className="fa-solid fa-check"
                      style={{ color: "rgb(29, 155, 0)" }}
                    ></i>{" "}
                    Pracownicy mogą dodawać dostępność od {startDay} do {endDay}{" "}
                    {months[selectedMonth]} {selectedYear}
                  </>
                ) : (
                  `🔒 Dodawanie dostępności jest zablokowane dla ${months[selectedMonth]} ${selectedYear}`
                )}
              </p>
            </div>
          )}
        </div>

        {!showHistory && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Anuluj
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Zapisywanie..."
                : "Zapisz dla " + months[selectedMonth]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// ============= КОМПОНЕНТ ВЫХОДА =============
const LogoutButton = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <button className="btn-icon logout-btn" onClick={handleLogout}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M7 4H5C3.89543 4 3 4.89543 3 6V14C3 15.1046 3.89543 16 5 16H7M13 12L16 10M16 10L13 8M16 10H8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>Wyloguj się</span>
    </button>
  );
};

const calculateHoursDiff = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  let diff = endTotal - startTotal;
  if (diff < 0) diff += 24 * 60;
  return diff / 60;
};

// ============= КОМПОНЕНТ ДЛЯ ПРИНЯТИЯ/ОТКЛОНЕНИЯ ЗАЯВОК =============
const PendingRequestsModal = ({
  show,
  onClose,
  pendingEvents,
  users,
  onAccept,
  onReject,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal requests-modal">
        <div className="modal-header">
          <h3 className="modal-title">Zgłoszenia dostępności od pracowników</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {pendingEvents.length === 0 ? (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  strokeWidth="1.5"
                />
              </svg>
              <p>Brak oczekujących zgłoszeń</p>
              <span>Pracownicy nie dodali jeszcze żadnych dostępności</span>
            </div>
          ) : (
            <div className="requests-list">
              {pendingEvents.map((event) => {
                const user = users.find((u) => u.id === event.userId);
                if (!user) return null;

                return (
                  <div
                    key={event.id}
                    className="request-card"
                    style={{ borderLeftColor: user.color }}
                  >
                    <div className="request-header">
                      <div className="request-user">
                        <div
                          className="request-user-avatar"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="request-user-info">
                          <div className="request-user-name">{user.name}</div>
                          <div className="request-user-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="request-status">
                        <span className="status-badge pending">Oczekuje</span>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="request-detail">
                        <span className="detail-label">Data:</span>
                        <span className="detail-value">
                          {new Date(event.date).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <div className="request-detail">
                        <span className="detail-label">Godziny:</span>
                        <span className="detail-value">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <div className="request-detail">
                        <span className="detail-label">Rodzaj:</span>
                        <span className="detail-value">{event.title}</span>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => onAccept(event)}
                      >
                        ✅ Akceptuj
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => onReject(event.id)}
                      >
                        ❌ Odrzuć
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= МОДАЛКА ДЛЯ ОТОБРАЖЕНИЯ НЕСКОЛЬКИХ СОБЫТИЙ =============
// ============= МОДАЛКА ДЛЯ ОТОБРАЖЕНИЯ НЕСКОЛЬКИХ СОБЫТИЙ =============
// ============= МОДАЛКА ДЛЯ ОТОБРАЖЕНИЯ НЕСКОЛЬКИХ СОБЫТИЙ =============
const EventsListModal = ({
  show,
  onClose,
  events,
  onEditEvent,
  users,
  onConfirmClick,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal events-list-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            Wydarzenia dnia{" "}
            {events[0]?.date
              ? new Date(events[0].date).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="events-list">
            {events.map((event) => {
              const user = users.find((u) => u.id === event.userId);
              const isAvailability =
                event.title === "Dostępność" ||
                event.title?.toLowerCase().includes("dostęp");

              return (
                <div
                  key={event.id}
                  className={`event-list-item ${
                    event.isPending ? "pending" : ""
                  } ${isAvailability ? "availability-event" : ""}`}
                  style={{
                    borderLeftColor: user?.color,
                    backgroundColor: event.isPending
                      ? `${user?.color}10`
                      : "transparent",
                  }}
                >
                  <div
                    className="event-item-color"
                    style={{ backgroundColor: user?.color }}
                  />
                  <div className="event-item-info">
                    <div className="event-item-user">
                      <span className="event-item-name">
                        {user?.name || "Nieznany"}
                      </span>
                      {event.isPending && (
                        <span className="event-item-badge">
                          {event.title === "Dostępność"
                            ? "⏳ Dostępność"
                            : "⏳ Oczekuje"}
                        </span>
                      )}
                    </div>
                    <div className="event-item-details">
                      <span className="event-item-time">
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="event-item-title">{event.title}</span>
                    </div>
                  </div>

                  <div className="event-item-actions">
                    {event.isPending && event.title === "Dostępność" && (
                      <button
                        className="event-action-btn confirm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmClick(event); // Открываем новую модалку
                        }}
                        title="Potwierdź dostępność"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M16 6L8 14L4 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>Potwierdź</span>
                      </button>
                    )}
                    <button
                      className="event-action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event, event.isPending);
                        onClose();
                      }}
                      title="Edytuj"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M11.5 2.5L13.5 4.5M3 13L6.5 12L13.5 5L11 2.5L4 9.5L3 13Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= ГЛАВНЫЙ КОМПОНЕНТ АДМИНА =============
function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMonthlyStatsModal, setShowMonthlyStatsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAvailabilitySettings, setShowAvailabilitySettings] =
    useState(false);
  const [authWindow, setAuthWindow] = useState(null);
  // Добавьте эти состояния
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEventForConfirm, setSelectedEventForConfirm] = useState(null);
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  // Добавьте это состояние рядом с другими
  // Добавьте это состояние рядом с другими
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  // Добавьте это состояние в AdminApp (в раздел с другими useState)
  const [currentMonthSettings, setCurrentMonthSettings] = useState({
    enabled: false,
    startDay: 1,
    endDay: 31,
  });

  // Состояния для копирования
  const [copiedEvent, setCopiedEvent] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState(null);
  const [isCopying, setIsCopying] = useState(false);

  // Состояния для месячной статистики
  const [selectedStatsMonth, setSelectedStatsMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({});

  // Состояния для настроек доступности
  const [availabilitySettings, setAvailabilitySettings] = useState({
    enabled: false,
    startDay: 1,
    endDay: 31,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    monthKey: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`,
  });

  // Форма создания/редактирования смены
  const [eventForm, setEventForm] = useState({
    id: null,
    title: "Recepcja",
    date: formatDateToYMD(new Date()),
    startTime: "13:00",
    endTime: "20:00",
    userIds: [],
    sendEmail: true,
    isPending: false,
  });

  const [bulkForm, setBulkForm] = useState({
    selectedEvents: [],
    sendEmail: true,
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    color: USER_COLORS[0],
  });

  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventsListModal, setShowEventsListModal] = useState(false);

  // ============= АВТОРИЗАЦИЯ =============
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Инициализация данных после авторизации
  useEffect(() => {
    if (user) {
      loadInitialData();

      const token = localStorage.getItem("google_token");
      if (token) {
        setIsAuthorized(true);
        verifyToken(token);
      }

      window.addEventListener("message", handleAuthMessage);
      return () => {
        window.removeEventListener("message", handleAuthMessage);
        if (authWindow) authWindow.close();
      };
    }
  }, [user]);

  // Статистика
  useEffect(() => {
    if (user) {
      calculateStatistics();
    }
  }, [events, users, user]);

  // Обновление месячной статистики при изменении выбранного месяца
  useEffect(() => {
    if (user) {
      const stats = calculateMonthlyStatistics(selectedStatsMonth);
      setMonthlyStats(stats);
    }
  }, [selectedStatsMonth, events, pendingEvents, users, user]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      const token = hash.split("access_token=")[1].split("&")[0];
      localStorage.setItem("google_token", token);
      setIsAuthorized(true);
      window.location.hash = "";
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  // Горячие клавиши для копирования
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCopyMode) {
        cancelCopyMode();
      }

      if (e.ctrlKey && e.key === "c" && hoveredEvent) {
        e.preventDefault();
        handleCopyEvent(
          hoveredEvent.event,
          hoveredEvent.isPending,
          hoveredEvent.date
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCopyMode, hoveredEvent]);

  const calculateStatistics = () => {
    const newStats = {};
    users.forEach((user) => {
      const userEvents = Object.values(events).filter(
        (e) => e.userId === user.id
      );
      const totalShifts = userEvents.length;
      let totalHours = 0;
      userEvents.forEach((event) => {
        totalHours += calculateHoursDiff(event.startTime, event.endTime);
      });
      newStats[user.id] = {
        user,
        totalShifts,
        totalHours: parseFloat(totalHours.toFixed(1)),
        averageHoursPerShift:
          totalShifts > 0
            ? parseFloat((totalHours / totalShifts).toFixed(1))
            : 0,
      };
    });
    setStats(newStats);
  };

  const calculateMonthlyStatistics = (targetDate) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${daysInMonth}`;

    const monthlyStats = {};

    users.forEach((user) => {
      const userEvents = Object.values(events).filter(
        (e) =>
          e.userId === user.id && e.date >= monthStart && e.date <= monthEnd
      );

      const userPendingEvents = pendingEvents.filter(
        (e) =>
          e.userId === user.id && e.date >= monthStart && e.date <= monthEnd
      );

      const totalShifts = userEvents.length;
      const pendingShifts = userPendingEvents.length;

      let totalHours = 0;
      userEvents.forEach((event) => {
        totalHours += calculateHoursDiff(event.startTime, event.endTime);
      });

      let pendingHours = 0;
      userPendingEvents.forEach((event) => {
        pendingHours += calculateHoursDiff(event.startTime, event.endTime);
      });

      monthlyStats[user.id] = {
        user,
        totalShifts,
        pendingShifts,
        totalHours: parseFloat(totalHours.toFixed(1)),
        pendingHours: parseFloat(pendingHours.toFixed(1)),
        averageHoursPerShift:
          totalShifts > 0
            ? parseFloat((totalHours / totalShifts).toFixed(1))
            : 0,
      };
    });

    return monthlyStats;
  };

  const handleAuthMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type === "google_auth_success") {
      const token = event.data.token;
      localStorage.setItem("google_token", token);
      setIsAuthorized(true);
      if (authWindow) {
        authWindow.close();
        setAuthWindow(null);
      }
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + token
      );
      const data = await response.json();
      if (data.error) {
        localStorage.removeItem("google_token");
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Ошибка проверки токена:", error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    await loadUsersFromFirebase();
    await loadEventsFromFirebase();
    await loadPendingEventsFromFirebase();
    await loadConfirmedEventsFromFirebase(); // Убедитесь, что это есть
    await loadAvailabilitySettings();
    const savedPending = localStorage.getItem("pendingEvents");
    if (savedPending) {
      try {
        setPendingEvents(JSON.parse(savedPending));
      } catch (e) {
        setPendingEvents([]);
      }
    }
    setIsLoading(false);
  };
  const loadConfirmedEventsFromFirebase = () => {
    const confirmedRef = ref(db, "confirmedEvents");
    onValue(confirmedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const confirmedArray = Object.values(data);
        setConfirmedEvents(confirmedArray);
      } else {
        setConfirmedEvents([]);
      }
    });
  };
  const loadUsersFromFirebase = () => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersMap = new Map();
        Object.values(data).forEach((user) => {
          if (user && user.id) {
            usersMap.set(user.id, user);
          }
        });
        const uniqueUsers = Array.from(usersMap.values());
        setUsers(uniqueUsers);
      } else {
        setUsers([]);
      }
    });
  };
  // ============= МОДАЛКА ДЛЯ ПОДТВЕРЖДЕНИЯ ДОСТУПНОСТИ =============
  // ============= МОДАЛКА ДЛЯ ПОДТВЕРЖДЕНИЯ ДОСТУПНОСТИ =============
  const ConfirmAvailabilityModal = ({
    show,
    onClose,
    event,
    user,
    onConfirm,
    onDelete, // Добавьте этот пропс
  }) => {
    const [selectedTitle, setSelectedTitle] = useState("Recepcja");
    const [customTitle, setCustomTitle] = useState("");
    const [showCustom, setShowCustom] = useState(false);
    const [notes, setNotes] = useState("");

    if (!show || !event) return null;

    const titleOptions = [
      { value: "Recepcja", label: "Recepcja", color: "#4A90E2" },
      { value: "Serwis", label: "Serwis", color: "#F5A623" },
      { value: "Szkolenie", label: "Szkolenie", color: "#9013FE" },
      { value: "Spotkanie", label: "Spotkanie", color: "#417505" },
      { value: "Inne", label: "Inne (wpisz własną nazwę)", color: "#7F8C8D" },
    ];

    const handleConfirm = () => {
      const finalTitle = showCustom ? customTitle : selectedTitle;
      if (showCustom && !customTitle.trim()) {
        alert("Wpisz nazwę zmiany");
        return;
      }
      onConfirm(event, finalTitle, notes);
    };

    const handleDelete = () => {
      if (window.confirm("Czy na pewno chcesz usunąć tę dostępność?")) {
        onDelete(event.id);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal confirm-modal">
          <div className="modal-header">
            <h3 className="modal-title">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Potwierdź dostępność
            </h3>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="modal-content">
            {/* Информация о сотруднике */}
            <div className="confirm-employee-info">
              <div
                className="employee-avatar-large"
                style={{ backgroundColor: user?.color }}
              >
                {user?.name?.charAt(0)}
              </div>
              <div className="employee-details">
                <div className="employee-name">{user?.name}</div>
                <div className="employee-email">{user?.email}</div>
              </div>
            </div>

            {/* Информация о доступности */}
            <div className="confirm-availability-info">
              <div className="info-row">
                <span className="info-label">Data:</span>
                <span className="info-value">
                  {new Date(event.date).toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Godziny:</span>
                <span className="info-value">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Originalna nazwa:</span>
                <span className="info-value original-title">{event.title}</span>
              </div>
            </div>

            {/* Выбор новой названия */}
            <div className="form-section">
              <label className="form-label">Wybierz rodzaj zmiany</label>
              <div className="title-options">
                {titleOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`title-option ${
                      selectedTitle === option.value && !showCustom
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedTitle(option.value);
                      setShowCustom(option.value === "Inne");
                      if (option.value !== "Inne") {
                        setCustomTitle("");
                      }
                    }}
                    style={{ "--option-color": option.color }}
                  >
                    <span
                      className="option-color-dot"
                      style={{ backgroundColor: option.color }}
                    ></span>
                    <span className="option-label">{option.label}</span>
                    {selectedTitle === option.value && !showCustom && (
                      <span className="option-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Поле для пользовательской названия */}
            {showCustom && (
              <div className="form-section">
                <label className="form-label">Wpisz nazwę zmiany</label>
                <input
                  type="text"
                  className="form-input"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="np. Konserwacja, Dyżur, etc."
                  autoFocus
                />
              </div>
            )}

            {/* Поле для заметок */}
            <div className="form-section">
              <label className="form-label">Notatki (opcjonalnie)</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodaj dodatkowe informacje..."
                rows="3"
              />
            </div>

            {/* Информация о действии */}
            <div className="confirm-info">
              <span className="info-icon">ℹ️</span>
              <span>
                Po potwierdzeniu zmiana zostanie przeniesiona do listy
                oczekujących z nową nazwą. Będzie widoczna w kalendarzu, ale
                wymaga jeszcze publikacji.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleDelete}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginRight: "4px" }}
              >
                <path
                  d="M4 6H16M14 6V14C14 15.1046 13.1046 16 12 16H8C6.89543 16 6 15.1046 6 14V6M8 4V2C8 1.44772 8.44772 1 9 1H11C11.5523 1 12 1.44772 12 2V4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Usuń
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Anuluj
            </button>
            <button className="btn btn-success" onClick={handleConfirm}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginRight: "4px" }}
              >
                <path
                  d="M16 6L8 14L4 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Potwierdź zmianę
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Добавьте эту функцию в компонент AdminApp
  const handleConfirmAvailability = async (event, newTitle, notes) => {
    try {
      // Создаем подтвержденное событие с новым ID
      const confirmedEvent = {
        ...event,
        id: `confirmed_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 6)}`,
        title: newTitle,
        isPending: true,
        notes: notes || "",
        confirmedAt: new Date().toISOString(),
        confirmedBy: user?.email || "",
        originalEventId: event.id,
      };

      // Удаляем все поля с undefined значениями
      Object.keys(confirmedEvent).forEach((key) => {
        if (confirmedEvent[key] === undefined) {
          delete confirmedEvent[key];
        }
      });

      // Удаляем оригинальное событие из pendingEvents
      const updatedPendingEvents = pendingEvents.filter(
        (e) => e.id !== event.id
      );

      // Добавляем подтвержденное в confirmedEvents
      const updatedConfirmedEvents = [...confirmedEvents, confirmedEvent];

      console.log("Обновленные confirmedEvents:", updatedConfirmedEvents); // Проверяем в консоли

      // Сохраняем оба списка
      await savePendingEvents(updatedPendingEvents);
      await saveConfirmedEvents(updatedConfirmedEvents);

      // Принудительно обновляем календарь
      setCurrentDate((prev) => new Date(prev)); // Триггер для перерендера

      // Показываем уведомление
      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Potwierdzono jako "${newTitle}" dla ${event.user?.name}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Закрываем модалки
      setShowConfirmModal(false);
      setSelectedEventForConfirm(null);
      setShowEventsListModal(false);
    } catch (error) {
      console.error("Ошибка подтверждения:", error);
      alert("❌ Błąd podczas potwierdzania");
    }
  };
  const loadPendingEventsFromFirebase = () => {
    const pendingRef = ref(db, "pendingEvents");
    onValue(
      pendingRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Загружены ожидающие события из Firebase:", data);
        if (data) {
          const pendingArray = Object.values(data);
          setPendingEvents(pendingArray);
          localStorage.setItem("pendingEvents", JSON.stringify(pendingArray));
        } else {
          setPendingEvents([]);
          localStorage.removeItem("pendingEvents");
        }
      },
      (error) => {
        console.error("Ошибка загрузки ожидающих событий:", error);
      }
    );
  };
  // Добавьте эту функцию рядом с другими handle функциями
  const handleDeletePendingEvent = async (eventId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę dostępność?")) return;

    try {
      // Удаляем из pendingEvents
      const updatedPendingEvents = pendingEvents.filter(
        (e) => e.id !== eventId
      );
      await savePendingEvents(updatedPendingEvents);

      // Показываем уведомление
      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Usunięto dostępność`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Закрываем модалку
      setShowConfirmModal(false);
      setSelectedEventForConfirm(null);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("❌ Błąd podczas usuwania");
    }
  };
  const loadAvailabilitySettings = async () => {
    const settingsRef = ref(db, "settings/availability");
    onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Загружены все настройки доступности:", data);

      if (data) {
        setAvailabilitySettings(data);

        // Находим настройки для ТЕКУЩЕГО месяца
        const currentMonthKey = `${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}`;

        const currentSettings = data[currentMonthKey];
        console.log(
          "Настройки для текущего месяца:",
          currentMonthKey,
          currentSettings
        );

        if (currentSettings) {
          setCurrentMonthSettings(currentSettings);
        } else {
          // Если нет настроек, отключаем
          setCurrentMonthSettings({ enabled: false });
        }
      } else {
        setAvailabilitySettings({});
        setCurrentMonthSettings({ enabled: false });
      }
    });
  };

  const loadEventsFromFirebase = () => {
    const eventsRef = ref(db, "calendarEvents");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEvents(data);
      } else {
        setEvents({});
      }
    });
  };

  const savePendingEvents = async (newPendingEvents) => {
    setPendingEvents(newPendingEvents);
    localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));

    try {
      for (const event of newPendingEvents) {
        // Создаем копию события без undefined полей
        const cleanEvent = {};
        Object.keys(event).forEach((key) => {
          if (event[key] !== undefined) {
            cleanEvent[key] = event[key];
          }
        });

        const pendingRef = ref(db, `pendingEvents/${event.id}`);
        await set(pendingRef, cleanEvent);
      }

      const snapshot = await get(ref(db, "pendingEvents"));
      const firebaseEvents = snapshot.val() || {};

      for (const firebaseId of Object.keys(firebaseEvents)) {
        if (!newPendingEvents.find((e) => e.id === firebaseId)) {
          const pendingRef = ref(db, `pendingEvents/${firebaseId}`);
          await remove(pendingRef);
        }
      }

      console.log("Ожидающие события сохранены в Firebase");
    } catch (error) {
      console.error("Ошибка сохранения в Firebase:", error);
    }
  };
  const saveAvailabilitySettings = async (settings) => {
    try {
      console.log("Сохранение настроек для месяца:", settings.monthKey);

      // Сохраняем в общий объект настроек
      const settingsRef = ref(db, `settings/availability/${settings.monthKey}`);
      await set(settingsRef, {
        enabled: settings.enabled,
        startDay: settings.startDay,
        endDay: settings.endDay,
        month: settings.month,
        year: settings.year,
        monthKey: settings.monthKey,
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      });

      // Обновляем локальное состояние
      setAvailabilitySettings((prev) => ({
        ...prev,
        [settings.monthKey]: settings,
      }));

      // Если это текущий месяц, обновляем currentMonthSettings
      const currentMonthKey = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`;

      if (settings.monthKey === currentMonthKey) {
        setCurrentMonthSettings(settings);
      }

      setShowAvailabilitySettings(false);

      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Ustawienia zapisane`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      return settings;
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
      alert("❌ Błąd podczas zapisywania ustawień");
      throw error;
    }
  };

  const loginWithGoogle = () => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent(SCOPES);
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const win = window.open(
      authUrl,
      "Google Auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    setAuthWindow(win);
  };

  const logout = () => {
    localStorage.removeItem("google_token");
    setIsAuthorized(false);
  };

  const saveEventToFirebase = async (eventData, eventId = null) => {
    const id = eventId || Date.now().toString();
    const eventRef = ref(db, `calendarEvents/${id}`);
    await set(eventRef, { ...eventData, id });
    return id;
  };

  const deleteEventFromFirebase = async (eventId) => {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    await remove(eventRef);
  };

  const getGoogleCalendarColor = (userColor) => {
    return COLOR_MAPPING[userColor] || 1;
  };

  const createGoogleCalendarEvent = async (eventData, user) => {
    const token = localStorage.getItem("google_token");
    if (!token) return null;

    const [year, month, day] = eventData.date.split("-").map(Number);
    const [startHour, startMinute] = eventData.startTime.split(":").map(Number);
    const [endHour, endMinute] = eventData.endTime.split(":").map(Number);

    const startDateTime = new Date(
      year,
      month - 1,
      day,
      startHour,
      startMinute
    );
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

    const event = {
      summary: `${user.name} — ${eventData.title || "Смена"}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: `Сотрудник: ${user.name}\nEmail: ${user.email}\nСмена: ${
        eventData.title || "Рабочая смена"
      }`,
      colorId: getGoogleCalendarColor(user.color).toString(),
    };

    if (user?.email && eventData.sendEmail) {
      event.attendees = [
        {
          email: user.email,
          displayName: user.name,
          responseStatus: "needsAction",
        },
      ];
    }

    try {
      const queryParams = new URLSearchParams();
      if (eventData.sendEmail && user?.email) {
        queryParams.append("sendUpdates", "all");
      }
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("google_token");
          setIsAuthorized(false);
        }
        return null;
      }
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Ошибка создания события в Google Calendar:", error);
      return null;
    }
  };

  // ============= ФУНКЦИИ ДЛЯ ПРИНЯТИЯ/ОТКЛОНЕНИЯ =============
  const handleAcceptRequest = async (event) => {
    const user = users.find((u) => u.id === event.userId);
    if (!user) return;

    let googleEventId = null;
    if (isAuthorized) {
      googleEventId = await createGoogleCalendarEvent(event, user);
    }

    const newEvent = {
      ...event,
      googleEventId,
      createdAt: new Date().toISOString(),
      isPending: false,
      acceptedBy: user.email,
      acceptedAt: new Date().toISOString(),
    };

    const savedEventId = await saveEventToFirebase(newEvent);
    newEvent.id = savedEventId;

    setEvents((prev) => ({
      ...prev,
      [savedEventId]: newEvent,
    }));

    const newPendingEvents = pendingEvents.filter((e) => e.id !== event.id);
    await savePendingEvents(newPendingEvents);

    alert(
      `✅ Zaakceptowano dostępność ${user.name} na dzień ${new Date(
        event.date
      ).toLocaleDateString("pl-PL")}`
    );
  };

  const handleRejectRequest = async (eventId) => {
    if (!window.confirm("Czy na pewno chcesz odrzucić to zgłoszenie?")) return;

    const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
    await savePendingEvents(newPendingEvents);

    alert(`❌ Zgłoszenie zostało odrzucone`);
  };

  const publishBulkEvents = async () => {
    if (bulkForm.selectedEvents.length === 0) {
      alert("Выберите события для публикации");
      return;
    }

    if (!isAuthorized) {
      alert("Для публикации нужно войти в Google Calendar");
      return;
    }

    setBulkPublishing(true);

    const publishedEvents = [];
    let successCount = 0;
    let failCount = 0;

    for (const eventId of bulkForm.selectedEvents) {
      // Ищем событие в confirmedEvents, а не в pendingEvents
      const event = confirmedEvents.find((e) => e.id === eventId);
      if (!event) continue;

      const user = users.find((u) => u.id === event.userId);
      if (!user) continue;

      const googleEventId = await createGoogleCalendarEvent(event, user);

      if (googleEventId) {
        const savedEventId = await saveEventToFirebase({
          ...event,
          googleEventId,
          createdAt: new Date().toISOString(),
          isPending: false,
          acceptedBy: user.email,
          acceptedAt: new Date().toISOString(),
        });
        publishedEvents.push({ ...event, googleEventId, id: savedEventId });
        successCount++;
      } else {
        failCount++;
      }
    }

    if (publishedEvents.length > 0) {
      setEvents((prev) => {
        const newEvents = { ...prev };
        publishedEvents.forEach((event) => {
          newEvents[event.id] = event;
        });
        return newEvents;
      });
    }

    // Удаляем опубликованные из confirmedEvents
    const newConfirmedEvents = confirmedEvents.filter(
      (e) => !bulkForm.selectedEvents.includes(e.id)
    );
    await saveConfirmedEvents(newConfirmedEvents);

    setBulkForm({ selectedEvents: [], sendEmail: true });
    setBulkPublishing(false);
    setShowBulkModal(false);
  };

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
  };

  // Функция копирования смены
  const handleCopyEvent = (event, isPending, sourceDate) => {
    if (isCopying) return;

    setIsCopying(true);
    setCopiedEvent({ ...event, isPending });
    setIsCopyMode(true);
    setCopySourceDate(sourceDate);

    const copyIndicator = document.createElement("div");
    copyIndicator.className = "copy-corner-indicator";
    copyIndicator.innerHTML = `
      <div class="copy-corner-content">
        <span class="copy-corner-icon">📋</span>
        <span class="copy-corner-text">Skopiowano</span>
        <span class="copy-corner-time">${event.startTime}</span>
      </div>
    `;
    document.body.appendChild(copyIndicator);

    setTimeout(() => {
      if (copyIndicator.parentNode) {
        copyIndicator.remove();
      }
      setIsCopying(false);
    }, 2000);
  };

  // Функция вставки смены
  const handlePasteEvent = (newEvent, targetDate, isPending) => {
    if (isPending) {
      const updatedPendingEvents = [...pendingEvents, newEvent];
      savePendingEvents(updatedPendingEvents);

      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 2000);
    } else {
      const user = users.find((u) => u.id === newEvent.userId);
      if (!user) return;

      saveEventToFirebase(newEvent, newEvent.id).then(() => {
        setEvents((prev) => ({ ...prev, [newEvent.id]: newEvent }));

        if (isAuthorized) {
          createGoogleCalendarEvent(newEvent, user).then((googleEventId) => {
            if (googleEventId) {
              const updatedEvent = { ...newEvent, googleEventId };
              saveEventToFirebase(updatedEvent, newEvent.id);
              setEvents((prev) => ({ ...prev, [newEvent.id]: updatedEvent }));
            }
          });
        }

        const toast = document.createElement("div");
        toast.className = "copy-toast success";
        document.body.appendChild(toast);

        setTimeout(() => {
          toast.remove();
        }, 2000);
      });
    }

    setTimeout(() => {
      setIsCopyMode(false);
      setCopiedEvent(null);
      setCopySourceDate(null);
    }, 300);
  };

  const cancelCopyMode = () => {
    setIsCopyMode(false);
    setCopiedEvent(null);
    setCopySourceDate(null);
  };

  const handleCreateEvent = async () => {
    // Добавляем проверку на существование
    if (!eventForm.title || !eventForm.title.trim()) {
      alert("Wpisz nazwę zmiany");
      return;
    }

    if (!eventForm.userIds || eventForm.userIds.length === 0) {
      alert("Wybierz co najmniej jednego pracownika");
      return;
    }

    if (bulkMode) {
      const newPendingEvents = eventForm.userIds.map((userId) => {
        const user = users.find((u) => u.id === userId);
        return {
          ...eventForm,
          userId,
          id: `pending_${Date.now()}_${userId}_${Math.random()
            .toString(36)
            .substr(2, 6)}`,
          createdAt: new Date().toISOString(),
          isPending: true,
          user,
        };
      });

      savePendingEvents([...pendingEvents, ...newPendingEvents]);
    } else {
      const createdEvents = [];
      let successCount = 0;

      for (const userId of eventForm.userIds) {
        const user = users.find((u) => u.id === userId);
        if (!user) continue;

        let googleEventId = null;
        if (isAuthorized) {
          googleEventId = await createGoogleCalendarEvent(eventForm, user);
        }

        const newEvent = {
          ...eventForm,
          userId,
          googleEventId,
          createdAt: new Date().toISOString(),
          isPending: false,
        };

        const savedEventId = await saveEventToFirebase(newEvent);
        newEvent.id = savedEventId;

        createdEvents.push(newEvent);
        successCount++;
      }

      if (createdEvents.length > 0) {
        setEvents((prev) => {
          const newEvents = { ...prev };
          createdEvents.forEach((event) => {
            newEvents[event.id] = event;
          });
          return newEvents;
        });
      }
    }

    setShowModal(false);
    setEventForm({
      id: null,
      title: "Recepcja",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userIds: [],
      sendEmail: true,
      isPending: false,
    });
  };

  const handleEditEvent = (event, isPending = false) => {
    setEventForm({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      userIds: [event.userId],
      sendEmail: event.sendEmail !== undefined ? event.sendEmail : true,
      isPending: isPending,
    });
    setShowModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.id) return;

    if (!eventForm.title.trim()) {
      alert("Введите название смены");
      return;
    }

    if (eventForm.userIds.length === 0) {
      alert("Выберите сотрудника");
      return;
    }

    const userId = eventForm.userIds[0];
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedEvent = {
      ...eventForm,
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (eventForm.isPending) {
      const updatedPendingEvents = pendingEvents.map((e) =>
        e.id === eventForm.id ? { ...e, ...updatedEvent, user } : e
      );
      savePendingEvents(updatedPendingEvents);
      alert(`✅ Zmiana została zaktualizowana na liście oczekujących`);
    } else {
      if (isAuthorized && events[eventForm.id]?.googleEventId) {
        await deleteGoogleCalendarEvent(events[eventForm.id].googleEventId);
      }

      let googleEventId = null;
      if (isAuthorized) {
        googleEventId = await createGoogleCalendarEvent(eventForm, user);
      }

      updatedEvent.googleEventId =
        googleEventId || events[eventForm.id]?.googleEventId;

      await saveEventToFirebase(updatedEvent, eventForm.id);

      setEvents((prev) => ({
        ...prev,
        [eventForm.id]: updatedEvent,
      }));

      alert(`✅ Zmiana została zaktualizowana`);
    }

    setShowModal(false);
    setEventForm({
      id: null,
      title: "Recepcja",
      date: formatDateToYMD(new Date()),
      startTime: "13:00",
      endTime: "20:00",
      userIds: [],
      sendEmail: true,
      isPending: false,
    });
  };

  const deleteGoogleCalendarEvent = async (googleEventId) => {
    const token = localStorage.getItem("google_token");
    if (!token) return;
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Ошибка удаления события из Google Calendar:", error);
    }
  };

  const handleDeleteEvent = async (eventId, isPending = false) => {
    if (!window.confirm("Usunąć tę zmianę?")) return;

    if (isPending) {
      const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
      savePendingEvents(newPendingEvents);
    } else {
      const event = events[eventId];
      if (isAuthorized && event?.googleEventId) {
        await deleteGoogleCalendarEvent(event.googleEventId);
      }
      await deleteEventFromFirebase(eventId);

      setEvents((prev) => {
        const newEvents = { ...prev };
        delete newEvents[eventId];
        return newEvents;
      });
    }

    if (eventForm.id === eventId) {
      setShowModal(false);
      setEventForm({
        id: null,
        title: "Recepcja",
        date: formatDateToYMD(new Date()),
        startTime: "13:00",
        endTime: "20:00",
        userIds: [],
        sendEmail: true,
        isPending: false,
      });
    }
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateToYMD(date);
    setSelectedDate(dateStr);

    const publishedEventsOnDate = Object.values(events).filter(
      (e) => e.date === dateStr
    );
    const pendingEventsOnDate = pendingEvents.filter((e) => e.date === dateStr);

    const allEventsOnDate = [
      ...publishedEventsOnDate.map((e) => ({ ...e, isPending: false })),
      ...pendingEventsOnDate.map((e) => ({ ...e, isPending: true })),
    ];

    if (allEventsOnDate.length === 0) {
      // Если нет событий - открываем модалку создания
      setEventForm({
        id: null,
        title: "Recepcja",
        date: dateStr,
        startTime: "13:00",
        endTime: "20:00",
        userIds: [],
        sendEmail: true,
        isPending: false,
      });
      setShowModal(true);
    } else if (allEventsOnDate.length === 1) {
      const firstEvent = allEventsOnDate[0];
      // Если это доступность - НЕ открываем модалку подтверждения здесь,
      // потому что это сделает обработчик клика на событии
      // Просто ничего не делаем
    } else {
      // Если несколько событий - показываем список
      setSelectedDateEvents(allEventsOnDate);
      setShowEventsListModal(true);
    }
  };

  const handleShiftClick = (e, event, isPending) => {
    e.stopPropagation();
    if (!e.ctrlKey && !e.shiftKey) {
      handleEditEvent(event, isPending);
    }
  };

  const toggleUserSelection = (userId) => {
    setEventForm((prev) => {
      if (prev.id) {
        return { ...prev, userIds: [userId] };
      }
      const newUserIds = prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId];
      return { ...prev, userIds: newUserIds };
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Заполните имя и email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert("Введите корректный email");
      return;
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
    );
    if (existingUser) {
      alert(`Пользователь с email ${newUser.email} уже существует`);
      return;
    }

    const newUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const userToAdd = {
      ...newUser,
      id: newUserId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const userRef = ref(db, `users/${newUserId}`);
    await set(userRef, userToAdd);

    setNewUser({ name: "", email: "", color: USER_COLORS[0] });
  };
  const saveConfirmedEvents = async (newConfirmedEvents) => {
    console.log("Сохранение confirmedEvents:", newConfirmedEvents);
    setConfirmedEvents(newConfirmedEvents);

    try {
      // Сохраняем в Firebase
      for (const event of newConfirmedEvents) {
        const cleanEvent = {};
        Object.keys(event).forEach((key) => {
          if (event[key] !== undefined) {
            cleanEvent[key] = event[key];
          }
        });

        const confirmedRef = ref(db, `confirmedEvents/${event.id}`);
        await set(confirmedRef, cleanEvent);
      }

      // Очищаем старые
      const snapshot = await get(ref(db, "confirmedEvents"));
      const firebaseEvents = snapshot.val() || {};

      for (const firebaseId of Object.keys(firebaseEvents)) {
        if (!newConfirmedEvents.find((e) => e.id === firebaseId)) {
          const confirmedRef = ref(db, `confirmedEvents/${firebaseId}`);
          await remove(confirmedRef);
        }
      }

      console.log("ConfirmedEvents сохранены успешно");
    } catch (error) {
      console.error("Ошибка сохранения подтвержденных событий:", error);
    }
  };
  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (
      window.confirm(
        `Удалить сотрудника "${user.name}"?\n\nВсе его смены также будут удалены.`
      )
    ) {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);

      const userEvents = Object.values(events).filter(
        (e) => e.userId === userId
      );
      for (const event of userEvents) {
        await handleDeleteEvent(event.id, false);
      }

      const newPendingEvents = pendingEvents.filter((e) => e.userId !== userId);
      savePendingEvents(newPendingEvents);
    }
  };

  const getUserById = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const getAllEventsForDate = (dateStr) => {
    const published = Object.values(events)
      .filter((e) => e.date === dateStr)
      .map((event) => ({
        ...event,
        user: getUserById(event.userId),
        isPending: false,
      }));

    const pending = pendingEvents
      .filter((e) => e.date === dateStr)
      .map((event) => ({
        ...event,
        user: getUserById(event.userId),
        isPending: true,
      }));

    // Добавляем confirmedEvents
    const confirmed = confirmedEvents
      .filter((e) => e.date === dateStr)
      .map((event) => ({
        ...event,
        user: getUserById(event.userId),
        isPending: true, // Они тоже ожидающие, но подтвержденные
      }));

    // Убираем фильтрацию по showOnlyMyShifts, так как это для сотрудников
    let allEvents = [...published, ...pending, ...confirmed].filter(
      (event) => event.user
    );

    return allEvents;
  };
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateStatsMonth = (direction) => {
    setSelectedStatsMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  // Добавьте эту функцию рядом с другими handle функциями
  const handleDeleteConfirmedEvent = async (eventId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę potwierdzoną zmianę?"))
      return;

    try {
      // Удаляем из confirmedEvents
      const newConfirmedEvents = confirmedEvents.filter(
        (e) => e.id !== eventId
      );
      await saveConfirmedEvents(newConfirmedEvents);

      // Показываем уведомление
      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Usunięto zmianę`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("❌ Błąd podczas usuwania");
    }
  };
  // Добавьте эту функцию в компонент AdminApp, рядом с другими handle функциями
  const handleRevertToAvailability = async (event) => {
    if (
      !window.confirm(
        "Czy na pewno chcesz przywrócić tę zmianę do statusu dostępności?"
      )
    )
      return;

    try {
      // Создаем событие доступности
      const availabilityEvent = {
        ...event,
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: "Dostępność",
        isPending: true,
        revertedAt: new Date().toISOString(),
        revertedBy: user?.email,
        originalEventId: event.id,
      };

      // Удаляем из всех возможных источников
      let updatedConfirmedEvents = confirmedEvents;
      let updatedPendingEvents = pendingEvents;
      let updatedEvents = { ...events };

      // Если событие было в confirmedEvents
      if (confirmedEvents.some((e) => e.id === event.id)) {
        updatedConfirmedEvents = confirmedEvents.filter(
          (e) => e.id !== event.id
        );
      }

      // Если событие было в pendingEvents
      if (pendingEvents.some((e) => e.id === event.id)) {
        updatedPendingEvents = pendingEvents.filter((e) => e.id !== event.id);
      }

      // Если событие было опубликовано (в events)
      if (events[event.id]) {
        const { [event.id]: removed, ...rest } = events;
        updatedEvents = rest;

        // Если есть googleEventId, удаляем из Google Calendar
        if (isAuthorized && event.googleEventId) {
          await deleteGoogleCalendarEvent(event.googleEventId).catch(
            console.error
          );
        }
      }

      // Добавляем в pendingEvents
      updatedPendingEvents = [...updatedPendingEvents, availabilityEvent];

      // Сохраняем все списки
      await saveConfirmedEvents(updatedConfirmedEvents);
      await savePendingEvents(updatedPendingEvents);
      setEvents(updatedEvents);

      // Показываем уведомление
      const toast = document.createElement("div");
      toast.className = "copy-toast success";
      toast.textContent = `✅ Przywrócono do dostępności`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Закрываем модалку
      setShowModal(false);
    } catch (error) {
      console.error("Ошибка przywracania:", error);
      alert("❌ Błąd podczas przywracania");
    }
  };
  const goToCurrentMonth = () => {
    setSelectedStatsMonth(new Date());
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateToYMD(date);
      const dayEvents = getAllEventsForDate(dateStr);
      const hasEvent = dayEvents.length > 0;
      const isToday = formatDateToYMD(new Date()) === dateStr;
      const hasPending = dayEvents.some((e) => e.isPending);

      // Проверяем, доступен ли этот день для сотрудников
      const isAvailableForEmployees = isDayAvailableForEmployees(date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasEvent ? "has-event" : ""} ${
            isToday ? "today" : ""
          } ${selectedDate === dateStr ? "selected" : ""} ${
            isCopyMode ? "copy-mode" : ""
          } ${isAvailableForEmployees ? "available-for-employees" : ""}`}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <div className="day-number">{day}</div>

          {isAvailableForEmployees && !hasEvent && (
            <div className="availability-indicator-small">
              <span>📋</span>
            </div>
          )}

          {hasEvent && (
            <div className="shift-square">
              <div className="shift-events-list">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`shift-item ${
                      event.isPending ? "pending" : ""
                    } ${
                      event.title === "Dostępność" ? "availability-item" : ""
                    } ${isCopyMode ? "copyable" : ""}`}
                    style={{
                      backgroundColor: event.user?.color || "#4A90E2",
                      opacity: event.isPending ? 0.55 : 1,
                      borderLeft: event.isPending
                        ? "3px solid rgba(0,0,0,0.2)"
                        : "none",
                      cursor: isCopyMode ? "copy" : "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (e.ctrlKey || e.shiftKey) {
                        handleCopyEvent(event, event.isPending, dateStr);
                      } else if (isCopyMode) {
                        handleCopyEvent(event, event.isPending, dateStr);
                      } else {
                        if (event.title === "Dostępność" && event.isPending) {
                          setSelectedEventForConfirm(event);
                          setShowConfirmModal(true);
                        } else {
                          handleShiftClick(e, event, event.isPending);
                        }
                      }
                    }}
                    onMouseEnter={() => {
                      setHoveredEvent({
                        event,
                        isPending: event.isPending,
                        date: dateStr,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredEvent(null);
                    }}
                    title={
                      isCopyMode
                        ? "Нажмите, чтобы скопировать"
                        : `${event.user?.name}: ${event.title} (${event.startTime})`
                    }
                  >
                    <span className="shift-initial">
                      {event.user?.name?.charAt(0) || "?"}
                    </span>
                    <span className="shift-time">{event.startTime}</span>
                    <span className="shift-name">
                      {event.user?.name?.split(" ")[0]}
                    </span>
                    {event.isPending && (
                      <span className="shift-pending-badge">
                        {event.title === "Dostępność" ? "📋" : "⏳"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {dayEvents.length > 3 && (
                <div className="shift-more">+{dayEvents.length - 3} więcej</div>
              )}
            </div>
          )}

          {hasPending && (
            <div className="pending-indicator">
              <span className="pending-dot"></span>
              <span className="pending-count">
                {dayEvents.filter((e) => e.isPending).length}
              </span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const setIsLoading = (value) => {
    setLoading(value);
  };
  // Добавьте эту функцию в AdminApp
  const isDayAvailableForEmployees = (date) => {
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthSettings = availabilitySettings?.[monthKey];

    if (!monthSettings || !monthSettings.enabled) return false;

    const day = date.getDate();
    return day >= monthSettings.startDay && day <= monthSettings.endDay;
  };
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img className="logo-red" src="/img/logo.png" alt="logo" />

          <div className="admin-badge">
            <span className="admin-icon">
              <i className="fa-regular fa-user"></i>
            </span>
            <span className="admin-email">{user.email}</span>
          </div>
          <div className="google-status">
            {isAuthorized ? (
              <span className="status-connected">
                <span className="status-dot" />
                Google Calendar
              </span>
            ) : (
              <button className="btn-google" onClick={loginWithGoogle}>
                Połącz z Google
              </button>
            )}
          </div>
        </div>

        <div className="header-actions">
          {/* НОВАЯ КНОПКА НАСТРОЙКИ ДОСТУПНОСТИ */}
          <button
            className={`btn-icon availability-btn ${
              availabilitySettings?.enabled ? "active" : ""
            }`}
            onClick={() => setShowAvailabilitySettings(true)}
            title="Ustawienia dostępności"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Dostępność</span>
            {availabilitySettings?.enabled && (
              <span className="availability-badge">
                {availabilitySettings.startDay}-{availabilitySettings.endDay}
              </span>
            )}
          </button>

          <button
            className={`btn-icon ${
              pendingEvents.length > 0 ? "has-badge pulse" : ""
            }`}
            onClick={() => setShowRequestsModal(true)}
            disabled={pendingEvents.length === 0}
            title="Zgłoszenia dostępności"
          >
            {pendingEvents.length > 0 && (
              <span className="btn-icon-badge">{pendingEvents.length}</span>
            )}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 4H15C16.1046 4 17 4.89543 17 6V14C17 15.1046 16.1046 16 15 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 9H13M7 12H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Zgłoszenia</span>
          </button>

          <div className="bulk-mode-toggle">
            <span className="toggle-label">Masowa publikacja</span>
            <button
              className={`toggle-switch ${bulkMode ? "active" : ""}`}
              onClick={toggleBulkMode}
            >
              <span className="toggle-handle"></span>
            </button>
          </div>

          <button
            className={`btn-icon ${
              confirmedEvents.length > 0 ? "has-badge" : "" // Изменено с pendingEvents на confirmedEvents
            }`}
            onClick={() => setShowBulkModal(true)}
            disabled={confirmedEvents.length === 0} // Изменено с pendingEvents на confirmedEvents
          >
            {confirmedEvents.length > 0 && ( // Изменено с pendingEvents на confirmedEvents
              <span className="btn-icon-badge">{confirmedEvents.length}</span>
            )}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Oczekują</span>
          </button>

          <button
            className="btn-icon"
            onClick={() => setShowMonthlyStatsModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="2"
                y="4"
                width="16"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6 2V6M14 2V6M2 10H18"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="7" cy="13" r="1" fill="currentColor" />
              <circle cx="10" cy="13" r="1" fill="currentColor" />
              <circle cx="13" cy="13" r="1" fill="currentColor" />
            </svg>
            <span className="statmies">Statystyki miesięczne</span>
          </button>

          <button className="btn-icon" onClick={() => setShowStatsModal(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Statystyki</span>
          </button>

          <button className="btn-icon" onClick={() => setShowUserModal(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M2 18C2 15.7909 3.79086 14 6 14H14C16.2091 14 18 15.7909 18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Pracownicy ({users.length})</span>
          </button>

          <LogoutButton onLogout={() => setUser(null)} />
        </div>
      </header>

      {isCopyMode && copiedEvent && (
        <div className="copy-indicator">
          <span>📋 Режим копирования</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>
              {copiedEvent.title} ({copiedEvent.startTime})
            </span>
            <button onClick={cancelCopyMode}>✕</button>
          </div>
        </div>
      )}

      <div
        className={`mode-indicator ${bulkMode ? "bulk-mode" : "normal-mode"}`}
      >
        <div className="mode-icon">
          {bulkMode ? (
            <i className="fa-solid fa-globe"></i>
          ) : (
            <i className="fa-brands fa-slack"></i>
          )}
        </div>

        <div className="mode-text">
          <strong>
            {bulkMode ? "Tryb masowej publikacji" : "Tryb zwykły"}
          </strong>
          <span>
            {bulkMode
              ? "Zmiany są dodawane do listy oczekujących"
              : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
          </span>
        </div>
      </div>

      <div className="month-nav">
        <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 16L6 10L12 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h2 className="month-title">
          {currentDate.toLocaleDateString("pl-PL", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M8 16L14 10L8 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="calendar">
        <div className="calendar-weekdays">
          {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{renderCalendar()}</div>
      </div>

      <PendingRequestsModal
        show={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        pendingEvents={pendingEvents}
        users={users}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      <AvailabilitySettings
        show={showAvailabilitySettings}
        onClose={() => setShowAvailabilitySettings(false)}
        settings={availabilitySettings}
        onSave={saveAvailabilitySettings}
        user={user}
        db={db}
      />

      <EventsListModal
        show={showEventsListModal}
        onClose={() => {
          setShowEventsListModal(false);
        }}
        events={selectedDateEvents}
        onEditEvent={handleEditEvent}
        onConfirmClick={(event) => {
          setSelectedEventForConfirm(event);
          setShowConfirmModal(true);
          setShowEventsListModal(false);
        }}
        users={users}
      />
      {/* Модалка подтверждения доступности */}
      <ConfirmAvailabilityModal
        show={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedEventForConfirm(null);
        }}
        event={selectedEventForConfirm}
        user={
          selectedEventForConfirm
            ? users.find((u) => u.id === selectedEventForConfirm.userId)
            : null
        }
        onConfirm={handleConfirmAvailability}
        onDelete={handleDeletePendingEvent} // Добавьте эту строку
      />

      {/* Остальные модалки (статистика, массовая публикация, пользователи и т.д.) */}
      {showMonthlyStatsModal && (
        <div className="modal-overlay">
          <div className="modal stats-modal monthly-stats-modal">
            <div className="modal-header">
              <div className="modal-title-with-nav">
                <button
                  className="month-nav-btn-small"
                  onClick={() => navigateStatsMonth(-1)}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12 16L6 10L12 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <h3 className="modal-title">
                  {selectedStatsMonth.toLocaleDateString("pl-PL", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <button
                  className="month-nav-btn-small"
                  onClick={() => navigateStatsMonth(1)}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M8 16L14 10L8 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="modal-header-actions">
                <button
                  className="btn-icon-small"
                  onClick={goToCurrentMonth}
                  title="Bieżący miesiąc"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                  </svg>
                </button>

                <button
                  className="modal-close"
                  onClick={() => setShowMonthlyStatsModal(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="stats-content">
              <div className="monthly-overview">
                <div className="statmonthly">
                  <div className="stat-value">
                    {Object.values(monthlyStats).reduce(
                      (acc, stat) => acc + stat.totalShifts,
                      0
                    )}
                  </div>
                  <div className="stat-label">Opublikowane</div>
                </div>
                <div className="statmonthly">
                  <div className="stat-value">
                    {Object.values(monthlyStats).reduce(
                      (acc, stat) => acc + stat.pendingShifts,
                      0
                    )}
                  </div>
                  <div className="stat-label">Oczekujące</div>
                </div>
                <div className="statmonthly">
                  <div className="stat-value">
                    {Object.values(monthlyStats)
                      .reduce((acc, stat) => acc + stat.totalHours, 0)
                      .toFixed(1)}
                  </div>
                  <div className="stat-label">Godzin</div>
                </div>
              </div>

              <div className="month-info">
                <span className="month-badge">
                  {selectedStatsMonth.toLocaleDateString("pl-PL", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {selectedStatsMonth.getMonth() === new Date().getMonth() &&
                  selectedStatsMonth.getFullYear() ===
                    new Date().getFullYear() && (
                    <span className="current-month-badge">Bieżący miesiąc</span>
                  )}
              </div>

              {users.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p>Brak danych do statystyk</p>
                  <span>Dodaj pracowników i zmiany</span>
                </div>
              ) : (
                <div className="monthly-stats-list">
                  {Object.values(monthlyStats).map((userStat) => (
                    <div
                      key={userStat.user.id}
                      className="monthly-stat-item"
                      style={{ "--user-color": userStat.user.color }}
                    >
                      <div className="monthly-stat-header">
                        <div className="user-info">
                          <div
                            className="user-avatar-small"
                            style={{ backgroundColor: userStat.user.color }}
                          >
                            {userStat.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="user-name">
                              {userStat.user.name}
                            </div>
                            <div className="user-email">
                              {userStat.user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="monthly-stats-grid">
                        <div className="monthly-stat-card">
                          <div className="stat-value">
                            {userStat.totalShifts}
                          </div>
                          <div className="stat-label">Opublikowane</div>
                        </div>

                        <div className="monthly-stat-card pending">
                          <div className="stat-value">
                            {userStat.pendingShifts}
                          </div>
                          <div className="stat-label">Oczekujące</div>
                        </div>

                        <div className="monthly-stat-card">
                          <div className="stat-value">
                            {userStat.totalHours}
                          </div>
                          <div className="stat-label">Godzin</div>
                        </div>

                        <div className="monthly-stat-card">
                          <div className="stat-value">
                            {userStat.averageHoursPerShift}
                          </div>
                          <div className="stat-label">Średnio</div>
                        </div>
                      </div>

                      <div className="monthly-details">
                        <div className="detail-row">
                          <span className="spandetail">Łącznie godzin:</span>
                          <strong>
                            {userStat.totalHours + userStat.pendingHours} h
                          </strong>
                        </div>
                        <div className="detail-row">
                          <span className="spandetail">W tym oczekujące:</span>
                          <strong>{userStat.pendingHours} h</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowMonthlyStatsModal(false)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal bulk-modal">
            <div className="modal-header">
              <h3 className="modal-title">Lista oczekujących (potwierdzone)</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkForm({ selectedEvents: [], sendEmail: true });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="pending-events-list">
              {confirmedEvents.map((event) => {
                const user = users.find((u) => u.id === event.userId);
                if (!user) return null;

                const isSelected = bulkForm.selectedEvents.includes(event.id);

                return (
                  <div
                    key={event.id}
                    className={`pending-event ${isSelected ? "selected" : ""}`}
                    style={{ "--user-color": user.color }}
                  >
                    <div
                      className="pending-event-check"
                      onClick={() => {
                        setBulkForm((prev) => ({
                          ...prev,
                          selectedEvents: isSelected
                            ? prev.selectedEvents.filter(
                                (id) => id !== event.id
                              )
                            : [...prev.selectedEvents, event.id],
                        }));
                      }}
                    >
                      <div
                        className={`checkbox ${isSelected ? "checked" : ""}`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </div>
                    <div
                      className="pending-event-color"
                      style={{ backgroundColor: user.color }}
                    />
                    <div className="pending-event-info">
                      <div className="pending-event-name">{user.name}</div>
                      <div className="pending-event-title">{event.title}</div>
                      <div className="pending-event-datetime">
                        {event.date} · {event.startTime} — {event.endTime}
                      </div>
                    </div>

                    {/* ДОБАВЬТЕ ЭТУ КНОПКУ УДАЛЕНИЯ */}
                    <button
                      className="pending-event-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConfirmedEvent(event.id);
                      }}
                      title="Usuń"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M12 6V14C12 14.5523 11.5523 15 11 15H5C4.44772 15 4 14.5523 4 14V6"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="modal-content">
              {confirmedEvents.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p>Brak potwierdzonych zmian do publikacji</p>
                  <span>Potwierdź dostępności w kalendarzu</span>
                </div>
              ) : (
                <>
                  <div className="bulk-stats">
                    <div className="stat-badge">
                      Łącznie potwierdzone:{" "}
                      <strong>{confirmedEvents.length}</strong>
                    </div>
                    <div className="stat-badge">
                      Wybrane: <strong>{bulkForm.selectedEvents.length}</strong>
                    </div>
                  </div>

                  <div className="bulk-actionsdwa">
                    <button
                      className="btn-smalldwa"
                      onClick={() =>
                        setBulkForm({
                          ...bulkForm,
                          selectedEvents: confirmedEvents.map((e) => e.id),
                        })
                      }
                    >
                      Zaznacz wszystko
                    </button>
                    <button
                      className="btn-smalldwa"
                      onClick={() =>
                        setBulkForm({ ...bulkForm, selectedEvents: [] })
                      }
                    >
                      Odznacz wszystko
                    </button>
                  </div>

                  <div className="pending-events-list">
                    {confirmedEvents.map((event) => {
                      const user = users.find((u) => u.id === event.userId);
                      if (!user) return null;

                      const isSelected = bulkForm.selectedEvents.includes(
                        event.id
                      );

                      return (
                        <div
                          key={event.id}
                          className={`pending-event ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => {
                            setBulkForm((prev) => ({
                              ...prev,
                              selectedEvents: isSelected
                                ? prev.selectedEvents.filter(
                                    (id) => id !== event.id
                                  )
                                : [...prev.selectedEvents, event.id],
                            }));
                          }}
                          style={{ "--user-color": user.color }}
                        >
                          <div className="pending-event-check">
                            <div
                              className={`checkbox ${
                                isSelected ? "checked" : ""
                              }`}
                            >
                              {isSelected && "✓"}
                            </div>
                          </div>
                          <div
                            className="pending-event-color"
                            style={{ backgroundColor: user.color }}
                          />
                          <div className="pending-event-info">
                            <div className="pending-event-name">
                              {user.name}
                            </div>
                            <div className="pending-event-title">
                              {event.title}
                            </div>
                            <div className="pending-event-datetime">
                              {event.date} · {event.startTime} — {event.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isAuthorized && bulkForm.selectedEvents.length > 0 && (
                    <div className="bulk-settings">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bulkForm.sendEmail}
                          onChange={(e) =>
                            setBulkForm({
                              ...bulkForm,
                              sendEmail: e.target.checked,
                            })
                          }
                        />
                        <span className="monstrclas">
                          Wyślij zaproszenia na e-mail
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkForm({ selectedEvents: [], sendEmail: true });
                }}
              >
                Zamknij
              </button>
              {confirmedEvents.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={publishBulkEvents}
                  disabled={
                    bulkForm.selectedEvents.length === 0 ||
                    bulkPublishing ||
                    !isAuthorized
                  }
                >
                  {bulkPublishing ? (
                    <>
                      <span className="spinner-small" />
                      Publikowanie...
                    </>
                  ) : (
                    `Opublikuj (${bulkForm.selectedEvents.length})`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal shift-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {eventForm.id
                  ? eventForm.isPending
                    ? "Edycja (oczekuje na publikację)"
                    : "Edycja zmiany"
                  : "Nowa zmiana"}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEventForm({
                    id: null,
                    title: "Recepcja",
                    date: formatDateToYMD(new Date()),
                    startTime: "13:00",
                    endTime: "20:00",
                    userIds: [],
                    sendEmail: true,
                    isPending: false,
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="form-section">
                <label className="form-label">Nazwa zmiany</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  placeholder="Recepcja, Serwis, Dostępność"
                />
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">Czas</label>
                  <div className="time-inputs">
                    <input
                      type="time"
                      className="form-input time"
                      value={eventForm.startTime}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                    <span className="time-separator">—</span>
                    <input
                      type="time"
                      className="form-input time"
                      value={eventForm.endTime}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">
                  {eventForm.id
                    ? "Pracownik"
                    : "Pracownicy (można wybrać kilku)"}
                </label>
                {users.length === 0 ? (
                  <div className="empty-users">
                    <p>Brak dodanych pracowników</p>
                    <button
                      className="btn btn-small"
                      onClick={() => {
                        setShowModal(false);
                        setShowUserModal(true);
                      }}
                    >
                      Dodaj pracownika
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="users-grid">
                      {users.map((user) => {
                        const isSelected = eventForm.userIds.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            className={`user-card ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={() => toggleUserSelection(user.id)}
                            style={{ "--user-color": user.color }}
                          >
                            <div
                              className="user-avatar"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.name.charAt(0)}
                            </div>
                            <span className="user-name">{user.name}</span>
                            {isSelected && (
                              <span className="user-check">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {eventForm.userIds.length > 0 && (
                      <div className="selected-users">
                        <span className="selected-count">
                          {eventForm.id ? "Pracownik:" : "Wybrani:"}{" "}
                          {eventForm.userIds.length}
                        </span>
                        <div className="selected-tags">
                          {eventForm.userIds.map((userId) => {
                            const user = users.find((u) => u.id === userId);
                            return user ? (
                              <span
                                key={userId}
                                className="selected-tag"
                                style={{
                                  backgroundColor: `${user.color}20`,
                                  borderColor: user.color,
                                }}
                              >
                                <span
                                  style={{ backgroundColor: user.color }}
                                  className="tag-dot"
                                ></span>
                                {user.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!eventForm.id && (
                <div className={`mode-badge ${bulkMode ? "bulk" : "direct"}`}>
                  <div className="mode-icon">
                    {bulkMode ? (
                      <i className="fa-solid fa-globe"></i>
                    ) : (
                      <i className="fa-brands fa-slack"></i>
                    )}
                  </div>
                  <span className="mode-description">
                    {bulkMode
                      ? "Zmiany są dodawane do listy oczekujących"
                      : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
                  </span>
                </div>
              )}

              {eventForm.isPending && (
                <div className="mode-badge pending">
                  <span className="badge-icon">
                    <i className="fa-regular fa-hourglass"></i>
                  </span>
                  <span>Ta zmiana oczekuje na publikację</span>
                </div>
              )}

              {isAuthorized &&
                eventForm.userIds.length > 0 &&
                !eventForm.isPending && (
                  <div className="form-section google-settings">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eventForm.sendEmail}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            sendEmail: e.target.checked,
                          })
                        }
                      />
                      <span>Wyślij zaproszenia do Kalendarza Google</span>
                    </label>
                  </div>
                )}
            </div>

            <div className="modal-footer">
              {eventForm.id && (
                <>
                  {/* Кнопка Przywróć dostępność - показываем для всех типов событий, кроме Dostępność */}
                  {eventForm.title !== "Dostępność" && (
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        // Находим оригинальное событие
                        let originalEvent = null;

                        // Сначала ищем в confirmedEvents
                        originalEvent = confirmedEvents.find(
                          (e) => e.id === eventForm.id
                        );

                        // Если не нашли, ищем в pendingEvents
                        if (!originalEvent) {
                          originalEvent = pendingEvents.find(
                            (e) => e.id === eventForm.id
                          );
                        }

                        // Если все еще не нашли, ищем в events (опубликованные)
                        if (!originalEvent) {
                          const eventFromEvents = events[eventForm.id];
                          if (eventFromEvents) {
                            originalEvent = {
                              ...eventFromEvents,
                              user: getUserById(eventFromEvents.userId),
                            };
                          }
                        }

                        if (originalEvent) {
                          handleRevertToAvailability(originalEvent);
                        } else {
                          alert("Nie można znaleźć oryginalnego wydarzenia");
                        }
                      }}
                      title="Przywróć do statusu dostępności"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{ marginRight: "4px" }}
                      >
                        <path
                          d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16C7.5 16 5.5 14.5 4.5 12.5M4 10L7 7M4 10L7 13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Przywróć dostępność
                    </button>
                  )}

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleDeleteEvent(eventForm.id, eventForm.isPending)
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ marginRight: "4px" }}
                    >
                      <path
                        d="M4 6H16M14 6V14C14 15.1046 13.1046 16 12 16H8C6.89543 16 6 15.1046 6 14V6M8 4V2C8 1.44772 8.44772 1 9 1H11C11.5523 1 12 1.44772 12 2V4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Usuń
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEventForm({
                    id: null,
                    title: "Recepcja",
                    date: formatDateToYMD(new Date()),
                    startTime: "13:00",
                    endTime: "20:00",
                    userIds: [],
                    sendEmail: true,
                    isPending: false,
                  });
                }}
              >
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                onClick={eventForm.id ? handleUpdateEvent : handleCreateEvent}
                disabled={
                  eventForm.userIds.length === 0 || !eventForm.title.trim()
                }
              >
                {eventForm.id ? "Zapisz" : "Utwórz zmianę"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal stats-modal">
            <div className="modal-header">
              <h3 className="modal-title">Statystyki</h3>
              <button
                className="modal-close"
                onClick={() => setShowStatsModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="stats-content">
              {users.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p>Brak danych do statystyk</p>
                  <span>Dodaj pracowników i zmiany</span>
                </div>
              ) : (
                <>
                  <div className="stats-overview">
                    <div className="stat-card">
                      <div className="stat-value">{users.length}</div>
                      <div className="stat-label">Pracowników</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {Object.keys(events).length}
                      </div>
                      <div className="stat-label">Opublikowano</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{pendingEvents.length}</div>
                      <div className="stat-label">Oczekujące</div>
                    </div>
                  </div>

                  <div className="stats-employees">
                    {Object.values(stats).map((userStat) => (
                      <div
                        key={userStat.user.id}
                        className="employee-stat"
                        style={{ "--user-color": userStat.user.color }}
                      >
                        <div className="employee-header">
                          <div className="employee-info">
                            <div
                              className="employee-avatar"
                              style={{ backgroundColor: userStat.user.color }}
                            >
                              {userStat.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="employee-name">
                                {userStat.user.name}
                              </div>
                              <div className="employee-email">
                                {userStat.user.email}
                              </div>
                            </div>
                          </div>
                          <div className="employee-total">
                            <div className="total-shifts">
                              {userStat.totalShifts} zmian
                            </div>
                            <div className="total-hours">
                              {userStat.totalHours.toFixed(1)} h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal users-modal">
            <div className="modal-header">
              <h3 className="modal-title">Pracownicy</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="users-content">
              <div className="add-user-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Imię i nazwisko"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <select
                  className="form-select"
                  value={newUser.color}
                  onChange={(e) =>
                    setNewUser({ ...newUser, color: e.target.value })
                  }
                >
                  {GOOGLE_COLORS.map((color) => (
                    <option key={color.hex} value={color.hex}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div
                  className="color-preview"
                  style={{ backgroundColor: newUser.color }}
                />
                <button
                  className="btn btn-primary add-user-btn"
                  onClick={handleAddUser}
                  disabled={!newUser.name.trim() || !newUser.email.trim()}
                >
                  Dodaj
                </button>
              </div>

              <div className="users-list">
                {users.length === 0 ? (
                  <div className="empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M12 4V20M4 12H20" strokeWidth="1.5" />
                    </svg>
                    <p className="ptitmonst">Brak pracowników</p>
                    <span className="ptitmonst">
                      Dodaj pierwszego pracownika
                    </span>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="user-list-item"
                      style={{ "--user-color": user.color }}
                    >
                      <div
                        className="user-avatar-large"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-details">
                        <div className="user-name-large">{user.name}</div>
                        <div className="user-email-small">{user.email}</div>
                        <div className="user-color-name">
                          {GOOGLE_COLORS.find((c) => c.hex === user.color)
                            ?.name || "Цвет"}
                        </div>
                      </div>
                      <button
                        className="btn-icon-small"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M12 6V14C12 14.5523 11.5523 15 11 15H5C4.44772 15 4 14.5523 4 14V6"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= ГЛАВНЫЙ КОМПОНЕНТ С МАРШРУТИЗАЦИЕЙ =============
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminApp />} />
        <Route path="/employee" element={<EmployeeView />} />
      </Routes>
    </Router>
  );
}

// _______________________________________________________________
// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import { initializeApp } from "firebase/app";
// import {
//   getDatabase,
//   ref,
//   set,
//   onValue,
//   remove,
//   update,
//   get,
// } from "firebase/database";
// import EmployeeView from "./EmployeeView.jsx";
// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
// } from "firebase/auth";
// import "./App.css";

// // Firebase конфигурация
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };
// // Добавьте эти состояния в AdminApp

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
// const auth = getAuth(app);

// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// // Цвета Google Calendar
// const GOOGLE_COLORS = [
//   { id: 1, name: "Lavender", hex: "#a4bdfc" },
//   { id: 2, name: "Sage", hex: "#7ae7bf" },
//   { id: 3, name: "Grape", hex: "#dbadff" },
//   { id: 4, name: "Flamingo", hex: "#ff887c" },
//   { id: 5, name: "Banana", hex: "#fbd75b" },
//   { id: 6, name: "Tangerine", hex: "#ffb878" },
//   { id: 7, name: "Peacock", hex: "#46d6db" },
//   { id: 8, name: "Graphite", hex: "#e1e1e1" },
//   { id: 9, name: "Blueberry", hex: "#5484ed" },
//   { id: 10, name: "Basil", hex: "#51b749" },
//   { id: 11, name: "Tomato", hex: "#dc2127" },
// ];

// const USER_COLORS = GOOGLE_COLORS.map((c) => c.hex);
// const COLOR_MAPPING = {};
// GOOGLE_COLORS.forEach((color) => {
//   COLOR_MAPPING[color.hex] = color.id;
// });

// const formatDateToYMD = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// // ============= КОМПОНЕНТ ВХОДА =============
// const LoginScreen = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       if (email !== "b.lewandowski@jetzone24.com") {
//         throw new Error("Доступ разрешён только администратору");
//       }

//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       onLogin(userCredential.user);
//     } catch (error) {
//       console.error("Ошибка входа:", error);
//       setError(error.message || "Ошибка входа. Проверьте данные");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <div className="login-header">
//           <div className="login-icon">JetZone24</div>
//           <h1 className="login-title">Kalendarz zmian</h1>
//           <p className="login-subtitle">Logowanie do panelu administratora</p>
//         </div>

//         <form onSubmit={handleSubmit} className="login-form">
//           <div className="login-field">
//             <label className="login-label">Email</label>
//             <div className="login-input-wrapper">
//               <span className="login-input-icon">
//                 <i className="fa-regular fa-envelope"></i>
//               </span>
//               <input
//                 type="email"
//                 className="login-input"
//                 placeholder="admin@jetzone24.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="login-field">
//             <label className="login-label">Hasło</label>
//             <div className="login-input-wrapper">
//               <span className="login-input-icon">
//                 <i className="fa-solid fa-shield-halved"></i>{" "}
//               </span>
//               <input
//                 type="password"
//                 className="login-input"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="login-error">
//               <span className="login-error-icon">⚠️</span>
//               {error}
//             </div>
//           )}

//           <button type="submit" className="login-button" disabled={loading}>
//             {loading ? (
//               <>
//                 <span className="login-spinner" />
//                 Logowanie...
//               </>
//             ) : (
//               "Zaloguj się"
//             )}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>Tylko dla administratorów</p>
//           <div className="employee-link">
//             <Link to="/employee">➔ Panel pracownika</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============= НОВЫЙ КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// // ============= НОВЫЙ КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ С ДНЯМИ И ИСТОРИЕЙ =============
// // ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// // ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// // ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// // ============= КОМПОНЕНТ НАСТРОЙКИ ДОСТУПНОСТИ =============
// const AvailabilitySettings = ({
//   show,
//   onClose,
//   settings, // это currentMonthSettings из родителя
//   onSave,
//   user,
//   db,
// }) => {
//   const [enabled, setEnabled] = useState(false);
//   const [startDay, setStartDay] = useState(1);
//   const [endDay, setEndDay] = useState(31);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [history, setHistory] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [monthSettings, setMonthSettings] = useState(null);

//   // Загружаем настройки для выбранного месяца при открытии или смене месяца
//   useEffect(() => {
//     if (show) {
//       loadMonthSettings();
//     }
//   }, [show, selectedMonth, selectedYear]);

//   const loadMonthSettings = async () => {
//     setLoading(true);
//     try {
//       const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
//         2,
//         "0"
//       )}`;
//       console.log("Загрузка настроек для месяца:", monthKey);

//       // Загружаем настройки для конкретного месяца
//       const settingsRef = ref(db, `settings/availability/${monthKey}`);
//       const snapshot = await get(settingsRef);

//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         console.log("Найдены настройки:", data);
//         setMonthSettings(data);
//         setEnabled(data.enabled || false);
//         setStartDay(data.startDay || 1);
//         setEndDay(data.endDay || 31);
//       } else {
//         console.log("Нет настроек для этого месяца");
//         setMonthSettings(null);
//         setEnabled(false);
//         setStartDay(1);
//         setEndDay(31);
//       }

//       // Загружаем историю
//       await loadHistory();
//     } catch (error) {
//       console.error("Ошибка загрузки настроек месяца:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadHistory = async () => {
//     try {
//       const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
//         2,
//         "0"
//       )}`;
//       const historyRef = ref(db, `settings/availability_history/${monthKey}`);
//       const snapshot = await get(historyRef);

//       if (snapshot.exists()) {
//         const historyData = snapshot.val();
//         const historyArray = Object.entries(historyData)
//           .map(([timestamp, data]) => ({
//             ...data,
//             timestamp: timestamp,
//             id: timestamp,
//           }))
//           .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

//         setHistory(historyArray);
//       } else {
//         setHistory([]);
//       }
//     } catch (error) {
//       console.error("Ошибка загрузки истории:", error);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
//         2,
//         "0"
//       )}`;

//       const settingsData = {
//         enabled,
//         startDay: parseInt(startDay),
//         endDay: parseInt(endDay),
//         month: selectedMonth,
//         year: selectedYear,
//         monthKey,
//         updatedAt: new Date().toISOString(),
//         updatedBy: user?.email,
//       };

//       // Сохраняем в Firebase
//       const settingsRef = ref(db, `settings/availability/${monthKey}`);
//       await set(settingsRef, settingsData);

//       // Сохраняем в историю ТОЛЬКО если изменилось состояние enabled
//       const lastHistoryItem = history[0];
//       if (!lastHistoryItem || lastHistoryItem.enabled !== enabled) {
//         const timestamp = Date.now();
//         const historyRef = ref(
//           db,
//           `settings/availability_history/${monthKey}/${timestamp}`
//         );
//         await set(historyRef, {
//           ...settingsData,
//           timestamp,
//           action: enabled ? "🔓 Odblokowano" : "🔒 Zablokowano",
//         });
//       }

//       // Обновляем родительский компонент
//       await onSave(settingsData);

//       // Обновляем историю
//       await loadHistory();

//       const toast = document.createElement("div");
//       toast.className = "copy-toast success";
//       toast.textContent = `✅ Zapisano dla ${months[selectedMonth]} ${selectedYear}`;
//       document.body.appendChild(toast);
//       setTimeout(() => toast.remove(), 3000);
//     } catch (error) {
//       console.error("Ошибка сохранения:", error);
//       alert("❌ Błąd podczas zapisywania");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteAll = async () => {
//     if (
//       !window.confirm(
//         `Czy na pewno chcesz usunąć WSZYSTKIE ustawienia dla ${months[selectedMonth]} ${selectedYear}?`
//       )
//     )
//       return;

//     setSaving(true);
//     try {
//       const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
//         2,
//         "0"
//       )}`;

//       // Удаляем основные настройки
//       const settingsRef = ref(db, `settings/availability/${monthKey}`);
//       await remove(settingsRef);

//       // Удаляем историю
//       const historyRef = ref(db, `settings/availability_history/${monthKey}`);
//       await remove(historyRef);

//       // Очищаем состояние
//       setEnabled(false);
//       setStartDay(1);
//       setEndDay(31);
//       setMonthSettings(null);
//       setHistory([]);

//       const toast = document.createElement("div");
//       toast.className = "copy-toast success";
//       toast.textContent = `✅ Usunięto wszystkie ustawienia dla ${months[selectedMonth]} ${selectedYear}`;
//       document.body.appendChild(toast);
//       setTimeout(() => toast.remove(), 3000);

//       onClose();
//     } catch (error) {
//       console.error("Ошибка удаления:", error);
//       alert("❌ Błąd podczas usuwania");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleQuickAction = (action) => {
//     if (action === "enable") {
//       setEnabled(true);
//     } else if (action === "disable") {
//       setEnabled(false);
//     }
//   };

//   if (!show) return null;

//   const months = [
//     "Styczeń",
//     "Luty",
//     "Marzec",
//     "Kwiecień",
//     "Maj",
//     "Czerwiec",
//     "Lipiec",
//     "Sierpień",
//     "Wrzesień",
//     "Październik",
//     "Listopad",
//     "Grudzień",
//   ];

//   return (
//     <div className="modal-overlay">
//       <div className="modal availability-modal" style={{ maxWidth: "800px" }}>
//         <div className="modal-header">
//           <h3 className="modal-title">
//             <svg
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               style={{ marginRight: "8px" }}
//             >
//               <rect
//                 x="3"
//                 y="4"
//                 width="18"
//                 height="18"
//                 rx="2"
//                 strokeWidth="1.5"
//               />
//               <path d="M8 2v4M16 2v4M3 10h18" strokeWidth="1.5" />
//             </svg>
//             Zarządzanie dostępnością
//           </h3>
//           <div className="modal-header-actions">
//             <button
//               className={`btn-icon-small ${showHistory ? "active" : ""}`}
//               onClick={() => setShowHistory(!showHistory)}
//               title="Historia blokad"
//             >
//               <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
//                 <path
//                   d="M10 4V10L14 12M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                 />
//               </svg>
//             </button>
//             <button className="modal-close" onClick={onClose}>
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path
//                   d="M15 5L5 15M5 5L15 15"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="modal-content">
//           {/* Селектор месяца и года ВСЕГДА сверху */}
//           <div className="month-selector-panel">
//             <div className="month-year-selector">
//               <select
//                 className="form-select"
//                 value={selectedMonth}
//                 onChange={(e) => {
//                   setSelectedMonth(parseInt(e.target.value));
//                 }}
//               >
//                 {months.map((month, index) => (
//                   <option key={index} value={index}>
//                     {month}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="number"
//                 className="form-input year-input"
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//                 min="2024"
//                 max="2030"
//               />
//             </div>

//             {loading && <div className="loading-indicator">Ładowanie...</div>}
//           </div>

//           {showHistory ? (
//             // История изменений
//             <div className="history-section">
//               <h4>
//                 Historia blokad - {months[selectedMonth]} {selectedYear}
//               </h4>

//               {loading ? (
//                 <div className="loading-spinner-small">
//                   Ładowanie historii...
//                 </div>
//               ) : history.length === 0 ? (
//                 <div className="empty-state small">
//                   <p>
//                     Brak historii blokad dla {months[selectedMonth]}{" "}
//                     {selectedYear}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="history-list">
//                   {history.map((item) => (
//                     <div key={item.timestamp} className="history-item">
//                       <div className="history-item-date">
//                         {new Date(item.updatedAt).toLocaleString("pl-PL", {
//                           day: "2-digit",
//                           month: "2-digit",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                       <div className="history-item-status">
//                         <span
//                           className={`status-badge ${
//                             item.enabled ? "enabled" : "disabled"
//                           }`}
//                         >
//                           {item.enabled ? "🔓 Odblokowano" : "🔒 Zablokowano"}
//                         </span>
//                       </div>
//                       <div className="history-item-range">
//                         {item.startDay} - {item.endDay}
//                       </div>
//                       <div className="history-item-user">
//                         {item.updatedBy?.split("@")[0] || "admin"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <button
//                 className="btn btn-secondary btn-block"
//                 onClick={() => setShowHistory(false)}
//               >
//                 ← Powrót do ustawień
//               </button>
//             </div>
//           ) : (
//             // Основные настройки
//             <div className="availability-controls">
//               {/* Статус месяца */}
//               <div className="month-status">
//                 <div
//                   className={`status-indicator ${
//                     enabled ? "active" : "inactive"
//                   }`}
//                 >
//                   {enabled ? (
//                     <>
//                       {" "}
//                       <i
//                         className="fa-solid fa-check"
//                         style={{ color: "rgb(29, 155, 0)" }}
//                       ></i>{" "}
//                       Odblokowany{" "}
//                     </>
//                   ) : (
//                     <>
//                       <i
//                         className="fa-solid fa-ban"
//                         style={{
//                           color: "rgb(217, 160, 4)",
//                           marginRight: "6px",
//                         }}
//                       ></i>
//                       Zablokowany
//                     </>
//                   )}
//                 </div>
//                 {monthSettings && (
//                   <div className="last-updated">
//                     Ostatnia zmiana:{" "}
//                     {new Date(monthSettings.updatedAt).toLocaleString("pl-PL")}
//                   </div>
//                 )}
//               </div>

//               {/* Диапазон дней */}
//               <div className="form-section">
//                 <label className="form-label">Zakres dni w miesiącu</label>
//                 <div className="date-range-inputs">
//                   <div className="date-input-group">
//                     <span className="date-input-label">Od</span>
//                     <input
//                       type="number"
//                       min="1"
//                       max="31"
//                       className="form-input date-input"
//                       value={startDay}
//                       onChange={(e) => setStartDay(e.target.value)}
//                     />
//                   </div>
//                   <div className="date-input-group">
//                     <span className="date-input-label">Do</span>
//                     <input
//                       type="number"
//                       min="1"
//                       max="31"
//                       className="form-input date-input"
//                       value={endDay}
//                       onChange={(e) => setEndDay(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Быстрые действия */}
//               <div className="quick-actions">
//                 <button
//                   className="btn btn-success"
//                   onClick={() => handleQuickAction("enable")}
//                   disabled={enabled}
//                 >
//                   🔓 Odblokuj
//                 </button>
//                 <button
//                   className="btn btn-warning"
//                   onClick={() => handleQuickAction("disable")}
//                   disabled={!enabled}
//                 >
//                   🔒 Zablokuj
//                 </button>
//                 <button className="btn btn-danger" onClick={handleDeleteAll}>
//                   <i
//                     className="fa-regular fa-trash-can"
//                     style={{ color: "rgb(222, 222, 222)" }}
//                   ></i>{" "}
//                   Usuń wszystko
//                 </button>
//               </div>

//               <p className="input-hint">
//                 {enabled ? (
//                   <>
//                     <i
//                       className="fa-solid fa-check"
//                       style={{ color: "rgb(29, 155, 0)" }}
//                     ></i>{" "}
//                     Pracownicy mogą dodawać dostępność od {startDay} do {endDay}{" "}
//                     {months[selectedMonth]} {selectedYear}
//                   </>
//                 ) : (
//                   `🔒 Dodawanie dostępności jest zablokowane dla ${months[selectedMonth]} ${selectedYear}`
//                 )}
//               </p>
//             </div>
//           )}
//         </div>

//         {!showHistory && (
//           <div className="modal-footer">
//             <button className="btn btn-secondary" onClick={onClose}>
//               Anuluj
//             </button>
//             <button
//               className="btn btn-primary"
//               onClick={handleSave}
//               disabled={saving}
//             >
//               {saving
//                 ? "Zapisywanie..."
//                 : "Zapisz dla " + months[selectedMonth]}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// // ============= КОМПОНЕНТ ВЫХОДА =============
// const LogoutButton = ({ onLogout }) => {
//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       onLogout();
//     } catch (error) {
//       console.error("Ошибка выхода:", error);
//     }
//   };

//   return (
//     <button className="btn-icon logout-btn" onClick={handleLogout}>
//       <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//         <path
//           d="M7 4H5C3.89543 4 3 4.89543 3 6V14C3 15.1046 3.89543 16 5 16H7M13 12L16 10M16 10L13 8M16 10H8"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//         />
//       </svg>
//       <span>Wyloguj się</span>
//     </button>
//   );
// };

// const calculateHoursDiff = (startTime, endTime) => {
//   const [startHour, startMinute] = startTime.split(":").map(Number);
//   const [endHour, endMinute] = endTime.split(":").map(Number);
//   const startTotal = startHour * 60 + startMinute;
//   const endTotal = endHour * 60 + endMinute;
//   let diff = endTotal - startTotal;
//   if (diff < 0) diff += 24 * 60;
//   return diff / 60;
// };

// // ============= КОМПОНЕНТ ДЛЯ ПРИНЯТИЯ/ОТКЛОНЕНИЯ ЗАЯВОК =============
// const PendingRequestsModal = ({
//   show,
//   onClose,
//   pendingEvents,
//   users,
//   onAccept,
//   onReject,
// }) => {
//   if (!show) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal requests-modal">
//         <div className="modal-header">
//           <h3 className="modal-title">Zgłoszenia dostępności od pracowników</h3>
//           <button className="modal-close" onClick={onClose}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M15 5L5 15M5 5L15 15"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </button>
//         </div>

//         <div className="modal-content">
//           {pendingEvents.length === 0 ? (
//             <div className="empty-state">
//               <svg
//                 width="48"
//                 height="48"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//               >
//                 <path
//                   d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                   strokeWidth="1.5"
//                 />
//               </svg>
//               <p>Brak oczekujących zgłoszeń</p>
//               <span>Pracownicy nie dodali jeszcze żadnych dostępności</span>
//             </div>
//           ) : (
//             <div className="requests-list">
//               {pendingEvents.map((event) => {
//                 const user = users.find((u) => u.id === event.userId);
//                 if (!user) return null;

//                 return (
//                   <div
//                     key={event.id}
//                     className="request-card"
//                     style={{ borderLeftColor: user.color }}
//                   >
//                     <div className="request-header">
//                       <div className="request-user">
//                         <div
//                           className="request-user-avatar"
//                           style={{ backgroundColor: user.color }}
//                         >
//                           {user.name.charAt(0)}
//                         </div>
//                         <div className="request-user-info">
//                           <div className="request-user-name">{user.name}</div>
//                           <div className="request-user-email">{user.email}</div>
//                         </div>
//                       </div>
//                       <div className="request-status">
//                         <span className="status-badge pending">Oczekuje</span>
//                       </div>
//                     </div>

//                     <div className="request-details">
//                       <div className="request-detail">
//                         <span className="detail-label">Data:</span>
//                         <span className="detail-value">
//                           {new Date(event.date).toLocaleDateString("pl-PL")}
//                         </span>
//                       </div>
//                       <div className="request-detail">
//                         <span className="detail-label">Godziny:</span>
//                         <span className="detail-value">
//                           {event.startTime} - {event.endTime}
//                         </span>
//                       </div>
//                       <div className="request-detail">
//                         <span className="detail-label">Rodzaj:</span>
//                         <span className="detail-value">{event.title}</span>
//                       </div>
//                     </div>

//                     <div className="request-actions">
//                       <button
//                         className="btn btn-success btn-small"
//                         onClick={() => onAccept(event)}
//                       >
//                         ✅ Akceptuj
//                       </button>
//                       <button
//                         className="btn btn-danger btn-small"
//                         onClick={() => onReject(event.id)}
//                       >
//                         ❌ Odrzuć
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button className="btn btn-secondary" onClick={onClose}>
//             Zamknij
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============= МОДАЛКА ДЛЯ ОТОБРАЖЕНИЯ НЕСКОЛЬКИХ СОБЫТИЙ =============
// const EventsListModal = ({ show, onClose, events, onEditEvent, users }) => {
//   if (!show) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal events-list-modal">
//         <div className="modal-header">
//           <h3 className="modal-title">
//             Wydarzenia dnia{" "}
//             {events[0]?.date
//               ? new Date(events[0].date).toLocaleDateString("pl-PL")
//               : ""}
//           </h3>
//           <button className="modal-close" onClick={onClose}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M15 5L5 15M5 5L15 15"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </button>
//         </div>

//         <div className="modal-content">
//           <div className="events-list">
//             {events.map((event) => {
//               const user = users.find((u) => u.id === event.userId);
//               return (
//                 <div
//                   key={event.id}
//                   className={`event-list-item ${
//                     event.isPending ? "pending" : ""
//                   }`}
//                   onClick={() => {
//                     onEditEvent(event, event.isPending);
//                     onClose();
//                   }}
//                   style={{ borderLeftColor: user?.color }}
//                 >
//                   <div
//                     className="event-item-color"
//                     style={{ backgroundColor: user?.color }}
//                   />
//                   <div className="event-item-info">
//                     <div className="event-item-user">
//                       <span className="event-item-name">
//                         {user?.name || "Nieznany"}
//                       </span>
//                       {event.isPending && (
//                         <span className="event-item-badge">⏳ Oczekuje</span>
//                       )}
//                     </div>
//                     <div className="event-item-details">
//                       <span className="event-item-time">
//                         {event.startTime} - {event.endTime}
//                       </span>
//                       <span className="event-item-title">{event.title}</span>
//                     </div>
//                   </div>
//                   <div className="event-item-arrow">→</div>
//                 </div>
//               );
//             })}
//           </div>

//           <button
//             className="btn btn-primary add-event-btn"
//             onClick={() => {
//               // Будет вызвано из родительского компонента
//               onClose();
//             }}
//           >
//             + Dodaj nową zmianę
//           </button>
//         </div>

//         <div className="modal-footer">
//           <button className="btn btn-secondary" onClick={onClose}>
//             Zamknij
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============= ГЛАВНЫЙ КОМПОНЕНТ АДМИНА =============
// function AdminApp() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [events, setEvents] = useState({});
//   const [pendingEvents, setPendingEvents] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [showStatsModal, setShowStatsModal] = useState(false);
//   const [showMonthlyStatsModal, setShowMonthlyStatsModal] = useState(false);
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [showRequestsModal, setShowRequestsModal] = useState(false);
//   const [showAvailabilitySettings, setShowAvailabilitySettings] =
//     useState(false);
//   const [authWindow, setAuthWindow] = useState(null);
//   const [bulkPublishing, setBulkPublishing] = useState(false);
//   const [bulkMode, setBulkMode] = useState(false);
//   // Добавьте это состояние в AdminApp (в раздел с другими useState)
//   const [currentMonthSettings, setCurrentMonthSettings] = useState({
//     enabled: false,
//     startDay: 1,
//     endDay: 31,
//   });

//   // Состояния для копирования
//   const [copiedEvent, setCopiedEvent] = useState(null);
//   const [isCopyMode, setIsCopyMode] = useState(false);
//   const [copySourceDate, setCopySourceDate] = useState(null);
//   const [isCopying, setIsCopying] = useState(false);

//   // Состояния для месячной статистики
//   const [selectedStatsMonth, setSelectedStatsMonth] = useState(new Date());
//   const [monthlyStats, setMonthlyStats] = useState({});

//   // Состояния для настроек доступности
//   const [availabilitySettings, setAvailabilitySettings] = useState({
//     enabled: false,
//     startDay: 1,
//     endDay: 31,
//     month: new Date().getMonth(),
//     year: new Date().getFullYear(),
//     monthKey: `${new Date().getFullYear()}-${String(
//       new Date().getMonth() + 1
//     ).padStart(2, "0")}`,
//   });

//   // Форма создания/редактирования смены
//   const [eventForm, setEventForm] = useState({
//     id: null,
//     title: "Recepcja",
//     date: formatDateToYMD(new Date()),
//     startTime: "13:00",
//     endTime: "20:00",
//     userIds: [],
//     sendEmail: true,
//     isPending: false,
//   });

//   const [bulkForm, setBulkForm] = useState({
//     selectedEvents: [],
//     sendEmail: true,
//   });

//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     color: USER_COLORS[0],
//   });

//   const [stats, setStats] = useState({});
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [hoveredEvent, setHoveredEvent] = useState(null);
//   const [selectedDateEvents, setSelectedDateEvents] = useState([]);
//   const [showEventsListModal, setShowEventsListModal] = useState(false);

//   // ============= АВТОРИЗАЦИЯ =============
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Инициализация данных после авторизации
//   useEffect(() => {
//     if (user) {
//       loadInitialData();

//       const token = localStorage.getItem("google_token");
//       if (token) {
//         setIsAuthorized(true);
//         verifyToken(token);
//       }

//       window.addEventListener("message", handleAuthMessage);
//       return () => {
//         window.removeEventListener("message", handleAuthMessage);
//         if (authWindow) authWindow.close();
//       };
//     }
//   }, [user]);

//   // Статистика
//   useEffect(() => {
//     if (user) {
//       calculateStatistics();
//     }
//   }, [events, users, user]);

//   // Обновление месячной статистики при изменении выбранного месяца
//   useEffect(() => {
//     if (user) {
//       const stats = calculateMonthlyStatistics(selectedStatsMonth);
//       setMonthlyStats(stats);
//     }
//   }, [selectedStatsMonth, events, pendingEvents, users, user]);

//   useEffect(() => {
//     const hash = window.location.hash;
//     if (hash.includes("access_token=")) {
//       const token = hash.split("access_token=")[1].split("&")[0];
//       localStorage.setItem("google_token", token);
//       setIsAuthorized(true);
//       window.location.hash = "";
//       window.history.replaceState(null, null, window.location.pathname);
//     }
//   }, []);

//   // Горячие клавиши для копирования
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape" && isCopyMode) {
//         cancelCopyMode();
//       }

//       if (e.ctrlKey && e.key === "c" && hoveredEvent) {
//         e.preventDefault();
//         handleCopyEvent(
//           hoveredEvent.event,
//           hoveredEvent.isPending,
//           hoveredEvent.date
//         );
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isCopyMode, hoveredEvent]);

//   const calculateStatistics = () => {
//     const newStats = {};
//     users.forEach((user) => {
//       const userEvents = Object.values(events).filter(
//         (e) => e.userId === user.id
//       );
//       const totalShifts = userEvents.length;
//       let totalHours = 0;
//       userEvents.forEach((event) => {
//         totalHours += calculateHoursDiff(event.startTime, event.endTime);
//       });
//       newStats[user.id] = {
//         user,
//         totalShifts,
//         totalHours: parseFloat(totalHours.toFixed(1)),
//         averageHoursPerShift:
//           totalShifts > 0
//             ? parseFloat((totalHours / totalShifts).toFixed(1))
//             : 0,
//       };
//     });
//     setStats(newStats);
//   };

//   const calculateMonthlyStatistics = (targetDate) => {
//     const year = targetDate.getFullYear();
//     const month = targetDate.getMonth();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
//     const monthEnd = `${year}-${String(month + 1).padStart(
//       2,
//       "0"
//     )}-${daysInMonth}`;

//     const monthlyStats = {};

//     users.forEach((user) => {
//       const userEvents = Object.values(events).filter(
//         (e) =>
//           e.userId === user.id && e.date >= monthStart && e.date <= monthEnd
//       );

//       const userPendingEvents = pendingEvents.filter(
//         (e) =>
//           e.userId === user.id && e.date >= monthStart && e.date <= monthEnd
//       );

//       const totalShifts = userEvents.length;
//       const pendingShifts = userPendingEvents.length;

//       let totalHours = 0;
//       userEvents.forEach((event) => {
//         totalHours += calculateHoursDiff(event.startTime, event.endTime);
//       });

//       let pendingHours = 0;
//       userPendingEvents.forEach((event) => {
//         pendingHours += calculateHoursDiff(event.startTime, event.endTime);
//       });

//       monthlyStats[user.id] = {
//         user,
//         totalShifts,
//         pendingShifts,
//         totalHours: parseFloat(totalHours.toFixed(1)),
//         pendingHours: parseFloat(pendingHours.toFixed(1)),
//         averageHoursPerShift:
//           totalShifts > 0
//             ? parseFloat((totalHours / totalShifts).toFixed(1))
//             : 0,
//       };
//     });

//     return monthlyStats;
//   };

//   const handleAuthMessage = (event) => {
//     if (event.origin !== window.location.origin) return;
//     if (event.data.type === "google_auth_success") {
//       const token = event.data.token;
//       localStorage.setItem("google_token", token);
//       setIsAuthorized(true);
//       if (authWindow) {
//         authWindow.close();
//         setAuthWindow(null);
//       }
//     }
//   };

//   const verifyToken = async (token) => {
//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + token
//       );
//       const data = await response.json();
//       if (data.error) {
//         localStorage.removeItem("google_token");
//         setIsAuthorized(false);
//       }
//     } catch (error) {
//       console.error("Ошибка проверки токена:", error);
//     }
//   };

//   const loadInitialData = async () => {
//     setIsLoading(true);
//     await loadUsersFromFirebase();
//     await loadEventsFromFirebase();
//     await loadPendingEventsFromFirebase();
//     await loadAvailabilitySettings();
//     const savedPending = localStorage.getItem("pendingEvents");
//     if (savedPending) {
//       try {
//         setPendingEvents(JSON.parse(savedPending));
//       } catch (e) {
//         setPendingEvents([]);
//       }
//     }
//     setIsLoading(false);
//   };

//   const loadUsersFromFirebase = () => {
//     const usersRef = ref(db, "users");
//     onValue(usersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const usersMap = new Map();
//         Object.values(data).forEach((user) => {
//           if (user && user.id) {
//             usersMap.set(user.id, user);
//           }
//         });
//         const uniqueUsers = Array.from(usersMap.values());
//         setUsers(uniqueUsers);
//       } else {
//         setUsers([]);
//       }
//     });
//   };

//   const loadPendingEventsFromFirebase = () => {
//     const pendingRef = ref(db, "pendingEvents");
//     onValue(
//       pendingRef,
//       (snapshot) => {
//         const data = snapshot.val();
//         console.log("Загружены ожидающие события из Firebase:", data);
//         if (data) {
//           const pendingArray = Object.values(data);
//           setPendingEvents(pendingArray);
//           localStorage.setItem("pendingEvents", JSON.stringify(pendingArray));
//         } else {
//           setPendingEvents([]);
//           localStorage.removeItem("pendingEvents");
//         }
//       },
//       (error) => {
//         console.error("Ошибка загрузки ожидающих событий:", error);
//       }
//     );
//   };

//   const loadAvailabilitySettings = async () => {
//     const settingsRef = ref(db, "settings/availability");
//     onValue(settingsRef, (snapshot) => {
//       const data = snapshot.val();
//       console.log("Загружены все настройки доступности:", data);

//       if (data) {
//         setAvailabilitySettings(data);

//         // Находим настройки для ТЕКУЩЕГО месяца
//         const currentMonthKey = `${new Date().getFullYear()}-${String(
//           new Date().getMonth() + 1
//         ).padStart(2, "0")}`;

//         const currentSettings = data[currentMonthKey];
//         console.log(
//           "Настройки для текущего месяца:",
//           currentMonthKey,
//           currentSettings
//         );

//         if (currentSettings) {
//           setCurrentMonthSettings(currentSettings);
//         } else {
//           // Если нет настроек, отключаем
//           setCurrentMonthSettings({ enabled: false });
//         }
//       } else {
//         setAvailabilitySettings({});
//         setCurrentMonthSettings({ enabled: false });
//       }
//     });
//   };

//   const loadEventsFromFirebase = () => {
//     const eventsRef = ref(db, "calendarEvents");
//     onValue(eventsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setEvents(data);
//       } else {
//         setEvents({});
//       }
//     });
//   };

//   const savePendingEvents = async (newPendingEvents) => {
//     setPendingEvents(newPendingEvents);
//     localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));

//     try {
//       for (const event of newPendingEvents) {
//         const pendingRef = ref(db, `pendingEvents/${event.id}`);
//         await set(pendingRef, event);
//       }

//       const snapshot = await get(ref(db, "pendingEvents"));
//       const firebaseEvents = snapshot.val() || {};

//       for (const firebaseId of Object.keys(firebaseEvents)) {
//         if (!newPendingEvents.find((e) => e.id === firebaseId)) {
//           const pendingRef = ref(db, `pendingEvents/${firebaseId}`);
//           await remove(pendingRef);
//         }
//       }

//       console.log("Ожидающие события сохранены в Firebase");
//     } catch (error) {
//       console.error("Ошибка сохранения в Firebase:", error);
//     }
//   };
//   const saveAvailabilitySettings = async (settings) => {
//     try {
//       console.log("Сохранение настроек для месяца:", settings.monthKey);

//       // Сохраняем в общий объект настроек
//       const settingsRef = ref(db, `settings/availability/${settings.monthKey}`);
//       await set(settingsRef, {
//         enabled: settings.enabled,
//         startDay: settings.startDay,
//         endDay: settings.endDay,
//         month: settings.month,
//         year: settings.year,
//         monthKey: settings.monthKey,
//         updatedAt: settings.updatedAt,
//         updatedBy: settings.updatedBy,
//       });

//       // Обновляем локальное состояние
//       setAvailabilitySettings((prev) => ({
//         ...prev,
//         [settings.monthKey]: settings,
//       }));

//       // Если это текущий месяц, обновляем currentMonthSettings
//       const currentMonthKey = `${new Date().getFullYear()}-${String(
//         new Date().getMonth() + 1
//       ).padStart(2, "0")}`;

//       if (settings.monthKey === currentMonthKey) {
//         setCurrentMonthSettings(settings);
//       }

//       setShowAvailabilitySettings(false);

//       const toast = document.createElement("div");
//       toast.className = "copy-toast success";
//       toast.textContent = `✅ Ustawienia zapisane`;
//       document.body.appendChild(toast);
//       setTimeout(() => toast.remove(), 3000);

//       return settings;
//     } catch (error) {
//       console.error("Ошибка сохранения настроек:", error);
//       alert("❌ Błąd podczas zapisywania ustawień");
//       throw error;
//     }
//   };

//   const loginWithGoogle = () => {
//     const redirectUri = encodeURIComponent(window.location.origin);
//     const scope = encodeURIComponent(SCOPES);
//     const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
//     const width = 500;
//     const height = 600;
//     const left = (window.screen.width - width) / 2;
//     const top = (window.screen.height - height) / 2;
//     const win = window.open(
//       authUrl,
//       "Google Auth",
//       `width=${width},height=${height},left=${left},top=${top}`
//     );
//     setAuthWindow(win);
//   };

//   const logout = () => {
//     localStorage.removeItem("google_token");
//     setIsAuthorized(false);
//   };

//   const saveEventToFirebase = async (eventData, eventId = null) => {
//     const id = eventId || Date.now().toString();
//     const eventRef = ref(db, `calendarEvents/${id}`);
//     await set(eventRef, { ...eventData, id });
//     return id;
//   };

//   const deleteEventFromFirebase = async (eventId) => {
//     const eventRef = ref(db, `calendarEvents/${eventId}`);
//     await remove(eventRef);
//   };

//   const getGoogleCalendarColor = (userColor) => {
//     return COLOR_MAPPING[userColor] || 1;
//   };

//   const createGoogleCalendarEvent = async (eventData, user) => {
//     const token = localStorage.getItem("google_token");
//     if (!token) return null;

//     const [year, month, day] = eventData.date.split("-").map(Number);
//     const [startHour, startMinute] = eventData.startTime.split(":").map(Number);
//     const [endHour, endMinute] = eventData.endTime.split(":").map(Number);

//     const startDateTime = new Date(
//       year,
//       month - 1,
//       day,
//       startHour,
//       startMinute
//     );
//     const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

//     const event = {
//       summary: `${user.name} — ${eventData.title || "Смена"}`,
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       description: `Сотрудник: ${user.name}\nEmail: ${user.email}\nСмена: ${
//         eventData.title || "Рабочая смена"
//       }`,
//       colorId: getGoogleCalendarColor(user.color).toString(),
//     };

//     if (user?.email && eventData.sendEmail) {
//       event.attendees = [
//         {
//           email: user.email,
//           displayName: user.name,
//           responseStatus: "needsAction",
//         },
//       ];
//     }

//     try {
//       const queryParams = new URLSearchParams();
//       if (eventData.sendEmail && user?.email) {
//         queryParams.append("sendUpdates", "all");
//       }
//       const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`;
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(event),
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem("google_token");
//           setIsAuthorized(false);
//         }
//         return null;
//       }
//       const data = await response.json();
//       return data.id;
//     } catch (error) {
//       console.error("Ошибка создания события в Google Calendar:", error);
//       return null;
//     }
//   };

//   // ============= ФУНКЦИИ ДЛЯ ПРИНЯТИЯ/ОТКЛОНЕНИЯ =============
//   const handleAcceptRequest = async (event) => {
//     const user = users.find((u) => u.id === event.userId);
//     if (!user) return;

//     let googleEventId = null;
//     if (isAuthorized) {
//       googleEventId = await createGoogleCalendarEvent(event, user);
//     }

//     const newEvent = {
//       ...event,
//       googleEventId,
//       createdAt: new Date().toISOString(),
//       isPending: false,
//       acceptedBy: user.email,
//       acceptedAt: new Date().toISOString(),
//     };

//     const savedEventId = await saveEventToFirebase(newEvent);
//     newEvent.id = savedEventId;

//     setEvents((prev) => ({
//       ...prev,
//       [savedEventId]: newEvent,
//     }));

//     const newPendingEvents = pendingEvents.filter((e) => e.id !== event.id);
//     await savePendingEvents(newPendingEvents);

//     alert(
//       `✅ Zaakceptowano dostępność ${user.name} na dzień ${new Date(
//         event.date
//       ).toLocaleDateString("pl-PL")}`
//     );
//   };

//   const handleRejectRequest = async (eventId) => {
//     if (!window.confirm("Czy na pewno chcesz odrzucić to zgłoszenie?")) return;

//     const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
//     await savePendingEvents(newPendingEvents);

//     alert(`❌ Zgłoszenie zostało odrzucone`);
//   };

//   const publishBulkEvents = async () => {
//     if (bulkForm.selectedEvents.length === 0) {
//       alert("Выберите события для публикации");
//       return;
//     }

//     if (!isAuthorized) {
//       alert("Для публикации нужно войти в Google Calendar");
//       return;
//     }

//     setBulkPublishing(true);

//     const publishedEvents = [];
//     let successCount = 0;
//     let failCount = 0;

//     for (const eventId of bulkForm.selectedEvents) {
//       const event = pendingEvents.find((e) => e.id === eventId);
//       if (!event) continue;

//       const user = users.find((u) => u.id === event.userId);
//       if (!user) continue;

//       const googleEventId = await createGoogleCalendarEvent(event, user);

//       if (googleEventId) {
//         const savedEventId = await saveEventToFirebase({
//           ...event,
//           googleEventId,
//           createdAt: new Date().toISOString(),
//           isPending: false,
//           acceptedBy: user.email,
//           acceptedAt: new Date().toISOString(),
//         });
//         publishedEvents.push({ ...event, googleEventId, id: savedEventId });
//         successCount++;
//       } else {
//         failCount++;
//       }
//     }

//     if (publishedEvents.length > 0) {
//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         publishedEvents.forEach((event) => {
//           newEvents[event.id] = event;
//         });
//         return newEvents;
//       });
//     }

//     const newPendingEvents = pendingEvents.filter(
//       (e) => !bulkForm.selectedEvents.includes(e.id)
//     );
//     savePendingEvents(newPendingEvents);

//     setBulkForm({ selectedEvents: [], sendEmail: true });
//     setBulkPublishing(false);
//     setShowBulkModal(false);
//   };

//   const toggleBulkMode = () => {
//     setBulkMode(!bulkMode);
//   };

//   // Функция копирования смены
//   const handleCopyEvent = (event, isPending, sourceDate) => {
//     if (isCopying) return;

//     setIsCopying(true);
//     setCopiedEvent({ ...event, isPending });
//     setIsCopyMode(true);
//     setCopySourceDate(sourceDate);

//     const copyIndicator = document.createElement("div");
//     copyIndicator.className = "copy-corner-indicator";
//     copyIndicator.innerHTML = `
//       <div class="copy-corner-content">
//         <span class="copy-corner-icon">📋</span>
//         <span class="copy-corner-text">Skopiowano</span>
//         <span class="copy-corner-time">${event.startTime}</span>
//       </div>
//     `;
//     document.body.appendChild(copyIndicator);

//     setTimeout(() => {
//       if (copyIndicator.parentNode) {
//         copyIndicator.remove();
//       }
//       setIsCopying(false);
//     }, 2000);
//   };

//   // Функция вставки смены
//   const handlePasteEvent = (newEvent, targetDate, isPending) => {
//     if (isPending) {
//       const updatedPendingEvents = [...pendingEvents, newEvent];
//       savePendingEvents(updatedPendingEvents);

//       const toast = document.createElement("div");
//       toast.className = "copy-toast success";
//       document.body.appendChild(toast);

//       setTimeout(() => {
//         toast.remove();
//       }, 2000);
//     } else {
//       const user = users.find((u) => u.id === newEvent.userId);
//       if (!user) return;

//       saveEventToFirebase(newEvent, newEvent.id).then(() => {
//         setEvents((prev) => ({ ...prev, [newEvent.id]: newEvent }));

//         if (isAuthorized) {
//           createGoogleCalendarEvent(newEvent, user).then((googleEventId) => {
//             if (googleEventId) {
//               const updatedEvent = { ...newEvent, googleEventId };
//               saveEventToFirebase(updatedEvent, newEvent.id);
//               setEvents((prev) => ({ ...prev, [newEvent.id]: updatedEvent }));
//             }
//           });
//         }

//         const toast = document.createElement("div");
//         toast.className = "copy-toast success";
//         document.body.appendChild(toast);

//         setTimeout(() => {
//           toast.remove();
//         }, 2000);
//       });
//     }

//     setTimeout(() => {
//       setIsCopyMode(false);
//       setCopiedEvent(null);
//       setCopySourceDate(null);
//     }, 300);
//   };

//   const cancelCopyMode = () => {
//     setIsCopyMode(false);
//     setCopiedEvent(null);
//     setCopySourceDate(null);
//   };

//   const handleCreateEvent = async () => {
//     if (!eventForm.title.trim()) {
//       alert("Введите название смены");
//       return;
//     }

//     if (eventForm.userIds.length === 0) {
//       alert("Выберите хотя бы одного сотрудника");
//       return;
//     }

//     if (bulkMode) {
//       const newPendingEvents = eventForm.userIds.map((userId) => {
//         const user = users.find((u) => u.id === userId);
//         return {
//           ...eventForm,
//           userId,
//           id: `pending_${Date.now()}_${userId}_${Math.random()
//             .toString(36)
//             .substr(2, 6)}`,
//           createdAt: new Date().toISOString(),
//           isPending: true,
//           user,
//         };
//       });

//       savePendingEvents([...pendingEvents, ...newPendingEvents]);
//     } else {
//       const createdEvents = [];
//       let successCount = 0;

//       for (const userId of eventForm.userIds) {
//         const user = users.find((u) => u.id === userId);
//         if (!user) continue;

//         let googleEventId = null;
//         if (isAuthorized) {
//           googleEventId = await createGoogleCalendarEvent(eventForm, user);
//         }

//         const newEvent = {
//           ...eventForm,
//           userId,
//           googleEventId,
//           createdAt: new Date().toISOString(),
//           isPending: false,
//         };

//         const savedEventId = await saveEventToFirebase(newEvent);
//         newEvent.id = savedEventId;

//         createdEvents.push(newEvent);
//         successCount++;
//       }

//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         createdEvents.forEach((event) => {
//           newEvents[event.id] = event;
//         });
//         return newEvents;
//       });
//     }

//     setShowModal(false);
//     setEventForm({
//       id: null,
//       title: "Recepcja",
//       date: formatDateToYMD(new Date()),
//       startTime: "13:00",
//       endTime: "20:00",
//       userIds: [],
//       sendEmail: true,
//       isPending: false,
//     });
//   };

//   const handleEditEvent = (event, isPending = false) => {
//     setEventForm({
//       id: event.id,
//       title: event.title,
//       date: event.date,
//       startTime: event.startTime,
//       endTime: event.endTime,
//       userIds: [event.userId],
//       sendEmail: event.sendEmail !== undefined ? event.sendEmail : true,
//       isPending: isPending,
//     });
//     setShowModal(true);
//   };

//   const handleUpdateEvent = async () => {
//     if (!eventForm.id) return;

//     if (!eventForm.title.trim()) {
//       alert("Введите название смены");
//       return;
//     }

//     if (eventForm.userIds.length === 0) {
//       alert("Выберите сотрудника");
//       return;
//     }

//     const userId = eventForm.userIds[0];
//     const user = users.find((u) => u.id === userId);
//     if (!user) return;

//     const updatedEvent = {
//       ...eventForm,
//       userId,
//       updatedAt: new Date().toISOString(),
//     };

//     if (eventForm.isPending) {
//       const updatedPendingEvents = pendingEvents.map((e) =>
//         e.id === eventForm.id ? { ...e, ...updatedEvent, user } : e
//       );
//       savePendingEvents(updatedPendingEvents);
//       alert(`✅ Zmiana została zaktualizowana na liście oczekujących`);
//     } else {
//       if (isAuthorized && events[eventForm.id]?.googleEventId) {
//         await deleteGoogleCalendarEvent(events[eventForm.id].googleEventId);
//       }

//       let googleEventId = null;
//       if (isAuthorized) {
//         googleEventId = await createGoogleCalendarEvent(eventForm, user);
//       }

//       updatedEvent.googleEventId =
//         googleEventId || events[eventForm.id]?.googleEventId;

//       await saveEventToFirebase(updatedEvent, eventForm.id);

//       setEvents((prev) => ({
//         ...prev,
//         [eventForm.id]: updatedEvent,
//       }));

//       alert(`✅ Zmiana została zaktualizowana`);
//     }

//     setShowModal(false);
//     setEventForm({
//       id: null,
//       title: "Recepcja",
//       date: formatDateToYMD(new Date()),
//       startTime: "13:00",
//       endTime: "20:00",
//       userIds: [],
//       sendEmail: true,
//       isPending: false,
//     });
//   };

//   const deleteGoogleCalendarEvent = async (googleEventId) => {
//     const token = localStorage.getItem("google_token");
//     if (!token) return;
//     try {
//       await fetch(
//         `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
//         {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//     } catch (error) {
//       console.error("Ошибка удаления события из Google Calendar:", error);
//     }
//   };

//   const handleDeleteEvent = async (eventId, isPending = false) => {
//     if (!window.confirm("Usunąć tę zmianę?")) return;

//     if (isPending) {
//       const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
//       savePendingEvents(newPendingEvents);
//     } else {
//       const event = events[eventId];
//       if (isAuthorized && event?.googleEventId) {
//         await deleteGoogleCalendarEvent(event.googleEventId);
//       }
//       await deleteEventFromFirebase(eventId);

//       setEvents((prev) => {
//         const newEvents = { ...prev };
//         delete newEvents[eventId];
//         return newEvents;
//       });
//     }

//     if (eventForm.id === eventId) {
//       setShowModal(false);
//       setEventForm({
//         id: null,
//         title: "Recepcja",
//         date: formatDateToYMD(new Date()),
//         startTime: "13:00",
//         endTime: "20:00",
//         userIds: [],
//         sendEmail: true,
//         isPending: false,
//       });
//     }
//   };

//   const handleDateClick = (date) => {
//     const dateStr = formatDateToYMD(date);
//     setSelectedDate(dateStr);

//     const publishedEventsOnDate = Object.values(events).filter(
//       (e) => e.date === dateStr
//     );
//     const pendingEventsOnDate = pendingEvents.filter((e) => e.date === dateStr);

//     const allEventsOnDate = [
//       ...publishedEventsOnDate.map((e) => ({ ...e, isPending: false })),
//       ...pendingEventsOnDate.map((e) => ({ ...e, isPending: true })),
//     ];

//     if (allEventsOnDate.length === 0) {
//       setEventForm({
//         id: null,
//         title: "Recepcja",
//         date: dateStr,
//         startTime: "13:00",
//         endTime: "20:00",
//         userIds: [],
//         sendEmail: true,
//         isPending: false,
//       });
//       setShowModal(true);
//     } else if (allEventsOnDate.length === 1) {
//       const firstEvent = allEventsOnDate[0];
//       handleEditEvent(firstEvent, firstEvent.isPending);
//     } else {
//       setSelectedDateEvents(allEventsOnDate);
//       setShowEventsListModal(true);
//     }
//   };

//   const handleShiftClick = (e, event, isPending) => {
//     e.stopPropagation();
//     if (!e.ctrlKey && !e.shiftKey) {
//       handleEditEvent(event, isPending);
//     }
//   };

//   const toggleUserSelection = (userId) => {
//     setEventForm((prev) => {
//       if (prev.id) {
//         return { ...prev, userIds: [userId] };
//       }
//       const newUserIds = prev.userIds.includes(userId)
//         ? prev.userIds.filter((id) => id !== userId)
//         : [...prev.userIds, userId];
//       return { ...prev, userIds: newUserIds };
//     });
//   };

//   const handleAddUser = async () => {
//     if (!newUser.name.trim() || !newUser.email.trim()) {
//       alert("Заполните имя и email");
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newUser.email)) {
//       alert("Введите корректный email");
//       return;
//     }

//     const existingUser = users.find(
//       (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
//     );
//     if (existingUser) {
//       alert(`Пользователь с email ${newUser.email} уже существует`);
//       return;
//     }

//     const newUserId = `user_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;
//     const userToAdd = {
//       ...newUser,
//       id: newUserId,
//       isActive: true,
//       createdAt: new Date().toISOString(),
//     };

//     const userRef = ref(db, `users/${newUserId}`);
//     await set(userRef, userToAdd);

//     setNewUser({ name: "", email: "", color: USER_COLORS[0] });
//   };

//   const handleDeleteUser = async (userId) => {
//     const user = users.find((u) => u.id === userId);
//     if (!user) return;

//     if (
//       window.confirm(
//         `Удалить сотрудника "${user.name}"?\n\nВсе его смены также будут удалены.`
//       )
//     ) {
//       const userRef = ref(db, `users/${userId}`);
//       await remove(userRef);

//       const userEvents = Object.values(events).filter(
//         (e) => e.userId === userId
//       );
//       for (const event of userEvents) {
//         await handleDeleteEvent(event.id, false);
//       }

//       const newPendingEvents = pendingEvents.filter((e) => e.userId !== userId);
//       savePendingEvents(newPendingEvents);
//     }
//   };

//   const getUserById = (userId) => {
//     return users.find((user) => user.id === userId);
//   };

//   const getAllEventsForDate = (dateStr) => {
//     const published = Object.values(events)
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: false,
//       }));

//     const pending = pendingEvents
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: true,
//       }));

//     return [...published, ...pending].filter((event) => event.user);
//   };

//   const getDaysInMonth = (year, month) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (year, month) => {
//     const day = new Date(year, month, 1).getDay();
//     return day === 0 ? 6 : day - 1;
//   };

//   const navigateMonth = (direction) => {
//     setCurrentDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setMonth(prev.getMonth() + direction);
//       return newDate;
//     });
//   };

//   const navigateStatsMonth = (direction) => {
//     setSelectedStatsMonth((prev) => {
//       const newDate = new Date(prev);
//       newDate.setMonth(prev.getMonth() + direction);
//       return newDate;
//     });
//   };

//   const goToCurrentMonth = () => {
//     setSelectedStatsMonth(new Date());
//   };

//   const renderCalendar = () => {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const daysInMonth = getDaysInMonth(year, month);
//     const firstDay = getFirstDayOfMonth(year, month);

//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       const dateStr = formatDateToYMD(date);
//       const dayEvents = getAllEventsForDate(dateStr);
//       const hasEvent = dayEvents.length > 0;
//       const isToday = formatDateToYMD(new Date()) === dateStr;
//       const hasPending = dayEvents.some((e) => e.isPending);

//       days.push(
//         <div
//           key={day}
//           className={`calendar-day ${hasEvent ? "has-event" : ""} ${
//             isToday ? "today" : ""
//           } ${selectedDate === dateStr ? "selected" : ""} ${
//             isCopyMode ? "copy-mode" : ""
//           }`}
//           onClick={() => {
//             if (isCopyMode && copiedEvent) {
//               handlePasteEvent(
//                 {
//                   ...copiedEvent,
//                   id: `copied_${Date.now()}_${Math.random()
//                     .toString(36)
//                     .substr(2, 9)}`,
//                   date: dateStr,
//                 },
//                 dateStr,
//                 copiedEvent.isPending
//               );
//             } else {
//               handleDateClick(date);
//             }
//           }}
//         >
//           <div className="day-number">{day}</div>

//           {hasEvent && (
//             <div className="shift-square">
//               <div className="shift-events-list">
//                 {dayEvents.map((event) => (
//                   <div
//                     key={event.id}
//                     className={`shift-item ${
//                       event.isPending ? "pending" : ""
//                     } ${isCopyMode ? "copyable" : ""}`}
//                     style={{
//                       backgroundColor: event.user?.color || "#4A90E2",
//                       opacity: event.isPending ? 0.55 : 1,
//                       borderLeft: event.isPending
//                         ? "3px solid rgba(0,0,0,0.2)"
//                         : "none",
//                       cursor: isCopyMode ? "copy" : "pointer",
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation();

//                       if (e.ctrlKey || e.shiftKey) {
//                         handleCopyEvent(event, event.isPending, dateStr);
//                       } else if (isCopyMode) {
//                         handleCopyEvent(event, event.isPending, dateStr);
//                       } else {
//                         handleShiftClick(e, event, event.isPending);
//                       }
//                     }}
//                     onMouseEnter={() => {
//                       setHoveredEvent({
//                         event,
//                         isPending: event.isPending,
//                         date: dateStr,
//                       });
//                     }}
//                     onMouseLeave={() => {
//                       setHoveredEvent(null);
//                     }}
//                     title={
//                       isCopyMode
//                         ? "Нажмите, чтобы скопировать"
//                         : `${event.user?.name}: ${event.title} (${event.startTime})`
//                     }
//                   >
//                     <span className="shift-initial">
//                       {event.user?.name?.charAt(0) || "?"}
//                     </span>
//                     <span className="shift-time">{event.startTime}</span>
//                     <span className="shift-name">
//                       {event.user?.name?.split(" ")[0]}
//                     </span>
//                     {event.isPending && (
//                       <span className="shift-pending-badge">⏳</span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               {dayEvents.length > 3 && (
//                 <div className="shift-more">+{dayEvents.length - 3} więcej</div>
//               )}
//             </div>
//           )}

//           {hasPending && (
//             <div className="pending-indicator">
//               <span className="pending-dot"></span>
//               <span className="pending-count">
//                 {dayEvents.filter((e) => e.isPending).length}
//               </span>
//             </div>
//           )}
//         </div>
//       );
//     }

//     return days;
//   };

//   const setIsLoading = (value) => {
//     setLoading(value);
//   };

//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <div className="loading-spinner" />
//         <div className="loading-text">Ładowanie...</div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <LoginScreen onLogin={setUser} />;
//   }

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <div className="header-left">
//           <img className="logo-red" src="/img/logo.png" alt="logo" />

//           <div className="admin-badge">
//             <span className="admin-icon">
//               <i className="fa-regular fa-user"></i>
//             </span>
//             <span className="admin-email">{user.email}</span>
//           </div>
//           <div className="google-status">
//             {isAuthorized ? (
//               <span className="status-connected">
//                 <span className="status-dot" />
//                 Google Calendar
//               </span>
//             ) : (
//               <button className="btn-google" onClick={loginWithGoogle}>
//                 Połącz z Google
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="header-actions">
//           {/* НОВАЯ КНОПКА НАСТРОЙКИ ДОСТУПНОСТИ */}
//           <button
//             className={`btn-icon availability-btn ${
//               availabilitySettings?.enabled ? "active" : ""
//             }`}
//             onClick={() => setShowAvailabilitySettings(true)}
//             title="Ustawienia dostępności"
//           >
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M10 4V16M4 10H16"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Dostępność</span>
//             {availabilitySettings?.enabled && (
//               <span className="availability-badge">
//                 {availabilitySettings.startDay}-{availabilitySettings.endDay}
//               </span>
//             )}
//           </button>

//           <button
//             className={`btn-icon ${
//               pendingEvents.length > 0 ? "has-badge pulse" : ""
//             }`}
//             onClick={() => setShowRequestsModal(true)}
//             disabled={pendingEvents.length === 0}
//             title="Zgłoszenia dostępności"
//           >
//             {pendingEvents.length > 0 && (
//               <span className="btn-icon-badge">{pendingEvents.length}</span>
//             )}
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M5 4H15C16.1046 4 17 4.89543 17 6V14C17 15.1046 16.1046 16 15 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4Z"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M7 9H13M7 12H11"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Zgłoszenia</span>
//           </button>

//           <div className="bulk-mode-toggle">
//             <span className="toggle-label">Masowa publikacja</span>
//             <button
//               className={`toggle-switch ${bulkMode ? "active" : ""}`}
//               onClick={toggleBulkMode}
//             >
//               <span className="toggle-handle"></span>
//             </button>
//           </div>

//           <button
//             className={`btn-icon ${
//               pendingEvents.length > 0 ? "has-badge" : ""
//             }`}
//             onClick={() => setShowBulkModal(true)}
//             disabled={pendingEvents.length === 0}
//           >
//             {pendingEvents.length > 0 && (
//               <span className="btn-icon-badge">{pendingEvents.length}</span>
//             )}
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M10 4V16M4 10H16"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Oczekują</span>
//           </button>

//           <button
//             className="btn-icon"
//             onClick={() => setShowMonthlyStatsModal(true)}
//           >
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <rect
//                 x="2"
//                 y="4"
//                 width="16"
//                 height="12"
//                 rx="2"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M6 2V6M14 2V6M2 10H18"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <circle cx="7" cy="13" r="1" fill="currentColor" />
//               <circle cx="10" cy="13" r="1" fill="currentColor" />
//               <circle cx="13" cy="13" r="1" fill="currentColor" />
//             </svg>
//             <span className="statmies">Statystyki miesięczne</span>
//           </button>

//           <button className="btn-icon" onClick={() => setShowStatsModal(true)}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Statystyki</span>
//           </button>

//           <button className="btn-icon" onClick={() => setShowUserModal(true)}>
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6Z"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M2 18C2 15.7909 3.79086 14 6 14H14C16.2091 14 18 15.7909 18 18"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Pracownicy ({users.length})</span>
//           </button>

//           <LogoutButton onLogout={() => setUser(null)} />
//         </div>
//       </header>

//       {isCopyMode && copiedEvent && (
//         <div className="copy-indicator">
//           <span>📋 Режим копирования</span>
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <span style={{ fontSize: "12px", opacity: 0.9 }}>
//               {copiedEvent.title} ({copiedEvent.startTime})
//             </span>
//             <button onClick={cancelCopyMode}>✕</button>
//           </div>
//         </div>
//       )}

//       <div
//         className={`mode-indicator ${bulkMode ? "bulk-mode" : "normal-mode"}`}
//       >
//         <div className="mode-icon">
//           {bulkMode ? (
//             <i className="fa-solid fa-globe"></i>
//           ) : (
//             <i className="fa-brands fa-slack"></i>
//           )}
//         </div>

//         <div className="mode-text">
//           <strong>
//             {bulkMode ? "Tryb masowej publikacji" : "Tryb zwykły"}
//           </strong>
//           <span>
//             {bulkMode
//               ? "Zmiany są dodawane do listy oczekujących"
//               : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
//           </span>
//         </div>
//       </div>

//       <div className="month-nav">
//         <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M12 16L6 10L12 4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//         <h2 className="month-title">
//           {currentDate.toLocaleDateString("pl-PL", {
//             month: "long",
//             year: "numeric",
//           })}
//         </h2>
//         <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M8 16L14 10L8 4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//       </div>

//       <div className="calendar">
//         <div className="calendar-weekdays">
//           {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
//             <div key={day} className="weekday">
//               {day}
//             </div>
//           ))}
//         </div>
//         <div className="calendar-grid">{renderCalendar()}</div>
//       </div>

//       <PendingRequestsModal
//         show={showRequestsModal}
//         onClose={() => setShowRequestsModal(false)}
//         pendingEvents={pendingEvents}
//         users={users}
//         onAccept={handleAcceptRequest}
//         onReject={handleRejectRequest}
//       />

//       <AvailabilitySettings
//         show={showAvailabilitySettings}
//         onClose={() => setShowAvailabilitySettings(false)}
//         settings={availabilitySettings}
//         onSave={saveAvailabilitySettings}
//         user={user}
//         db={db}
//       />

//       <EventsListModal
//         show={showEventsListModal}
//         onClose={() => setShowEventsListModal(false)}
//         events={selectedDateEvents}
//         onEditEvent={handleEditEvent}
//         users={users}
//       />

//       {/* Остальные модалки (статистика, массовая публикация, пользователи и т.д.) */}
//       {showMonthlyStatsModal && (
//         <div className="modal-overlay">
//           <div className="modal stats-modal monthly-stats-modal">
//             <div className="modal-header">
//               <div className="modal-title-with-nav">
//                 <button
//                   className="month-nav-btn-small"
//                   onClick={() => navigateStatsMonth(-1)}
//                 >
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                     <path
//                       d="M12 16L6 10L12 4"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </button>

//                 <h3 className="modal-title">
//                   {selectedStatsMonth.toLocaleDateString("pl-PL", {
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </h3>

//                 <button
//                   className="month-nav-btn-small"
//                   onClick={() => navigateStatsMonth(1)}
//                 >
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                     <path
//                       d="M8 16L14 10L8 4"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               <div className="modal-header-actions">
//                 <button
//                   className="btn-icon-small"
//                   onClick={goToCurrentMonth}
//                   title="Bieżący miesiąc"
//                 >
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                     <circle
//                       cx="10"
//                       cy="10"
//                       r="8"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                     />
//                     <circle cx="10" cy="10" r="2" fill="currentColor" />
//                   </svg>
//                 </button>

//                 <button
//                   className="modal-close"
//                   onClick={() => setShowMonthlyStatsModal(false)}
//                 >
//                   <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                     <path
//                       d="M15 5L5 15M5 5L15 15"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             <div className="stats-content">
//               <div className="monthly-overview">
//                 <div className="statmonthly">
//                   <div className="stat-value">
//                     {Object.values(monthlyStats).reduce(
//                       (acc, stat) => acc + stat.totalShifts,
//                       0
//                     )}
//                   </div>
//                   <div className="stat-label">Opublikowane</div>
//                 </div>
//                 <div className="statmonthly">
//                   <div className="stat-value">
//                     {Object.values(monthlyStats).reduce(
//                       (acc, stat) => acc + stat.pendingShifts,
//                       0
//                     )}
//                   </div>
//                   <div className="stat-label">Oczekujące</div>
//                 </div>
//                 <div className="statmonthly">
//                   <div className="stat-value">
//                     {Object.values(monthlyStats)
//                       .reduce((acc, stat) => acc + stat.totalHours, 0)
//                       .toFixed(1)}
//                   </div>
//                   <div className="stat-label">Godzin</div>
//                 </div>
//               </div>

//               <div className="month-info">
//                 <span className="month-badge">
//                   {selectedStatsMonth.toLocaleDateString("pl-PL", {
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </span>
//                 {selectedStatsMonth.getMonth() === new Date().getMonth() &&
//                   selectedStatsMonth.getFullYear() ===
//                     new Date().getFullYear() && (
//                     <span className="current-month-badge">Bieżący miesiąc</span>
//                   )}
//               </div>

//               {users.length === 0 ? (
//                 <div className="empty-state">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                   <p>Brak danych do statystyk</p>
//                   <span>Dodaj pracowników i zmiany</span>
//                 </div>
//               ) : (
//                 <div className="monthly-stats-list">
//                   {Object.values(monthlyStats).map((userStat) => (
//                     <div
//                       key={userStat.user.id}
//                       className="monthly-stat-item"
//                       style={{ "--user-color": userStat.user.color }}
//                     >
//                       <div className="monthly-stat-header">
//                         <div className="user-info">
//                           <div
//                             className="user-avatar-small"
//                             style={{ backgroundColor: userStat.user.color }}
//                           >
//                             {userStat.user.name.charAt(0)}
//                           </div>
//                           <div>
//                             <div className="user-name">
//                               {userStat.user.name}
//                             </div>
//                             <div className="user-email">
//                               {userStat.user.email}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="monthly-stats-grid">
//                         <div className="monthly-stat-card">
//                           <div className="stat-value">
//                             {userStat.totalShifts}
//                           </div>
//                           <div className="stat-label">Opublikowane</div>
//                         </div>

//                         <div className="monthly-stat-card pending">
//                           <div className="stat-value">
//                             {userStat.pendingShifts}
//                           </div>
//                           <div className="stat-label">Oczekujące</div>
//                         </div>

//                         <div className="monthly-stat-card">
//                           <div className="stat-value">
//                             {userStat.totalHours}
//                           </div>
//                           <div className="stat-label">Godzin</div>
//                         </div>

//                         <div className="monthly-stat-card">
//                           <div className="stat-value">
//                             {userStat.averageHoursPerShift}
//                           </div>
//                           <div className="stat-label">Średnio</div>
//                         </div>
//                       </div>

//                       <div className="monthly-details">
//                         <div className="detail-row">
//                           <span className="spandetail">Łącznie godzin:</span>
//                           <strong>
//                             {userStat.totalHours + userStat.pendingHours} h
//                           </strong>
//                         </div>
//                         <div className="detail-row">
//                           <span className="spandetail">W tym oczekujące:</span>
//                           <strong>{userStat.pendingHours} h</strong>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowMonthlyStatsModal(false)}
//               >
//                 Zamknij
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showBulkModal && (
//         <div className="modal-overlay">
//           <div className="modal bulk-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Lista oczekujących</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => {
//                   setShowBulkModal(false);
//                   setBulkForm({ selectedEvents: [], sendEmail: true });
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-content">
//               {pendingEvents.length === 0 ? (
//                 <div className="empty-state">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                   <p>Brak zmian do publikacji</p>
//                   <span>Utwórz zmiany w trybie masowej publikacji</span>
//                 </div>
//               ) : (
//                 <>
//                   <div className="bulk-stats">
//                     <div className="stat-badge">
//                       Łącznie oczekujące:{" "}
//                       <strong>{pendingEvents.length}</strong>
//                     </div>
//                     <div className="stat-badge">
//                       Wybrane: <strong>{bulkForm.selectedEvents.length}</strong>
//                     </div>
//                   </div>

//                   <div className="bulk-actionsdwa">
//                     <button
//                       className="btn-smalldwa"
//                       onClick={() =>
//                         setBulkForm({
//                           ...bulkForm,
//                           selectedEvents: pendingEvents.map((e) => e.id),
//                         })
//                       }
//                     >
//                       Zaznacz wszystko
//                     </button>
//                     <button
//                       className="btn-smalldwa"
//                       onClick={() =>
//                         setBulkForm({ ...bulkForm, selectedEvents: [] })
//                       }
//                     >
//                       Odznacz wszystko
//                     </button>
//                   </div>

//                   <div className="pending-events-list">
//                     {pendingEvents.map((event) => {
//                       const user = users.find((u) => u.id === event.userId);
//                       if (!user) return null;

//                       const isSelected = bulkForm.selectedEvents.includes(
//                         event.id
//                       );

//                       return (
//                         <div
//                           key={event.id}
//                           className={`pending-event ${
//                             isSelected ? "selected" : ""
//                           }`}
//                           onClick={() => {
//                             setBulkForm((prev) => ({
//                               ...prev,
//                               selectedEvents: isSelected
//                                 ? prev.selectedEvents.filter(
//                                     (id) => id !== event.id
//                                   )
//                                 : [...prev.selectedEvents, event.id],
//                             }));
//                           }}
//                           style={{ "--user-color": user.color }}
//                         >
//                           <div className="pending-event-check">
//                             <div
//                               className={`checkbox ${
//                                 isSelected ? "checked" : ""
//                               }`}
//                             >
//                               {isSelected && "✓"}
//                             </div>
//                           </div>
//                           <div
//                             className="pending-event-color"
//                             style={{ backgroundColor: user.color }}
//                           />
//                           <div className="pending-event-info">
//                             <div className="pending-event-name">
//                               {user.name}
//                             </div>
//                             <div className="pending-event-title">
//                               {event.title}
//                             </div>
//                             <div className="pending-event-datetime">
//                               {event.date} · {event.startTime} — {event.endTime}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {isAuthorized && bulkForm.selectedEvents.length > 0 && (
//                     <div className="bulk-settings">
//                       <label className="checkbox-label">
//                         <input
//                           type="checkbox"
//                           checked={bulkForm.sendEmail}
//                           onChange={(e) =>
//                             setBulkForm({
//                               ...bulkForm,
//                               sendEmail: e.target.checked,
//                             })
//                           }
//                         />
//                         <span className="monstrclas">
//                           Wyślij zaproszenia na e-mail
//                         </span>
//                       </label>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => {
//                   setShowBulkModal(false);
//                   setBulkForm({ selectedEvents: [], sendEmail: true });
//                 }}
//               >
//                 Zamknij
//               </button>
//               {pendingEvents.length > 0 && (
//                 <button
//                   className="btn btn-primary"
//                   onClick={publishBulkEvents}
//                   disabled={
//                     bulkForm.selectedEvents.length === 0 ||
//                     bulkPublishing ||
//                     !isAuthorized
//                   }
//                 >
//                   {bulkPublishing ? (
//                     <>
//                       <span className="spinner-small" />
//                       Publikowanie...
//                     </>
//                   ) : (
//                     `Opublikuj (${bulkForm.selectedEvents.length})`
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal shift-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 {eventForm.id
//                   ? eventForm.isPending
//                     ? "Edycja (oczekuje na publikację)"
//                     : "Edycja zmiany"
//                   : "Nowa zmiana"}
//               </h3>
//               <button
//                 className="modal-close"
//                 onClick={() => {
//                   setShowModal(false);
//                   setEventForm({
//                     id: null,
//                     title: "Recepcja",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "13:00",
//                     endTime: "20:00",
//                     userIds: [],
//                     sendEmail: true,
//                     isPending: false,
//                   });
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-content">
//               <div className="form-section">
//                 <label className="form-label">Nazwa zmiany</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   value={eventForm.title}
//                   onChange={(e) =>
//                     setEventForm({ ...eventForm, title: e.target.value })
//                   }
//                   placeholder="Recepcja, Serwis, Dostępność"
//                 />
//               </div>

//               <div className="form-row">
//                 <div className="form-section">
//                   <label className="form-label">Data</label>
//                   <input
//                     type="date"
//                     className="form-input"
//                     value={eventForm.date}
//                     onChange={(e) =>
//                       setEventForm({ ...eventForm, date: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div className="form-section">
//                   <label className="form-label">Czas</label>
//                   <div className="time-inputs">
//                     <input
//                       type="time"
//                       className="form-input time"
//                       value={eventForm.startTime}
//                       onChange={(e) =>
//                         setEventForm({
//                           ...eventForm,
//                           startTime: e.target.value,
//                         })
//                       }
//                     />
//                     <span className="time-separator">—</span>
//                     <input
//                       type="time"
//                       className="form-input time"
//                       value={eventForm.endTime}
//                       onChange={(e) =>
//                         setEventForm({ ...eventForm, endTime: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="form-section">
//                 <label className="form-label">
//                   {eventForm.id
//                     ? "Pracownik"
//                     : "Pracownicy (można wybrać kilku)"}
//                 </label>
//                 {users.length === 0 ? (
//                   <div className="empty-users">
//                     <p>Brak dodanych pracowników</p>

//                     <button
//                       className="btn btn-small"
//                       onClick={() => {
//                         setShowModal(false);
//                         setShowUserModal(true);
//                       }}
//                     >
//                       Dodaj pracownika
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="users-grid">
//                       {users.map((user) => {
//                         const isSelected = eventForm.userIds.includes(user.id);
//                         return (
//                           <div
//                             key={user.id}
//                             className={`user-card ${
//                               isSelected ? "selected" : ""
//                             }`}
//                             onClick={() => toggleUserSelection(user.id)}
//                             style={{ "--user-color": user.color }}
//                           >
//                             <div
//                               className="user-avatar"
//                               style={{ backgroundColor: user.color }}
//                             >
//                               {user.name.charAt(0)}
//                             </div>
//                             <span className="user-name">{user.name}</span>
//                             {isSelected && (
//                               <span className="user-check">✓</span>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                     {eventForm.userIds.length > 0 && (
//                       <div className="selected-users">
//                         <span className="selected-count">
//                           {eventForm.id ? "Сотрудник:" : "Wybrane:"}{" "}
//                           {eventForm.userIds.length}
//                         </span>
//                         <div className="selected-tags">
//                           {eventForm.userIds.map((userId) => {
//                             const user = users.find((u) => u.id === userId);
//                             return user ? (
//                               <span
//                                 key={userId}
//                                 className="selected-tag"
//                                 style={{
//                                   backgroundColor: `${user.color}20`,
//                                   borderColor: user.color,
//                                 }}
//                               >
//                                 <span
//                                   style={{ backgroundColor: user.color }}
//                                   className="tag-dot"
//                                 ></span>
//                                 {user.name}
//                               </span>
//                             ) : null;
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               {!eventForm.id && (
//                 <div className={`mode-badge ${bulkMode ? "bulk" : "direct"}`}>
//                   <div className="mode-icon">
//                     {bulkMode ? (
//                       <i className="fa-solid fa-globe"></i>
//                     ) : (
//                       <i className="fa-brands fa-slack"></i>
//                     )}
//                   </div>
//                   <span className="spamzmiantit">
//                     {bulkMode
//                       ? "Zmiany są dodawane do listy oczekujących"
//                       : "Zmiany są natychmiast publikowane w Kalendarzu Google"}
//                   </span>
//                 </div>
//               )}

//               {eventForm.isPending && (
//                 <div className="mode-badge bulk">
//                   <span className="badge-icon">
//                     <i className="fa-regular fa-hourglass"></i>
//                   </span>
//                   <span>Ta zmiana oczekuje na publikację</span>
//                 </div>
//               )}

//               {isAuthorized &&
//                 eventForm.userIds.length > 0 &&
//                 !eventForm.isPending && (
//                   <div className="form-section google-settings">
//                     <label className="checkbox-label">
//                       <input
//                         type="checkbox"
//                         checked={eventForm.sendEmail}
//                         onChange={(e) =>
//                           setEventForm({
//                             ...eventForm,
//                             sendEmail: e.target.checked,
//                           })
//                         }
//                       />
//                       <span>Wyślij zaproszenia do Kalendarza Google</span>
//                     </label>
//                   </div>
//                 )}
//             </div>

//             <div className="modal-footer">
//               {eventForm.id && (
//                 <button
//                   className="btn btn-danger"
//                   onClick={() =>
//                     handleDeleteEvent(eventForm.id, eventForm.isPending)
//                   }
//                 >
//                   Usuń
//                 </button>
//               )}
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => {
//                   setShowModal(false);
//                   setEventForm({
//                     id: null,
//                     title: "Recepcja",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "13:00",
//                     endTime: "20:00",
//                     userIds: [],
//                     sendEmail: true,
//                     isPending: false,
//                   });
//                 }}
//               >
//                 Anuluj
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={eventForm.id ? handleUpdateEvent : handleCreateEvent}
//                 disabled={
//                   eventForm.userIds.length === 0 || !eventForm.title.trim()
//                 }
//               >
//                 {eventForm.id ? "Zapisz" : "Utwórz zmianę"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showStatsModal && (
//         <div className="modal-overlay">
//           <div className="modal stats-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Statystyki</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowStatsModal(false)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="stats-content">
//               {users.length === 0 ? (
//                 <div className="empty-state">
//                   <svg
//                     width="48"
//                     height="48"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                   <p>Brak danych do statystyk</p>
//                   <span>Dodaj pracowników i zmiany</span>
//                 </div>
//               ) : (
//                 <>
//                   <div className="stats-overview">
//                     <div className="stat-card">
//                       <div className="stat-value">{users.length}</div>
//                       <div className="stat-label">Pracowników</div>
//                     </div>
//                     <div className="stat-card">
//                       <div className="stat-value">
//                         {Object.keys(events).length}
//                       </div>
//                       <div className="stat-label">Opublikowano</div>
//                     </div>
//                     <div className="stat-card">
//                       <div className="stat-value">{pendingEvents.length}</div>
//                       <div className="stat-label">Oczekujące</div>
//                     </div>
//                   </div>

//                   <div className="stats-employees">
//                     {Object.values(stats).map((userStat) => (
//                       <div
//                         key={userStat.user.id}
//                         className="employee-stat"
//                         style={{ "--user-color": userStat.user.color }}
//                       >
//                         <div className="employee-header">
//                           <div className="employee-info">
//                             <div
//                               className="employee-avatar"
//                               style={{ backgroundColor: userStat.user.color }}
//                             >
//                               {userStat.user.name.charAt(0)}
//                             </div>
//                             <div>
//                               <div className="employee-name">
//                                 {userStat.user.name}
//                               </div>
//                               <div className="employee-email">
//                                 {userStat.user.email}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="employee-total">
//                             <div className="total-shifts">
//                               {userStat.totalShifts} zmian
//                             </div>
//                             <div className="total-hours">
//                               {userStat.totalHours.toFixed(1)} h
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showUserModal && (
//         <div className="modal-overlay">
//           <div className="modal users-modal">
//             <div className="modal-header">
//               <h3 className="modal-title">Pracownicy</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowUserModal(false)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="users-content">
//               <div className="add-user-form">
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Imię i nazwisko"
//                   value={newUser.name}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, name: e.target.value })
//                   }
//                 />
//                 <input
//                   type="email"
//                   className="form-input"
//                   placeholder="Email"
//                   value={newUser.email}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, email: e.target.value })
//                   }
//                 />
//                 <select
//                   className="form-select"
//                   value={newUser.color}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, color: e.target.value })
//                   }
//                 >
//                   {GOOGLE_COLORS.map((color) => (
//                     <option key={color.hex} value={color.hex}>
//                       {color.name}
//                     </option>
//                   ))}
//                 </select>
//                 <div
//                   className="color-preview"
//                   style={{ backgroundColor: newUser.color }}
//                 />
//                 <button
//                   className="btn btn-primary add-user-btn"
//                   onClick={handleAddUser}
//                   disabled={!newUser.name.trim() || !newUser.email.trim()}
//                 >
//                   Dodaj
//                 </button>
//               </div>

//               <div className="users-list">
//                 {users.length === 0 ? (
//                   <div className="empty-state">
//                     <svg
//                       width="48"
//                       height="48"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                     >
//                       <path d="M12 4V20M4 12H20" strokeWidth="1.5" />
//                     </svg>
//                     <p className="ptitmonst">Brak pracowników</p>
//                     <span className="ptitmonst">
//                       Dodaj pierwszego pracownika
//                     </span>
//                   </div>
//                 ) : (
//                   users.map((user) => (
//                     <div
//                       key={user.id}
//                       className="user-list-item"
//                       style={{ "--user-color": user.color }}
//                     >
//                       <div
//                         className="user-avatar-large"
//                         style={{ backgroundColor: user.color }}
//                       >
//                         {user.name.charAt(0)}
//                       </div>
//                       <div className="user-details">
//                         <div className="user-name-large">{user.name}</div>
//                         <div className="user-email-small">{user.email}</div>
//                         <div className="user-color-name">
//                           {GOOGLE_COLORS.find((c) => c.hex === user.color)
//                             ?.name || "Цвет"}
//                         </div>
//                       </div>
//                       <button
//                         className="btn-icon-small"
//                         onClick={() => handleDeleteUser(user.id)}
//                       >
//                         <svg
//                           width="16"
//                           height="16"
//                           viewBox="0 0 16 16"
//                           fill="none"
//                         >
//                           <path
//                             d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M12 6V14C12 14.5523 11.5523 15 11 15H5C4.44772 15 4 14.5523 4 14V6"
//                             stroke="currentColor"
//                             strokeWidth="1.2"
//                             strokeLinecap="round"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ============= ГЛАВНЫЙ КОМПОНЕНТ С МАРШРУТИЗАЦИЕЙ =============
// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<AdminApp />} />
//         <Route path="/employee" element={<EmployeeView />} />
//       </Routes>
//     </Router>
//   );
// }
