const API_URL =
    "https://chatsapp-kwqy.onrender.com";


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
"https://chatsapp-kwqy.onrender.com",
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
// CREATE UNIQUE ROOM ID USING EMAIL
// ==========================================

function createRoomId(
email1,
email2
) {

const emails = [
    email1.toLowerCase().trim(),
    email2.toLowerCase().trim()
].sort();

return `personal_${emails[0]}_${emails[1]}`;

}

// ==========================================
// CHECK USER BY EMAIL
// ==========================================

async function checkUserByEmail(email) {

try {

    const response =
        await fetch(
            `${API_URL}/api/users/check-email?email=${encodeURIComponent(email)}`
        );

    const data =
        await response.json();

    if (!response.ok) {

        console.error(
            "User verification failed:",
            data.message
        );

        return null;
    }

    return data.user;

} catch (error) {

    console.error(
        "Check User Email Error:",
        error
    );

    return null;

}

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

    displayMessage(
        message
    );

    scrollToBottom();

}


);

// ==========================================
// RECEIVE GROUP MESSAGE
// ==========================================

socketIO.on(
"group_message",
function (message) {


    console.log(
        "Group message received:",
        message
    );

    displayGroupMessage(
        message
    );

    scrollToBottom();

}


);

// ==========================================
// RECEIVE PERSONAL MEDIA
// ==========================================

socketIO.on(
"new_media",
function (media) {

    console.log(
        "Personal media received:",
        media
    );

    displayMediaMessage(
        media
    );

    scrollToBottom();

}

);

// ==========================================
// RECEIVE GROUP MEDIA
// ==========================================

socketIO.on(
"group_media",
function (media) {


    console.log(
        "Group media received:",
        media
    );

    displayGroupMediaMessage(
        media
    );

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

const attachmentBtn =
document.getElementById(
"attachmentBtn"
);

const mediaInput =
document.getElementById(
"mediaInput"
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
                `${API_URL}/api/users/all`
            );

        const data =
            await response.json();

        usersList.innerHTML =
            "";

        data.users.forEach(
            function (user) {

                // Hide only logged-in user
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
// OPEN PERSONAL CHAT
// ==========================================

async function openChat(user) {


selectedUser =
    user;

selectedGroup =
    null;

// ==========================================
// VERIFY USER EMAIL FROM DATABASE
// ==========================================

const verifiedUser =
    await checkUserByEmail(
        selectedUser.email
    );

if (!verifiedUser) {

    alert(
        "User with this email does not exist"
    );

    selectedUser =
        null;

    return;

}

// Use verified user from database

selectedUser =
    verifiedUser;


// ==========================================
// CREATE PERSONAL ROOM ID
// ==========================================

const roomId =
    createRoomId(
        currentUser.email,
        selectedUser.email
    );

console.log(
    "Personal room ID:",
    roomId
);


// ==========================================
// JOIN PERSONAL ROOM
// ==========================================

joinPersonalChat(
    roomId
);


// ==========================================
// UPDATE CHAT HEADER
// ==========================================

chatName.textContent =
    selectedUser.name;

chatAvatar.textContent =
    selectedUser.name
        .charAt(0)
        .toUpperCase();

chatStatus.textContent =
    "offline";


// ==========================================
// LOAD OLD MESSAGES
// ==========================================

await loadMessages();

messageInput.focus();


}

// ==========================================
// LOAD OLD PERSONAL MESSAGES
// ==========================================

async function loadMessages() {


if (!selectedUser) {

    return;

}

try {

    const response =
        await fetch(
            `${API_URL}/api/messages?user1=${currentUser.id}&user2=${selectedUser.id}`
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


    // ==========================================
    // DISPLAY TEXT + MEDIA MESSAGES
    // ==========================================

    data.messages.forEach(
        function (message) {

            if (
                message.type ===
                "media"
            ) {

                displayMediaMessage(
                    message
                );

            } else {

                displayMessage(
                    message
                );

            }

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
// DISPLAY PERSONAL TEXT MESSAGE
// ==========================================

function displayMessage(
message
) {


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
// DISPLAY PERSONAL MEDIA
// ==========================================

function displayMediaMessage(
media
) {

if (!selectedUser) {

    return;

}


// ==========================================
// CHECK PERSONAL CHAT
// ==========================================

const senderId =
    Number(
        media.senderId
    );

const receiverId =
    Number(
        media.receiverId
    );

const currentUserId =
    Number(
        currentUser.id
    );

const selectedUserId =
    Number(
        selectedUser.id
    );


const isCurrentChat =
    (
        senderId ===
        currentUserId

        &&

        receiverId ===
        selectedUserId
    )

    ||

    (
        senderId ===
        selectedUserId

        &&

        receiverId ===
        currentUserId
    );


if (!isCurrentChat) {

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


// ==========================================
// CHECK MY MESSAGE
// ==========================================

const isMyMessage =
    senderId ===
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
// IMAGE
// ==========================================

if (
    media.mimeType &&
    media.mimeType.startsWith(
        "image/"
    )
) {

    const link =
        document.createElement(
            "a"
        );

    link.href =
        media.url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";


    const image =
        document.createElement(
            "img"
        );

    image.src =
        media.url;

    image.alt =
        media.fileName ||
        "Shared image";

    image.style.maxWidth =
        "250px";

    image.style.borderRadius =
        "10px";

    image.style.display =
        "block";

    image.style.cursor =
        "pointer";

    link.appendChild(
        image
    );

    bubble.appendChild(
        link
    );

}


// ==========================================
// VIDEO
// ==========================================

else if (
    media.mimeType &&
    media.mimeType.startsWith(
        "video/"
    )
) {

    const video =
        document.createElement(
            "video"
        );

    video.src =
        media.url;

    video.controls =
        true;

    video.style.maxWidth =
        "300px";

    video.style.borderRadius =
        "10px";

    bubble.appendChild(
        video
    );

}


// ==========================================
// OTHER FILE
// ==========================================

else {

    const link =
        document.createElement(
            "a"
        );

    link.href =
        media.url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.textContent =
        media.fileName ||
        "Open file";

    bubble.appendChild(
        link
    );

}


// ==========================================
// TIME
// ==========================================

const time =
    document.createElement(
        "span"
    );

time.className =
    "message-time";

const messageDate =
    new Date(
        media.createdAt
    );

time.textContent =
    messageDate.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


if (isMyMessage) {

    time.textContent +=
        " ✓✓";

}


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
// DISPLAY GROUP MEDIA
// ==========================================

function displayGroupMediaMessage(
media
) {


if (!selectedGroup) {

    return;

}


// ==========================================
// CHECK CURRENT GROUP
// ==========================================

if (
    Number(media.groupId) !==
    Number(selectedGroup.id)
) {

    return;

}


const messageWrapper =
    document.createElement(
        "div"
    );

const bubble =
    document.createElement(
        "div"
    );


// ==========================================
// CHECK MY MESSAGE
// ==========================================

const isMyMessage =
    Number(media.senderId) ===
    Number(currentUser.id);


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
// IMAGE
// ==========================================

if (
    media.mimeType &&
    media.mimeType.startsWith(
        "image/"
    )
) {

    const link =
        document.createElement(
            "a"
        );

    link.href =
        media.url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";


    const image =
        document.createElement(
            "img"
        );

    image.src =
        media.url;

    image.alt =
        media.fileName ||
        "Shared image";

    image.style.maxWidth =
        "250px";

    image.style.borderRadius =
        "10px";

    image.style.display =
        "block";

    image.style.cursor =
        "pointer";

    link.appendChild(
        image
    );

    bubble.appendChild(
        link
    );

}


// ==========================================
// VIDEO
// ==========================================

else if (
    media.mimeType &&
    media.mimeType.startsWith(
        "video/"
    )
) {

    const video =
        document.createElement(
            "video"
        );

    video.src =
        media.url;

    video.controls =
        true;

    video.style.maxWidth =
        "300px";

    video.style.borderRadius =
        "10px";

    bubble.appendChild(
        video
    );

}


// ==========================================
// OTHER FILE
// ==========================================

else {

    const link =
        document.createElement(
            "a"
        );

    link.href =
        media.url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.textContent =
        media.fileName ||
        "Open file";

    bubble.appendChild(
        link
    );

}


// ==========================================
// TIME
// ==========================================

const time =
    document.createElement(
        "span"
    );

time.className =
    "message-time";

const messageDate =
    new Date(
        media.createdAt
    );

time.textContent =
    messageDate.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


if (isMyMessage) {

    time.textContent +=
        " ✓✓";

}


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
// DISPLAY GROUP MESSAGE
// ==========================================

function displayGroupMessage(
message
) {


if (!selectedGroup) {

    return;

}


// ==========================================
// CHECK CURRENT GROUP
// ==========================================

if (
    Number(message.groupId) !==
    Number(selectedGroup.id)
) {

    return;

}


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
    Number(message.senderId) ===
    Number(currentUser.id);


console.log(
    "GROUP DEBUG => senderId:",
    Number(message.senderId),
    "currentUserId:",
    Number(currentUser.id),
    "isMyMessage:",
    isMyMessage
);


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


// ==========================================
// GROUP CHAT
// ==========================================

if (selectedGroup) {

    socketIO.emit(
        "group_message",
        {
            groupId:
                selectedGroup.id,

            message:
                message
        }
    );

    console.log(
        "Group message sent:",
        message
    );

    messageInput.value =
        "";

    messageInput.focus();

    return;

}


// ==========================================
// PERSONAL CHAT
// ==========================================

if (!selectedUser) {

    alert(
        "Please select a user first"
    );

    return;

}


if (!currentRoomId) {

    alert(
        "Please open a chat first"
    );

    return;

}


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
// MEDIA UPLOAD
// ==========================================

attachmentBtn.addEventListener(
"click",
function () {

    if (
        !selectedUser &&
        !selectedGroup
    ) {

        alert(
            "Please select a chat first"
        );

        return;

    }

    mediaInput.click();

}


);

// ==========================================
// SELECT MEDIA FILE
// ==========================================

mediaInput.addEventListener(
"change",
async function () {


    const file =
        this.files[0];

    if (!file) {

        return;

    }

    await uploadMedia(
        file
    );

    // Reset file input

    mediaInput.value =
        "";

}

);

// ==========================================
// UPLOAD MEDIA TO SERVER
// ==========================================

async function uploadMedia(
file
) {

try {

    console.log(
        "Uploading media:",
        file.name
    );


    const formData =
        new FormData();


    // ==========================================
    // ADD FILE
    // ==========================================

    formData.append(
        "media",
        file
    );


    // ==========================================
    // PERSONAL CHAT
    // ==========================================

    if (selectedUser) {

        formData.append(
            "chatType",
            "personal"
        );

        formData.append(
            "roomId",
            currentRoomId
        );

        formData.append(
            "receiverId",
            selectedUser.id
        );

    }


    // ==========================================
    // GROUP CHAT
    // ==========================================

    if (selectedGroup) {

        formData.append(
            "chatType",
            "group"
        );

        formData.append(
            "roomId",
            selectedGroup.roomId
        );

        formData.append(
            "groupId",
            selectedGroup.id
        );

    }


    // ==========================================
    // SEND FILE TO BACKEND
    // ==========================================

    const response =
        await fetch(
            `${API_URL}/api/media/upload`,
            {

                method:
                    "POST",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    formData

            }
        );


    const data =
        await response.json();


    // ==========================================
    // CHECK RESPONSE
    // ==========================================

    if (!response.ok) {

        console.error(
            "Media upload failed:",
            data
        );

        alert(
            data.message ||
            "Media upload failed"
        );

        return;

    }


    console.log(
        "Media uploaded successfully:",
        data
    );

} catch (error) {

    console.error(
        "Media Upload Error:",
        error
    );

    alert(
        "Media upload failed"
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
// GROUP CHAT
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

const groupName =
document.getElementById(
"groupName"
);

const groupUsersList =
document.getElementById(
"groupUsersList"
);

const saveGroupBtn =
document.getElementById(
"saveGroupBtn"
);

const groupsList =
document.getElementById(
"groupsList"
);

// ==========================================
// SELECTED GROUP
// ==========================================

let selectedGroup =
null;

// ==========================================
// OPEN CREATE GROUP MODAL
// ==========================================

createGroupBtn.addEventListener(
"click",
function () {

    groupName.value =
        "";

    loadUsersForGroup();

    groupModal.classList.add(
        "show"
    );

}


);

// ==========================================
// CLOSE GROUP MODAL
// ==========================================

closeModal.addEventListener(
"click",
function () {


    groupModal.classList.remove(
        "show"
    );

}


);

// ==========================================
// LOAD USERS FOR GROUP
// ==========================================

async function loadUsersForGroup() {


try {

    const response =
        await fetch(
             `${API_URL}/api/users/all`
        );

    const data =
        await response.json();

    const users =
        data.users || [];


    groupUsersList.innerHTML =
        "";


    users.forEach(
        function (user) {

            // Don't show current user

            if (
                Number(user.id) ===
                Number(currentUser.id)
            ) {

                return;

            }


            const userItem =
                document.createElement(
                    "label"
                );

            userItem.className =
                "group-user-item";


            userItem.innerHTML = `

                <input
                    type="checkbox"
                    value="${user.id}"
                >

                <span>
                    ${user.name}
                </span>

            `;


            groupUsersList.appendChild(
                userItem
            );

        }
    );

} catch (error) {

    console.error(
        "Load Group Users Error:",
        error
    );

}


}

// ==========================================
// CREATE GROUP
// ==========================================

saveGroupBtn.addEventListener(
"click",
async function () {


    const name =
        groupName.value.trim();


    if (!name) {

        alert(
            "Please enter group name"
        );

        return;

    }


    // Get selected users

    const checkedUsers =
        groupUsersList.querySelectorAll(
            'input[type="checkbox"]:checked'
        );


    if (
        checkedUsers.length ===
        0
    ) {

        alert(
            "Please select at least one user"
        );

        return;

    }


    const userIds =
        Array.from(
            checkedUsers
        ).map(
            function (checkbox) {

                return Number(
                    checkbox.value
                );

            }
        );


    try {

        const response =
            await fetch(
                    `${API_URL}/api/groups`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            userIds:
                                userIds

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to create group"
            );

            return;

        }


        console.log(
            "Group created:",
            data.group
        );


        // Close modal

        groupModal.classList.remove(
            "show"
        );


        // Clear form

        groupName.value =
            "";


        // Reload groups

        loadGroups();


        alert(
            "Group created successfully"
        );


    } catch (error) {

        console.error(
            "Create Group Error:",
            error
        );

        alert(
            "Server error"
        );

    }

}


);

// ==========================================
// LOAD USER GROUPS
// ==========================================

async function loadGroups() {

try {

    const response =
        await fetch(
               `${API_URL}/api/groups`,
            {

                method:
                    "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            data.message
        );

        return;

    }


    groupsList.innerHTML =
        "";


    data.groups.forEach(
        function (group) {

            const groupItem =
                document.createElement(
                    "div"
                );


            groupItem.className =
                "user-item";


            groupItem.innerHTML = `

                <div class="avatar">

                    ${group.name
                        .charAt(0)
                        .toUpperCase()}

                </div>

                <div>
                    ${group.name}
                </div>

            `;


            groupItem.addEventListener(
                "click",
                function () {

                    openGroupChat(
                        group
                    );

                }
            );


            groupsList.appendChild(
                groupItem
            );

        }
    );


} catch (error) {

    console.error(
        "Load Groups Error:",
        error
    );

}


}

// ==========================================
// LOAD GROUP MESSAGES
// ==========================================

async function loadGroupMessages(
groupId
) {


try {

    console.log(
        "Loading group messages:",
        groupId
    );


    const response =
        await fetch(
             `${API_URL}/api/groups/${groupId}/messages`,
            {
                method:
                    "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    const data =
        await response.json();


    console.log(
        "Group messages response:",
        data
    );


    if (!response.ok) {

        console.error(
            "Load Group Messages Error:",
            data.message
        );

        return;

    }


    // ==========================================
    // CLEAR CHAT
    // ==========================================

    chatMessages.innerHTML =
        "";


    // ==========================================
    // NO MESSAGES
    // ==========================================

    if (
        !data.messages ||
        data.messages.length === 0
    ) {

        chatMessages.innerHTML = `

            <div class="select-chat">

                <h2>
                    ${selectedGroup.name}
                </h2>

                <p>
                    No messages yet
                </p>

            </div>

        `;

        return;

    }


    // ==========================================
    // DISPLAY OLD GROUP MESSAGES
    // ==========================================

    data.messages.forEach(
        function (message) {

            if (
                message.type ===
                "media"
            ) {

                displayGroupMediaMessage(
                    message
                );

            } else {

                displayGroupMessage(
                    message
                );

            }

        }
    );


    // ==========================================
    // SCROLL TO BOTTOM
    // ==========================================

    scrollToBottom();


} catch (error) {

    console.error(
        "Load Group Messages Error:",
        error
    );

}


}

// ==========================================
// OPEN GROUP CHAT
// ==========================================

function openGroupChat(
group
) {


console.log(
    "Opening group:",
    group
);


// ==========================================
// SET GROUP
// ==========================================

selectedGroup =
    group;

selectedUser =
    null;


// ==========================================
// UPDATE HEADER
// ==========================================

chatName.textContent =
    group.name;

chatAvatar.textContent =
    group.name
        .charAt(0)
        .toUpperCase();

chatStatus.textContent =
    "Group";


// ==========================================
// JOIN SOCKET.IO GROUP
// ==========================================

socketIO.emit(
    "join_group",
    group.id
);


// ==========================================
// SET CURRENT ROOM
// ==========================================

currentRoomId =
    group.roomId;


// ==========================================
// LOAD OLD GROUP MESSAGES
// ==========================================

loadGroupMessages(
    group.id
);


console.log(
    "Joined group room:",
    group.roomId
);


messageInput.focus();


}

// ==========================================
// START APPLICATION
// ==========================================

loadUsers();

loadGroups();