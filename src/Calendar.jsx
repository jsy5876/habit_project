import { useState } from "react";
import "./Calendar.css";

function Calendar({
  currentDate,
  setCurrentDate,
  onDateClick,
  records,
  onOpenHabitSetup,
  onOpenReport,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= lastDate; day++) {
    calendarDays.push(day);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();

  const isFutureDate = (day) => {
    if (!day) return false;

    const cellDate = new Date(year, month, day);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return cellDate > todayStart;
  }

  const isToday = (day) => {
    return (
      day &&
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleTitleClick = () => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsPickerOpen(true);
  };

  const handleApplyDate = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    setIsPickerOpen(false);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setIsPickerOpen(false);
  };

  const yearOptions = [];
  for (let y = 2020; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  const formatDateKey = (year, month, day) => {
    const monthText = String(month + 1).padStart(2, "0");
    const dayText = String(day).padStart(2, "0");
    return `${year}-${monthText}-${dayText}`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="arrow-button" onClick={handlePrevMonth}>
          ◀
        </button>

        <h2 className="calendar-title" onClick={handleTitleClick}>
          {year}년 {monthNames[month]}
        </h2>

        <button className="arrow-button" onClick={handleNextMonth}>
          ▶
        </button>
      </div>

      {isPickerOpen && (
        <div className="date-picker-popup">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>

          <button onClick={handleApplyDate}>적용</button>
          <button onClick={() => setIsPickerOpen(false)}>닫기</button>
        </div>
      )}

      <div className="week-row">
        {weekDays.map((day) => (
          <div key={day} className="week-day">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const dateKey = day ? formatDateKey(year, month, day) : "";
          const record = day ? records[dateKey] : null;

          const hasRecord =
            record &&
            ((record.memo && record.memo.trim() !== "") ||
              (record.checkedHabits && record.checkedHabits.length > 0));

          return (
            <div
              key={index}
              className={`calendar-cell ${day ? "active" : "empty"} ${
                isToday(day) ? "today" : ""
              } ${hasRecord ? "has-record" : ""} ${
                isFutureDate(day) ? "future" : ""
              }`}
              onClick={() => {
                if (day && !isFutureDate(day)) {
                  onDateClick(new Date(year, month, day));
                }
              }}
            >
              {day}
              {hasRecord && <span className="record-dot"></span>}
            </div>
          );
        })}
      </div>

      <div className="calendar-actions">
        <button className="today-button" onClick={handleGoToday}>
          오늘
        </button>

        <button className="habit-button" onClick={onOpenHabitSetup}>
          습관 추가
        </button>

        <button className="habit-button" onClick={onOpenReport}>
          통계
        </button>
      </div>
      
      <p className="report-tip">월말에 가까워질수록 더 정확한 분석을 확인 할 수 있어요.</p>
    </div>
  );
}

export default Calendar;