fetch('nav.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('nav-placeholder').innerHTML = data;
    });