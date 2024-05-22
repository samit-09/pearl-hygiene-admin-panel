// Import Firebase modules and configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';
import firebaseConfig from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '../';
    }
});

// Function to show toast notifications
var toastContainer = document.getElementById("toastContainer");
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds (adjust as needed)
}

// Event listener for user form submission
const addUserForm = document.getElementById('addUserForm');
addUserForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = addUserForm['username'].value;
    const password = addUserForm['password'].value;
    const email = addUserForm['email'].value;


    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user to the database
        await set(ref(database, 'admin_users/' + username), {
            uid: user.uid,
            email: email,
            password: password
        });

        addUserForm.reset();
        // Show success message
        toastContainer.style.background = "#490f0d";
        showToast("User added successfully!");
    } catch (error) {
        // Show error message
        console.error(error);
        toastContainer.style.background = "#490f0d";
        showToast("Error: " + error.message);
    }



    // // Add user to the database
    // set(ref(database, 'admin_users/' + username), {
    //     password: password,
    //     email: email
    // });

    // // Show success message
    // toastContainer.style.background = "#490f0d";
    // showToast("User added successfully!");
});

// Constant variable for users button
const usersButton = document.getElementById("users-button");

// Event listener for users button click
usersButton.addEventListener("click", () => {
    window.location.href = "/administrator/users";
});
