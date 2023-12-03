const msgForm = document.querySelector('.msg-form');
const msgInput = document.getElementById('msg-input');
const promptDiv = document.querySelector('.prompt-div');
const chatUl = document.querySelector('.chatUl');
const groupUl = document.querySelector('.groupUl');
const createGroupBtn = document.querySelector('.createGroupBtn');
const createGroupForm = document.querySelector('#createGroupForm');
const createGrpNameInput = document.getElementById('createGroupName');
const groupInfo = document.querySelector('.groupInfo');
const addMemberBtn = document.querySelector('.addMemberBtn');
const addMemberForm = document.getElementById('addMemberForm');
const memberList = document.getElementById('memberList');
const usernameLi = document.getElementById('usernameLi');
const emailLi = document.getElementById('emailLi');
const showMemberBtn= document.querySelector('.showMemberBtn');
const sendImgForm = document.getElementById('sendImgForm');
const fileInput = document.getElementById('fileInp');

usernameLi.innerText = `User :: ${localStorage.getItem('username')}`
emailLi.innerText = `Email :: ${localStorage.getItem('email')}`

msgForm.addEventListener('submit', sendMessage);

const socket = io('http://13.49.225.119:8000')

async function sendMessage(e) {
    e.preventDefault();
    if (msgInput.value === '') {
        window.alert('Nothing to send');
    } else {
        try {
            let token = localStorage.getItem('token');
            let groupId = localStorage.getItem('groupId');
            
            //sending msg through socket
            socket.emit('sendMsg', { msg: msgInput.value, username: localStorage.getItem('username'), time: new Date(), groupId: groupId });

            // making an obj with msg
            let obj = {msg : msgInput.value , groupId : groupId};
            // Posting this msg
            let response = await axios.post('http://13.49.225.119:5000/chat/sendMsg', obj, {
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
        const groupId = localStorage.getItem('groupId');
        let oldMsgArray = JSON.parse(localStorage.getItem('oldMsgArray'));
        let lastMsgId;
        // checking if there is no old msg array in localstorage (can happen for newly signup or when a new group is created)
        if(oldMsgArray === null || oldMsgArray.length === 0){
            oldMsgArray = [];
            lastMsgId = 0;
        }
        else{
            lastMsgId = oldMsgArray[oldMsgArray.length - 1].id;
        }
         // first finding out group name with the help of group Id and showing it
         let result = await axios.get(`http://13.49.225.119:5000/group/findGroup?groupId=${groupId}`)
         if(result.data.group){
            groupInfo.innerHTML = `<h4>${result.data.group.name}</h4>`
        };
 
         // now getting new messages from DB
         let response = await axios.get(`http://13.49.225.119:5000/chat/getNewMsg?lastMsgId=${lastMsgId}&groupId=${groupId}`);
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
createGroupBtn.addEventListener('click',(e)=>{
    // Toggling the visibility of the form
  createGroupForm.style.display = createGroupForm.style.display === 'none' ? 'block' : 'none';
});


//------------------handling create group Form------------------------//
createGroupForm.addEventListener('submit',async(e)=>{
    try{
        e.preventDefault()
        let token = localStorage.getItem('token')
        // making an object of input
        let grpObj = {name: createGrpNameInput.value}
        // making a post request
        let response = await axios.post('http://13.49.225.119:5000/group/createGroup',grpObj,{ headers:{ 'Authorization': token }});

        // if success then showing group on display
        if(response.data.success){
            // making an li 
            let li = makeGrpLi(createGrpNameInput.value , response.data.grpId);
            // appending li in groupUl
            groupUl.appendChild(li)
            // clearing input
            createGrpNameInput.value = '';
        }

    }
    catch(err){
        console.log(err)
    }

})

//-----------------handling add member Btn-----------------------//
addMemberBtn.addEventListener('click',async(e)=>{
    try{
        // first we have to check if user is admin or not
        let token = localStorage.getItem('token');
        let groupId = localStorage.getItem('groupId');
             // making a post call
        let response = await axios.post('http://13.49.225.119:5000/user/checkIfAdmin',{
            groupId : groupId
        },{ headers:{ 'Authorization': token }})

        if(response.data.success){
            // toggling the visibility of form
            addMemberForm.style.display = addMemberForm.style.display === 'none' ? 'block' : 'none';
        }
        else{
            alert(response.data.msg)
        }

    }
    catch(err){
        console.log(err)
    }
})

//----------------handling add member form------------------------//
addMemberForm.addEventListener('submit',addUserToGroup);

async function addUserToGroup(e){
    e.preventDefault()
    try{
        const token = localStorage.getItem('token')
        const groupId = localStorage.getItem('groupId')

        // first we have to check if user(who is trying to add member) is admin or not
        let response = await axios.post('http://13.49.225.119:5000/user/checkIfAdmin',{
            groupId : groupId
        },{ headers:{ 'Authorization': token }})

        if(response.data.success){          // user is admin
            let email = document.querySelector('.addMemberInput').value;
            console.log(email);
            // storing groupId and email in an obj
            let obj = {groupId : groupId , email : email };
            // making a post request
            let result = await axios.post('http://13.49.225.119:5000/group/addUser',obj,{
                headers:{ 'Authorization': token }
            })

            if(result.data.success === false){
                alert(result.data.msg)
            }
            else{
                alert('User added to Group')

                // clearing input
                email.value = ''
            }
        }
        else{
            alert(response.data.msg)
        }
    }
    catch(err){
        console.log(err)
    }

}

//-----------------handling Show Members Btn---------------------//
showMemberBtn.addEventListener('click',showMembers);

async function showMembers(e){
    try{
        // first finding all the members of the group
        let token = localStorage.getItem('token');
        let groupId = localStorage.getItem('groupId');

        let response = await axios.get(`http://13.49.225.119:5000/group/getAllMembers?groupId=${groupId}`,{headers:{ 'Authorization': token }})

        // showing members
        // but first clearing list
        memberList.innerHTML = '';
        response.data.userArray.forEach((member)=>{
            // making an member li
            let li = makeMemberLi(member);
            // making and adding remove btn
            let removeBtn = makeRemoveBtn();
            li.appendChild(removeBtn)
            //Adding makeAdmin or Admin 
            let adminBtn = makeAdminOrIsAdminBtn(member);
            li.appendChild(adminBtn)
            // appending li to memberlist
            memberList.appendChild(li)
        })

        // toggeling visibility of list
        memberList.style.display = memberList.style.display === 'none' ? 'block' : 'none';

    }
    catch(err){
        console.log(err)
    }
}

//--------reloading groups when page reloads---------------------//
window.addEventListener('DOMContentLoaded',loadGroups);

async function loadGroups(e){
    try{
        let token = localStorage.getItem('token')
        // getting groups from database
        let response = await axios.get('http://13.49.225.119:5000/group/getGroups',{
            headers:{ 'Authorization': token }
        })

        // if succesfull then show on dom
        if(response.data.success){
            response.data.groupArray.forEach((grp)=>{
                // making an li
                let li = makeGrpLi(grp.name,grp.id)
                // appending li in groupUl
                groupUl.appendChild(li)
            })
        }
    }
    catch(err){
        console.log(err)
    }
}

//-----------handling the member list options---------------//
memberList.addEventListener('click',modifyMemberList);

async function modifyMemberList(e){
    try{
        // getting group Id from localstorage
        const groupId = localStorage.getItem('groupId');
        const token = localStorage.getItem('token')

        //---------------------- if remove btn is clicked---------------------//
        if(e.target.className === 'removeBtnClass'){
            // finding user id which we have to remove
            let rmvUserId = e.target.parentElement.id;
            // making a post request but 1st making an obj
            let obj = {rmvUserId : rmvUserId, groupId : groupId}
            let result = await axios.post('http://13.49.225.119:5000/group/removeMember',obj,{headers:{ 'Authorization': token }})

            if(result.data.success){
                showMemberBtn.click()
                showMemberBtn.click()
                alert('user removed')
            }
            else{
                alert(result.data.msg)
            }
        }

        //-------------------- if make admin button is clicked-----------------//
        else if(e.target.className === 'makeAdminBtnClass'){
            // finding user id which we have to make admin
            let mkAdminUserId = e.target.parentElement.id;
            // making a post request but 1st making an obj
            let obj = {mkAdminUserId : mkAdminUserId, groupId : groupId}
            let result = await axios.post('http://13.49.225.119:5000/group/makeAdmin',obj,{headers:{ 'Authorization': token }})

            if(result.data.success){
                showMemberBtn.click()
                showMemberBtn.click()
                alert('Selected User is now admin')
            }
            else{
                alert(result.data.msg)
            }
        }

        //---------------if Admin button is clicked--------------------------//
        else if(e.target.className === 'adminBtnClass'){
            // finding user id admin which we have to remove from admin
            let rmAdminUserId = e.target.parentElement.id;
            // making a post request but 1st making an obj
            let obj = {rmAdminUserId : rmAdminUserId, groupId : groupId}
            let result = await axios.post('http://13.49.225.119:5000/group/removeAdmin',obj,{headers:{ 'Authorization': token }})

            if(result.data.success){
                showMemberBtn.click()
                showMemberBtn.click()
                alert('Selected User is no longer an Admin')
            }
            else{
                alert(result.data.msg)
            }
        }

    }
    catch(err){
        console.log(err)
    }
}

//------------selecting a group-------------------------//
groupUl.addEventListener('click',selectGroup);

function selectGroup(e){
    if(e.target.parentElement.className === 'groupLi'){
        // getting group id
        let groupId = e.target.parentElement.id;

        //leaving current room (socket IO) if any
        if(localStorage.getItem('groupId')){
            socket.emit('leaveRoom',localStorage.getItem('groupId'))
        }

        // saving groupId in local storage
        localStorage.setItem('groupId',groupId);

         // joining socket to a room (named after group)for socket IO
         socket.emit('joinRoom',groupId)

        // closing 'addmember' and 'member list' dropdowns
        memberList.style.display = 'none';
        addMemberForm.style.display = 'none';

        // clearing chatul and then loading msg
        chatUl.innerHTML = ''
        loadMsg()
    }
}

//-------------- handling send file option ------------------------//
sendImgForm.addEventListener('submit',sendFile);

async function sendFile (e){
    e.preventDefault()
    try{
        const token = localStorage.getItem('token');
        const groupId = localStorage.getItem('groupId')
        let file = fileInput.files[0];

        if(!file){
            alert('No Image selected')
        }
        else{
            // Using a built in JS object (FormData) to handle files
            let formData = new FormData();
            // appending file to form data
            formData.append('file',file)
            // making a post request to upload
            let result = await axios.post('http://13.49.225.119:5000/chat/upload',formData,{headers:{ 'Authorization': token }})

            if(result.data.success){
                let fileurl = result.data.fileurl;
                let filename = result.data.filename;

                //sending msg through socket
                // Change the socket.emit for sending files
                socket.emit('sendFile', { msg: `<a href="${fileurl}">${filename}</a>`, username: localStorage.getItem('username'), time: new Date(), groupId: groupId });


                // making an obj with msg
                let obj = {msg : `<a href="${fileurl}">${filename}</a>` , groupId : groupId};
                // posting this msg
                let response = await axios.post('http://13.49.225.119:5000/chat/sendMsg',    obj,{ headers:{ 'Authorization': token }});
                if(response.data.sucess){
                    loadMsg();
                }
                fileInput.value = ''

            }
            else{
                alert(result.data.msg)
            }
        }

    }
    catch(err){
        console.log(err)
        alert('Something Went wrong')
    }
}


function makeLi(name, msg, createdAt) {
    let li = document.createElement('li');
    li.className = 'chatLi';
    li.innerHTML = `<p class="messageClass">${name} (${createdAt})    :    ${msg}</p>`
    return li
}

function makeGrpLi(name,id){
    let li = document.createElement('li');
    li.className = 'groupLi';
    li.id = id
    li.innerHTML = `<h3>${name}</h3>`
    return li
}

function storeInLocalStorage(msgArray){
    const groupId = localStorage.getItem('groupId')
    let slicedArray;
    if(msgArray.length <10){
        slicedArray = msgArray
    }
    else{
        slicedArray = msgArray.slice(msgArray.length - 10)
    }
    localStorage.setItem(groupId,JSON.stringify(slicedArray));
}

function makeMemberLi(member){
    let li = document.createElement('li');
    li.id = member.userId
    li.className = 'memberListLi'
    li.innerHTML = `<span>${member.userName}</span>`
    return li;
}

function makeRemoveBtn(){
    let removeBtn = document.createElement('button');
    removeBtn.className = 'removeBtnClass';
    removeBtn.innerText = 'Remove'
    return removeBtn
}

function makeAdminOrIsAdminBtn(member){
    // checking if member is admin or not and adding btn accordingly
    if(!member.isAdmin){
        // making make Admin btn
        let makeAdminBtn = document.createElement('button');
        makeAdminBtn.className = 'makeAdminBtnClass';
        makeAdminBtn.innerText = 'Make Admin';
        return makeAdminBtn
    }
    else{
        // making admin Btn
        let adminBtn = document.createElement('button');
        adminBtn.className = 'adminBtnClass';
        adminBtn.innerText = 'Admin';
        return adminBtn
    }
}

// showing msg which came by socket
socket.on('message', (msgObj)=>{
    let li = makeLi(msgObj.username,msgObj.msg,msgObj.time);
    chatUl.appendChild(li)

});

socket.on('fileMessage', (fileObj) => {
    const { msg, username, time } = fileObj;
    const li = makeLi(username, msg, time);
    chatUl.appendChild(li);
});
// // Reload messages every 5 seconds
// setInterval(loadMsg, 5000);
