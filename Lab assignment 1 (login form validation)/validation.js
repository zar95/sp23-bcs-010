let email = document.getElementById('email');
let password = document.getElementById('password');
let btn = document.getElementById('btsubmit');
let contact = document.getElementById('contact');

btn.addEventListener("click", function() {
    if (email.value.trim() === "") {
        console.log('email is empty');
        email.classList.add('error-shadow');
    } else {
        email.classList.remove('error-shadow');
    }

    if (password.value.trim() === "") {
        console.log('password is empty');
        password.classList.add('error-shadow');
    } else {
        password.classList.remove('error-shadow');
    }

    if (contact.value.trim() === "") {
        console.log('contact is empty');
        contact.classList.add('error-shadow');
    } else {
        contact.classList.remove('error-shadow');
    }

    console.log('btn clicked');
});
