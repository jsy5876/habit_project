import "./App.css";
import { useEffect, useState } from "react";
import { formatDateKey } from "./utils/date";
import { loadJSON, saveJSON } from "./utils/storage";
import Calendar from "./Calendar";
import MemoPage from "./MemoPage";
import HabitSetup from "./HabitSetup";
import ReportPage from "./ReportPage";

const SCREEN = {
  CALENDAR: "calendar",
  MEMO: "memo",
  HABIT_SETUP: "habit-setup",
  REPORT: "report"
};

const EMPTY_RECORD = {
  memo: "",
  checkedHabits: [],
};

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="logo">습관 모아</div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <h2>습관 모아</h2>
      <p>오늘의 습관을 가볍게 기록해보세요.</p>

      <button onClick={onLogin} className="login-button">
        게스트로 시작
      </button>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [screen, setScreen] = useState(SCREEN.CALENDAR);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [habits, setHabits] = useState([]);
  const [habitSetupDone, setHabitSetupDone] = useState(false);

  const [records, setRecords] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    const savedRecords = localStorage.getItem("records");
    const savedHabitSetupDone = localStorage.getItem("habitSetupDone");

    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      setHabits(parsedHabits);

      if (parsedHabits.length > 0) {
        setHabitSetupDone(true);
      }
    }

    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }

    if (savedHabitSetupDone === "true") {
      setHabitSetupDone(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem("habitSetupDone", String(habitSetupDone));
  }, [habitSetupDone]);

  const handleLogin = () => {
    setIsLoggedIn(true);

    if (habitSetupDone) {
      setScreen(SCREEN.CALENDAR);
    } else {
      setScreen(SCREEN.HABIT_SETUP);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setScreen(SCREEN.MEMO);
  };

  const handleSaveRecord = ({ memo, checkedHabits }) => {
    const dateKey = formatDateKey(selectedDate);

    setRecords((prev) => ({
      ...prev,
      [dateKey]: {
        memo,
        checkedHabits,
      },
    }));
  };

  const handleBackToCalendar = () => {
    setScreen(SCREEN.CALENDAR);
  };

  const handleSaveHabits = (newHabits) => {
    setHabits(newHabits);
    setHabitSetupDone(true);
    setScreen(SCREEN.CALENDAR);
  };

  const handleOpenHabitSetup = () => {
    setScreen(SCREEN.HABIT_SETUP);
  };

  const handleOpenReport = () => {
    setScreen(SCREEN.REPORT);
  };

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : "";
  const selectedRecord = selectedDateKey
    ? records[selectedDateKey] || EMPTY_RECORD
    : EMPTY_RECORD;

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === SCREEN.HABIT_SETUP) {
    return (
      <HabitSetup
        existingHabits={habits}
        onSave={handleSaveHabits}
        onCancel={habitSetupDone ? handleBackToCalendar : null}
        isFirstSetup={!habitSetupDone}
      />
    );
  }

  if (screen === SCREEN.REPORT) {
    return (
      <ReportPage
        currentDate={currentDate}
        records={records}
        habits={habits}
        onBack={handleBackToCalendar}
      />
    );
  }

  if (screen === SCREEN.MEMO) {
    return (
      <MemoPage
        selectedDate={selectedDate}
        record={selectedRecord}
        habits={habits}
        onSave={handleSaveRecord}
        onBack={handleBackToCalendar}
      />
    );
  }
  
  return (
    <div className="app-container">
      <Calendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onDateClick={handleDateClick}
        records={records}
        onOpenHabitSetup={handleOpenHabitSetup}
        onOpenReport={handleOpenReport}
      />
    </div>
  );
}

export default App;