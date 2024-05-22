// Import necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js'; // Import Firebase Auth module

// Import Firebase configuration
import firebaseConfig from "/firebaseConfig.js";

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
const database = getDatabase(app);

// Get the Firebase Auth instance
const auth = getAuth(app);

// Select the login form from the DOM
const loginForm = document.getElementById('loginForm');

onAuthStateChanged(auth, (user) => {

    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (user && isLoggedInLocalStorage == 'true') {
        window.location.href = 'products/';
    }
});


// Select the toast container from the DOM
const toastContainer = document.getElementById("toastContainer");

// Function to display toast messages
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds (adjust as needed)
}

// Event listener for form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Retrieve username and password from the form
    const username = loginForm['username'].value;
    const password = loginForm['password'].value;

    // Reference to the 'admin_users' node in the database
    const usersRef = ref(database, 'admin_users');

    // Fetch user data from the database
    get(usersRef).then(async (snapshot) => {
        const usersData = snapshot.val();
        // Check if user exists and password matches
        if (usersData && usersData[username] && usersData[username].password == password) {

            try {

            const email = usersData[username].email;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            console.log(userCredential);

            if (userCredential) {
            // Store login state and user data in local storage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ username: username, password: usersData[username]["password"] }));

            // Display success message
            toastContainer.style.background = "#490f0d";
            showToast("Login Success!");

            // Redirect to the dashboard after a delay
            setTimeout(() => {
                window.location.href = 'products/';
            }, 1200);    
            }

            

        } catch (error) {
            // Display error message for authentication failure
            console.error('Error signing in:', error);
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast("Login failed. Please check your email and password.");
        }

        } else {
            // Display error message for invalid credentials
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast("Invalid username or password...");
        }
    }).catch((error) => {
        // Display error message for database fetch failure
        console.error('Error fetching user data:', error);
        toastContainer.style.background = "rgb(204, 0, 0)";
        showToast("Login failed. Please try again later...");
    });
});

