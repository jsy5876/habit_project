import { getDateKey } from "./date";

export function getMonthlyReport(records, habits, currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dailyData = [];
  const habitCounts = {};

  habits.forEach((habit) => {
    habitCounts[habit] = 0;
  });

  let recordedDays = 0;
  let totalSuccessCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = getDateKey(year, month, day);
    const record = records[dateKey];
    const checkedHabits = record?.checkedHabits || [];
    const memo = record?.memo || "";

    const hasRecord =
      !!record && (memo.trim() !== "" || checkedHabits.length > 0);

    if (hasRecord) {
      recordedDays += 1;
    }

    checkedHabits.forEach((habit) => {
      if (habitCounts[habit] !== undefined) {
        habitCounts[habit] += 1;
      }
    });

    totalSuccessCount += checkedHabits.length;

    dailyData.push({
      day,
      count: checkedHabits.length,
    });
  }

  let bestHabit = "";
  let bestCount = -1;

  Object.entries(habitCounts).forEach(([habit, count]) => {
    if (count > bestCount) {
      bestHabit = habit;
      bestCount = count;
    }
  });

  let worstHabit = "";
  let worstCount = Number.MAX_SAFE_INTEGER;

  Object.entries(habitCounts).forEach(([habit, count]) => {
    if (count < worstCount) {
      worstHabit = habit;
      worstCount = count;
    }
  });

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
    
  const isFutureMonth = 
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  const endDay = isFutureMonth ? 0 : isCurrentMonth ? today.getDate() : daysInMonth;
  const availableData = dailyData.slice(0, endDay);

  //성공률
  const possibleTotal = endDay * habits.length;
  const successRate =
    possibleTotal === 0 ? 0 : Math.round((totalSuccessCount / possibleTotal) * 100);


  const recent7 = availableData.slice(-7);
  const previous7 = availableData.slice(-14, -7);

  const recent7Total = recent7.reduce((sum, item) => sum + item.count, 0);
  const previous7Total = previous7.reduce((sum, item) => sum + item.count, 0);



  let weeklyTrend = "";

  if (recent7Total === 0 && previous7Total === 0) {
    weeklyTrend = "최근 7일 데이터가 아직 많지 않아요.";
  } else if (previous7.length === 0) {
    weeklyTrend = "최근 7일 추세를 확인하는 중이에요.";
  } else if (recent7Total > previous7Total) {
    weeklyTrend = "최근 7일간 성공 횟수가 늘고 있어요!";
  } else if (recent7Total < previous7Total) {
    weeklyTrend = "최근 7일간 성공 횟수가 줄고 있어요!";
  } else {
    weeklyTrend = "최근 7일간 비슷한 흐름을 유지하고 있어요.";
  }

  return {
    year,
    month,
    recordedDays,
    successRate,
    dailyData,
    bestHabit,
    worstHabit,
    weeklyTrend,
  };
}

export function getRateMessage(rate) {
  if (rate >= 80) return "최고예요!";
  if (rate >= 60) return "잘했어요!";
  if (rate >= 40) return "조금만 더 힘내봐요!";
  return "노력이 필요해요!";
}

export function getAdviceText(report, habits) {
  if (habits.length === 0) {
    return "먼저 습관을 등록해 주세요. 습관을 등록하면 월간 결과지를 확인할 수 있어요.";
  }

  if (report.recordedDays === 0) {
    return "이번 달에는 아직 기록이 많지 않아요. 하루 한 줄 메모나 체크 1개부터 시작해 보세요.";
  }

  const { bestHabit, worstHabit } = report;


  }