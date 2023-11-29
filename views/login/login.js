const loginBtn= document.getElementById('login-btn');
loginBtn.addEventListener('click',
        async function(e){
            try{
            e.preventDefault();
            const email= document.getElementById('email').value;
            const password= document.getElementById('password').value;
            const loginDetails={
                email,
                password
            }
            const response= await axios.post('http://localhost:5000/user/login',loginDetails);
            console.log(response);
            if(response.status===200){
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username',response.data.username);
                localStorage.setItem('email',response.data.email);
                alert(response.data.message);
                window.location.href = '../chat/chat.html'

            }
            }
            catch(error){
                if(error.response.status===401){
                    alert(error.response.data.err);
                }
                if(error.response.status===404){
                    alert(error.response.data.err);
                }
            }
});