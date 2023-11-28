const msgForm = document.querySelector('.msg-form');
const msgInput = document.getElementById('msg-input');
const promptDiv = document.querySelector('.prompt-div');
const chatUl = document.querySelector('.chatUl');

msgForm.addEventListener('submit', sendMessage);

async function sendMessage(e) {
    e.preventDefault();
    if (msgInput.value === '') {
        window.alert('Nothing to send');
    } else {
        try {
            let token = localStorage.getItem('token');
            // Making an object with msg
            let obj = { msg: msgInput.value };
            // Posting this msg
            let response = await axios.post('http://localhost:5000/chat/sendMsg', obj, {
                headers: { 'Authorization': token }
            });
            console.log(response);
            // Displaying message on the screen
            if (response.data.success) {
                promptDiv.innerHTML = '<p class="success">Message Sent</p>';
                setTimeout(() => (promptDiv.innerHTML = ''), 1000);
                // Clearing input
                msgInput.value = '';
                // Reload messages after sending
                loadMsg();
            } else {
                promptDiv.innerHTML = '<p class="failure">Something Went Wrong</p>';
                setTimeout(() => (promptDiv.innerHTML = ''), 1000);
            }
        } catch (err) {
            console.log(err);
        }
    }
}

window.addEventListener('DOMContentLoaded', loadMsg);

async function loadMsg() {
    try {
        let response = await axios.get('http://localhost:5000/chat/getMsg');
        if (response.data.success) {
            // Clear existing messages before appending new ones
            chatUl.innerHTML = '';
            // Showing msg on display
            response.data.msgArray.forEach((msgObj) => {
                // Making an li
                let li = makeLi(msgObj.username, msgObj.message, msgObj.createdAt);
                // Appending li to ul
                chatUl.appendChild(li);
            });
        } else {
            // Showing error message on screen
            promptDiv.innerHTML = '<p class="failure">Something Went Wrong</p>';
            setTimeout(() => (promptDiv.innerHTML = ''), 1000);
        }
    } catch (err) {
        console.log(err);
    }
}

function makeLi(name, msg, createdAt) {
    let li = document.createElement('li');
    li.className = 'chatLi';
    li.innerText = `${name} - ${msg} (${createdAt})`;
    return li;
}

// Reload messages every 5 seconds
setInterval(loadMsg, 5000);
