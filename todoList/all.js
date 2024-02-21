const url = "https://todoo.5xcamp.us";
let token = "";
const loginEmail = document.querySelector("#loginEmail");
const loginPsw = document.querySelector("#loginPsw");

const loginBtn = document.querySelector("#loginBtn");
const signupBtn = document.querySelector("#signupBtn");
const signupAccBtn = document.querySelector("#signupAccBtn");
const loginPageBtn = document.querySelector("#loginPageBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const userName = document.querySelector("#userName");

const addTodoBtn = document.querySelector("#addTodoBtn");
const inputAddTodo = document.querySelector("#inputAddTodo");

const loginPage = document.querySelector(".login");
const signupPage = document.querySelector(".signup");
const todolist = document.querySelector(".todolist");

const content = document.querySelector(".content");
const list = document.querySelector(".list");
const tab = document.querySelector(".tab");
const listUl = document.querySelector("#listUl");
const undoneText = document.querySelector(".undoneText");
const clearDone = document.querySelector("#clearDone");

const allItems = document.querySelector("#allItems");
const undoneItems = document.querySelector("#undoneItems");
const doneItems = document.querySelector("#doneItems");

let dataArr = [];
let doneArr = [];
let undoneArr = [];
let undoneNum = 0;
let doneNum = 0;
let targetId = "";

function login(email, psw){
    axios.post(`${url}/users/sign_in`,{
        "user": {
            "email": email,
            "password": psw
        }
    })
    .then(res => {
        loginPage.classList.add("display-none");
        todolist.classList.remove("display-none");
        console.log(res.headers.authorization);
        token = res.headers.authorization;
        loginEmail.value = "";
        loginPsw.value = "";
        getTodo();
        userName.innerHTML = `${res.data.nickname}的代辦`;
    })
    .catch(err => {
        alert("信箱或密碼輸入錯誤!");
        console.log(err.response);
    })
};
function signup(email, name, psw){
    axios.post(`${url}/users`,{
        "user": {
            "email": email,
            "nickname": name,
            "password": psw
        }
    })
    .then(res => {
        alert("註冊成功，請登入!");
        loginPage.classList.remove("display-none");
        signupPage.classList.add("display-none");
    })
    .catch(err => console.log(err.response))
};
function logout(){
    axios.delete(`${url}/users/sign_out`,{
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        alert("已登出!");
        loginPage.classList.remove("display-none");
        todolist.classList.add("display-none");
    })
    .catch(err => console.log(err.response))
};
function addTodo(todo) {
    axios.post(`${url}/todos`,{
        "todo": {
          "content": todo
        }
      },
      {
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        console.log(res);

        getTodo();
        inputAddTodo.value = "";
        // alert("新增成功");
    })
    .catch(err => console.log(err.response))
    
}
function getTodo(){
    axios.get(`${url}/todos`,{
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        const todoArr = res.data.todos;
        let newdataArr = [];
        let newdoneArr = [];
        let newundoneArr = [];
        let str = "";
        
        //因為todoArr為空的了，所以foreach沒有執行，str就不會寫入listUl
        // 所以todoArr為空的時候要另外寫判斷
        if(todoArr.length != 0){
            todoArr.forEach((item, index) => {
                newdataArr.push(item);
                str += `
                <li>
                <input type="text" data-num="${index}" class="editTodoInput display-none" placeholder="輸入修改代辦事項">
                <input type="checkbox" data-num="${index}" class="checkBtn" >
                <span>${item.content}</span>
                <div>
                <i class="fa-solid fa-pen-to-square" id="edit" data-num="${index}"></i>
                <i class="fa-solid fa-xmark" id="delete" data-num="${index}"></i>
                </div>
                </li>
                `
                listUl.innerHTML = str;

                // 以下不能寫在這裡，每次todoArr.forEach執行一次，就會再const一次
                // 會覆蓋掉前面所執行程式checkboxBtn裡面的元素
                // 所以迴圈跑完只有最後一個會執行成功就是這個原因
                // const也不能寫在todoArr.forEach之前，寫在他前會抓不到checkboxBtn這個元素
                // const checkboxBtn = document.querySelectorAll(".checkBtn");

                // if(item.completed_at == null){
                //     newundoneNum++;
                // }
                // else{
                //     checkboxBtn[index].checked = true;
                // }
            })
        }else {
            listUl.innerHTML = `<p class="emptyText">目前尚無待辦事項</p>`;
        }
        dataArr = newdataArr;
        todoArr.forEach((item, index) => {   
            const checkboxBtn = document.querySelectorAll(".checkBtn");

            if(item.completed_at == null){
                newundoneArr.push(item);
            }
            else{
                checkboxBtn[index].checked = true;
                newdoneArr.push(item);
            }
        })
        doneArr = newdoneArr;
        undoneArr = newundoneArr;
        undoneText.textContent = `${undoneArr.length}個待完成項目`;
        // console.log(res.data);
    })
    .catch(err => console.log(err.response))
}
function deleteTodo(todoId){
    axios.delete(`${url}/todos/${todoId}`,{
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        if(undoneItems.getAttribute("class") == "active"){
            undoneArr = undoneArr.filter(item =>{
                return item.id != todoId;
            })
            renderUndone();
            undoneText.textContent = `${undoneArr.length}個待完成項目`;
        }else if(allItems.getAttribute("class") == "active"){
            getTodo();
        }else if(targetId == "delete"){
            doneArr = doneArr.filter(item =>{
                return item.id != todoId;
            })
            renderDone();
        }else if(doneItems.getAttribute("class") == "active"){
            renderDone();
        }
    })
    .catch(err => console.log(err.response))
}
function toggleTodo(todoId){
    axios.patch(`${url}/todos/${todoId}/toggle`,{},{
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        console.log(res.data);
        // 不想要勾選或取消勾選時todo跑到最上面，所以寫了一個條件
        if(res.data.completed_at == null){
            doneArr = doneArr.filter(item =>{
                return item.id != res.data.id;
            })
            undoneArr.push(res.data);
            if(doneItems.getAttribute("class") == "active"){
                renderDone();
            }
        }
        else{
            undoneArr = undoneArr.filter(item =>{
                return item.id != res.data.id;
            })
            doneArr.push(res.data);
            if(undoneItems.getAttribute("class") == "active"){
                renderUndone();
            }
        }
        undoneText.textContent = `${undoneArr.length}個待完成項目`;

    })
    .catch(err => console.log(err))
}
function editTodo(todoId, todoItem){
    axios.put(`${url}/todos/${todoId}`,{
        "todo": {
          "content": todoItem
        }
      },{
        headers: {
            "authorization": token
        }
    })
    .then(res => {
        console.log(res.data);
        getTodo();
    })
    .catch(err => console.log(err))
}
loginBtn.addEventListener("click", e => {
    const loginInputArr = loginPage.querySelectorAll("input");
    loginInputArr.forEach(item => {
        if(item.value == "") {
            let remarkP = item.nextElementSibling ;
            remarkP.innerHTML = `此欄不可為空`;
        }else {
            let remarkP = item.nextElementSibling ;
            remarkP.innerHTML = ``;
        }
    });
    login(loginEmail.value, loginPsw.value);
});

signupAccBtn.addEventListener("click", e => {
    loginPage.classList.add("display-none");
    signupPage.classList.remove("display-none");
})

signupBtn.addEventListener("click", e => {   
    const signupEmail = document.querySelector("#signupEmail");
    const signupName = document.querySelector("#signupName");
    const signupPsw = document.querySelector("#signupPsw");
    const signupPswAgain = document.querySelector("#signupPswAgain");
    const signupInputArr = signupPage.querySelectorAll("input");
    const remarkPswAgain = document.querySelector(".remark-pswAgain");

    signupInputArr.forEach(item => {
        if(item.value == "") {
            let remarkP = item.nextElementSibling ;
            remarkP.innerHTML = `此欄不可為空`;
        }else {
            let remarkP = item.nextElementSibling ;
            remarkP.innerHTML = ``;
        }
    });
    if(signupPsw.value != signupPswAgain.value){
        remarkPswAgain.classList.remove("display-none");
    }else {
        remarkPswAgain.classList.add("display-none");
        signup(signupEmail.value, signupName.value, signupPsw.value);
    }
    console.log(signupEmail.value, signupName.value, signupPsw.value);
});

loginPageBtn.addEventListener("click", e => {
    loginPage.classList.remove("display-none");
    signupPage.classList.add("display-none");
});

logoutBtn.addEventListener("click", e => {
    loginPage.classList.remove("display-none");
    todolist.classList.add("display-none");
    logout();
});

addTodoBtn.addEventListener("click", e => {
    if(inputAddTodo == ""){
        return;
    }else {
        addTodo(inputAddTodo.value.trim());
    }

});

listUl.addEventListener("click",e => {
//如果點到input checkbox 取得那個框的id，傳入到toggleTodo

    targetId = e.target.getAttribute("id");
    let num = e.target.getAttribute("data-num");
    if(targetId == "delete"){
        if(doneItems.getAttribute("class") == "active"){
            doneArr.forEach((item, index) => {
                if (num == index) {
                    deleteTodo(item.id);
                }
            })
        }else if(undoneItems.getAttribute("class") == "active"){
            undoneArr.forEach((item, index) => {
                if (num == index) {
                    deleteTodo(item.id);
                }
            })
        }else{
            dataArr.forEach((item, index) => {
                if (num == index) {
                    deleteTodo(item.id);
                }
            })
        }
    }else if(targetId == "edit"){
        const editTodoInput = document.querySelectorAll(".editTodoInput");
        const checkboxBtn = document.querySelectorAll(".checkBtn");
        console.log(editTodoInput);
        dataArr.forEach((item, index) => {
            if (num == index) {
                editTodoInput[index].classList.toggle("display-none");
                checkboxBtn[index].classList.toggle("display-none");
                const todoItem = editTodoInput[index].value;
                if(todoItem != ""){
                    editTodo(item.id, todoItem);
                }
            }
        })
    }else if(e.target.getAttribute("class") == "checkBtn"){
        if(undoneItems.getAttribute("class") == "active"){
            undoneArr.forEach((item, index) => {
                if (num == index) {
                    toggleTodo(item.id);
                }
            })
        }else if(doneItems.getAttribute("class") == "active"){
            doneArr.forEach((item, index) => {
                if (num == index) {
                    toggleTodo(item.id);
                }
            })
        }else {
            dataArr.forEach((item, index) => {
                if (num == index) {
                    toggleTodo(item.id);
                }
            })
        }
    }else{
        return;
    }
})

clearDone.addEventListener("click",e => {
    console.log(doneArr);
    if(undoneItems.getAttribute("class") == "active"){
        return;
    }else if(doneItems.getAttribute("class") == "active"){
        doneArr.forEach((item, index)=> {
            deleteTodo(item.id);
        })
        doneArr = [];
        // console.log(doneArr);
    }else{
        doneArr.forEach((item, index)=> {
            deleteTodo(item.id);
        })
    }
})
tab.addEventListener("click",e => {
    const aArr = tab.querySelectorAll("a");
    aArr.forEach((item, index)=>{
        if(e.target.getAttribute("id") == item.getAttribute("id")){
            e.target.classList.add("active");
        }else{
            item.classList.remove("active");
        }
    })
    
    if(e.target.getAttribute("id") == "allItems"){
        getTodo();
    }else if(e.target.getAttribute("id") == "undoneItems"){
        renderUndone();
       
    }else if(e.target.getAttribute("id") == "doneItems"){
        renderDone();
    }
})
function renderUndone() {
    let str = "";
    if(undoneArr.length != 0){
        undoneArr.forEach((item, index) => {
            str += `
            <li>
            <input type="text" data-num="${index}" class="editTodoInput display-none" placeholder="輸入修改代辦事項">
            <input type="checkbox" data-num="${index}" class="checkBtn" >
            <span>${item.content}</span>
            <div>
            <i class="fa-solid fa-pen-to-square" id="edit" data-num="${index}"></i>
            <i class="fa-solid fa-xmark" id="delete" data-num="${index}"></i>
            </div>
            </li>
            `
        })
    }else {
        str = `<p class="emptyText">目前尚無待辦事項</p>`;
    }
    listUl.innerHTML = str;
}
function renderDone(){
    let str = "";
    if(doneArr.length != 0){
        doneArr.forEach((item, index) => {
            str += `
            <li>
            <input type="text" data-num="${index}" class="editTodoInput display-none" placeholder="輸入修改代辦事項">
            <input type="checkbox" data-num="${index}" class="checkBtn" >
            <span>${item.content}</span>
            <div>
            <i class="fa-solid fa-pen-to-square" id="edit" data-num="${index}"></i>
            <i class="fa-solid fa-xmark" id="delete" data-num="${index}"></i>
            </div>
            </li>
            `
            listUl.innerHTML = str;
        })
    }else {
        str = `<p class="emptyText">目前尚無未完成事項</p>`;
        
    }
    listUl.innerHTML = str;
    doneArr.forEach((item, index) => {   
        const checkboxBtn = document.querySelectorAll(".checkBtn");
        checkboxBtn[index].checked = true;
    })
}