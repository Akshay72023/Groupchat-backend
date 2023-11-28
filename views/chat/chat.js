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
                chatUl.innerHTML = '';
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

async function loadMsg(){
    try{
        let oldMsgArray = JSON.parse(localStorage.getItem('oldMsgArray'));
        let lastMsgId;
        if(oldMsgArray === null){
            oldMsgArray = [];
            lastMsgId = 0;
        }
        else{
            lastMsgId = oldMsgArray[oldMsgArray.length - 1].id;
        }
        let response = await axios.get(`http://localhost:5000/chat/getNewMsg?lastMsgId=${lastMsgId}`);
        console.log(response);

        if(response.data.success){
            let msgArray = [...oldMsgArray,...response.data.newMsgArray]
            storeInLocalStorage(msgArray);
            chatUl.innerHTML = '';
            msgArray.forEach((msgObj)=>{
                let li = makeLi(msgObj.username, msgObj.message, msgObj.createdAt);
                chatUl.appendChild(li);
            });
        } else {
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

function storeInLocalStorage(msgArray){
    let slicedArray;
    if(msgArray.length <10){
        slicedArray = msgArray
    }
    else{
        slicedArray = msgArray.slice(msgArray.length - 10)
    }
    localStorage.setItem('oldMsgArray',JSON.stringify(slicedArray))
}

// Reload messages every 5 seconds
setInterval(loadMsg, 5000);
