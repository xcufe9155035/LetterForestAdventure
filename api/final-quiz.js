export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  try {
    const gasUrl = process.env.GAS_URL;

    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "getLogs",
        name: req.body.name || "",
        email: req.body.email || ""
      })
    });

    const result = await response.json();
    const logs = result.logs || [];

    const latest = {};

    logs.forEach(log => {
      if (log.event) {
        latest[log.event] = log;
      }
    });

    const level2 = latest.level2_complete || {};
    const level3 = latest.level3_complete || {};
    const level4 = latest.level4_complete || {};

    const quiz = [];

    if ((level2.score || 0) < 3) {
      quiz.push({
        type: "letter_order",
        question: ["G", "H", "?", "J", "K", "L"],
        answer: "I",
        options: ["I", "M", "F"]
      });
    }

    if ((level3.score || 0) < 5) {
      const wrong =
        level3.wrongQuestions &&
        level3.wrongQuestions.length > 0
          ? level3.wrongQuestions[0].correctWord
          : "rabbit";

      quiz.push({
        type: "listening_picture",
        word: wrong,
        answer: wrong,
        options: makeAnimalOptions(wrong)
      });
    }

    if ((level4.score || 0) < 5) {
      const wrong =
        level4.wrongQuestions &&
        level4.wrongQuestions.length > 0
          ? level4.wrongQuestions[0].correctAnswer
          : "goat";

      quiz.push({
        type: "initial_sound",
        word: wrong,
        answer: wrong,
        options: makeSoundOptions(wrong)
      });
    }

    while (quiz.length < 3) {
      quiz.push(defaultQuestions[quiz.length]);
    }

    return res.status(200).json({
      status: "success",
      source: "google_sheet_logs",
      quiz: quiz.slice(0, 3)
    });

  } catch (error) {
    console.error("final quiz error:", error);

    return res.status(200).json({
      status: "fallback",
      message: error.toString(),
      quiz: defaultQuestions
    });
  }
}

const defaultQuestions = [
  {
    type: "letter_order",
    question: ["G", "H", "?", "J", "K", "L"],
    answer: "I",
    options: ["I", "M", "F"]
  },
  {
    type: "listening_picture",
    word: "rabbit",
    answer: "rabbit",
    options: ["rabbit", "bear", "dog", "goat"]
  },
  {
    type: "initial_sound",
    word: "goat",
    answer: "goat",
    options: ["goat", "cat", "pig"]
  }
];

function makeAnimalOptions(answer) {
  const animals = [
    "bear", "dog", "goat", "pig", "bird", "duck",
    "horse", "rabbit", "cat", "elephant", "lion",
    "sheep", "chicken", "fish", "monkey", "tiger",
    "cow", "frog", "mouse", "turtle"
  ];

  return shuffle([
    answer,
    ...animals.filter(item => item !== answer).slice(0, 3)
  ]);
}

function makeSoundOptions(answer) {
  const pool = [
    "ant", "bat", "cat", "dog", "elf", "fan",
    "goat", "hat", "ink", "jam", "kite", "lip",
    "map", "net", "ox", "pig", "red", "sun",
    "top", "web"
  ];

  return shuffle([
    answer,
    ...pool.filter(item => item !== answer).slice(0, 2)
  ]);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}