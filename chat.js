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
// SOCKET.IO CONNECTION
// ==========================================

const token =
    localStorage.getItem("token");

const socketIO =
    io(
        "http://localhost:3000",
        {
            auth: {
                token: token
            }
        }
    );


// ==========================================
// SOCKET.IO CONNECT
// ==========================================

socketIO.on(
    "connect",
    function () {

        console.log(
            "Socket.IO connected:",
            socketIO.id
        );

    }
);


// ==========================================
// SOCKET.IO CONNECTION ERROR
// ==========================================

socketIO.on(
    "connect_error",
    function (error) {

        console.error(
            "Socket.IO connection error:",
            error.message
        );

    }
);


// ==========================================
// PERSONAL CHAT
// ==========================================

let currentRoomId = null;


// ==========================================
// CREATE UNIQUE ROOM ID
// ==========================================

function createRoomId(
    user1,
    user2
) {

    const ids = [
        Number(user1),
        Number(user2)
    ].sort(
        function (a, b) {
            return a - b;
        }
    );

    return `personal_${ids[0]}_${ids[1]}`;
}


// ==========================================
// JOIN PERSONAL CHAT ROOM
// ==========================================

function joinPersonalChat(
    roomId
) {

    socketIO.emit(
        "join_room",
        roomId
    );

    currentRoomId =
        roomId;

    console.log(
        "Joined personal chat room:",
        roomId
    );

}


// ==========================================
// RECEIVE PERSONAL MESSAGE
// ==========================================

socketIO.on(
    "new_message",
    function (message) {

        console.log(
            "Socket.IO message received:",
            message
        );


        // Display message
        displayMessage(
            message
        );


        // Scroll chat
        scrollToBottom();

    }
);


// ==========================================
// ELEMENTS
// ==========================================

const myName =
    document.getElementById(
        "myName"
    );

const myAvatar =
    document.getElementById(
        "myAvatar"
    );

const usersList =
    document.getElementById(
        "usersList"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const chatName =
    document.getElementById(
        "chatName"
    );

const chatAvatar =
    document.getElementById(
        "chatAvatar"
    );

const chatStatus =
    document.getElementById(
        "chatStatus"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendBtn =
    document.getElementById(
        "sendBtn"
    );


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
// LOAD USERS
// ==========================================

async function loadUsers() {

    try {

        const response =
            await fetch(
                "/api/users/all"
            );


        const data =
            await response.json();


        usersList.innerHTML =
            "";


        data.users.forEach(
            function (user) {

                // Don't show logged-in user

                if (
                    Number(user.id) ===
                    Number(currentUser.id)
                ) {

                    return;

                }


                const userItem =
                    document.createElement(
                        "div"
                    );


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


                // Open chat

                userItem.addEventListener(
                    "click",
                    function () {

                        openChat(
                            user
                        );

                    }
                );


                usersList.appendChild(
                    userItem
                );

            }
        );


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

async function openChat(
    user
) {

    // Select user

    selectedUser =
        user;


    // ==========================================
    // CREATE ROOM ID
    // ==========================================

    const roomId =
        createRoomId(
            currentUser.id,
            selectedUser.id
        );


    console.log(
        "Personal room ID:",
        roomId
    );


    // ==========================================
    // JOIN ROOM
    // ==========================================

    joinPersonalChat(
        roomId
    );


    // ==========================================
    // HEADER
    // ==========================================

    chatName.textContent =
        user.name;


    chatAvatar.textContent =
        user.name
            .charAt(0)
            .toUpperCase();


    chatStatus.textContent =
        "offline";


    // ==========================================
    // LOAD OLD MESSAGES
    // ==========================================

    await loadMessages();


    // ==========================================
    // FOCUS INPUT
    // ==========================================

    messageInput.focus();

}


// ==========================================
// LOAD OLD MESSAGES
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


        chatMessages.innerHTML =
            "";


        if (
            !data.messages ||
            data.messages.length === 0
        ) {

            const emptyMessage =
                document.createElement(
                    "div"
                );


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

function displayMessage(
    message
) {

    // Don't display message if
    // no chat is selected

    if (!selectedUser) {

        return;

    }


    const messageSenderId =
        Number(
            message.senderId
        );

    const messageReceiverId =
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


    // ==========================================
    // CHECK CURRENT CHAT
    // ==========================================

    const isCurrentChat =

        (
            messageSenderId ===
            currentUserId

            &&

            messageReceiverId ===
            selectedUserId
        )

        ||

        (
            messageSenderId ===
            selectedUserId

            &&

            messageReceiverId ===
            currentUserId
        );


    if (!isCurrentChat) {

        console.log(
            "Message belongs to another chat"
        );

        return;

    }


    // ==========================================
    // CREATE ELEMENTS
    // ==========================================

    const messageWrapper =
        document.createElement(
            "div"
        );

    const bubble =
        document.createElement(
            "div"
        );

    const text =
        document.createElement(
            "span"
        );

    const time =
        document.createElement(
            "span"
        );


    // ==========================================
    // CHECK MY MESSAGE
    // ==========================================

    const isMyMessage =
        messageSenderId ===
        currentUserId;


    // ==========================================
    // WRAPPER
    // ==========================================

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


    // ==========================================
    // BUBBLE
    // ==========================================

    bubble.className =
        "message-bubble";


    // ==========================================
    // MESSAGE TEXT
    // ==========================================

    text.className =
        "message-text";

    text.textContent =
        message.message;


    // ==========================================
    // TIME
    // ==========================================

    time.className =
        "message-time";


    const messageDate =
        new Date(
            message.createdAt
        );


    time.textContent =
        messageDate.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // ==========================================
    // DOUBLE TICK
    // ==========================================

    if (isMyMessage) {

        time.textContent +=
            " ✓✓";

    }


    // ==========================================
    // APPEND
    // ==========================================

    bubble.appendChild(
        text
    );

    bubble.appendChild(
        time
    );

    messageWrapper.appendChild(
        bubble
    );

    chatMessages.appendChild(
        messageWrapper
    );

}


// ==========================================
// SEND MESSAGE USING SOCKET.IO
// ==========================================

function sendMessage() {

    const message =
        messageInput.value.trim();


    // Empty message

    if (!message) {

        return;

    }


    // User not selected

    if (!selectedUser) {

        alert(
            "Please select a user first"
        );

        return;

    }


    // Room not joined

    if (!currentRoomId) {

        alert(
            "Please open a chat first"
        );

        return;

    }


    // ==========================================
    // SEND USING SOCKET.IO
    // ==========================================

    socketIO.emit(
        "new_message",
        {

            roomId:
                currentRoomId,

            senderId:
                currentUser.id,

            receiverId:
                selectedUser.id,

            message:
                message

        }
    );


    console.log(
        "Personal message sent:",
        message
    );


    // ==========================================
    // CLEAR INPUT
    // ==========================================

    messageInput.value =
        "";


    messageInput.focus();

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
// SEARCH USERS
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


        users.forEach(
            function (user) {

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

            }
        );

    }
);


// ==========================================
// SCROLL TO BOTTOM
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


if (
    createGroupBtn &&
    groupModal &&
    closeModal
) {

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

}


// ==========================================
// START APPLICATION
// ==========================================

loadUsers();