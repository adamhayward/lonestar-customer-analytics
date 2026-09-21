document.addEventListener("DOMContentLoaded", () => {
  const alert = document.getElementById("downloadAlert");
  const heading = document.getElementById("alertHeading");
  const message = document.getElementById("downloadAlertMessage");
  const dlBtn = document.getElementById("downloadButton");
  const closeBtn = document.getElementById("closeButton");

  const pageContent = document.getElementById("methodologyPage");

  const hr = document.createElement("hr");

  dlBtn.addEventListener("click", () => {
    heading.textContent = "Thank You For Downloading The Notebook!";
    heading.insertAdjacentElement("afterend", hr);

    message.innerHTML = `
        <p class="mb-3 centered-last-line">
          The notebook can be run locally using
          <a class="alert-link" target="_blank" style="text-decoration: none;" rel="noopener noreferrer"
             href="https://jupyter.org/">
             JupyterLab
          </a>
          or in a browser-based environment such as
          <a class="alert-link" target="_blank" style="text-decoration: none;" rel="noopener noreferrer"
             href="https://colab.research.google.com/">Google Colab</a> to upload
          the notebook and run it without installing Python or Jupyter
          on your computer.
        </p>

        <p class="mb-3 centered-last-line">
          For compatibility, the notebook should be run using
          <strong>Python 3.12.14</strong>.
        </p>
    `;
  });

  closeBtn.addEventListener("click", () => {
    alert.remove();
    pageContent.classList.remove("out-of-focus");
  });
});