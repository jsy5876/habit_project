import { useEffect, useState } from "react";
import "./HabitSetup.css";

function HabitSetup({ existingHabits, onSave, onCancel, isFirstSetup }) {
  const [input, setInput] = useState("");
  const [habitList, setHabitList] = useState([]);

  useEffect(() => {
    setHabitList(existingHabits || []);
  }, [existingHabits]);

  const handleAddHabit = () => {
    const trimmed = input.trim();

    if (!trimmed) return;
    if (habitList.includes(trimmed)) {
      setInput("");
      return;
    }

    setHabitList((prev) => [...prev, trimmed]);
    setInput("");
  };

  const handleRemoveHabit = (habit) => {
    setHabitList((prev) => prev.filter((item) => item !== habit));
  };

  const handleSave = () => {
    const cleanedHabits = habitList.map((item) => item.trim()).filter(Boolean);

    if (cleanedHabits.length === 0) {
      alert("습관을 하나 이상 등록하세요.");
      return;
    }

    onSave(cleanedHabits);
  };

  return (
    <div className="habit-screen">
      <div className="habit-setup-page">
        <h2 className="habit-setup-title">
          {isFirstSetup ? "이루고 싶은 습관 등록" : "습관 추가"}
        </h2>

        <div className="habit-input-row">
          <input
            type="text"
            value={input}
            placeholder="예: 물 2L 마시기"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddHabit();
              }
            }}
            className="habit-input"
          />
          <button className="habit-add-button" onClick={handleAddHabit}>
            추가
          </button>
        </div>

        <div className="habit-list-box">
          {habitList.length === 0 ? (
            <p className="habit-empty-text">아직 등록된 습관이 없습니다.</p>
          ) : (
            habitList.map((habit) => (
              <div className="habit-item" key={habit}>
                <span>{habit}</span>
                <button
                  className="habit-delete-button"
                  onClick={() => handleRemoveHabit(habit)}
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>

        <div className="habit-setup-bottom">
          {onCancel && (
            <button className="habit-cancel-button" onClick={onCancel}>
              취소
            </button>
          )}
          <button className="habit-save-button" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default HabitSetup;