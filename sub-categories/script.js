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


document.getElementById("categories_form_container").style.display = "block";
document.getElementById("loading-container").style.display = "none";

const categoriesRef = ref(database, 'categories');

let subCategoryName = "", catName = "";


function displaycategories() {
    get(categoriesRef).then((snapshot) => {
        const categoriesData = snapshot.val();
        const selectElement = document.getElementById('product_category');

        if (categoriesData) {
            for (const categoryId in categoriesData) {
                const categoryData = categoriesData[categoryId];
                
                if (categoryData.name) {
                    const option = document.createElement('option');
                    option.value = categoryData.name;
                    option.textContent = categoryData.name;
                    selectElement.appendChild(option);

                    const row = document.createElement("div");
                    row.classList.add("category-item");

                    // Build the subcategories HTML
                    let subCategoriesHtml = '';
                    for (const subCategoryId in categoryData.subCategories) {
                        const subCategory = categoryData.subCategories[subCategoryId];
                        subCategoriesHtml += `<div class="sub-cat-item">
                            <p class="sub-cat-style">${subCategory}</p>
                            <button class="sub-image-data-button" id="delete-button-${categoryId}-${subCategoryId}">
                                <img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete">
                            </button>
                        </div>`;
                    }

                    // Populate the row with category data
                    row.innerHTML = `
                        <h3>${categoryData.name}</h3>
                        ${subCategoriesHtml}
                        <button class="image-data-button" id="delete-button-${categoryId}">
                            <img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete">
                        </button>
                    `;

                    document.getElementById("categories-data").appendChild(row);

                    // Attach event listeners after the elements are added to the DOM
                    attachDynamicEventListener(categoryId);

                    for (const subCategoryId in categoryData.subCategories) {
                        attachDynamicEventListener2(categoryId, subCategoryId);
                    }
                } else {
                    const categoryName = categoriesData[categoryId];
                    const option = document.createElement('option');
                    option.value = categoryName;
                    option.textContent = categoryName;
                    selectElement.appendChild(option);
                }
            }

            // Hide loading spinner and display the product container
            document.getElementById("loading-container").style.display = "none";
            document.getElementById("categories_form_container").style.display = "block";
        } else {
            // If no categories found, display appropriate message
            document.getElementById("loading-container").style.display = "none";
            document.getElementById("categories_form_container").style.display = "block";
        }
    }).catch((error) => {
        console.error("Error fetching categories: ", error);
    });
}


// Function to attach event listeners to dynamic elements

function attachDynamicEventListener(categoryId) {

    const deleteButtonId = `delete-button-${categoryId}`;

    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {

            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this category?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    deleteCategory(categoryId);
                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }

}


function attachDynamicEventListener2(categoryId , subCategoryId) {

    const deleteButtonId = `delete-button-${categoryId}-${subCategoryId}`;

    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {

            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this sub category?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    deleteSubCategory(categoryId, subCategoryId);
                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }

}


const deleteCategory = (categoryId) =>{

    
    // Assuming you have a reference to the products node
    const categoriesRef = ref(database, `categories/${categoryId}`);

    // Remove product from the database
    remove(categoriesRef)
        .then(() => {

            // Display success message
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Category deleted successfully');

            // Remove the deleted product row from the UI
            const row = document.querySelector(`#delete-button-${categoryId}`).closest('div');
            row.remove();

        })
        .catch((error) => {

            // Display error message if deletion fails
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete product. Please try again later');

        });

}



const deleteSubCategory = (categoryId, subCategoryId) =>{

    
    // Assuming you have a reference to the products node
    const subCategoriesRef = ref(database, `categories/${categoryId}/subCategories/${subCategoryId}`);

    // Remove product from the database
    remove(subCategoriesRef)
        .then(() => {

            // Display success message
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Category deleted successfully');

            // Remove the deleted product row from the UI
            const row = document.querySelector(`#delete-button-${categoryId}-${subCategoryId}`).closest('div');
            row.remove();

        })
        .catch((error) => {

            // Display error message if deletion fails
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete product. Please try again later');

        });

}



displaycategories();


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
const categoriesForm = document.getElementById('categories_form');

document.getElementById("add-sub-category-button").addEventListener('click', () =>{
    categoriesForm.style.display = "block"
    addButton.style.display = "block"
});


categoriesForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addButton.click();
    }
});




addButton.addEventListener('click', function () {

    subCategoryName = document.getElementById("subCategoryName").value.trim();
    catName = document.getElementById("product_category").value.trim();

    uploadToDatabase(subCategoryName, catName)

    addButton.style.display = "none";
    document.getElementById("loading-container").style.display = "flex"
    document.getElementById("categories_form_container").style.display = "none"
});



function uploadToDatabase(subCategoryName, categoryName) {
    if (!subCategoryName) {
        showToast('Sub Category Name is required.');
        toastContainer.style.background = "#b00000";
        return;
    }

    const categoriesRef = ref(database, 'categories');

    // Fetch existing categories
    get(categoriesRef)
        .then((snapshot) => {
            const categoriesData = snapshot.val();

            if (categoriesData) {
                let categoryKey = null;

                // Find the category key by its name
                for (const key in categoriesData) {
                    const category = categoriesData[key];
                    if (typeof category === 'object' && category.name === categoryName) {
                        categoryKey = key;
                        break;
                    } else if (category === categoryName) {
                        // Handle the case where the category is a simple string
                        // Convert it to an object with subCategories
                        categoryKey = key;
                        categoriesData[key] = {
                            name: category,
                            subCategories: {}
                        };
                        break;
                    }
                }

                if (categoryKey !== null) {
                    // If the category is found, add the subcategory
                    const categoryRef = ref(database, `categories/${categoryKey}/name`);

                    // Find the next available subcategory index
                    const subCategories = categoriesData[categoryKey].subCategories || {};
                    const subCatLength = Object.keys(subCategories).length;

                    let nextSubCategoryIndex;

                    if (subCatLength == 0) {
                        nextSubCategoryIndex = 0
                    }else{
                        nextSubCategoryIndex = parseInt(Object.keys(subCategories)[subCatLength - 1]) + 1;
                    }
                    

                    set(categoryRef, catName).then(() =>{

                        set(ref(database, `categories/${categoryKey}/subCategories/${nextSubCategoryIndex}`), subCategoryName)
                        .then(() => {
                            showToast('Sub Category uploaded successfully!');
                            document.getElementById("loading-container").style.display = "none";
                            document.getElementById("categories_form_container").style.display = "block";
                            toastContainer.style.background = "#5b1616";
                            setTimeout(function () {
                                addButton.style.display = "block";
                                window.location.reload();
                            }, 2000);
                        })
                        .catch((error) => {
                            showToast('Failed to upload sub category. Please try again later.');
                            console.error(error);
                            toastContainer.style.background = "#b00000";
                            document.getElementById("loading-container").style.display = "none";
                            document.getElementById("categories_form_container").style.display = "block";
                            setTimeout(function () {
                                addButton.style.display = "block";
                            }, 2000);
                        });

                    }).catch((error) => {
                        showToast('Failed to upload sub category. Please try again later.');
                        console.error(error);
                        toastContainer.style.background = "#b00000";
                        document.getElementById("loading-container").style.display = "none";
                        document.getElementById("categories_form_container").style.display = "block";
                        setTimeout(function () {
                            addButton.style.display = "block";
                        }, 2000);
                    });

                    

                    // Set the new subcategory
                    


                } else {
                    showToast('Category not found.');
                    toastContainer.style.background = "#b00000";
                    document.getElementById("loading-container").style.display = "none";
                    document.getElementById("categories_form_container").style.display = "block";
                    setTimeout(function () {
                        addButton.style.display = "block";
                    }, 2000);
                }
            }
        })
        .catch((error) => {
            showToast('Failed to upload sub category. Please try again later.');
            console.error(error);
            toastContainer.style.background = "#b00000";
            document.getElementById("loading-container").style.display = "none";
            document.getElementById("categories_form_container").style.display = "block";
            setTimeout(function () {
                addButton.style.display = "block";
            }, 2000);
        });
}
