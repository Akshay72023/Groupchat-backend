const submitBtn= document.getElementById('forgotpassword');
submitBtn.addEventListener('click',
        async function(e){
            try{
                e.preventDefault();
                const email= document.getElementById('email').value;
                const obj={
                    email
                }
                const response= await axios.post('http://16.16.27.246:5000/password/forgotpassword',obj);
                if(response.status === 200){
                    document.getElementById('message').textContent= 'Mail sent successfully';
                 } else {
                     throw new Error('Something went wrong!!!')
                 }
            }
            catch(error){
                console.log(response);
            }
});