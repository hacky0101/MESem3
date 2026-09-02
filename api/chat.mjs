const SYSTEM_PROMPT = `
You are MESem3 AI, an AI study assistant for B.Tech Mechanical Engineering 3rd Semester.

Website:
https://mesem3.vercel.app/

Help students with:
- Engineering Mechanics II
- Manufacturing Processes II
- Applied Thermodynamics
- Fluid Mechanics
- Engineering Drawing II
- Engineering Mathematics III
- Basic Electronics
- Data Structures
- C Programming
- Thermal Engineering Lab
- English

Rules:
1. Give accurate and clear answers.
2. For numerical problems use:
   Given
   Formula
   Substitution
   Calculation
   Final Answer
3. For exam questions, give an answer that a student can directly write in an exam.
4. Explain difficult concepts simply.
5. You can respond in English, Hindi or Hinglish.
6. Do not invent information.
7. Keep answers focused on the student's question.
8. Use proper formulas and units.
`;

export default async function handler(req, res) {

    // Only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Only POST requests are allowed."
        });
    }

    try {

        // Vercel Node.js automatically parses JSON body
        const body = req.body || {};

        const messages = Array.isArray(body.messages)
            ? body.messages
            : [];

        if (messages.length === 0) {
            return res.status(400).json({
                error: "No messages provided."
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {

            console.error(
                "OPENROUTER_API_KEY is missing"
            );

            return res.status(500).json({
                error: "OPENROUTER_API_KEY is not configured in Vercel."
            });
        }

        // Keep only recent messages
        const cleanMessages = messages
            .slice(-12)
            .map(message => ({
                role:
                    message.role === "assistant"
                        ? "assistant"
                        : "user",

                content:
                    String(message.content || "")
                        .slice(0, 6000)
            }))
            .filter(
                message =>
                    message.content.trim().length > 0
            );

        const openRouterResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",

                    "HTTP-Referer":
                        "https://mesem3.vercel.app/",

                    "X-Title":
                        "MESem3 AI"
                },

                body: JSON.stringify({

                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content: SYSTEM_PROMPT
                        },
                        ...cleanMessages
                    ],

                    temperature: 0.4,

                    max_tokens: 1500
                })
            }
        );

        const data =
            await openRouterResponse.json();

        console.log(
            "OpenRouter status:",
            openRouterResponse.status
        );

        if (!openRouterResponse.ok) {

            console.error(
                "OpenRouter error:",
                JSON.stringify(data)
            );

            return res.status(
                openRouterResponse.status
            ).json({
                error:
                    data?.error?.message ||
                    "OpenRouter API request failed."
            });
        }

        const answer =
            data?.choices?.[0]?.message?.content;

        if (!answer) {

            console.error(
                "No answer from OpenRouter:",
                JSON.stringify(data)
            );

            return res.status(502).json({
                error:
                    "AI returned an empty response."
            });
        }

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(
            "MESem3 AI ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Internal server error."
        });
    }
}
