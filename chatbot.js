/* =====================================================
   MESem3 AI CHATBOT
===================================================== */

(function () {

    const chatbotHTML = `
    
        <button id="mesem3-ai-button" aria-label="Open MESem3 AI">
            🤖
        </button>

        <div id="mesem3-ai-window">

            <div id="mesem3-ai-header">

                <div id="mesem3-ai-title">
                    🤖
                    <div>
                        <div>MESem3 AI</div>
                        <div id="mesem3-ai-status">
                            B.Tech M.E. 3rd Semester
                        </div>
                    </div>
                </div>

                <button id="mesem3-ai-close">
                    ×
                </button>

            </div>


            <div id="mesem3-ai-messages">

                <div class="mesem3-message ai">

                    <div class="mesem3-bubble">
                        👋 Hello! I'm MESem3 AI.

                        Ask me anything about your
                        B.Tech M.E. 3rd Semester.

                        You can ask me about:
                        • Engineering Mechanics
                        • Thermodynamics
                        • Fluid Mechanics
                        • Manufacturing
                        • Electronics
                        • Data Structures
                        • C Programming
                        • Mathematics
                        • Engineering Drawing
                        • English

                        How can I help you?
                    </div>

                </div>

            </div>


            <div id="mesem3-ai-quick">

                <button class="mesem3-quick-btn"
                    data-question="Explain Engineering Mechanics II in simple language">
                    Mechanics
                </button>

                <button class="mesem3-quick-btn"
                    data-question="Give important Applied Thermodynamics topics for exam">
                    Thermodynamics
                </button>

                <button class="mesem3-quick-btn"
                    data-question="Explain Fluid Mechanics important formulas">
                    Fluid
                </button>

                <button class="mesem3-quick-btn"
                    data-question="Give important Data Structures questions">
                    DSA
                </button>

            </div>


            <div id="mesem3-ai-input-area">

                <textarea
                    id="mesem3-ai-input"
                    rows="1"
                    placeholder="Ask your question..."
                ></textarea>

                <button id="mesem3-ai-send">
                    ➤
                </button>

            </div>

        </div>
    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        chatbotHTML
    );


    const button =
        document.getElementById("mesem3-ai-button");

    const windowBox =
        document.getElementById("mesem3-ai-window");

    const close =
        document.getElementById("mesem3-ai-close");

    const messages =
        document.getElementById("mesem3-ai-messages");

    const input =
        document.getElementById("mesem3-ai-input");

    const send =
        document.getElementById("mesem3-ai-send");


    let chatHistory = [];

    let isLoading = false;


    /* ============================
       OPEN / CLOSE
    ============================ */

    button.addEventListener("click", () => {

        const isOpen =
            windowBox.style.display === "flex";

        windowBox.style.display =
            isOpen ? "none" : "flex";

        if (!isOpen) {
            setTimeout(() => input.focus(), 100);
        }

    });


    close.addEventListener("click", () => {
        windowBox.style.display = "none";
    });


    /* ============================
       ADD MESSAGE
    ============================ */

    function addMessage(text, type) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            `mesem3-message ${type}`;

        const bubble =
            document.createElement("div");

        bubble.className =
            "mesem3-bubble";

        bubble.textContent = text;

        wrapper.appendChild(bubble);

        messages.appendChild(wrapper);

        messages.scrollTop =
            messages.scrollHeight;

        return bubble;
    }


    /* ============================
       TYPING INDICATOR
    ============================ */

    function showTyping() {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "mesem3-message ai";

        wrapper.id =
            "mesem3-typing-message";

        wrapper.innerHTML = `
            <div class="mesem3-bubble">
                <div class="mesem3-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messages.appendChild(wrapper);

        messages.scrollTop =
            messages.scrollHeight;
    }


    function removeTyping() {

        document
            .getElementById("mesem3-typing-message")
            ?.remove();

    }


    /* ============================
       SEND MESSAGE
    ============================ */

    async function sendMessage(customQuestion = null) {

        if (isLoading) return;


        const question =
            customQuestion ||
            input.value.trim();


        if (!question) return;


        input.value = "";


        addMessage(
            question,
            "user"
        );


        chatHistory.push({
            role: "user",
            content: question
        });


        isLoading = true;

        send.disabled = true;

        showTyping();


        try {

            const response =
                await fetch("/api/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        messages: chatHistory

                    })

                });


            const data =
                await response.json();


            removeTyping();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Something went wrong."
                );

            }


            const answer =
                data.answer ||
                "No answer received.";


            addMessage(
                answer,
                "ai"
            );


            chatHistory.push({
                role: "assistant",
                content: answer
            });


            /* Keep browser memory small */

            if (chatHistory.length > 12) {

                chatHistory =
                    chatHistory.slice(-12);

            }


        } catch (error) {

            removeTyping();

            console.error(error);

            addMessage(
                "❌ " +
                (error.message ||
                    "Unable to connect to AI."),
                "ai"
            );

        }


        isLoading = false;

        send.disabled = false;

        input.focus();

    }


    /* ============================
       SEND BUTTON
    ============================ */

    send.addEventListener(
        "click",
        () => sendMessage()
    );


    /* ============================
       ENTER KEY
    ============================ */

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    /* ============================
       QUICK QUESTIONS
    ============================ */

    document
        .querySelectorAll(".mesem3-quick-btn")
        .forEach((btn) => {

            btn.addEventListener(
                "click",
                () => {

                    const question =
                        btn.dataset.question;

                    sendMessage(question);

                }
            );

        });


})();
