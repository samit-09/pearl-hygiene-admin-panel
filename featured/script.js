// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, remove, get, set } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import firebaseConfig from "../firebaseConfig.js";
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';
import imgbbAPIKey from "../imgbbConfig.js";

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
// Function to display toast notifications
const toastContainer = document.getElementById("toastContainer");
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds (adjust as needed)
}


document.getElementById("featuredProducts_form_container").style.display = "block";
document.getElementById("loading-container").style.display = "none";

const featuredProductsRef = ref(database, 'featuredProducts');

let featuredProductName = "", image_url = "", productsData;


function displayFeaturedProducts() {

    get(featuredProductsRef).then((snapshot) => {
        const featuredProductsData = snapshot.val();

        if (featuredProductsData) {

            for (const featuredProductId in featuredProductsData) {
                const featuredProductData = featuredProductsData[featuredProductId];

                // Create a table row for each product
                const row = document.createElement("div");
                row.classList.add("featuredProduct-item");

                // Populate the row with product data
                row.innerHTML = `
                <img class="img-table" src="${featuredProductData.image}" alt="product - ${featuredProductData.name}">
                <h3>${featuredProductData.name}</h3>
                    
                    <button class="image-data-button" id="delete-button-${featuredProductId}"><img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>

                `;

                document.getElementById("featuredProducts-data").appendChild(row);

                attachDynamicEventListener(featuredProductId);


            }


            // Hide loading spinner and display the product container
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("featuredProducts_form_container").style.display = "block"



        } else {

            // If no featuredProducts found, display appropriate message
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("featuredProducts_form_container").style.display = "block"

        }
    }).catch((error) => {
        console.error("Error fetching Featured Products: ", error);
    });
}

// Function to attach event listeners to dynamic elements

function attachDynamicEventListener(featuredProductId) {

    const deleteButtonId = `delete-button-${featuredProductId}`;

    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {

            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this Featured Product?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    deleteFeaturedProduct(featuredProductId);
                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }

}


const deleteFeaturedProduct = (featuredProductId) =>{

    
    // Assuming you have a reference to the products node
    const featuredProductsRef = ref(database, `featuredProducts/${featuredProductId}`);

    // Remove product from the database
    remove(featuredProductsRef)
        .then(() => {

            // Display success message
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Featured Product deleted successfully');

            // Remove the deleted product row from the UI
            const row = document.querySelector(`#delete-button-${featuredProductId}`).closest('div');
            row.remove();

        })
        .catch((error) => {

            // Display error message if deletion fails
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete product. Please try again later');

        });

}

displayFeaturedProducts();



function getProductsFromFirebase() {
    // Reference to the product data in Firebase RTDB
    const productsRef = ref(database, 'products');

    get(productsRef).then((snapshot) => {
      productsData = snapshot.val();
    
      // Check if there are products in the database
      if (productsData) {
        // Get a reference to the select element
        const selectElement = document.getElementById('featuredProductName');

          for (const productId in productsData) {
            const product = productsData[productId];

            const productName = product.productName;
            const option = document.createElement('option');
            option.value = productId;
            option.textContent = productName; // Set the text content of the option
            selectElement.appendChild(option); 

          }

      }
    }); 
  }


  getProductsFromFirebase();


// Sidebar JavaScript code
const menuItems = document.querySelectorAll('.sidebar-menu a');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(item => item.classList.remove('active'));
        item.classList.add('active');
    });
});

const navbar = document.getElementById("navbar");
const mainSection = document.getElementById("main-container");
const bars = document.querySelectorAll('.bar');

function toggleSidebar() {
    const screenWidth = window.innerWidth;
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    bars.forEach(bar => bar.classList.toggle('active'));

    if (!sidebar.classList.contains("active")) {
        navbar.style.margin = 0;
        mainSection.style.margin = 0;
        if (screenWidth < 768) {
            mainSection.style.display = "block"
        } else {
            mainSection.style.display = "block"
        }
    } else {
        navbar.style.marginLeft = "250px";
        mainSection.style.marginLeft = "250px";
        if (screenWidth < 768) {
            mainSection.style.display = "none"
        } else {
            mainSection.style.display = "block"
        }
    }
}

document.getElementById("hamburger-menu-icon").addEventListener("click", function () {
    toggleSidebar();
});

document.getElementById("sidebar-logout").addEventListener("click", function () {
    
    signOut(auth).then(() => {
        // Remove user data from local storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');

        // Redirect to the login page
        window.location.href = '../';
    }).catch((error) => {
        // Handle any errors that occur during sign-out
        console.error('Error signing out:', error);
    });

});

const username = JSON.parse(localStorage.getItem("currentUser"))["username"];
document.getElementById("username-text").innerText = username;

function checkScreenWidth() {
    const sidebar = document.getElementById('sidebar');
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
        sidebar.classList.remove('active');
        navbar.style.margin = 0;
        mainSection.style.marginLeft = 0;
        bars.forEach(bar => bar.classList.remove('active'));
    } else {
        sidebar.classList.add('active');
        navbar.style.marginLeft = "250px";
        mainSection.style.marginLeft = "250px";
        bars.forEach(bar => bar.classList.add('active'));
    }
}

// Call checkScreenWidth function when the page loads
window.onload = checkScreenWidth;
// Call checkScreenWidth function when the window is resized
window.onresize = checkScreenWidth;


const addButton = document.getElementById('addButton');
const featuredProductsForm = document.getElementById('featuredProducts_form');

featuredProductsForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addButton.click();
    }
});

document.getElementById("add-featuredProduct-button").addEventListener('click', () =>{
    document.getElementById("featuredProducts_form").style.display = "block"
    document.getElementById("addButton").style.display = "block"
});



addButton.addEventListener('click', function () {

    featuredProductName = document.getElementById("featuredProductName").value.trim();
    console.log(featuredProductName);

    const name = productsData[featuredProductName].productName;
    const image = productsData[featuredProductName].images[0];

    uploadToDatabase(featuredProductName, name, image);

    addButton.style.display = "none";
    document.getElementById("loading-container").style.display = "flex"
    document.getElementById("featuredProducts_form_container").style.display = "none"

});



function uploadToDatabase(id, name, image) {

    const newFeaturedProductsRef = ref(database, 'featuredProducts/' + id);

    set(newFeaturedProductsRef, {
        name: name,
        image: image
    })
        .then(() => {
            // Show success message on successful upload
            showToast('Featured Product uploaded successfully!');
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("featuredProducts_form_container").style.display = "block"
            toastContainer.style.background = "#5b1616";
            setTimeout(function () {
                addButton.style.display = "block";
                window.location.reload();
            }, 2000);
        })
        .catch((error) => {
            // Show error message on failed upload
            showToast('Failed to upload featuredProduct. Please try again later.');
            console.log(error);
            toastContainer.style.background = "#b00000";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("featuredProducts_form_container").style.display = "block"
            setTimeout(function () {
                addButton.style.display = "block";
            }, 2000);
        });
}

// Function to reset file input
function resetFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    imgPreview.src = "../images/upload.png";
}
