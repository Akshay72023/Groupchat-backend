const msgForm = document.querySelector('.msg-form');
const msgInput = document.getElementById('msg-input');
const promptDiv = document.querySelector('.prompt-div')

msgForm.addEventListener('submit',sendMessage);

async function sendMessage (e){
    e.preventDefault()
    if(msgInput.value === ''){
        window.alert('Nothing to send')
    }
    else{
        try{
            let token = localStorage.getItem('token')
            // making an obj with msg
            let obj = {msg : msgInput.value};
            // posting this msg
            let response = await axios.post('http://localhost:5000/chat/sendMsg',obj,{ headers:{ 'Authorization': token }});
            console.log(response)
            // displaying message on screen
            if(response.data.success){
                promptDiv.innerHTML = '<p class="success">Message Sent</p>'
                setTimeout(()=>promptDiv.innerHTML = '',1000)
                // clearing input
                msgInput.value = ''
            }
            else{
                promptDiv.innerHTML = '<p class="failure">Something Went Wrong</p>'
                setTimeout(()=>promptDiv.innerHTML = '',1000)
            }

        }
        catch(err){
            console.log(err)
        }

    }
}