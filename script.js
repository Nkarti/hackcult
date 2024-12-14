// Navigation handling
document.getElementById('homeLink').addEventListener('click', () => {
    showPage('homePage');
});
document.getElementById('aboutLink').addEventListener('click', () => {
    showPage('aboutPage');
});
document.getElementById('diseasesLink').addEventListener('click', () => {
    showPage('diseasesPage');
});
document.getElementById('bmiLink').addEventListener('click', () => {
    showPage('bmiPage');
});
document.getElementById('dietLink').addEventListener('click', () => {
    showPage('dietPage');
});
document.getElementById('loginLink').addEventListener('click', () => {
    showPage('loginPage');
});
document.getElementById('signupLink').addEventListener('click', () => {
    showPage('signupPage');
});
document.getElementById('uploadLink').addEventListener('click', () => {
    showPage('uploadPage');
});
document.getElementById('manageFilesLink').addEventListener('click', () => {
    showPage('manageFilesPage');
});

function showPage(pageId) {
    const pages = ['homePage', 'aboutPage', 'diseasesPage', 'bmiPage', 'dietPage', 'loginPage', 'signupPage', 'uploadPage', 'manageFilesPage'];
    pages.forEach(page => {
        document.getElementById(page).style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// Sign Up Logic
document.querySelector('#signupPage form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Sign Up Successful!');
    // Implement sign up logic (e.g., sending data to server)
});

// Upload File Logic
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        document.getElementById('uploadStatus').textContent = "File uploaded successfully!";
        // Implement file upload logic (e.g., uploading file to server)
    } else {
        document.getElementById('uploadStatus').textContent = "Please select a file to upload.";
    }
});

// Manage Files Logic (mockup)
document.getElementById('manageFilesPage').addEventListener('load', function() {
    const fileList = document.getElementById('fileList');
    // This should be replaced with dynamic file list from server
    const files = ['File1.pdf', 'File2.jpg', 'File3.docx'];
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file;
        fileList.appendChild(listItem);
    });
});

// Default page is Home
showPage('homePage');