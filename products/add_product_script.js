// Import necessary Firebase modules and configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import firebaseConfig from "../firebaseConfig.js";
import imgbbAPIKey from "../imgbbConfig.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
// Get a reference to the Firebase database
const database = getDatabase(app);


let productName, productDescription, productCode, productBrand, productCategory, productSubCategory;

// Get DOM elements
const imgPreviewDiv = document.getElementById('imgPreviewDiv');
const toastContainer = document.getElementById("toastContainer");

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '../';
    }
});

// Function to display toast messages
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds
}


function getBrandsFromFirebase() {
    // Reference to the brand data in Firebase RTDB
    const brandsRef = ref(database, 'brands');

    get(brandsRef).then((snapshot) => {
        const brandsData = snapshot.val();

        // Check if there are brands in the database
        if (brandsData) {
            // Get a reference to the select element
            const selectElement = document.getElementById('product_brand');

            // Loop through the brands object and create option elements
            Object.keys(brandsData).forEach((brandKey) => {
                const brandName = brandKey; // Get the brand name (key)
                const option = document.createElement('option'); // Create an option element
                option.value = brandName; // Set the value of the option
                option.textContent = brandName; // Set the text content of the option
                selectElement.appendChild(option); // Append the option to the select element
            });

            const defaultOption = document.createElement('option'); // Create an option element
            defaultOption.value = "None"; // Set the value of the option
            defaultOption.textContent = "None"; // Set the text content of the option
            selectElement.appendChild(defaultOption);

        }
    });
}

function getCategoriesFromFirebase() {
    // Reference to the brand data in Firebase RTDB
    const categoriesRef = ref(database, 'categories');

    get(categoriesRef).then((snapshot) => {

        const categoriesData = snapshot.val();

        // Check if there are brands in the database
        if (categoriesData) {
            // Get a reference to the select element
            const selectElement = document.getElementById('product_category');
            const subCategorySelectElement = document.getElementById('sub_category');

            for (const categoryId in categoriesData) {

                const categoryData = categoriesData[categoryId];

                if (categoryData.subCategories) {

                    const option = document.createElement('option');
                    option.value = categoryData.name;
                    option.textContent = categoryData.name;
                    selectElement.appendChild(option);

                } else {

                    const categoryName = categoriesData[categoryId];
                    const option = document.createElement('option');
                    option.value = categoryName;
                    option.textContent = categoryName;
                    selectElement.appendChild(option);

                }
            }

            
            selectElement.addEventListener('change', (e) => {
                subCategorySelectElement.innerHTML = ''; // Clear existing options

                const selectedCategoryName = e.target.value; // Get the selected category name

                // Find the category object using the name
                let selectedCategory = null;
                for (const categoryId in categoriesData) {
                    if (categoriesData[categoryId].name === selectedCategoryName) {
                        selectedCategory = categoriesData[categoryId];
                        break; // Exit the loop once found
                    }
                }

                if (selectedCategory && selectedCategory.subCategories) {
                    for (const subCategoryId in selectedCategory.subCategories) {
                        const subOption = document.createElement('option');
                        subOption.value = selectedCategory.subCategories[subCategoryId]; // Assuming subCategory IDs are relevant
                        subOption.textContent = selectedCategory.subCategories[subCategoryId];
                        subCategorySelectElement.appendChild(subOption);
                    }
                }

                  // Add a default option for subcategories if no subcategories exist
                  const noSubCategoryOption = document.createElement('option');
                  noSubCategoryOption.value = "";
                  noSubCategoryOption.textContent = "None";
                  subCategorySelectElement.appendChild(noSubCategoryOption);

            });

            const defaultOption = document.createElement('option'); // Create an option element
            defaultOption.value = ""; // Set the value of the option
            defaultOption.textContent = "None"; // Set the text content of the option
            defaultOption.selected = true;  
            selectElement.appendChild(defaultOption);



        }
    });
}






getBrandsFromFirebase();
getCategoriesFromFirebase();

// Asynchronous function to upload image to ImgBB
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

let primaryIndex;

// Function to handle file input
function handleFiles(files) {
    if (files.length > 0) {
        const imageFiles = files;

        primaryIndex = 0;

        imgPreviewDiv.innerHTML = ``;

        for (let index = 0; index < imageFiles.length; index++) {

            const file = imageFiles[index];

            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                // Show error message if file type is not supported
                Swal.fire({
                    title: "Error!",
                    text: "Please select a PNG, JPG, or JPEG image...",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: '#490f0d',
                });
                resetFileInput();
                return;
            }

            // Display the image preview

            const previewImageDiv = document.createElement("div");
            previewImageDiv.style.width = "300px";
            previewImageDiv.style.height = "300px";
            previewImageDiv.style.display = "flex";
            previewImageDiv.style.flexDirection = "column";
            previewImageDiv.style.justifyContent = "center";
            previewImageDiv.style.margin = "50px 10px"
            previewImageDiv.classList.add("previewImageDiv");

            previewImageDiv.innerHTML = `
        <img src="${URL.createObjectURL(file)}" alt="Product Image" width="300px" style='display: "block";' id="image-${index}"/>
        <div>
        <input type="checkbox" id="select-${index}" name="select-${index}" value="select-${index}">
        <label for="select-${index}">Primary Image</label>
        </div>
        `

            imgPreviewDiv.appendChild(previewImageDiv);
            attachDynamicEventListener(index);

        }



    } else {
        // Handle case when no file is selected
        setTimeout(function () {
            uploadButton.style.display = "block";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("upload_product_form_container").style.display = "block"
        }, 2000);
    }
}



let checkboxes = [];

function attachDynamicEventListener(index) {

    const checkboxId = `select-${index}`;
    const checkbox = document.getElementById(checkboxId);

    if (checkbox) {

        checkbox.addEventListener('change', function (event) {

            const isChecked = event.target.checked;

            checkboxes = document.querySelectorAll('#imgPreviewDiv input[type="checkbox"]');

            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }

            if (isChecked) {
                primaryIndex = index;
            } else {
                primaryIndex = 0;
            }

            checkbox.checked = isChecked;


        });

    }

}




async function uploadImage(files) {
    if (files.length > 0) {
        const image_urls = [];
        const imageFiles = Object.values(files);

        let temp = imageFiles[0];
        imageFiles[0] = imageFiles[primaryIndex];
        imageFiles[primaryIndex] = temp;


        await Promise.all(imageFiles.map(async file => {
            try {
                const url = await uploadToImgBB(file);
                image_urls.push(url);
            } catch (error) {
                console.error(error);

                toastContainer.style.background = "#b00000";
                showToast('Failed to upload image. Please try again later.');
                throw error;

            }
        }));

        uploadToDatabase(productName, productCategory, productSubCategory, productDescription, productCode, productBrand, image_urls, specifications);
    } else {
        // Show error message if no file is selected
        toastContainer.style.background = "#b00000";
        showToast('Please select image files');
    }

    // Reset UI after upload is complete
    setTimeout(function () {
        uploadButton.style.display = "block";
        document.getElementById("loading-container").style.display = "none";
        document.getElementById("upload_product_form_container").style.display = "block";
    }, 2000);
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

// Event listener for upload button click
const uploadButton = document.getElementById('uploadButton');
uploadButton.addEventListener('click', function () {

    productName = document.getElementById("product_name").value.trim();
    productCategory = document.getElementById("product_category").value.trim();
    productSubCategory = document.getElementById("sub_category").value.trim();
    productDescription = document.getElementById("product_description").value.trim();
    productCode = document.getElementById("product_code").value.trim();
    productBrand = document.getElementById("product_brand").value.trim();

    if (productName == "" || productCategory == "" || productDescription == "" || productCode == "" || productBrand == "" || specifications.length == 0) {
        toastContainer.style.background = "#b00000";
        showToast('Please give all the required information...');

    } else {
        uploadImage(fileInput.files);
        uploadButton.style.display = "none";
        document.getElementById("loading-container").style.display = "flex"
        document.getElementById("upload_product_form_container").style.display = "none"
    }

});



// // Reference to Firebase database for storing products
// const newProductsRef = ref(database, 'products');

// // Function to upload image data to database
// function uploadToDatabase(product_name, product_category, product_description, product_code, product_brand, image_urls, product_specifications) {
//     push(newProductsRef, {
//         productName: product_name,
//         productCategory: product_category,
//         productDescription: product_description,
//         productCode: product_code,
//         productBrand: product_brand,
//         images: image_urls,
//         specifications: product_specifications
//     })
//         .then(() => {
//             // Show success message on successful upload
//             toastContainer.style.background = "#5b1616";
//             showToast('Prodct uploaded successfully!');
//             document.getElementById("loading-container").style.display = "none"
//             document.getElementById("upload_product_form_container").style.display = "block"
//             setTimeout(function () {
//                 uploadButton.style.display = "block";
//                 window.location.reload();
//             }, 2000);
//         })
//         .catch((error) => {
//             console.log(error);
//             // Show error message on failed upload
//             showToast('Failed to upload product. Please try again later.');
//             toastContainer.style.background = "#b00000";
//             document.getElementById("loading-container").style.display = "none"
//             document.getElementById("upload_product_form_container").style.display = "block"
//             setTimeout(function () {
//                 uploadButton.style.display = "block";
//             }, 2000);
//         });
// }




// Reference to Firebase database for storing products
const productsRef = ref(database, 'products');

// Function to upload image data to database with custom ID
function uploadToDatabase(product_name, product_category, sub_category, product_description, product_code, product_brand, image_urls, product_specifications) {
    get(productsRef).then((snapshot) => {
        const productsData = snapshot.val();
        let nextId = 1;

        if (productsData) {
            const ids = Object.keys(productsData).map(key => parseInt(key, 10));
            nextId = Math.max(...ids) + 1;
        }

        const newProductRef = ref(database, `products/${nextId}`);


        if (sub_category != "") {
            set(newProductRef, {
                productName: product_name,
                productCategory: product_category,
                productSubCategory: sub_category,
                productDescription: product_description,
                productCode: product_code,
                productBrand: product_brand,
                images: image_urls,
                specifications: product_specifications
            })
                .then(() => {
                    // Show success message on successful upload
                    toastContainer.style.background = "#5b1616";
                    showToast('Product uploaded successfully!');
                    document.getElementById("loading-container").style.display = "none"
                    document.getElementById("upload_product_form_container").style.display = "block"
                    setTimeout(function () {
                        uploadButton.style.display = "block";
                        window.location.reload();
                    }, 2000);
                })
                .catch((error) => {
                    console.log(error);
                    // Show error message on failed upload
                    showToast('Failed to upload product. Please try again later.');
                    toastContainer.style.background = "#b00000";
                    document.getElementById("loading-container").style.display = "none"
                    document.getElementById("upload_product_form_container").style.display = "block"
                    setTimeout(function () {
                        uploadButton.style.display = "block";
                    }, 2000);
                });
        }else{
            set(newProductRef, {
                productName: product_name,
                productCategory: product_category,
                productDescription: product_description,
                productCode: product_code,
                productBrand: product_brand,
                images: image_urls,
                specifications: product_specifications
            })
                .then(() => {
                    // Show success message on successful upload
                    toastContainer.style.background = "#5b1616";
                    showToast('Product uploaded successfully!');
                    document.getElementById("loading-container").style.display = "none"
                    document.getElementById("upload_product_form_container").style.display = "block"
                    setTimeout(function () {
                        uploadButton.style.display = "block";
                        window.location.reload();
                    }, 2000);
                })
                .catch((error) => {
                    console.log(error);
                    // Show error message on failed upload
                    showToast('Failed to upload product. Please try again later.');
                    toastContainer.style.background = "#b00000";
                    document.getElementById("loading-container").style.display = "none"
                    document.getElementById("upload_product_form_container").style.display = "block"
                    setTimeout(function () {
                        uploadButton.style.display = "block";
                    }, 2000);
                });
        }

        
    })
        .catch((error) => {
            console.log(error);
            // Show error message if retrieving products data fails
            showToast('Failed to retrieve product data. Please try again later.');
            toastContainer.style.background = "#b00000";
            document.getElementById("loading-container").style.display = "none"
            document.getElementById("upload_product_form_container").style.display = "block"
            setTimeout(function () {
                uploadButton.style.display = "block";
            }, 2000);
        });
}


// Function to reset file input
function resetFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    imgPreviewDiv.src = "../images/upload.png";
}


let specifications = [];

// Function to add specification
function addSpecification() {

    const field = document.getElementById('specification_field').value;
    const value = document.getElementById('specification_value').value;

    // Check if both field and value are provided
    if (field && value) {
        // Add specification to array
        specifications.push({ field, value });

        // Display added specifications
        displaySpecifications();

        // Clear input fields
        document.getElementById('specification_field').value = '';
        document.getElementById('specification_value').value = '';
    } else {
        // Show error message if field or value is missing
        Swal.fire({
            title: 'Error!',
            text: 'Please enter both specification field and value...',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: '#490f0d',
        });
    }
}

// Function to display added specifications
function displaySpecifications() {
    const addedSpecificationsDiv = document.getElementById('added_specifications');
    addedSpecificationsDiv.innerHTML = '';

    specifications.forEach(spec => {
        const specElement = document.createElement('p');
        specElement.classList.add('spec-item');
        specElement.innerHTML = `<span>${spec.field}</span> : ${spec.value}`;
        addedSpecificationsDiv.appendChild(specElement);
    });
}

// Event listener for "Add Specification" button
document.getElementById('add_specification').addEventListener('click', addSpecification);
