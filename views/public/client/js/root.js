let passwordActive = document.getElementById("activepassword");

passwordActive.onchange = ()=>{
    let oldpassword = document.getElementById("oldpassword");
    let newpassword = document.getElementById("newpassword");

    if (passwordActive.checked) {
        document.getElementById("password").style.display = "block";
        oldpassword.value = '';
        newpassword.value = '';
    }else{
        document.getElementById("password").style.display = "none";
        oldpassword.value = '////////';
        newpassword.value = '////////';
    }
}