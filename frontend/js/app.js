import renderHorizontalBarChart from "./horizontal_bar.js";

// const form = document.querySelector("form");
const form = document.getElementById("formContainer");
const phoneService = document.getElementById("phoneService");
const multipleLines = document.getElementById("multipleLines");
const internetFiber = document.getElementById("internetFiber");
const internetDSL = document.getElementById("internetDSL");
const onlineSecurity = document.getElementById("onlineSecurity");
const onlineBackup = document.getElementById("onlineBackup");
const deviceProtection = document.getElementById("deviceProtection");
const techSupport = document.getElementById("techSupport");
const streamingTV = document.getElementById("streamingTV");
const streamingMovies = document.getElementById("streamingMovies");
const loadingCard = document.getElementById("loadingCard");
const resultsCard = document.getElementById("resultsCard");
const newPredictionButton = document.getElementById("newPrediction");

// Initate Boostrap tooltips
const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]'),
);
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
const phoneTooltipEl = document.querySelector(".requires-phone");
const phoneTooltipInstance = bootstrap.Tooltip.getInstance(phoneTooltipEl);
const internetTooltipEl = document.querySelectorAll(".requires-internet");
const internetTooltipInstance =
  bootstrap.Tooltip.getInstance(internetTooltipEl);

const BACKEND_URL = "https://churn-prediction-api-0bus.onrender.com";

// Initiate phone and internet subservice values
let multipleLinesValue = "No phone service";
let onlineSecurityValue = "No internet service",
  onlineBackupValue = "No internet service",
  deviceProtectionValue = "No internet service",
  techSupportValue = "No internet service",
  streamingTvValue = "No internet service",
  streamingMoviesValue = "No internet service";

// Enable state within the form when the page is loaded

// Generate Boostrap tooltips
internetTooltipEl.forEach((tooltip) => {
  const tooltipInstance = bootstrap.Tooltip.getInstance(tooltip);
  tooltipInstance.enable();
});

document.addEventListener("DOMContentLoaded", () => {
  const statusAlert = document.getElementById("apiStatusAlert");
  const statusMessage = document.getElementById("apiStatusMessage");
  const statusSpinner = document.getElementById("statusSpinner");
  const formFields = document.getElementById("formFields");

  const BACKEND_CHECK_INTERVAL = 10 * 60 * 1000;

  const lastChecked = sessionStorage.getItem("backendLastChecked");
  const now = Date.now();

  const downloadButton = document.getElementById("download-methodology");

  downloadButton.href = `${BACKEND_URL}/download-methodology`;

  // If the backend was successfully with in the past 10 minutes,
  // skip the loading card and wake-up request.
  if (lastChecked && now - Number(lastChecked) < BACKEND_CHECK_INTERVAL) {
    console.log("Backend was recently verified; skipping startup check.");
    return;
  }

  async function checkBackendStatus() {
    try {
      // Show the startup card while we check Render
      formFields.disabled = true;
      statusAlert.classList.remove("d-none");
      // Ping the root endpoint to trigger a cold-start wake-up
      const response = await fetch(`${BACKEND_URL}/`, {
        method: "GET",
        // Wait 90 seconds before time out
        signal: AbortSignal.timeout(90000),
      });
      // When the backend has been initialized in Render
      if (response.ok) {
        // Record the time of the successful check
        sessionStorage.setItem("backendLastChecked", Date.now().toString());

        // Hide the alert and enable the churn assesment form
        statusAlert.classList.add("d-none");
        formFields.disabled = false;
        console.log("Customer Churn Prediction Engine Ready.");
      } else {
        throw new Error(`Server status: ${response.status}`);
      }
    } catch (error) {
      console.warn("Backend connectivity delay:", error);

      statusSpinner.classList.add("d-none");

      statusAlert.style.padding = "5%";
      statusAlert.classList.add("alert-dismissible", "fade", "show");

      statusAlert.style.position = "fixed";

      statusAlert.classList.replace("alert-primary", "alert-danger");
      // Update alert message
      statusMessage.innerHTML = `
        <div style="display: flex;">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" aria-hidden="true"></i>
          <h4 class="alert-heading">
            Model initialization is taking longer than expected
          </h4>
        </div>
        <hr>
        <p class="centered-last-line mb-0">
          You may still complete and submit the form. Your prediction may be
          delayed while the server finishes starting up.
        </p>
        <button
          id="close-warning"
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close">
        </button>
      `;
      const close = document.getElementById("close-warning");
      close.addEventListener("click", () => {
        formFields.disabled = false;
      });
    }
  }
  // Check immediately when the site is visited
  checkBackendStatus();
});

// Prevent non numerical characters and decimal entries for fields requiring whole number values
document.addEventListener("keydown", (e) => {
  if (e.target.classList.contains("no-decimals")) {
    // Prevent the user form entering a decimal value
    if (e.key === "." || e.keyCode === 190 || e.keyCode === 110) {
      e.preventDefault();
    }
  }
});

// Logic to enable user to select multiple lines as an option when phone service is selected
phoneService.addEventListener("change", () => {
  const hasPhone = phoneService.checked;
  // Enable multiple services when phone service is selected
  multipleLines.disabled = !hasPhone;
  // When phone service is unchecked
  if (!hasPhone) {
    // Ensure multiple lines is unselected
    multipleLines.checked = false;
    // Revert multiple lines value back to its original value to inform that the customer does not have phone service
    multipleLinesValue = "No Phone Service";
    // Enable tooltip to be displayed when multiple lines is disabled
    multipleLines.classList.add("no-pointer-events");
    phoneTooltipInstance.enable();
  }
  // WHen phone service is selected
  else {
    // Default multiplines value
    multipleLinesValue = "No";
    // Enable mulpile lines to be selected and disable tooltips
    multipleLines.classList.remove("no-pointer-events");
    phoneTooltipInstance.hide();
    phoneTooltipInstance.disable();
  }
});
// Retrieve multiple lines value
multipleLines.addEventListener("change", () => {
  // Toggle multiple lines value when selected and unselected
  multipleLinesValue =
    phoneService.checked && multipleLines.checked ? "Yes" : "No";
});

// Enable only one type of internet service to be selected
internetFiber.addEventListener("change", () => {
  // WHen Fiber is selected ensure DSL is unselected
  if (internetFiber.checked) {
    internetDSL.checked = false;
  }
});

internetDSL.addEventListener("change", () => {
  // WHen DSL is selected ensure Fiber is unselected
  if (internetDSL.checked) {
    internetFiber.checked = false;
  }
});

// Logic to enable user to select each internet subservice as an option when Fiber or DSL is selected service is selected
const internetOptions = document.querySelectorAll(
  'input[name="internetService"]',
);
const internetSubservices = document.querySelectorAll(".internet-subservice");
// When either Fiber or DSL is selected
internetOptions.forEach((option) => {
  option.addEventListener("change", () => {
    // Update each internet subservice value to reflect that the customer subscribes to internet
    onlineSecurityValue =
      onlineBackupValue =
      deviceProtectionValue =
      techSupportValue =
      streamingTvValue =
      streamingMoviesValue =
        "No";

    const hasInternet = option.checked;
    // When Fiber or DSL is slected enable each internet subservice
    internetSubservices.forEach((service) => {
      service.disabled = !hasInternet;
      // When Fiber or DSL is unselected
      if (!hasInternet) {
        // Unselect each inernet subservice
        service.checked = false;
        // Revert each internet subservice value back to its original value inform that the customer does not have internet service
        onlineSecurityValue =
          onlineBackupValue =
          deviceProtectionValue =
          techSupportValue =
          streamingTvValue =
          streamingMoviesValue =
            "No internet service";
        // Prevent the user from selecting each option
        service.classList.add("no-pointer-events");
      } // When Fiber or DSL is selected
      else {
        // Transform each internet subservice value to inform that the customer does have internet service
        onlineSecurityValue =
          onlineBackupValue =
          deviceProtectionValue =
          techSupportValue =
          streamingTvValue =
          streamingMoviesValue =
            "No";
        // Allow the user to select each option
        service.classList.remove("no-pointer-events");
      }
    });
    // Control tooltips based on internet selection
    internetTooltipEl.forEach((el) => {
      const tooltipInstance = new bootstrap.Tooltip(el);
      // When internet is unselected
      if (!hasInternet) {
        // Display tooltips for each intenet subservice option
        tooltipInstance.enable();
      }
      // When internet is unselected
      else {
        // Prevent displaying tooltips for each intenet subservice option
        tooltipInstance.hide();
        tooltipInstance.disable();
      }
    });
  });
});

// Get value for each internet subservice option when each option is selected or unselected
onlineSecurity.addEventListener("change", () => {
  onlineSecurityValue =
    (internetDSL.checked && onlineSecurity.checked) ||
    (internetFiber.checked && onlineSecurity.checked)
      ? "Yes"
      : "No";
});
onlineBackup.addEventListener("change", function () {
  onlineBackupValue =
    (internetDSL.checked && onlineBackup.checked) ||
    (internetFiber.checked && onlineBackup.checked)
      ? "Yes"
      : "No";
});
deviceProtection.addEventListener("change", function () {
  deviceProtectionValue =
    (internetDSL.checked && deviceProtection.checked) ||
    (internetFiber.checked && deviceProtection.checked)
      ? "Yes"
      : "No";
});
techSupport.addEventListener("change", function () {
  techSupportValue =
    (internetDSL.checked && techSupport.checked) ||
    (internetFiber.checked && techSupport.checked)
      ? "Yes"
      : "No";
});
streamingTV.addEventListener("change", function () {
  streamingTvValue =
    (internetDSL.checked && streamingTV.checked) ||
    (internetFiber.checked && streamingTV.checked)
      ? "Yes"
      : "No";
});
streamingMovies.addEventListener("change", function () {
  streamingMoviesValue =
    (internetDSL.checked && streamingMovies.checked) ||
    (internetFiber.checked && streamingMovies.checked)
      ? "Yes"
      : "No";
});

// Form validation to require at least one service is selected
const serviceOptions = document.querySelectorAll(".service-option");
function validateServices() {
  const atLeastOneSelected = [...serviceOptions].some(
    (service) => service.checked,
  );
  const servicesContainer = document.querySelector(".services");
  // Apply a single validation all service options
  servicesContainer.classList.toggle("was-invalid", !atLeastOneSelected);
  serviceOptions.forEach((service) => {
    // Display invalid message when no service is selected
    service.setCustomValidity(
      atLeastOneSelected ? "" : "Please select at least one service.",
    );
  });
  // When at least one service is selected mark as valid
  if (atLeastOneSelected) {
    servicesContainer.classList.remove("was-invalid");
  }
  // When no service is selected mark it as invalid
  else {
    servicesContainer.classList.add("was-invalid");
  }
}
// Perform form validaton on service inputs
serviceOptions.forEach((service) => {
  service.addEventListener("change", validateServices);
});

// Strip out value that is not whole number from input field
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("no-decimals")) {
    let input = e.target;
    input.value = input.value.replace(/[^0-9]/g, "");
  }
});

// Include decial values for curency fields
document.addEventListener(
  "blur",
  function (e) {
    if (e.target.classList.contains("currencyInput")) {
      let input = e.target;
      let value = input.value.trim();
      // Only accept numerical and a decimal point characters
      value = value.replace(/[^0-9.]/g, "");
      // Insert 2 decimal point with two decimal places when the user enters a whole number
      if (value !== "" && !isNaN(value)) {
        input.value = parseFloat(value).toFixed(2);
      }
    }
  },
  true,
);

// Return to form to generate a new prediction
newPredictionButton.addEventListener("click", () => {
  // Remove all previously entered form data
  form.reset();
  //Remove Bootstrap's validation trigger class
  form.classList.remove("was-validated");
  //Clear individual input states
  const inputs = form.querySelectorAll(".is-invalid, .is-valid");
  inputs.forEach((input) => {
    input.classList.remove("is-invalid", "is-valid");
  });
  resultsCard.classList.add("d-none");
  form.classList.remove("d-none");
});

// Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // validate form inputs
  validateServices();
  if (!form.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add("was-validated");
    return;
  }
  // Remove the form from view
  form.classList.add("d-none");
  // Display the loading animation
  loadingCard.classList.remove("d-none");
  // Force viewport to return to the top of the screen
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 40);
  // Transform values input to the form the model to use
  const contractSelection = document.querySelector(
    'input[name="contract"]:checked',
  )?.value;
  const seniorCitizen = document.getElementById("seniorCitizen").checked
    ? "1"
    : "0";
  const partner = document.getElementById("partner").checked ? "Yes" : "No";
  const dependents = document.getElementById("dependents").checked
    ? "Yes"
    : "No";
const phoneServiceSelection =
  document.getElementById("phoneService").checked ? "Yes" : "No";

  const internetSelection =
    document.querySelector('input[name="internetService"]:checked')?.value ??
    "No";
  const paymentMethodSelection = document.querySelector(
    'input[name="paymentMethod"]:checked',
  )?.value;
  const paperlessBillingSelection = document.querySelector(
    'input[name="paperlessBilling"]:checked',
  )?.value;
  // Create customer object with transformed feature values to have the model process
  const customer = {
    SeniorCitizen: Number(seniorCitizen),
    Partner: partner,
    Dependents: dependents,
    tenure: Number(document.getElementById("tenure").value),
    PhoneService: phoneServiceSelection,
    MultipleLines: multipleLinesValue,
    InternetService: internetSelection,
    OnlineSecurity: onlineSecurityValue,
    OnlineBackup: onlineBackupValue,
    DeviceProtection: deviceProtectionValue,
    TechSupport: techSupportValue,
    StreamingTV: streamingTvValue,
    StreamingMovies: streamingMoviesValue,
    Contract: contractSelection,
    PaperlessBilling: paperlessBillingSelection,
    PaymentMethod: paymentMethodSelection,
    MonthlyCharges: Number(document.getElementById("monthlyCharges").value),
    TotalCharges: Number(document.getElementById("totalCharges").value)
  };
  // Send customer object to the backend to be processsed by the model
  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });
    // Inform error status if responce is not recieved from backend
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    // Save the responce from the backend in JSON format
    const data = await response.json();
    // Loading effect - spin for at leat 3 seconds
    const startTime = Date.now();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(3000 - elapsed, 0);
    await new Promise((resolve) => setTimeout(resolve, remaining));
    // Terminate loading effect
    loadingCard.classList.add("d-none");
    // Show results
    resultsCard.classList.remove("d-none");
    // Identify result values
    let probability = Number(data.probability.toFixed(1));
    const labels = data.features.map((x) => x.feature);
    const impacts = data.features.map((x) => x.impact);
    const riskElement = document.getElementById("churnRisk");
    // Prevent 0% and 100% displays to avoid false absolute certainty 
    if (probability === 0) {
      probability += 0.01;
    }
    if (probability === 1) {
      probability -= 0.01;
    }
    console.log(probability)
    // Dynamically format "churn risk" based on the churn probability
    if (probability >= 0.6) {
      riskElement.textContent = "High Churn Risk";
      riskElement.className = "fs-1 fw-semibold text-danger mb-0";
    } else if (probability >= 0.3) {
      riskElement.textContent = "Moderate Churn Risk";
      riskElement.className = "fs-1 fw-semibold text-warning mb-0";
    } else {
      riskElement.textContent = "Low Churn Risk";
      riskElement.className = "fs-1 fw-semibold text-success mb-0";
    }
    // Format churn probability
    document.getElementById("churnProbability").textContent =
      `${(probability * 100).toFixed(0)}%`;
    // Create SHAP chart
    renderHorizontalBarChart(labels, impacts);
  } catch (error) {
    // When an error prevents connecting to the backend
    console.error(error);
    // Skip loading animation
    loadingCard.classList.add("d-none");
    // Document error
    errorAlert.textContent = `Server Connection Failed (${error.message}).`;
    // Display error message
    errorAlert.classList.remove("d-none");
  }
});
