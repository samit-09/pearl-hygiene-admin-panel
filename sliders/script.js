// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, remove, get, push } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
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


document.getElementById("sliders_form_container").style.display = "block";
document.getElementById("loading-container").style.display = "none";

const slidersRef = ref(database, 'sliders');

let sliderTitle = "", sliderSubtitle = "", image_url = "";

function displaySliders() {

    get(slidersRef).then((snapshot) => {
        const slidersData = snapshot.val();

        if (slidersData) {

            for (const sliderId in slidersData) {
                const sliderData = slidersData[sliderId];

                const row = document.createElement("div");
                row.classList.add("slider-item");


                row.innerHTML = `
                <img class="img-table" src="${sliderData.image}" alt="slider - ${sliderData.image}">
                <h3>${sliderData.title}</h3>
                <p>${sliderData.subtitle}</p>
                    
                    <button class="image-data-button" id="delete-button-${sliderId}"><img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>

                `;

                document.getElementById("sliders-data").appendChild(row);

                attachDynamicEventListener(sliderId);


            }


            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"



        } else {

            // If no sliders found, display appropriate message
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"

        }
    }).catch((error) => {
        console.error("Error fetching sliders: ", error);
    });
}

// Function to attach event listeners to dynamic elements

function attachDynamicEventListener(sliderId) {

    const deleteButtonId = `delete-button-${sliderId}`;

    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {

            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this slider?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    deleteSlider(sliderId);
                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }

}


const deleteSlider = (sliderId) =>{

    
    // Assuming you have a reference to the products node
    const slidersRef = ref(database, `sliders/${sliderId}`);

    // Remove product from the database
    remove(slidersRef)
        .then(() => {

            // Display success message
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Slider deleted successfully');

            // Remove the deleted product row from the UI
            const row = document.querySelector(`#delete-button-${sliderId}`).closest('div');
            row.remove();

        })
        .catch((error) => {

            // Display error message if deletion fails
            toastContainer.style.background = "rgb(204, 0, 0)";
            showToast('Failed to delete product. Please try again later');

        });

}

displaySliders();


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
const slidersForm = document.getElementById('sliders_form');

slidersForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        addButton.click();
    }
});

document.getElementById("add-slider-button").addEventListener('click', () =>{
    document.getElementById("sliders_form").style.display = "block"
    document.getElementById("addButton").style.display = "block"
});



async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data.data.url;
}

// Function to handle file input
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            // Show error message if file type is not supported
            Swal.fire({
                title: "Error!",
                text: "Please select a PNG, JPG, or JPEG image...",
                icon: "error",
                confirmButtonText: "Okay",
                confirmButtonColor: '#4bae4f',
            });
            resetFileInput();
            return;
        }
        // Display the image preview
        imgPreview.src = URL.createObjectURL(file);
    } else {
        // Handle case when no file is selected
        setTimeout(function () {
            addButton.style.display = "block";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"
        }, 2000);
    }
}

// Function to handle image upload
function uploadImage(files) {
    if (image_url == "") {
        if (files.length > 0) {
            const file = files[0];
            uploadToImgBB(file)
                .then(url => {
                    // On successful upload to ImgBB, upload image URL to database
                    image_url = url;
                    uploadToDatabase(sliderTitle, sliderSubtitle, image_url);
                })
                .catch(error => {
                    // Show error message if failed to upload image to ImgBB
                    toastContainer.style.background = "#b00000";
                    showToast('Failed to upload slider. Please try again later.');
                    console.log(error);
                    setTimeout(function () {
                        addButton.style.display = "block";
                        document.getElementById("loading-container").style.display = "none"
                        document.getElementById("sliders_form_container").style.display = "block"
                    }, 2000);
                });
        } else {
            // Show error message if no file is selected
            toastContainer.style.background = "#b00000";
            showToast('Please select an image file');
            setTimeout(function () {
                addButton.style.display = "block";
                document.getElementById("loading-container").style.display = "none"
                document.getElementById("sliders_form_container").style.display = "block"
            }, 2000);
        }
    } else {
        setTimeout(function () {
            addButton.style.display = "block";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"
        }, 2000);
    }
}




// Event listeners for drag and drop functionality
const dropArea = document.getElementById('dropArea');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

// Prevent default drag and drop behavior
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area on drag enter and drag over
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

// Remove highlight on drag leave and drop
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Add highlight class
function highlight() {
    dropArea.classList.add('highlight');
}

// Remove highlight class
function unhighlight() {
    dropArea.classList.remove('highlight');
}

// Event listener for file input change
fileInput.addEventListener('change', function () {
    handleFiles(this.files);
});


addButton.addEventListener('click', function () {

    sliderTitle = document.getElementById("title").value.trim();
    sliderSubtitle = document.getElementById("subtitle").value.trim();
    uploadImage(fileInput.files);

    addButton.style.display = "none";
    document.getElementById("loading-container").style.display = "flex"
    document.getElementById("sliders_form_container").style.display = "none"
});



function uploadToDatabase(title, subtitle, image) {

    const newSliderRef = ref(database, 'sliders/');

    push(newSliderRef, {
        title: title,
        subtitle: subtitle,
        image: image
    })
        .then(() => {
            // Show success message on successful upload
            showToast('Slider uploaded successfully!');
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"
            toastContainer.style.background = "#5b1616";
            setTimeout(function () {
                addButton.style.display = "block";
                window.location.reload();
            }, 2000);
        })
        .catch((error) => {
            // Show error message on failed upload
            showToast('Failed to upload slider. Please try again later.');
            toastContainer.style.background = "#b00000";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("sliders_form_container").style.display = "block"
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
