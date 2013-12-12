
function login() {
    var username = document.getElementById('username').value,
        password = document.getElementById('password').value;
    socket.emit("login", { username: username, password: password });
}
function register() {
    var username = document.getElementById('registerUser').value,
        password = document.getElementById('registerPass').value;
    socket.emit("register", { username: username, password: password });
}
function showhide(which) {
    if(which=='login') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('register').style.display = 'block';
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('register').style.display = 'none';
    }
}