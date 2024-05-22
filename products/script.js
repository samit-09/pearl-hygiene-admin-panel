// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, remove } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import firebaseConfig from "../firebaseConfig.js";
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Databas
const database = getDatabase(app);


const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '../';
    }
});

// Function to display toast messages
var toastContainer = document.getElementById("toastContainer");

function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 2000);
}



var bottomButton = document.getElementById("bottomButton");

bottomButton.addEventListener("click", function name() {

    window.location.href = "#pageBottom"

})

const productsRef = ref(database, 'products');

const productsTable = document.getElementById("productsTable");

// Function to display products in the table
function displayproducts() {
    // Reference to the products body
    const tableBody = document.getElementById("tableBody");

    // Fetch all products from the database
    get(productsRef).then((snapshot) => {
        const productsData = snapshot.val();

        // Check if there are products in the database

        if (productsData) {

            let iteration = 0;

            // Loop through each product and display the information in the products table

            for (const productId in productsData) {
                const productData = productsData[productId];

                // Create a table row for each product
                const row = document.createElement("tr");

                // Alternate row background color for better visibility

                // row.style.background = iteration % 2 == 0 ? "#ebebeb33" : "#ffffff";

                // Populate the row with product data
                row.innerHTML = `

                    <td><input type="checkbox" id="select-${productId}" name="select-${productId}" value="select-${productId}"></td>
                    <td><img class="img-table" src="${productData.images[0]}" alt="product - ${productData.productName}"></td>
                    <td>${productData.productName}</td>
                    <td>${productData.productCategory}</td>
                    <td>${productData.productBrand}</td>
                    <td>${productData.productCode}</td>
                    <td>
                    
                    <button class="image-data-button" id="delete-button-${productId}"><img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>
                    <button class="image-data-button" id = "edit-button-${productId}"><img src="../images/editIcon.png" alt="Edit Icon" width="30px"></button>

                    </td>

                `;

                // Append the row to the products table body
                tableBody.appendChild(row);

                iteration++;

                // Attach event listeners to delete and edit buttons
                attachDynamicEventListener(productId, productData);


            }


            // Hide loading spinner and display the product container
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("main-product-container").style.display = "block"



        } else {

            // If no products found, display appropriate message
            document.getElementById("loading-container").style.display = "none"
            productsTable.style.display = "none"
            document.getElementById("main-product-container").style.display = "block"

        }
    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}


// Function to attach event listeners to dynamic elements
function attachDynamicEventListener(productId, productData) {

    const deleteButtonId = `delete-button-${productId}`;

    const checkboxId = `select-${productId}`;

    const editButtonId = `edit-button-${productId}`;


    const deleteButton = document.getElementById(deleteButtonId);

    const checkbox = document.getElementById(checkboxId);

    const editButton = document.getElementById(editButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {


            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    deleteproduct(productId);
                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }



    if (checkbox) {

        checkbox.addEventListener('change', function (event) {

            const isChecked = event.target.checked;

            checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');

            checkbox.checked = isChecked;


        });

    }


    if (editButton) {

        editButton.addEventListener("click", function () {

            window.location.href = `edit_product.html?id=${productId}`;

        })

    }

}


// Function to delete a product by ID
function deleteproduct(productId) {

    // Assuming you have a reference to the products node
    const productRef = ref(database, `products/${productId}`);

    // Remove product from the database
    remove(productRef)
        .then(() => {

            // Display success message
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Product deleted successfully');

            // Remove the deleted product row from the UI
            const row = document.querySelector(`#select-${productId}`).closest('tr');
            row.remove();

        })
        .catch((error) => {

            // Display error message if deletion fails
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete product. Please try again later');

        });
}

// Function to initiate display of products
displayproducts();



const addProductButton = document.getElementById("addProductButton");

// Add event listener to "Add product" button

addProductButton.addEventListener("click", function () {

    window.location.href = 'add_product.html';

});

/* 


 ####################################################################### 
 
 Code for select all, delete selected, search, and sidebar functionality

 #######################################################################


 */





const selectAllCheckbox = document.getElementById('selectAll');
const deleteSelectedButton = document.getElementById('deleteSelectedButton');

// Add event listener to the "Select All" checkbox

let checkboxes = [];

selectAllCheckbox.addEventListener('change', function (event) {
    const isChecked = event.target.checked;

    checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });


    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            // Check if any checkbox is unchecked
            const uncheckedCheckbox = [...checkboxes].find(checkbox => !checkbox.checked);
            // If any checkbox is unchecked, uncheck the "Select All" checkbox
            if (uncheckedCheckbox) {
                selectAllCheckbox.checked = false;
            }
            else {
                selectAllCheckbox.checked = true;
            }
        });
    });
});




deleteSelectedButton.addEventListener('click', function () {
    // Array to store IDs of selected items
    const selectedIds = [];

    // Loop through all checkboxes in the table body
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            // Extract the ID from the checkbox value and push it to the selectedIds array
            const id = checkbox.value;
            selectedIds.push(id);
        }
    });



    Swal.fire({
        title: "Sure?",
        text: "Are you sure you want to delete these products?",
        icon: "warning",
        showCancelButton: true, // Show cancel button
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#490f0d',
    }).then((result) => {

        if (result.isConfirmed) {

            selectedIds.forEach(id => {

                const newId = id.split('select-')[1];

                deleteItemById(newId);

            });

        } else {

            toastContainer.style.background = "rgb(204, 0, 0)";

            showToast('Delete Cancelled');

        }

    });

});

function deleteItemById(id) {

    // Implement deletion logic here using the item ID


    const row = document.querySelector(`#select-${id}`).closest('tr');
    const rowVisibility = row.style.display;


    //Remove product If It Is Not Hidden....

    if (rowVisibility == "none") {

        console.log("Display None... No deletion...");

    } else {

        const productRef = ref(database, `products/${id}`);
        remove(productRef)
            .then(() => {

                toastContainer.style.background = "rgb(204, 0, 0)";

                showToast('product deleted successfully');

                // Remove the deleted product row from the UI (optional)
                row.remove();
            })
            .catch((error) => {

                toastContainer.style.background = "rgb(204, 0, 0)";

                showToast('Failed to delete product. Please try again later');


            });

    }
}











document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('searchBar');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetButton');

    searchButton.addEventListener('click', function () {
        const searchTerm = searchBar.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#tableBody tr');

        rows.forEach(row => {
            const name = row.cells[2].innerText.toLowerCase();
            const category = row.cells[3].innerText.toLowerCase();

            // Show rows that match the search term or if the search term is empty
            if (name.includes(searchTerm) || category.includes(searchTerm) || searchTerm === '') {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    });

    resetButton.addEventListener('click', function () {
        searchBar.value = '';
        // Reset the visibility of all rows
        document.querySelectorAll('#tableBody tr').forEach(row => {
            row.style.display = 'table-row';
        });
    });
});








/////////////////////////
//Sidebar javascript code
/////////////////////////



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

    // Toggle the appearance of the hamburger icon
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
