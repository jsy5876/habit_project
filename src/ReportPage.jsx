import "./ReportPage.css";
import {
    getMonthlyReport,
    getRateMessage,
    getAdviceText,
} from "./utils/report";
import { formatDateKey } from "./utils/date";
import { useEffect, useState } from "react";

const MIN_RECORDED_DAYS = 7;
const CLIENT_DAILY_LIMIT = 5;
const COOLDOWN_SECONDS = 10;

function getAdviceKey(year, month) {
    return `ai-advice-${year}-${month + 1}`;
}

function getTodayKey() {
    return `ai-advice-count-${formatDateKey(new Date())}`;
}

function getClientDailyCount() {
    return Number(localStorage.getItem(getTodayKey()) || "0");
}

function increaseClientDailyCount() {
  const next = getClientDailyCount() + 1;
  localStorage.setItem(getTodayKey(), String(next));
  return next;
}

function LineChart({ data, maxValue }) {
    const width = 320;
    const height = 180;
    const padding = 28;

    const safeMax = Math.max(maxValue, 1);
    //점들 사이 가로간격
    const stepX =
        data.length > 1 ? (width - padding * 2) / (data.length -1) : 0;

    const points = data.map((item, index) => {
        const x = padding + stepX * index;
        const y =
            height - padding - (item.count / safeMax) * (height - padding * 2);
        return `${x},${y}`;
    });

    return (
        <div className="line-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} className="line-chart">
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    className="axis-line"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    className="axis-line"
                />

                <text x={10} y={padding + 4} className="axis-text">
                    {safeMax}
                </text>
                <text x={14} y={height - padding + 4} className="axis-text">
                    0
                </text>

                <polyline
                    fill="none"
                    points={points.join(" ")}
                    className="chart-line"
                />

                {data.map((item, index) => {
                    const x = padding + stepX * index;
                    const y =
                        height - padding - (item.count / safeMax) * (height - padding * 2);
                    
                    const showLabel = 
                        item.day === 1 ||
                        item.day % 5 === 0 ||
                        item.day === data.length;

                    return (
                        <g key={item.day}>
                            <circle cx={x} cy={y} r="3.5" className="chart-dot" />
                            {showLabel && (
                                <text
                                x={x}
                                y={height - 8}
                                textAnchor="middle"
                                className="axis-text"
                            >
                                {item.day}
                            </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="chart-caption">
                <span>가로: 날짜</span>
                <span>세로: 성공 횟수</span>
            </div>
        </div>
    );
}

function ReportPage({ currentDate, records, habits, onBack }) {
    const report = getMonthlyReport(records, habits, currentDate);
    const adviceText = getAdviceText(report, habits);
    const maxValue = Math.max(habits.length, 1);

    const [aiAdvice, setAiAdvice] = useState("");
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [aiError, setAiError] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [clientCount, setClientCount] = useState(() => getClientDailyCount());

    useEffect(() => {
        const savedAdvice = localStorage.getItem(
            getAdviceKey(report.year, report.month)
        );

        if (savedAdvice) {
            setAiAdvice(savedAdvice);
        } else {
            setAiAdvice("");
        }
    }, [report.year, report.month]);

    const hasEnoughData =
        habits.length > 0 && report.recordedDays >= MIN_RECORDED_DAYS;

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
        setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleGetAiAdvice = async () => {

        if (!hasEnoughData ) {
        setAiError(`AI 조언은 최소 ${MIN_RECORDED_DAYS}일 이상 기록 후 사용할 수 있어요.`);
        return;
        }

        if (loadingAdvice || cooldown > 0) {
        return;
        }

        if (clientCount >= CLIENT_DAILY_LIMIT) {
        setAiError(`오늘은 AI 조언을 ${CLIENT_DAILY_LIMIT}번까지 받을 수 있어요.`);
        return;
        }

        try {
        setLoadingAdvice(true);
        setAiError("");

        const response = await fetch("/api/advice", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            year: report.year,
            month: report.month + 1,
            recordedDays: report.recordedDays,
            successRate: report.successRate,
            bestHabit: report.bestHabit,
            worstHabit: report.worstHabit,
            weeklyTrend: report.weeklyTrend,
            habits,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setAiError(data.error || "AI 조언을 불러오지 못했어요.");
            return;
        }

        const newAdvice = data.advice || "";
        setAiAdvice(newAdvice);
        localStorage.setItem(
            getAdviceKey(report.year, report.month),
            newAdvice
        );

        const nextCount = increaseClientDailyCount();
        setClientCount(nextCount);
        setCooldown(COOLDOWN_SECONDS);
        } catch (error) {
        setAiError("네트워크 오류가 발생했어요.");
        } finally {
        setLoadingAdvice(false);
        }
    };


    return (
        <div className="report-screen">
            <div className="report-page">
                <div className="report-header">
                    <button className="back-button" onClick={onBack}>
                        뒤로
                    </button>
                    <h2>
                        {report.year}년 {report.month + 1}월 통계
                    </h2>
                </div>

                <div className="rate-message">
                    <p>{getRateMessage(report.successRate)}</p>

                </div>

                <div className="report-card">
                    <h3>주간 추세</h3>
                    <p>{report.weeklyTrend}</p>
                </div>

                <div className="report-card">
                    <h3>이번 달 요약</h3>
                    <p>총 기록한 일수: {report.recordedDays}일 </p>
                    <p>이번 달 성공률: {report.successRate}%</p>
                </div>

                <div className="report-card">
                    <h3>이번 달 습관 실행 추이</h3>
                    <LineChart data={report.dailyData} maxValue={maxValue} />
                </div>

                <div className="report-card">
                    {aiAdvice && (
                        <div className="advice-text">
                            <strong>TIP !</strong>
                            <p>{aiAdvice}</p>
                        </div>
                    )}

                    <button
                        className="habit-button"
                        onClick={handleGetAiAdvice}
                        disabled={
                            !hasEnoughData ||
                            loadingAdvice ||
                            cooldown > 0 ||
                            clientCount >= CLIENT_DAILY_LIMIT
                        }
                    > 
                        {!hasEnoughData
                            ? `AI 조언은 최소 ${MIN_RECORDED_DAYS}일 이상 기록한 뒤 사용할 수 있어요.`
                            :loadingAdvice
                            ? "조언 생성 중..."
                            : cooldown > 0
                            ? `${cooldown}초 후 다시 시도`
                            : "팁 확인하기"}
                    </button>

                    {aiError && <p>{aiError}</p>}

                    <p>
                        오늘 사용 횟수: {clientCount}/{CLIENT_DAILY_LIMIT}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ReportPage;