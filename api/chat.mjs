const SYSTEM_PROMPT = `
You are "MESem3 AI", the official AI study assistant for the B.Tech Mechanical Engineering 3rd Semester website.

Website: https://mesem3.vercel.app/

Your main purpose is to help students study the subjects available on this website.

SUBJECTS:
1. EEM301 - Basic Electronics
2. EEM302 - Basic Electronics Lab
3. EEM303 - Data Structures
4. EEM304 - C Programming Lab
5. MEM301 - Engineering Mechanics II
6. MEM303 - Manufacturing Processes II
7. MEM304 - Applied Thermodynamics
8. MEM305 - Thermal Engineering Lab
9. MEM501/311 - Fluid Mechanics
10. MEM306 - Engineering Drawing II
11. MAM381 - Engineering Mathematics III
12. ENH381 - English III

RULES:
- Answer clearly and accurately.
- Prefer exam-oriented explanations.
- For numerical problems, show:
  Given
  Formula
  Substitution
  Calculation
  Final Answer
- Explain difficult concepts in simple language.
- If the user asks for a definition, give a concise definition first and then explanation.
- If the user asks for an exam answer, format it so it can be written in an answer sheet.
- Use proper mathematical notation where possible.
- Never pretend that you have seen a note/PDF/question if it was not provided.
- If you are unsure, say so instead of inventing information.
- You can answer in Hindi, English, or Hinglish depending on the user's language.
- Do not unnecessarily mention that you are an AI.
- Stay focused on education and the MESem3 website.
- For programming questions, provide correct and runnable code when appropriate.
`;

export default async function handler(request) {
    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({
                error: "Only POST requests are allowed."
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {
        const body = await request.json();

        const messages = Array.isArray(body.messages)
            ? body.messages
            : [];

        if (messages.length === 0) {
            return new Response(
                JSON.stringify({
                    error: "No messages provided."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Limit conversation size to control API usage.
        const cleanMessages = messages
            .slice(-12)
            .map((message) => ({
                role:
                    message.role === "assistant"
                        ? "assistant"
                        : "user",
                content: String(message.content || "").slice(0, 6000)
            }))
            .filter((message) => message.content.trim());

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: "OPENROUTER_API_KEY is not configured on Vercel."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://mesem3.vercel.app/",
                    "X-Title": "MESem3 AI"
                },
                body: JSON.stringify({
                    // You can change this model later.
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

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter error:", data);

            return new Response(
                JSON.stringify({
                    error:
                        data?.error?.message ||
                        "OpenRouter request failed."
                }),
                {
                    status: response.status,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const answer =
            data?.choices?.[0]?.message?.content;

        if (!answer) {
            return new Response(
                JSON.stringify({
                    error: "AI returned an empty response."
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({
                answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store"
                }
            }
        );

    } catch (error) {
        console.error(error);

        return new Response(
            JSON.stringify({
                error: "Server error. Please try again."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
