export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  return res.status(200).json({
    status: "success",
    quiz: [
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
        word: "grape",
        answer: "goat",
        options: ["goat", "cat", "pig"]
      }
    ]
  });
}