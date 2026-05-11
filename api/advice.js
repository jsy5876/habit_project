const MIN_RECORDED_DAYS = 7;

function getFallbackAdvice({
  bestHabit,
  worstHabit,
}) {
  if (bestHabit || worstHabit) {
    return `이번 달 가장 잘한 습관은 ${
      bestHabit || "아직 없어요"}, 가장 어려웠던 습관은 ${
      worstHabit || "아직 없어요"}예요. ${
      worstHabit || "어려운 습관"}는 목표를 더 작게 나눠서 시도해보세요. 꾸준함이 가장 중요하답니다!`
  }

  return "처음부터 완벽하게 하려고 하지 않아도 괜찮아요. 하루 한 번 기록하는 습관부터 천천히 시작해보세요!";
}

export async function POST(request) {

  let bestHabit = "";
  let worstHabit = "";

  try {
    const body = await request.json();

    const {
      year,
      month,
      recordedDays,
      successRate,
      bestHabit: parsedBestHabit,
      worstHabit: parsedWorstHabit,
      weeklyTrend,
      habits,
    } = body;

    bestHabit = parsedBestHabit;
    worstHabit = parsedWorstHabit;

    if (!Array.isArray(habits)) {
      return Response.json(
        { error: "habits 형식이 올바르지 않아요." },
        { status: 400 }
      );
    }

    if (habits.length === 0 || recordedDays < MIN_RECORDED_DAYS) {
      return Response.json(
        {
          error: `AI 조언은 최소 ${MIN_RECORDED_DAYS}일 이상 기록 후 사용할 수 있어요.`,
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API 키가 설정되지 않았어요." },
        { status: 500 }
      );
    }

    const prompt = `
사용자의 월간 습관 데이터를 보고 한국어로 짧고 자연스러운 조언을 작성해.
조건:
- 3문장 이내
- 과장 금지
- 데이터에 없는 내용 추측 금지
- 가장 어려운 습관을 더 쉽게 실천할 수 있는 구체적인 팁 1개 포함
- 응원 한 마디
- 말투는 부드럽고 간결하고 발랄하게

데이터:
- 연도: ${year}
- 월: ${month}
- 기록 일수: ${recordedDays}
- 성공률: ${successRate}%
- 가장 잘한 습관: ${bestHabit || "없음"}
- 가장 어려운 습관: ${worstHabit || "없음"}
- 최근 추세: ${weeklyTrend}
- 등록 습관 목록: ${habits.join(", ") || "없음"}
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );


    const geminiData = await geminiResponse.json();


    if (!geminiResponse.ok) {
        if (geminiResponse.status === 503) {
            return Response.json(
            { error: "현재 AI 요청이 많아요. 잠시 후 다시 시도해주세요.",
              advice: getFallbackAdvice({
                bestHabit,
                worstHabit,
              }),
              fallback: true,
            },
            { status: 503 }
          );
        }

        if (geminiResponse.status === 429) {
            return Response.json(
            { error: "AI 사용 한도를 초과했어요. 30초 후 다시 시도해주세요.",
              advice: getFallbackAdvice({
                bestHabit,
                worstHabit,
              }),
              fallback: true,
            },
            { status: 429 }
          );
        }

        return Response.json(
            { error: geminiData.error?.message || "Gemini 호출 실패" },
            { status: geminiResponse.status }
        );
    }

    const advice =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "응답이 비어 있어요.";

    return Response.json({
      advice,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "AI 조언 생성 실패",
        advice: getFallbackAdvice({
          bestHabit,
            worstHabit,
        }),
        fallback: true,
      },
      { status: 500 }
    );
  }
}