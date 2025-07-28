const upload = document.getElementById("resumeUpload");
const status = document.querySelector(".upload-status");

upload.addEventListener("change", () => {
  if (upload.files.length > 0) {
    status.textContent = `Uploaded: ${upload.files[0].name}`;
  } else {
    status.textContent = "No file uploaded";
  }
});
