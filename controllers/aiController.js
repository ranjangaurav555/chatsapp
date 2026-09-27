const { GoogleGenAI } =
    require("@google/genai");

const ai =
    new GoogleGenAI({
        apiKey:
            process.env.GEMINI_API_KEY
    });


// ==========================================
// AI SUGGESTIONS
// ==========================================

const getAISuggestions =
    async (req, res) => {

        try {

            const {
                type,
                message,
                draft,
                conversation
            } = req.body;


            // Check request type
            if (
                type !== "typing" &&
                type !== "reply"
            ) {

                return res.status(400).json({
                    message:
                        "Invalid AI suggestion type"
                });

            }


            // Check required message
            if (
                !message &&
                !draft
            ) {

                return res.status(400).json({
                    message:
                        "Message or draft is required"
                });

            }


            let prompt;


            // ==========================================
            // PREDICTIVE TYPING
            // ==========================================

            if (type === "typing") {

                prompt = `
You are an AI typing assistant inside a chat application.

The user is currently typing:

"${draft || ""}"

Suggest 3 short and natural ways to continue the message.

Rules:
- Suggestions must be relevant to what the user typed.
- Keep each suggestion very short.
- Do not repeat the complete message.
- Suggestions should feel natural in a real chat.
- Use casual language when appropriate.
- Do not add explanations.
- Return ONLY a JSON array of 3 strings.

Example:
["5 pm", "the office", "tomorrow"]
`;

            }


            // ==========================================
            // SMART REPLIES
            // ==========================================

            if (type === "reply") {

                prompt = `
You are an AI assistant inside a chat application.

The user received this message:

"${message}"

Generate 3 short replies that the user could naturally send.

Rules:
- Replies must directly relate to the incoming message.
- Keep replies short and conversational.
- Give different possible responses.
- Use natural everyday language.
- Do not explain the replies.
- Return ONLY a JSON array of 3 strings.

Example:
[
    "Yes, I'll be there.",
    "Running late, will join soon.",
    "Can we reschedule?"
]
`;

            }


            // ==========================================
            // CONVERSATION CONTEXT
            // ==========================================

            if (conversation) {

                prompt += `

Recent conversation context:

${conversation}

Use this context only to make the suggestions more relevant.
`;

            }


            // ==========================================
            // CALL GEMINI
            // ==========================================

        const interaction =
    await ai.interactions.create({

        model:
            "gemini-3.8-flash",

        input:
            prompt
    });

const aiText =
    interaction.output_text.trim();


            // ==========================================
            // PARSE AI RESPONSE
            // ==========================================

            let suggestions;

            try {

                suggestions =
                    JSON.parse(aiText);

            }
            catch (error) {

                console.log(
                    "AI returned non-JSON response:",
                    aiText
                );

                suggestions =
                    aiText
                        .replace(
                            /```json/g,
                            ""
                        )
                        .replace(
                            /```/g,
                            ""
                        )
                        .trim();

                suggestions =
                    JSON.parse(
                        suggestions
                    );
            }


            // ==========================================
            // SEND RESPONSE
            // ==========================================

            return res.status(200).json({

                success:
                    true,

                type:
                    type,

                suggestions:
                    suggestions.slice(0, 3)

            });

        }
        catch (error) {

            console.error(
                "Gemini AI Error:",
                error
            );

            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to generate AI suggestions"

            });

        }

    };


module.exports =
    {
        getAISuggestions
    };