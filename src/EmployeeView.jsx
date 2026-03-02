// import { useState, useEffect } from "react";
// import { getDatabase, ref, onValue } from "firebase/database";
// import { initializeApp } from "firebase/app";
// import "./EmployeeView.css";

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

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// const DEFAULT_PASSWORD = "VsJetZone24pr";

// const formatDateToYMD = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
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

// // Компонент входа для работников
// const EmployeeLoginScreen = ({ onLogin, employees }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const employee = employees.find((emp) => emp.email === email);

//       if (!employee) {
//         throw new Error("Nie znaleziono pracownika z tym adresem email");
//       }

//       if (password !== DEFAULT_PASSWORD) {
//         throw new Error("Nieprawidłowe hasło");
//       }

//       onLogin(employee);
//     } catch (error) {
//       console.error("Ошибка входа:", error);
//       setError(error.message || "Błąd logowania. Sprawdź dane");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="employee-login-container">
//       <div className="employee-login-card">
//         <div className="employee-login-header">
//           <div className="employee-login-icon">JetZone24</div>
//           <h1 className="employee-login-title">Panel pracownika</h1>
//           <p className="employee-login-subtitle">
//             Zaloguj się, aby zarządzać swoją dostępnością
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="employee-login-form">
//           <div className="employee-login-field">
//             <label className="employee-login-label">Email służbowy</label>
//             <div className="employee-login-input-wrapper">
//               <span className="employee-login-input-icon">📧</span>
//               <input
//                 type="email"
//                 className="employee-login-input"
//                 placeholder="twoj.email@jetzone24.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="employee-login-field">
//             <label className="employee-login-label">Hasło</label>
//             <div className="employee-login-input-wrapper">
//               <span className="employee-login-input-icon">🔒</span>
//               <input
//                 type="password"
//                 className="employee-login-input"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={loading}
//               />
//             </div>
//             <div className="employee-password-hint">
//               Domyślne hasło: {DEFAULT_PASSWORD}
//             </div>
//           </div>

//           {error && (
//             <div className="employee-login-error">
//               <span className="employee-login-error-icon">⚠️</span>
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="employee-login-button"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <span className="employee-login-spinner" />
//                 Logowanie...
//               </>
//             ) : (
//               "Zaloguj się"
//             )}
//           </button>
//         </form>

//         <div className="employee-login-footer">
//           <p>Dostęp tylko dla pracowników JetZone24</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Компонент выхода
// const EmployeeLogoutButton = ({ onLogout }) => {
//   return (
//     <button
//       className="employee-btn-icon employee-logout-btn"
//       onClick={onLogout}
//     >
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

// // Основной компонент
// export default function EmployeeView() {
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [events, setEvents] = useState({});
//   const [pendingEvents, setPendingEvents] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showStatsModal, setShowStatsModal] = useState(false);

//   const [availabilityForm, setAvailabilityForm] = useState({
//     id: null,
//     title: "Dostępność",
//     date: formatDateToYMD(new Date()),
//     startTime: "09:00",
//     endTime: "17:00",
//     userId: null,
//     isPending: true,
//   });

//   const [stats, setStats] = useState({});
//   const [selectedDate, setSelectedDate] = useState(null);

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (employee) {
//       calculateEmployeeStatistics();
//     }
//   }, [events, pendingEvents, employee]);

//   // Удаление только СВОИХ подтвержденных событий из ожидающих
//   useEffect(() => {
//     const removeConfirmedPendingEvents = () => {
//       if (!employee) return;

//       // Создаем Set из ключей ВСЕХ опубликованных событий
//       const publishedEventKeys = new Set(
//         Object.values(events).map(
//           (event) =>
//             `${event.userId}_${event.date}_${event.startTime}_${event.endTime}`
//         )
//       );

//       // Фильтруем ожидающие события
//       const updatedPendingEvents = pendingEvents.filter((pendingEvent) => {
//         // Если это событие другого сотрудника - ВСЕГДА ОСТАВЛЯЕМ
//         if (pendingEvent.userId !== employee.id) {
//           return true;
//         }

//         // Если это мое событие - проверяем, не опубликовано ли оно
//         const pendingKey = `${pendingEvent.userId}_${pendingEvent.date}_${pendingEvent.startTime}_${pendingEvent.endTime}`;
//         return !publishedEventKeys.has(pendingKey);
//       });

//       if (updatedPendingEvents.length !== pendingEvents.length) {
//         console.log(
//           "Usunięto potwierdzone wydarzenia z listy oczekujących:",
//           pendingEvents.length - updatedPendingEvents.length
//         );
//         setPendingEvents(updatedPendingEvents);
//         localStorage.setItem(
//           "pendingEvents",
//           JSON.stringify(updatedPendingEvents)
//         );
//       }
//     };

//     removeConfirmedPendingEvents();
//   }, [events, employee]);

//   const loadInitialData = async () => {
//     setLoading(true);
//     await loadUsersFromFirebase();
//     await loadEventsFromFirebase();
//     const savedPending = localStorage.getItem("pendingEvents");
//     if (savedPending) {
//       try {
//         const parsedPending = JSON.parse(savedPending);
//         setPendingEvents(parsedPending);
//       } catch (e) {
//         setPendingEvents([]);
//       }
//     }
//     setLoading(false);
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

//   const savePendingEvents = (newPendingEvents) => {
//     setPendingEvents(newPendingEvents);
//     localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));
//   };

//   const calculateEmployeeStatistics = () => {
//     if (!employee) return;

//     const userEvents = Object.values(events).filter(
//       (e) => e.userId === employee.id
//     );
//     const userPendingEvents = pendingEvents.filter(
//       (e) => e.userId === employee.id
//     );

//     const totalShifts = userEvents.length;
//     const pendingShifts = userPendingEvents.length;

//     let totalHours = 0;
//     userEvents.forEach((event) => {
//       totalHours += calculateHoursDiff(event.startTime, event.endTime);
//     });

//     let pendingHours = 0;
//     userPendingEvents.forEach((event) => {
//       pendingHours += calculateHoursDiff(event.startTime, event.endTime);
//     });

//     setStats({
//       totalShifts,
//       pendingShifts,
//       totalHours: parseFloat(totalHours.toFixed(1)),
//       pendingHours: parseFloat(pendingHours.toFixed(1)),
//     });
//   };

//   const handleDateClick = (date) => {
//     if (!employee) return;

//     const dateStr = formatDateToYMD(date);
//     setSelectedDate(dateStr);

//     const existingAvailability = pendingEvents.find(
//       (e) => e.date === dateStr && e.userId === employee.id
//     );

//     if (existingAvailability) {
//       setAvailabilityForm({
//         id: existingAvailability.id,
//         title: existingAvailability.title,
//         date: existingAvailability.date,
//         startTime: existingAvailability.startTime,
//         endTime: existingAvailability.endTime,
//         userId: employee.id,
//         isPending: true,
//       });
//     } else {
//       setAvailabilityForm({
//         id: null,
//         title: "Dostępność",
//         date: dateStr,
//         startTime: "09:00",
//         endTime: "17:00",
//         userId: employee.id,
//         isPending: true,
//       });
//     }
//     setShowModal(true);
//   };

//   const handleCreateAvailability = () => {
//     if (!employee) return;

//     if (!availabilityForm.title.trim()) {
//       alert("Wpisz nazwę dostępności");
//       return;
//     }

//     const newAvailability = {
//       ...availabilityForm,
//       id:
//         availabilityForm.id ||
//         `pending_${Date.now()}_${employee.id}_${Math.random()
//           .toString(36)
//           .substr(2, 6)}`,
//       userId: employee.id,
//       createdAt: new Date().toISOString(),
//       isPending: true,
//     };

//     if (availabilityForm.id) {
//       const updatedPendingEvents = pendingEvents.map((e) =>
//         e.id === availabilityForm.id ? newAvailability : e
//       );
//       savePendingEvents(updatedPendingEvents);
//     } else {
//       savePendingEvents([...pendingEvents, newAvailability]);
//     }

//     setShowModal(false);
//     setAvailabilityForm({
//       id: null,
//       title: "Dostępność",
//       date: formatDateToYMD(new Date()),
//       startTime: "09:00",
//       endTime: "17:00",
//       userId: employee.id,
//       isPending: true,
//     });
//   };

//   const handleDeleteAvailability = (eventId) => {
//     if (!window.confirm("Usunąć tę dostępność?")) return;

//     const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
//     savePendingEvents(newPendingEvents);
//     setShowModal(false);
//   };

//   const getUserById = (userId) => {
//     return users.find((user) => user.id === userId);
//   };

//   // ИСПРАВЛЕННАЯ функция для получения всех событий на дату
//   const getAllEventsForDate = (dateStr) => {
//     // Получаем все опубликованные события из Firebase
//     const published = Object.values(events)
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: false,
//       }));

//     // Получаем все ожидающие события из localStorage
//     const pending = pendingEvents
//       .filter((e) => e.date === dateStr)
//       .map((event) => ({
//         ...event,
//         user: getUserById(event.userId),
//         isPending: true,
//       }));

//     // Объединяем и возвращаем ВСЕ события
//     // Важно: фильтруем только те, у которых есть пользователь
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

//   const renderCalendar = () => {
//     if (!employee) return null;

//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const daysInMonth = getDaysInMonth(year, month);
//     const firstDay = getFirstDayOfMonth(year, month);

//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(
//         <div key={`empty-${i}`} className="employee-calendar-day empty"></div>
//       );
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       const dateStr = formatDateToYMD(date);
//       const dayEvents = getAllEventsForDate(dateStr);

//       const myEvents = dayEvents.filter((e) => e.userId === employee?.id);
//       const otherEvents = dayEvents.filter((e) => e.userId !== employee?.id);

//       const isToday = formatDateToYMD(new Date()) === dateStr;

//       days.push(
//         <div
//           key={day}
//           className={`employee-calendar-day ${isToday ? "today" : ""} ${
//             selectedDate === dateStr ? "selected" : ""
//           }`}
//           onClick={() => handleDateClick(date)}
//         >
//           <div className="employee-day-number">{day}</div>

//           {(myEvents.length > 0 || otherEvents.length > 0) && (
//             <div className="employee-shift-square">
//               {/* Сначала показываем свои события */}
//               {myEvents.map((event) => (
//                 <div
//                   key={event.id}
//                   className={`employee-shift-item my-shift ${
//                     event.isPending ? "pending" : ""
//                   }`}
//                   style={{
//                     backgroundColor: event.user?.color || "#4A90E2",
//                   }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (event.isPending) {
//                       handleDateClick(date);
//                     }
//                   }}
//                 >
//                   <span className="employee-shift-initial">
//                     {event.user?.name?.charAt(0) || "?"}
//                   </span>
//                   <span className="employee-shift-time">{event.startTime}</span>
//                   {event.isPending && (
//                     <span className="employee-shift-pending-badge">⏳</span>
//                   )}
//                 </div>
//               ))}

//               {/* Потом показываем события других сотрудников */}
//               {otherEvents.map((event) => (
//                 <div
//                   key={event.id}
//                   className="employee-shift-item other-shift"
//                   style={{
//                     backgroundColor: event.user?.color || "#4A90E2",
//                   }}
//                 >
//                   <span className="employee-shift-initial">
//                     {event.user?.name?.charAt(0) || "?"}
//                   </span>
//                   <span className="employee-shift-time">{event.startTime}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       );
//     }

//     return days;
//   };

//   const handleLogout = () => {
//     setEmployee(null);
//   };

//   if (loading) {
//     return (
//       <div className="employee-loading-screen">
//         <div className="employee-loading-spinner" />
//         <div className="employee-loading-text">Ładowanie...</div>
//       </div>
//     );
//   }

//   if (!employee) {
//     return <EmployeeLoginScreen onLogin={setEmployee} employees={users} />;
//   }

//   return (
//     <div className="employee-app-container">
//       <header className="employee-app-header">
//         <div className="employee-header-left">
//           <img className="employee-logo-red" src="/img/logo.png" alt="logo" />
//           <div className="employee-badge">
//             <span
//               className="employee-avatar-small"
//               style={{ backgroundColor: employee.color }}
//             >
//               {employee.name?.charAt(0)}
//             </span>
//             <span className="employee-info">
//               <span className="employee-name-header">{employee.name}</span>
//               <span className="employee-email-header">{employee.email}</span>
//             </span>
//           </div>
//         </div>

//         <div className="employee-header-actions">
//           <button
//             className="employee-btn-icon"
//             onClick={() => setShowStatsModal(true)}
//           >
//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//               <path
//                 d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span>Moje statystyki</span>
//           </button>

//           <EmployeeLogoutButton onLogout={handleLogout} />
//         </div>
//       </header>

//       <div className="employee-mode-indicator">
//         <div className="employee-mode-icon">👤</div>
//         <div className="employee-mode-text">
//           <strong>Tryb pracownika</strong>
//           <span>Kliknij na dzień, aby dodać swoją dostępność</span>
//         </div>
//       </div>

//       <div className="employee-legend">
//         <div className="legend-item">
//           <div className="legend-color my-shift"></div>
//           <span>Moja dostępność</span>
//         </div>
//         <div className="legend-item">
//           <div className="legend-color other-shift"></div>
//           <span>Inni pracownicy</span>
//         </div>
//         <div className="legend-item">
//           <div className="legend-color pending"></div>
//           <span>Oczekuje na publikację</span>
//         </div>
//       </div>

//       <div className="employee-month-nav">
//         <button
//           className="employee-month-nav-btn"
//           onClick={() => navigateMonth(-1)}
//         >
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M12 16L6 10L12 4"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//         <h2 className="employee-month-title">
//           {currentDate.toLocaleDateString("pl-PL", {
//             month: "long",
//             year: "numeric",
//           })}
//         </h2>
//         <button
//           className="employee-month-nav-btn"
//           onClick={() => navigateMonth(1)}
//         >
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

//       <div className="employee-calendar">
//         <div className="employee-calendar-weekdays">
//           {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
//             <div key={day} className="employee-weekday">
//               {day}
//             </div>
//           ))}
//         </div>
//         <div className="employee-calendar-grid">{renderCalendar()}</div>
//       </div>

//       {/* Модалка доступности */}
//       {showModal && (
//         <div className="employee-modal-overlay">
//           <div className="employee-modal availability-modal">
//             <div className="employee-modal-header">
//               <h3 className="employee-modal-title">
//                 {availabilityForm.id ? "Edytuj dostępność" : "Dodaj dostępność"}
//               </h3>
//               <button
//                 className="employee-modal-close"
//                 onClick={() => {
//                   setShowModal(false);
//                   setAvailabilityForm({
//                     id: null,
//                     title: "Dostępność",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "09:00",
//                     endTime: "17:00",
//                     userId: employee.id,
//                     isPending: true,
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

//             <div className="employee-modal-content">
//               <div className="employee-form-section">
//                 <label className="employee-form-label">Data</label>
//                 <input
//                   type="date"
//                   className="employee-form-input"
//                   value={availabilityForm.date}
//                   onChange={(e) =>
//                     setAvailabilityForm({
//                       ...availabilityForm,
//                       date: e.target.value,
//                     })
//                   }
//                 />
//               </div>

//               <div className="employee-form-section">
//                 <label className="employee-form-label">Godziny</label>
//                 <div className="employee-time-inputs">
//                   <input
//                     type="time"
//                     className="employee-form-input time"
//                     value={availabilityForm.startTime}
//                     onChange={(e) =>
//                       setAvailabilityForm({
//                         ...availabilityForm,
//                         startTime: e.target.value,
//                       })
//                     }
//                   />
//                   <span className="employee-time-separator">—</span>
//                   <input
//                     type="time"
//                     className="employee-form-input time"
//                     value={availabilityForm.endTime}
//                     onChange={(e) =>
//                       setAvailabilityForm({
//                         ...availabilityForm,
//                         endTime: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>

//               <div className="employee-form-section">
//                 <label className="employee-form-label">Nazwa</label>
//                 <input
//                   type="text"
//                   className="employee-form-input"
//                   value={availabilityForm.title}
//                   onChange={(e) =>
//                     setAvailabilityForm({
//                       ...availabilityForm,
//                       title: e.target.value,
//                     })
//                   }
//                   placeholder="Dostępność, Urlóp, itp."
//                 />
//               </div>

//               <div className="employee-mode-badge">
//                 <span className="employee-badge-icon">⏳</span>
//                 <span>Dostępność zostanie dodana do listy oczekujących</span>
//               </div>
//             </div>

//             <div className="employee-modal-footer">
//               {availabilityForm.id && (
//                 <button
//                   className="employee-btn employee-btn-danger"
//                   onClick={() => handleDeleteAvailability(availabilityForm.id)}
//                 >
//                   Usuń
//                 </button>
//               )}
//               <button
//                 className="employee-btn employee-btn-secondary"
//                 onClick={() => {
//                   setShowModal(false);
//                   setAvailabilityForm({
//                     id: null,
//                     title: "Dostępność",
//                     date: formatDateToYMD(new Date()),
//                     startTime: "09:00",
//                     endTime: "17:00",
//                     userId: employee.id,
//                     isPending: true,
//                   });
//                 }}
//               >
//                 Anuluj
//               </button>
//               <button
//                 className="employee-btn employee-btn-primary"
//                 onClick={handleCreateAvailability}
//               >
//                 {availabilityForm.id ? "Zapisz" : "Dodaj dostępność"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Модалка статистики */}
//       {showStatsModal && (
//         <div className="employee-modal-overlay">
//           <div className="employee-modal stats-modal">
//             <div className="employee-modal-header">
//               <h3 className="employee-modal-title">Moje statystyki</h3>
//               <button
//                 className="employee-modal-close"
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

//             <div className="employee-stats-content">
//               <div className="employee-stats-overview">
//                 <div className="employee-stat-card">
//                   <div className="employee-stat-value">
//                     {stats.totalShifts || 0}
//                   </div>
//                   <div className="employee-stat-label">Opublikowane zmiany</div>
//                 </div>
//                 <div className="employee-stat-card">
//                   <div className="employee-stat-value">
//                     {stats.pendingShifts || 0}
//                   </div>
//                   <div className="employee-stat-label">Oczekujące</div>
//                 </div>
//                 <div className="employee-stat-card">
//                   <div className="employee-stat-value">
//                     {(stats.totalHours || 0).toFixed(1)}
//                   </div>
//                   <div className="employee-stat-label">
//                     Przepracowane godziny
//                   </div>
//                 </div>
//               </div>

//               <div className="employee-stats-details">
//                 <div className="employee-detail-row">
//                   <span>Łącznie godzin (z oczekującymi):</span>
//                   <strong>
//                     {(
//                       (stats.totalHours || 0) + (stats.pendingHours || 0)
//                     ).toFixed(1)}{" "}
//                     h
//                   </strong>
//                 </div>
//                 <div className="employee-detail-row">
//                   <span>W tym oczekujące:</span>
//                   <strong>{(stats.pendingHours || 0).toFixed(1)} h</strong>
//                 </div>
//               </div>
//             </div>

//             <div className="employee-modal-footer">
//               <button
//                 className="employee-btn employee-btn-secondary"
//                 onClick={() => setShowStatsModal(false)}
//               >
//                 Zamknij
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";
import "./EmployeeView.css";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DEFAULT_PASSWORD = "VsJetZone24pr";

const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date) => {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });
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

// Компонент входа для работников
const EmployeeLoginScreen = ({ onLogin, employees }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const employee = employees.find((emp) => emp.email === email);

      if (!employee) {
        throw new Error("Nie znaleziono pracownika z tym adresem email");
      }

      if (password !== DEFAULT_PASSWORD) {
        throw new Error("Nieprawidłowe hasło");
      }

      onLogin(employee);
    } catch (error) {
      console.error("Ошибка входа:", error);
      setError(error.message || "Błąd logowania. Sprawdź dane");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-card">
        <div className="employee-login-header">
          <div className="employee-login-icon">JetZone24</div>
          <h1 className="employee-login-title">Panel pracownika</h1>
          <p className="employee-login-subtitle">
            Zaloguj się, aby zarządzać swoją dostępnością
          </p>
        </div>

        <form onSubmit={handleSubmit} className="employee-login-form">
          <div className="employee-login-field">
            <label className="employee-login-label">Email służbowy</label>
            <div className="employee-login-input-wrapper">
              <span className="login-input-icon">
                <i className="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                className="employee-login-input"
                placeholder="twoj.email@jetzone24.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="employee-login-field">
            <label className="employee-login-label">Hasło</label>
            <div className="employee-login-input-wrapper">
              <span className="login-input-icon">
                <i className="fa-solid fa-shield-halved"></i>{" "}
              </span>
              <input
                type="password"
                className="employee-login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="employee-password-hint">
              Domyślne hasło: {DEFAULT_PASSWORD}
            </div>
          </div>

          {error && (
            <div className="employee-login-error">
              <span className="employee-login-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="employee-login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="employee-login-spinner" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </button>
        </form>

        <div className="employee-login-footer">
          <p>Dostęp tylko dla pracowników JetZone24</p>
        </div>
      </div>
    </div>
  );
};

// Компонент выхода
const EmployeeLogoutButton = ({ onLogout }) => {
  return (
    <button
      className="employee-btn-icon employee-logout-btn"
      onClick={onLogout}
    >
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

// Компонент переключателя вида календаря
const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === "month" ? "active" : ""}`}
        onClick={() => onViewChange("month")}
      >
        Miesiąc
      </button>
      <button
        className={`view-toggle-btn ${view === "week" ? "active" : ""}`}
        onClick={() => onViewChange("week")}
      >
        Tydzień
      </button>
      <button
        className={`view-toggle-btn ${view === "day" ? "active" : ""}`}
        onClick={() => onViewChange("day")}
      >
        Dzień
      </button>
    </div>
  );
};

// Компонент переключателя "Только мои смены"
const MyShiftsToggle = ({ showOnlyMyShifts, onToggle }) => {
  return (
    <label className="shifts-toggle">
      <div className="shifts-toggle__switch">
        <input
          type="checkbox"
          className="shifts-toggle__checkbox"
          checked={showOnlyMyShifts}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="shifts-toggle__slider"></span>
      </div>
      <span className="shifts-toggle__label">
        {showOnlyMyShifts ? "Tylko moje zmiany" : "Wszystkie zmiany"}
      </span>
    </label>
  );
};

// Основной компонент
export default function EmployeeView() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showOnlyMyShifts, setShowOnlyMyShifts] = useState(false);
  const [calendarView, setCalendarView] = useState("month"); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(null);
  const [statsMonth, setStatsMonth] = useState(new Date());
  // НОВОЕ: состояние для детального просмотра дня на мобильных
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const [availabilityForm, setAvailabilityForm] = useState({
    id: null,
    title: "Dostępność",
    date: formatDateToYMD(new Date()),
    startTime: "09:00",
    endTime: "17:00",
    userId: null,
    isPending: true,
  });

  const [monthlyStats, setMonthlyStats] = useState({
    totalShifts: 0,
    totalHours: 0,
    pendingShifts: 0,
    pendingHours: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (employee) {
      calculateMonthlyStatistics();
    }
  }, [events, pendingEvents, employee, statsMonth]);

  // Удаление только СВОИХ подтвержденных событий из ожидающих
  useEffect(() => {
    const removeConfirmedPendingEvents = () => {
      if (!employee) return;

      const publishedEventKeys = new Set(
        Object.values(events).map(
          (event) =>
            `${event.userId}_${event.date}_${event.startTime}_${event.endTime}`
        )
      );

      const updatedPendingEvents = pendingEvents.filter((pendingEvent) => {
        if (pendingEvent.userId !== employee.id) {
          return true;
        }

        const pendingKey = `${pendingEvent.userId}_${pendingEvent.date}_${pendingEvent.startTime}_${pendingEvent.endTime}`;
        return !publishedEventKeys.has(pendingKey);
      });

      if (updatedPendingEvents.length !== pendingEvents.length) {
        setPendingEvents(updatedPendingEvents);
        localStorage.setItem(
          "pendingEvents",
          JSON.stringify(updatedPendingEvents)
        );
      }
    };

    removeConfirmedPendingEvents();
  }, [events, employee]);

  const loadInitialData = async () => {
    setLoading(true);
    await loadUsersFromFirebase();
    await loadEventsFromFirebase();
    const savedPending = localStorage.getItem("pendingEvents");
    if (savedPending) {
      try {
        const parsedPending = JSON.parse(savedPending);
        setPendingEvents(parsedPending);
      } catch (e) {
        setPendingEvents([]);
      }
    }
    setLoading(false);
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

  const savePendingEvents = (newPendingEvents) => {
    setPendingEvents(newPendingEvents);
    localStorage.setItem("pendingEvents", JSON.stringify(newPendingEvents));
  };

  const calculateMonthlyStatistics = () => {
    if (!employee) return;

    const year = statsMonth.getFullYear();
    const month = statsMonth.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const startStr = formatDateToYMD(startDate);
    const endStr = formatDateToYMD(endDate);

    // Фильтруем события за выбранный месяц
    const userEvents = Object.values(events).filter(
      (e) => e.userId === employee.id && e.date >= startStr && e.date <= endStr
    );

    const userPendingEvents = pendingEvents.filter(
      (e) => e.userId === employee.id && e.date >= startStr && e.date <= endStr
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

    setMonthlyStats({
      totalShifts,
      pendingShifts,
      totalHours: parseFloat(totalHours.toFixed(1)),
      pendingHours: parseFloat(pendingHours.toFixed(1)),
    });
  };

  const handleDateClick = (date) => {
    if (!employee) return;

    const dateStr = formatDateToYMD(date);
    setSelectedDate(dateStr);

    const existingAvailability = pendingEvents.find(
      (e) => e.date === dateStr && e.userId === employee.id
    );

    if (existingAvailability) {
      setAvailabilityForm({
        id: existingAvailability.id,
        title: existingAvailability.title,
        date: existingAvailability.date,
        startTime: existingAvailability.startTime,
        endTime: existingAvailability.endTime,
        userId: employee.id,
        isPending: true,
      });
    } else {
      setAvailabilityForm({
        id: null,
        title: "Dostępność",
        date: dateStr,
        startTime: "09:00",
        endTime: "17:00",
        userId: employee.id,
        isPending: true,
      });
    }
    setShowModal(true);
  };

  // НОВАЯ: функция для обработки клика по дню с учетом мобильных устройств
  const handleDayClick = (date) => {
    if (calendarView === "month" && window.innerWidth <= 768) {
      // На телефоне в месячном виде показываем детальный просмотр
      setSelectedDayDetail(date);
    } else {
      // На десктопе или в других видах открываем модалку добавления
      handleDateClick(date);
    }
  };

  const handleCreateAvailability = () => {
    if (!employee) return;

    if (!availabilityForm.title.trim()) {
      alert("Wpisz nazwę dostępności");
      return;
    }

    const newAvailability = {
      ...availabilityForm,
      id:
        availabilityForm.id ||
        `pending_${Date.now()}_${employee.id}_${Math.random()
          .toString(36)
          .substr(2, 6)}`,
      userId: employee.id,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    if (availabilityForm.id) {
      const updatedPendingEvents = pendingEvents.map((e) =>
        e.id === availabilityForm.id ? newAvailability : e
      );
      savePendingEvents(updatedPendingEvents);
    } else {
      savePendingEvents([...pendingEvents, newAvailability]);
    }

    setShowModal(false);
    setAvailabilityForm({
      id: null,
      title: "Dostępność",
      date: formatDateToYMD(new Date()),
      startTime: "09:00",
      endTime: "17:00",
      userId: employee.id,
      isPending: true,
    });
  };

  const handleDeleteAvailability = (eventId) => {
    if (!window.confirm("Usunąć tę dostępność?")) return;

    const newPendingEvents = pendingEvents.filter((e) => e.id !== eventId);
    savePendingEvents(newPendingEvents);
    setShowModal(false);
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

    let allEvents = [...published, ...pending].filter((event) => event.user);

    // Фильтруем по переключателю "Только мои смены"
    if (showOnlyMyShifts && employee) {
      allEvents = allEvents.filter((event) => event.userId === employee.id);
    }

    return allEvents;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    // В JS: 0 - воскресенье, 1 - понедельник, ..., 6 - суббота
    // Нам нужно: понедельник = 0, воскресенье = 6
    return day === 0 ? 6 : day - 1;
  };

  const navigateDate = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (calendarView === "month") {
        newDate.setMonth(prev.getMonth() + direction);
      } else if (calendarView === "week") {
        newDate.setDate(prev.getDate() + direction * 7);
      } else {
        newDate.setDate(prev.getDate() + direction);
      }
      return newDate;
    });
  };

  const navigateStatsMonth = (direction) => {
    setStatsMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderMonthView = () => {
    if (!employee) return null;

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

      const isToday = formatDateToYMD(new Date()) === dateStr;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${
            selectedDate === dateStr ? "selected" : ""
          }`}
          onClick={() => handleDayClick(date)}
        >
          <div className="day-number">{day}</div>

          {dayEvents.length > 0 && (
            <div className="day-events-compact">
              {dayEvents.slice(0, 2).map((event) => {
                // Получаем короткое имя (максимум 4 буквы)
                const nameParts = event.user?.name?.split(" ") || ["?"];
                let displayName = "";

                if (nameParts.length > 1) {
                  // Если есть имя и фамилия - берем первую букву фамилии
                  displayName = nameParts[0].substring(0, 3) + nameParts[1][0];
                } else {
                  // Если только имя - берем первые 4 буквы
                  displayName = nameParts[0].substring(0, 4);
                }

                return (
                  <div
                    key={event.id}
                    className={`event-name-badge ${
                      event.isPending ? "pending" : ""
                    }`}
                    style={{
                      backgroundColor: event.user?.color || "#666",
                      opacity: event.isPending ? 0.7 : 1,
                      borderLeft: event.isPending ? "2px dashed #000" : "none",
                    }}
                    title={`${event.user?.name}: ${event.startTime} - ${event.endTime}`}
                  >
                    <span className="event-name-text">{displayName}</span>
                    {event.isPending && (
                      <span className="pending-indicator">⏳</span>
                    )}
                  </div>
                );
              })}
              {dayEvents.length > 2 && (
                <div className="event-more-badge">+{dayEvents.length - 2}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    if (!employee) return null;

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateToYMD(date);
      const dayEvents = getAllEventsForDate(dateStr);
      const isToday = formatDateToYMD(new Date()) === dateStr;

      days.push(
        <div key={i} className={`week-day ${isToday ? "today" : ""}`}>
          <div className="week-day-header">
            <div className="week-day-name">
              {date.toLocaleDateString("pl-PL", { weekday: "short" })}
            </div>
            <div
              className={`week-day-number ${
                selectedDate === dateStr ? "selected" : ""
              }`}
              onClick={() => handleDateClick(date)}
            >
              {date.getDate()}
            </div>
          </div>
          <div className="week-day-events">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`week-event ${event.isPending ? "pending" : ""}`}
                style={{ borderLeftColor: event.user?.color || "#666" }}
                onClick={() => handleDateClick(date)}
              >
                <span className="event-time">{event.startTime}</span>
                <span className="event-name">{event.user?.name}</span>
                {event.isPending && <span className="pending-badge">⏳</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="week-view">{days}</div>;
  };

  const renderDayView = () => {
    if (!employee) return null;

    const dateStr = formatDateToYMD(currentDate);
    const dayEvents = getAllEventsForDate(dateStr);
    const isToday = formatDateToYMD(new Date()) === dateStr;

    return (
      <div className="day-view">
        <div className={`day-header ${isToday ? "today" : ""}`}>
          <div className="day-title">
            {currentDate.toLocaleDateString("pl-PL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="day-events-list">
          {dayEvents.length === 0 ? (
            <div className="no-events">Brak wydarzeń w tym dniu</div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                className={`day-event ${event.isPending ? "pending" : ""}`}
                style={{
                  backgroundColor: `${event.user?.color}10`,
                  borderLeftColor: event.user?.color || "#666",
                }}
                onClick={() => handleDateClick(currentDate)}
              >
                <div className="event-time-badge">
                  {event.startTime} - {event.endTime}
                </div>
                <div className="event-details">
                  <span
                    className="event-user"
                    style={{ color: event.user?.color }}
                  >
                    {event.user?.name}
                  </span>
                  <span className="event-title">{event.title}</span>
                  {event.isPending && (
                    <span className="pending-badge">⏳ Oczekuje</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    switch (calendarView) {
      case "week":
        return renderWeekView();
      case "day":
        return renderDayView();
      default:
        return (
          <>
            <div className="calendar-weekdays">
              {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-grid">{renderMonthView()}</div>
          </>
        );
    }
  };

  const handleLogout = () => {
    setEmployee(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Ładowanie...</div>
      </div>
    );
  }

  if (!employee) {
    return <EmployeeLoginScreen onLogin={setEmployee} employees={users} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-actions">
          <img className="logo" src="/img/logo.png" alt="logo" />
          <button className="icon-btn" onClick={() => setShowStatsModal(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 18H18M4 14L6 9L9 13L13 7L16 11L18 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="btn-label">Statystyki</span>
          </button>

          <EmployeeLogoutButton onLogout={handleLogout} />
        </div>
        <div className="header-left">
          <div className="user-badge">
            <span
              className="avatar"
              style={{ backgroundColor: employee.color }}
            >
              {employee.name?.charAt(0)}
            </span>
            <div className="user-info">
              <span className="user-name">{employee.name}</span>
              <span className="user-email">{employee.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mode-indicator">
        <div className="mode-icon">
          <i
            className="fa-brands fa-earlybirds"
            style={{ color: "rgb(104, 104, 104)" }}
          ></i>
        </div>
        <div className="mode-text">
          <strong>Tryb pracownika</strong>
          <span>Kliknij na dzień, aby dodać swoją dostępność</span>
        </div>
      </div>

      <div className="controls-bar">
        <ViewToggle view={calendarView} onViewChange={setCalendarView} />
        <MyShiftsToggle
          showOnlyMyShifts={showOnlyMyShifts}
          onToggle={setShowOnlyMyShifts}
        />
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot my-shift"></div>
          <span>Moja dostępność</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot other-shift"></div>
          <span>Inni pracownicy</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot pending"></div>
          <span>Oczekuje</span>
        </div>
      </div>

      <div className="navigation-bar">
        <button className="nav-btn" onClick={() => navigateDate(-1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 16L6 10L12 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h2 className="date-title">
          {calendarView === "month" &&
            currentDate.toLocaleDateString("pl-PL", {
              month: "long",
              year: "numeric",
            })}
          {calendarView === "week" &&
            `Tydzień ${Math.ceil(
              currentDate.getDate() / 7
            )} ${currentDate.toLocaleDateString("pl-PL", {
              month: "long",
              year: "numeric",
            })}`}
          {calendarView === "day" &&
            currentDate.toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
        </h2>
        <button className="nav-btn" onClick={() => navigateDate(1)}>
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

      <div className="calendar-container">{renderCalendar()}</div>

      {/* Модалка доступности */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {availabilityForm.id ? "Edytuj dostępność" : "Dodaj dostępność"}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setAvailabilityForm({
                    id: null,
                    title: "Dostępność",
                    date: formatDateToYMD(new Date()),
                    startTime: "09:00",
                    endTime: "17:00",
                    userId: employee.id,
                    isPending: true,
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
              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={availabilityForm.date}
                  onChange={(e) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Godziny</label>
                <div className="time-inputs">
                  <input
                    type="time"
                    className="form-input time"
                    value={availabilityForm.startTime}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        startTime: e.target.value,
                      })
                    }
                  />
                  <span className="time-separator">—</span>
                  <input
                    type="time"
                    className="form-input time"
                    value={availabilityForm.endTime}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nazwa</label>
                <input
                  type="text"
                  className="form-input"
                  value={availabilityForm.title}
                  onChange={(e) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Dostępność, Urlop, itp."
                />
              </div>

              <div className="info-badge">
                <span className="badge-icon">⏳</span>
                <span>Dostępność zostanie dodana do listy oczekujących</span>
              </div>
            </div>

            <div className="modal-footer">
              {availabilityForm.id && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteAvailability(availabilityForm.id)}
                >
                  Usuń
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setAvailabilityForm({
                    id: null,
                    title: "Dostępność",
                    date: formatDateToYMD(new Date()),
                    startTime: "09:00",
                    endTime: "17:00",
                    userId: employee.id,
                    isPending: true,
                  });
                }}
              >
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateAvailability}
              >
                {availabilityForm.id ? "Zapisz" : "Dodaj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка статистики */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal stats-modal">
            <div className="modal-header">
              <h3 className="modal-title">Statystyki miesięczne</h3>
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

            <div className="stats-month-nav">
              <button
                className="month-nav-btn"
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
              <span className="month-display">
                {statsMonth.toLocaleDateString("pl-PL", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                className="month-nav-btn"
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

            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{monthlyStats.totalShifts}</div>
                  <div className="stat-label">Opublikowane zmiany</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{monthlyStats.pendingShifts}</div>
                  <div className="stat-label">Oczekujące</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {monthlyStats.totalHours.toFixed(1)}h
                  </div>
                  <div className="stat-label">Przepracowane</div>
                </div>
              </div>

              <div className="stats-details">
                <div className="detail-row">
                  <span>Łącznie godzin (z oczekującymi):</span>
                  <strong>
                    {(
                      monthlyStats.totalHours + monthlyStats.pendingHours
                    ).toFixed(1)}{" "}
                    h
                  </strong>
                </div>
                <div className="detail-row">
                  <span>W tym oczekujące:</span>
                  <strong>{monthlyStats.pendingHours.toFixed(1)} h</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStatsModal(false)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Детальный просмотр дня для мобильных */}
      {selectedDayDetail && (
        <div className="day-detail-modal">
          <div className="day-detail-header">
            <div className="day-detail-header-left">
              <h3 className="day-detail-title">
                {selectedDayDetail.toLocaleDateString("pl-PL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <span className="day-detail-events-count">
                {getAllEventsForDate(formatDateToYMD(selectedDayDetail)).length}{" "}
                wydarzeń
              </span>
            </div>
            <button
              className="day-detail-close"
              onClick={() => setSelectedDayDetail(null)}
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

          <div className="day-detail-content">
            {/* Кнопка добавления своей доступности */}
            <button
              className="add-availability-button"
              onClick={() => {
                setSelectedDayDetail(null);
                handleDateClick(selectedDayDetail);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 3V15M3 9H15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Dodaj swoją dostępność</span>
            </button>

            {/* Список событий */}
            <div className="day-events-list">
              {getAllEventsForDate(formatDateToYMD(selectedDayDetail)).map(
                (event) => (
                  <div
                    key={event.id}
                    className={`day-detail-event ${
                      event.userId === employee.id ? "my-shift" : "other-shift"
                    } ${event.isPending ? "pending" : ""}`}
                    onClick={() => {
                      if (event.userId === employee.id && event.isPending) {
                        setSelectedDayDetail(null);
                        handleDateClick(selectedDayDetail);
                      }
                    }}
                  >
                    <div className="event-avatar-wrapper">
                      <div
                        className="event-avatar"
                        style={{ backgroundColor: event.user?.color || "#666" }}
                      >
                        {event.user?.name?.charAt(0)}
                      </div>
                      {event.userId === employee.id && (
                        <span className="event-owner-badge">Moje</span>
                      )}
                    </div>

                    <div className="event-info">
                      <div className="event-header">
                        <span className="event-name">{event.user?.name}</span>
                        <span className="event-time-badge">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>

                      <div className="event-details">
                        <span className="event-title">{event.title}</span>
                        {event.isPending && (
                          <span className="event-status pending-status">
                            ⏳ Oczekuje na potwierdzenie
                          </span>
                        )}
                      </div>
                    </div>

                    {event.isPending && event.userId === employee.id && (
                      <button
                        className="event-edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDetail(null);
                          handleDateClick(selectedDayDetail);
                        }}
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
                    )}
                  </div>
                )
              )}
            </div>

            {getAllEventsForDate(formatDateToYMD(selectedDayDetail)).length ===
              0 && (
              <div className="no-events">
                <div className="no-events-icon">📅</div>
                <p>Brak wydarzeń w tym dniu</p>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    setSelectedDayDetail(null);
                    handleDateClick(selectedDayDetail);
                  }}
                >
                  Dodaj swoją dostępność
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
