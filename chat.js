const userData =
    localStorage.getItem("user");


// ==========================================
// LOGIN CHECK
// ==========================================

if (!userData) {

    window.location.href =
        "login.html";

}


const currentUser =
    JSON.parse(userData);



    // ==========================================
// WEBSOCKET
// ==========================================

let socket = null;


function connectWebSocket() {

    const protocol =
        window.location.protocol === "https:"
            ? "wss://"
            : "ws://";


    socket =
        new WebSocket(
            protocol +
            window.location.host
        );


    // ==========================================
    // CONNECTION OPEN
    // ==========================================

    socket.addEventListener(
        "open",
        function () {

            console.log(
                "WebSocket connected"
            );


            // Register current user
            socket.send(
                JSON.stringify({

                    type: "register",

                    userId:
                        currentUser.id

                })
            );

        }
    );


   // ==========================================
// RECEIVE LIVE MESSAGE
// ==========================================

socket.addEventListener(
    "message",
    function (event) {

        console.log(
            "================================="
        );

        console.log(
            "WEBSOCKET MESSAGE RECEIVED"
        );

        console.log(
            "Raw data:",
            event.data
        );


        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "Parsed data:",
                data
            );


            // ==========================================
            // CHECK MESSAGE TYPE
            // ==========================================

            if (
                data.type !==
                "new_message"
            ) {

                console.log(
                    "Unknown WebSocket message type:",
                    data.type
                );

                return;

            }


            const message =
                data.message;


            console.log(
                "Live message object:",
                message
            );


            // ==========================================
            // CURRENT USER
            // ==========================================

            console.log(
                "Current user ID:",
                currentUser.id
            );


            // ==========================================
            // SELECTED USER
            // ==========================================

            console.log(
                "Selected user:",
                selectedUser
            );


            if (!selectedUser) {

                console.log(
                    "No chat is currently selected"
                );

                return;

            }


            // ==========================================
            // CONVERT IDs TO NUMBER
            // ==========================================

            const senderId =
                Number(
                    message.senderId
                );

            const receiverId =
                Number(
                    message.receiverId
                );

            const currentUserId =
                Number(
                    currentUser.id
                );

            const selectedUserId =
                Number(
                    selectedUser.id
                );


            console.log(
                "senderId:",
                senderId
            );

            console.log(
                "receiverId:",
                receiverId
            );

            console.log(
                "currentUserId:",
                currentUserId
            );

            console.log(
                "selectedUserId:",
                selectedUserId
            );


            // ==========================================
            // CHECK CURRENT CHAT
            // ==========================================

            const isCurrentChat =

                senderId ===
                    selectedUserId

                &&

                receiverId ===
                    currentUserId;


            console.log(
                "Is current chat:",
                isCurrentChat
            );


            if (!isCurrentChat) {

                console.log(
                    "Message is not for currently selected chat"
                );

                return;

            }


            // ==========================================
            // DISPLAY MESSAGE
            // ==========================================

            displayMessage(
                message
            );


            scrollToBottom();


            console.log(
                "LIVE MESSAGE DISPLAYED SUCCESSFULLY"
            );


            console.log(
                "================================="
            );


        } catch (error) {

            console.error(
                "WebSocket Receive Error:",
                error
            );

        }

    }
);
    // ==========================================
    // CONNECTION CLOSED
    // ==========================================

    socket.addEventListener(
        "close",
        function () {

            console.log(
                "WebSocket disconnected"
            );


            // Try to reconnect
            setTimeout(
                connectWebSocket,
                2000
            );

        }
    );


    // ==========================================
    // CONNECTION ERROR
    // ==========================================

    socket.addEventListener(
        "error",
        function (error) {

            console.error(
                "WebSocket Error:",
                error
            );

        }
    );

}

// ==========================================
// ELEMENTS
// ==========================================

const myName =
    document.getElementById("myName");

const myAvatar =
    document.getElementById("myAvatar");

const usersList =
    document.getElementById("usersList");

const searchInput =
    document.getElementById("searchInput");

const chatName =
    document.getElementById("chatName");

const chatAvatar =
    document.getElementById("chatAvatar");

const chatStatus =
    document.getElementById("chatStatus");

const chatMessages =
    document.getElementById("chatMessages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");


// ==========================================
// SHOW CURRENT USER
// ==========================================

myName.textContent =
    currentUser.name;

myAvatar.textContent =
    currentUser.name
        .charAt(0)
        .toUpperCase();


// ==========================================
// SELECTED USER
// ==========================================

let selectedUser = null;

// ==========================================
// START WEBSOCKET
// ==========================================

connectWebSocket();

// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    try {

        const response =
            await fetch("/api/users/all");


        const data =
            await response.json();


        usersList.innerHTML = "";


        data.users.forEach(function (user) {


            // Don't show logged-in user

            if (
                Number(user.id) ===
                Number(currentUser.id)
            ) {

                return;

            }


            const userItem =
                document.createElement("div");


            userItem.className =
                "user-item";


            userItem.dataset.name =
                user.name;

            userItem.dataset.email =
                user.email;


            userItem.innerHTML = `

                <div class="avatar">

                    ${user.name
                        .charAt(0)
                        .toUpperCase()}

                </div>

                <div class="user-info">

                    <h4>
                        ${user.name}
                    </h4>

                    <p>
                        ${user.email}
                    </p>

                </div>

            `;


            // Click user

            userItem.addEventListener(
                "click",
                function () {

                    openChat(user);

                }
            );


            usersList.appendChild(
                userItem
            );

        });


    } catch (error) {

        console.error(
            "Load Users Error:",
            error
        );

    }

}


// ==========================================
// OPEN CHAT
// ==========================================

async function openChat(user) {

    selectedUser =
        user;


    // Header

    chatName.textContent =
        user.name;


    chatAvatar.textContent =
        user.name
            .charAt(0)
            .toUpperCase();


    chatStatus.textContent =
        "offline";


    // Load messages

    await loadMessages();


// Focus input

    messageInput.focus();

}


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages() {

    if (!selectedUser) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/messages?user1=${currentUser.id}&user2=${selectedUser.id}`
            );


        const data =
            await response.json();


        chatMessages.innerHTML = "";


        if (
            !data.messages ||
            data.messages.length === 0
        ) {

            const emptyMessage =
                document.createElement("div");


            emptyMessage.className =
                "select-chat";


            emptyMessage.innerHTML = `

                <h2>
                    ${selectedUser.name}
                </h2>

                <p>
                    No messages yet
                </p>

            `;


            chatMessages.appendChild(
                emptyMessage
            );


            return;

        }


        data.messages.forEach(
            function (message) {

                displayMessage(
                    message
                );

            }
        );


        scrollToBottom();


    } catch (error) {

        console.error(
            "Load Messages Error:",
            error
        );

    }

}


// ==========================================
// DISPLAY MESSAGE
// ==========================================
function displayMessage(message) {

    const messageWrapper =
        document.createElement("div");

    const bubble =
        document.createElement("div");

    const text =
        document.createElement("span");

    const time =
        document.createElement("span");


    // Check sender

    const isMyMessage =
        Number(message.senderId) ===
        Number(currentUser.id);


    // Wrapper

    messageWrapper.className =
        "message-wrapper";


    if (isMyMessage) {

        messageWrapper.classList.add(
            "sent"
        );

    } else {

        messageWrapper.classList.add(
            "received"
        );

    }


    // Bubble

    bubble.className =
        "message-bubble";


    // Message text

    text.className =
        "message-text";

    text.textContent =
        message.message;


    // Time

    time.className =
        "message-time";


    const messageDate =
        new Date(message.createdAt);


    time.textContent =
        messageDate.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // Double tick for my messages

    if (isMyMessage) {

        time.textContent +=
            " ✓✓";

    }


    bubble.appendChild(text);

    bubble.appendChild(time);

    messageWrapper.appendChild(
        bubble
    );

    chatMessages.appendChild(
        messageWrapper
    );

}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {


    const message =
        messageInput.value.trim();


    if (!message) {
        return;
    }


    if (!selectedUser) {

        alert(
            "Please select a user first"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/messages",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        senderId:
                            currentUser.id,

                        receiverId:
                            selectedUser.id,

                        message:
                            message

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Message could not be sent"
            );

            return;

        }


        // Clear input

        messageInput.value = "";


        // Reload messages

        await loadMessages();


        messageInput.focus();


    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );

        alert(
            "Server error"
        );

    }

}


// ==========================================
// SEND BUTTON
// ==========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// ENTER TO SEND
// ==========================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        const search =
            this.value
                .toLowerCase()
                .trim();


        const users =
            document.querySelectorAll(
                ".user-item"
            );


        users.forEach(function (user) {

            const name =
                user.dataset.name
                    .toLowerCase();


            const email =
                user.dataset.email
                    .toLowerCase();


            if (
                name.includes(search) ||
                email.includes(search)
            ) {

                user.style.display =
                    "flex";

            } else {

                user.style.display =
                    "none";

            }

        });

    }
);


// ==========================================
// SCROLL
// ==========================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==========================================
// CREATE GROUP MODAL
// ==========================================

const createGroupBtn =
    document.getElementById(
        "createGroupBtn"
    );

const groupModal =
    document.getElementById(
        "groupModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );


createGroupBtn.addEventListener(
    "click",
    function () {

        groupModal.classList.add(
            "show"
        );

    }
);


closeModal.addEventListener(
    "click",
    function () {

        groupModal.classList.remove(
            "show"
        );

    }
);


// ==========================================
// START
// ==========================================

loadUsers();