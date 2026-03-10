// import React, { useState, useEffect } from "react";
// import "./ShiftReminder.css";

// const ShiftReminder = ({ events, pendingEvents, currentDate, employee }) => {
//   const [todayShift, setTodayShift] = useState(null);
//   const [nextShift, setNextShift] = useState(null);

//   useEffect(() => {
//     if (!employee) return;

//     // Форматируем сегодняшнюю дату
//     const todayStr = formatDateToYMD(currentDate || new Date());

//     // Объединяем все события (опубликованные и ожидающие)
//     const allShifts = [
//       ...Object.values(events).map((event) => ({
//         ...event,
//         isPending: false,
//       })),
//       ...pendingEvents.map((event) => ({
//         ...event,
//         isPending: true,
//       })),
//     ].filter((event) => event.userId === employee.id); // Только смены текущего сотрудника

//     // Находим сегодняшнюю смену
//     const todayShiftFound = allShifts.find((shift) => shift.date === todayStr);
//     setTodayShift(todayShiftFound || null);

//     // Находим следующую смену (ближайшую после сегодня)
//     const futureShifts = allShifts
//       .filter((shift) => shift.date > todayStr)
//       .sort((a, b) => a.date.localeCompare(b.date));

//     setNextShift(futureShifts[0] || null);
//   }, [events, pendingEvents, employee, currentDate]);

//   // Функция форматирования даты (копируем из основного компонента)
//   const formatDateToYMD = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // Функция форматирования даты для отображения
//   const formatDateForDisplay = (dateStr) => {
//     const date = new Date(dateStr + "T12:00:00");
//     return date.toLocaleDateString("pl-PL", {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//     });
//   };

//   if (!employee) return null;

//   return (
//     <div className="shift-reminder-container">
//       {/* Колонка "Сегодняшняя смена" */}
//       <div className={`shift-card ${!todayShift ? "shift-empty" : ""}`}>
//         <div className="shift-header">
//           <div className="shift-icon">
//             <i className="fa-solid fa-calendar-day"></i>
//           </div>
//           <div className="shift-title">Dzisiaj</div>
//         </div>

//         <div className="shift-content">
//           {todayShift ? (
//             <>
//               <div className="shift-time">
//                 <i className="fa-regular fa-clock"></i>
//                 {todayShift.startTime} - {todayShift.endTime}
//               </div>
//               <div className="shift-name">
//                 <i className="fa-regular fa-note-sticky"></i>
//                 {todayShift.title}
//               </div>
//               {todayShift.isPending && (
//                 <div className="shift-date">
//                   <i className="fa-solid fa-hourglass-half"></i>
//                   Oczekuje na potwierdzenie
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="shift-content">
//               <i className="fa-regular fa-face-smile"></i>
//               <p>Brak zmiany na dzisiaj</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Колонка "Ближайшая следующая смена" */}
//       <div
//         className={`shift-card next-shift ${!nextShift ? "shift-empty" : ""}`}
//       >
//         <div className="shift-header">
//           <div className="shift-icon">
//             <i className="fa-solid fa-calendar-week"></i>
//           </div>
//           <div className="shift-title">Następna zmiana</div>
//         </div>

//         <div className="shift-content">
//           {nextShift ? (
//             <>
//               <div className="shift-date">
//                 <i className="fa-regular fa-calendar"></i>
//                 {formatDateForDisplay(nextShift.date)}
//               </div>
//               <div className="shift-time">
//                 <i className="fa-regular fa-clock"></i>
//                 {nextShift.startTime} - {nextShift.endTime}
//               </div>
//               <div className="shift-name">
//                 <i className="fa-regular fa-note-sticky"></i>
//                 {nextShift.title}
//               </div>
//               {nextShift.isPending && (
//                 <div className="shift-date">
//                   <i className="fa-solid fa-hourglass-half"></i>
//                   Oczekuje na potwierdzenie
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="shift-content">
//               <i className="fa-regular fa-calendar-xmark"></i>
//               <p>Brak zaplanowanych zmian</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShiftReminder;
import React, { useState, useEffect, useRef } from "react";
import "./ShiftReminder.css";

const ShiftReminder = ({ events, pendingEvents, currentDate, employee }) => {
  const [todayShift, setTodayShift] = useState(null);
  const [nextShift, setNextShift] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!employee) return;

    const todayStr = formatDateToYMD(currentDate || new Date());

    // Объединяем все события (опубликованные и ожидающие)
    const allShifts = [
      ...Object.values(events).map((event) => ({
        ...event,
        isPending: false,
        // Извлекаем место работы из заголовка события
        workLocation: extractLocationFromTitle(event.title),
      })),
      ...pendingEvents.map((event) => ({
        ...event,
        isPending: true,
        // Для ожидающих событий тоже извлекаем из заголовка
        workLocation: extractLocationFromTitle(event.title),
      })),
    ].filter((event) => event.userId === employee.id); // Только смены текущего сотрудника

    // Находим сегодняшнюю смену
    const todayShiftFound = allShifts.find((shift) => shift.date === todayStr);
    setTodayShift(todayShiftFound || null);

    // Находим следующую смену (ближайшую после сегодня)
    const futureShifts = allShifts
      .filter((shift) => shift.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    setNextShift(futureShifts[0] || null);
  }, [events, pendingEvents, employee, currentDate]);

  // Функция для извлечения места работы из заголовка события
  const extractLocationFromTitle = (title) => {
    if (!title) return { full: "", location: "", isReception: false };

    // Очищаем заголовок от лишних пробелов
    const cleanTitle = title.trim();

    // Проверяем, содержит ли заголовок "Recepcja" или похожие варианты
    const receptionVariants = [
      "recepcja",
      "recepcia",
      "reception",
      "recepcjaa",
    ];
    const isReception = receptionVariants.some((word) =>
      cleanTitle.toLowerCase().includes(word.toLowerCase())
    );

    // Извлекаем основное место работы (первое слово или фразу)
    let location = cleanTitle;

    // Если есть двоеточие или дефис, берем то, что после
    if (cleanTitle.includes(":")) {
      location = cleanTitle.split(":")[1].trim();
    } else if (cleanTitle.includes("-")) {
      location = cleanTitle.split("-")[1].trim();
    }

    return {
      full: cleanTitle,
      location: location,
      isReception: isReception,
      // Для отображения используем красивое название
      displayName: isReception ? "RECEPCJA" : location.toUpperCase(),
    };
  };

  // Функция форматирования даты
  const formatDateToYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Функция форматирования даты для отображения
  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Функция для отображения места работы из заголовка календаря
  const renderLocation = (shift) => {
    if (!shift || !shift.workLocation) return null;

    const { displayName, isReception, location, full } = shift.workLocation;

    // Определяем иконку в зависимости от места работы
    const icon = isReception
      ? "fa-solid fa-bell-concierge"
      : "fa-solid fa-briefcase";

    // Если место работы - рецепция, показываем с особым стилем
    if (isReception) {
      return (
        <div className="shift-location reception">
          <i className={icon}></i>
          <div className="location-info">
            <span className="location-name">RECEPCJA</span>
            <small className="location-source">z kalendarza</small>
          </div>
        </div>
      );
    }

    // Для других мест
    return (
      <div className="shift-location">
        <i className={icon}></i>
        <div className="location-info">
          <span className="location-name">{displayName || location}</span>
          <small className="location-source">z kalendarza</small>
        </div>
      </div>
    );
  };

  if (!employee) return null;

  return (
    <div className="shift-reminder-container" ref={containerRef}>
      {/* Колонка "Сегодняшняя смена" */}
      <div className={`shift-card ${!todayShift ? "shift-empty" : ""}`}>
        <div className="shift-header">
          <div className="shift-icon">
            <i className="fa-solid fa-calendar-day"></i>
          </div>
          <div className="shift-title">Dzisiaj</div>
        </div>

        <div className="shift-content">
          {todayShift ? (
            <>
              <div className="shift-time">
                <i className="fa-regular fa-clock"></i>
                {todayShift.startTime} - {todayShift.endTime}
              </div>

              {/* Отображение места работы из календаря */}
              {renderLocation(todayShift)}

              {/* Показываем оригинальный заголовок если нужно */}
              {todayShift.workLocation &&
                todayShift.workLocation.full !==
                  todayShift.workLocation.location && (
                  <div className="shift-full-title">
                    <i className="fa-regular fa-file-lines"></i>
                    <small>{todayShift.workLocation.full}</small>
                  </div>
                )}

              {todayShift.isPending && (
                <div className="shift-date">
                  <i className="fa-solid fa-hourglass-half"></i>
                  Oczekuje na potwierdzenie
                </div>
              )}
            </>
          ) : (
            <div className="shift-content">
              <i className="fa-regular fa-face-smile"></i>
              <p>Brak zmiany na dzisiaj</p>
            </div>
          )}
        </div>
      </div>

      {/* Колонка "Ближайшая следующая смена" */}
      <div
        className={`shift-card next-shift ${!nextShift ? "shift-empty" : ""}`}
      >
        <div className="shift-header">
          <div className="shift-icon">
            <i className="fa-solid fa-calendar-week"></i>
          </div>
          <div className="shift-title">Następna zmiana</div>
        </div>

        <div className="shift-content">
          {nextShift ? (
            <>
              <div className="shift-date">
                <i className="fa-regular fa-calendar"></i>
                {formatDateForDisplay(nextShift.date)}
              </div>
              <div className="shift-time">
                <i className="fa-regular fa-clock"></i>
                {nextShift.startTime} - {nextShift.endTime}
              </div>

              {/* Отображение места работы из календаря для следующей смены */}
              {renderLocation(nextShift)}

              <div className="shift-name">
                <i className="fa-regular fa-note-sticky"></i>
                {nextShift.title}
              </div>

              {/* Показываем оригинальный заголовок если нужно */}
              {nextShift.workLocation &&
                nextShift.workLocation.full !==
                  nextShift.workLocation.location && (
                  <div className="shift-full-title">
                    <i className="fa-regular fa-file-lines"></i>
                    <small>{nextShift.workLocation.full}</small>
                  </div>
                )}

              {nextShift.isPending && (
                <div className="shift-date">
                  <i className="fa-solid fa-hourglass-half"></i>
                  Oczekuje na potwierdzenie
                </div>
              )}
            </>
          ) : (
            <div className="shift-content">
              <i className="fa-regular fa-calendar-xmark"></i>
              <p>Brak zaplanowanych zmian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftReminder;
