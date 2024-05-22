// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getAuth, onAuthStateChanged, deleteUser as deleteAuthUser } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';
import firebaseConfig from "../../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '../../';
    }

});

// Get reference to toast container
var toastContainer = document.getElementById("toastContainer");

// Function to display toast messages
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds (adjust as needed)
}

// Get reference to user list element
const userList = document.getElementById('userList');

// Get reference to 'admin_users' node in database and fetch users
const usersRef = ref(database, 'admin_users');
get(usersRef).then((snapshot) => {
    const usersData = snapshot.val();

    // Clear previous user list
    userList.innerHTML = '';

    // Iterate through each user and display their information
    for (const username in usersData) {
        if (Object.hasOwnProperty.call(usersData, username)) {
            const user = usersData[username];
            // Create HTML elements to display user information
            const userElement = document.createElement('div');
            userElement.innerHTML = `
                <div class="user-item">
                    <p><strong>Username:</strong> ${username}<br></p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <button class="user-data-button" id="delete-button-${username}"><img src="../../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>
                </div>
            `;
            // Append user element to user list
            userList.appendChild(userElement);

            // Attach event listener to delete button dynamically
            attachDynamicEventListener(username, user);
        }
    }

    // Hide loading spinner after data is loaded
    document.getElementById("loading-container").style.display = "none";

}).catch((error) => {
    console.error('Error fetching user data:', error);
    // Display error message if fetching data fails
    toastContainer.style.background = "rgb(204, 0, 0)";
    showToast("Failed to fetch user data...");
});

// Function to attach event listener dynamically to delete button
function attachDynamicEventListener(username, userData) {
    const deleteButtonId = `delete-button-${username}`;
    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {
            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this user?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonColor: '#490f0d',
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    // Call function to delete user
                    deleteUser(username);
                } else {
                    // Display toast message if delete action is cancelled
                    toastContainer.style.background = "rgb(204, 0, 0)";
                    showToast('Delete Cancelled');
                }
            });
        })
    }
}

// Function to delete user from database

function deleteUser(username) {
    // Reference to the user data in Firebase Realtime Database
    const userRef = ref(database, `admin_users/${username}`);
    
    // Remove user data from Firebase Realtime Database
    remove(userRef)
        .then(() => {
            // Delete the user from Firebase Authentication
            deleteAuthUser(auth.currentUser)
                .then(() => {
                    // Display success message after user deletion
                    toastContainer.style.background = "rgb(204, 0, 0)";
                    showToast('User deleted successfully');

                    // Remove deleted user from UI
                    const user_div = document.querySelector(`#delete-button-${username}`).closest('div');
                    user_div.remove();
                })
                .catch((error) => {
                    // Display error message if deletion from Firebase Auth fails
                    console.error('Error deleting user from Authentication:', error);
                    toastContainer.style.background = "rgb(204, 0, 0)";
                    showToast('Failed to delete user from Authentication. Please try again later');
                });
        })
        .catch((error) => {
            console.error('Error deleting user from Database:', error);
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete user from Database. Please try again later');
        });
}
