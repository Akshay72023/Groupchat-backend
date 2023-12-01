const signupBtn=document.getElementById('signup-btn');
signupBtn.addEventListener('click',
        async function(e){
          try{ 
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const phonenum= document.getElementById('phonenum').value;
            const password = document.getElementById('password').value;
            const userDetails={
                username,
                email,
                phonenum,
                password
            }
            console.log(userDetails);
            const response= await axios.post('http://localhost:5000/user/signup',userDetails);
            console.log(response);
            if (response.status === 201) {
                alert(response.data.message);
                window.location.href = '../login/login.html';
            }
        }
        catch (error) {
            if (error.response.status === 400 && error.response.data.err === 'User already exists') {
                alert(error.response.data.err);
            } else {
                console.error(error);
                document.body.innerHTML += `<div >Error: ${error.message} <div>`;
            }
        }    
});

//--------handling socketIO----------------//
const socket = io('http://localhost:8000');

socket.on('connect',()=>{
    console.log("Connected to server with socket id :",socket.id);
})


    