const users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = null;

function checkLogin() {
    if (localStorage.getItem('loggedIn')) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('signup-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        initMap();
    } else {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('signup-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'none';
    }
}

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    loggedInUser = users.find(user => user.username === username && user.password === password);
    if (loggedInUser) {
        localStorage.setItem('loggedIn', 'true');
        checkLogin();
    } else {
        document.getElementById('login-error-message').innerText = "Invalid username or password.";
    }
});

document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (users.some(user => user.username === username)) {
        document.getElementById('signup-error-message').innerText = "Username already exists.";
    } else {
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Sign up successful! You can now log in.");
        showLogin();
    }
});

function showSignUp() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}

function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('signup-container').style.display = 'none';
}

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 12,
    });
    loadFavorites();
}

async function fetchTransportData(start, destination) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { transport: "Bus 10", arrival: "5 minutes" },
                { transport: "Train A", arrival: "10 minutes" },
                { transport: "Tram 5", arrival: "2 minutes" }
            ]);
        }, 1000);
    });
}

function displayTransportArrivals(data) {
    const arrivalList = document.getElementById('arrival-list');
    arrivalList.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.transport}: Arriving in ${item.arrival}`;
        arrivalList.appendChild(li);
    });
}

async function getRoute() {
    const start = document.getElementById('start').value.trim();
    const destination = document.getElementById('destination').value.trim();

    if (!start || !destination) {
        alert("Please enter both start and destination locations.");
        return;
    }

    document.getElementById('loading').style.display = 'block';
    
    try {
        const transportData = await fetchTransportData(start, destination);
        displayTransportArrivals(transportData);

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);

        const request = {
            origin: start,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
            } else {
                alert('Directions request failed due to ' + status);
            }
        });
    } catch (error) {
        alert('Error fetching transport data: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function saveFavorite() {
    const start = document.getElementById('start').value.trim();
    const destination = document.getElementById('destination').value.trim();

    if (!start || !destination) {
        alert("Please enter both start and destination locations to save.");
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push({ start, destination });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    alert('Route saved as favorite!');
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';

    favorites.forEach((route, index) => {
        const li = document.createElement('li');
        li.textContent = `${route.start} to ${route.destination}`;
        const deleteBtn =   document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            favorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            loadFavorites();
        };
        li.appendChild(deleteBtn);
        favoritesList.appendChild(li);
    });
}

function logout() {
    localStorage.removeItem('loggedIn');
    loggedInUser = null;
    checkLogin();
}

checkLogin();