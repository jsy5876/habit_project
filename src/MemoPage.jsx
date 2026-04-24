import { useEffect, useState } from "react";
import "./MemoPage.css";


function MemoPage({ selectedDate, record, habits, onSave, onBack }) {
    const [text, setText] = useState("");
  const [checkedHabits, setCheckedHabits] = useState([]);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const nextMemo = record?.memo || "";
    const nextCheckedHabits = record?.checkedHabits || [];

    setText(nextMemo);
    setCheckedHabits(nextCheckedHabits);

    const hasSavedData =
      nextMemo.trim() !== "" || nextCheckedHabits.length > 0;

    setIsEditing(!hasSavedData);
  }, [record, selectedDate]);

  const handleSave = () => {
    onSave({
      memo: text,
      checkedHabits,
    });
    setIsEditing(false);
  };

  const handleToggleHabit = (habit) => {
    setCheckedHabits((prev) =>
      prev.includes(habit)
        ? prev.filter((item) => item !== habit)
        : [...prev, habit]
    );
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="memo-screen">
      <div className="memo-page">
        <div className="memo-header">
          <button className="back-button" onClick={onBack}>
            나가기
          </button>
          <h2>{selectedDate ? formatDate(selectedDate) : ""}</h2>
        </div>

        <div className="memo-content">
          <h3 className="section-title">오늘은 어떤 일이 있었나요?</h3>

          {isEditing ? (
            <textarea
              className="memo-textarea"
              placeholder="자유롭게 적어주세요!"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <div className="memo-view-box">
              <p>{text || ""}</p>
            </div>
          )}

          <h3 className="section-title habit-section-title">오늘 실행한 습관</h3>

          {isEditing ? (
            <div className="habit-check-list">
              {habits.length === 0 ? (
                <p className="habit-empty-text">
                  등록된 습관이 없습니다. 달력에서 습관을 추가해 주세요.
                </p>
              ) : (
                habits.map((habit) => (
                  <label className="habit-check-item" key={habit}>
                    <input
                      type="checkbox"
                      checked={checkedHabits.includes(habit)}
                      onChange={() => handleToggleHabit(habit)}
                    />
                    <span>{habit}</span>
                  </label>
                ))
              )}
            </div>
          ) : (
            <div className="habit-view-box">
              {habits.length === 0 ? (
                <p className="habit-empty-text">
                  등록된 습관이 없습니다. 달력에서 습관을 추가해 주세요.
                </p>
              ) : (
                habits.map((habit) => (
                  <div className="habit-view-item" key={habit}>
                    <span>{checkedHabits.includes(habit) ? "✅" : "⬜"}</span>
                    <span>{habit}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="memo-bottom-buttons">
          {!isEditing && (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              수정
            </button>
          )}

          {isEditing && (
            <button className="save-button" onClick={handleSave}>
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemoPage;