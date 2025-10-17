<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
<<<<<<< HEAD
        <h1>Reports</h1>

        <!-- Choose Monthly Report -->
        <section class="choose-monthly-report">
            <button @click="ChooseMonthlyReport = true" class="monthly-reports-button">
                <i class="fas fa-plus"></i> Monthly Report
            </button>
        </section>

        <!-- Monthly Report Modal -->
        <div v-if="ChooseMonthlyReport" class = "modal-overlay">
            <div>
                
            </div> 

        </div>

        <!-- Choose Weekly Report -->
        <section class="choose-weekly-report">
            <button @click="ChooseWeeklyReport = true" class="weekly-reports-button">
                <i class="fas fa-plus"></i> Weekly Report
            </button>
        </section>

        <!-- Choose Daily Report -->
        <section class="choose-daily-report">
            <button @click="ChooseDailyReport = true" class="daily-reports-button">
                <i class="fas fa-plus"></i> Daily Report
            </button>
        </section>
 

    
=======
        <h1>  </h1>

        <!-- Main button that opens the popup -->
        <button @click="showPopup = true">Open Popup</button>

        <!-- Popup (modal) -->
        <div v-if="showPopup" class="popup-overlay">
            <div class="popup">
                <h2>This is a popup</h2>
                <p>Choose an action:</p>

                <!-- Buttons inside popup -->
                <button @click="doAction('Action 1')">Action 1</button>
                <button @click="doAction('Action 2')">Action 2</button>
                <button @click="closePopup">Close</button>
            </div>
        </div>
>>>>>>> 9064a00c1f6086a55c36a3dddcfd0afda8e5565a
      <!-- Amend Data button -->
      <div class="amendData-button">
        <button class="amendData-btn" @click="openAmendData">
          Amend Data
        </button>
      </div>

      <!-- Amend Data Modal -->
      <div v-if="showAmendData" class="modal-overlay">
        <div class="modal">
          <button class="modal-close" @click="closeAllModals">✕</button>
          <h3 style="text-align: center;">{{ currentMonthYearInCST }}</h3>
          <div class="modal-actions">
          </div>
        </div>
      </div>












    </div>
</template>
<script setup>
import { ref, computed } from 'vue';

const currentDate = ref(new Date());

const currentMonthYearInCST = computed(() => {
  // Options for formatting the date
  const options = {
    year: 'numeric',
    month: 'long', // Use 'long' for full month name (e.g., "October")
    timeZone: 'America/Chicago', // Specify US Central Time
  };

  // Use Intl.DateTimeFormat to format the current date
  return new Intl.DateTimeFormat('en-US', options).format(currentDate.value);
});

const showAmendData = ref(false);

/*
export default {
    name: 'ReportsLandingPage'
}
*/

function openAmendData() {
  showAmendData.value = true;
}

function closeAllModals() {
  showAmendData.value = false;
}
</script>

<style scoped>
.reports-container {
    font-family: 'Open Sans', sans-serif;
    padding: 2em;
    background-color: #f0f2f5; /* Light gray background */
    min-height: 100vh;
    max-height: 300px; /* Adjust as needed */
    overflow-y: auto; /* Vertical scroll */
    overflow-x: auto; /* Horizontal scroll if needed */
}

.reports-landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

.monthly-reports {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1em;
}

.monthly-reports-button{
    padding: 0.5em 1.5em;
    background-color: #af4c4c; /* Red */
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    text-transform: uppercase;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.weekly-reports {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1em;
}

.weekly-reports-button{
    padding: 0.5em 1.5em;
    background-color: #4caf53; /* Green */
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    text-transform: uppercase;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.daily-reports {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1em;
}

.daily-reports-button{
    padding: 0.5em 1.5em;
    background-color: #4c5baf; /* Blue */
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    text-transform: uppercase;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 480px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.modal input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.modal-actions.vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.modal-content {
    background-color: #fff;
    padding: 2em;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
    margin-top: 0;
    margin-bottom: 1em;
    color: #3f51b5; /* Indigo */
    text-align: center;
}

.form-group {
    margin-bottom: 1em;
}

    .form-group label {
        display: block;
        margin-bottom: 0.5em;
        color: #333;
    }

    .form-group input {
        width: 100%;
        padding: 0.5em;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1em;
}

.save-button,
.cancel-button {
    padding: 0.5em 1.5em;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.save-button {
    background-color: #4caf50; /* Green */
}

    .save-button:hover {
        background-color: #43a047;
    }

.cancel-button {
    background-color: #f44336; /* Red */
}

    .cancel-button:hover {
        background-color: #e53935;
    }

/* Filter and Sort Section */
.filter-sort-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
}

.search-input {
    flex: 1 1 200px;
    margin-bottom: 1em;
    max-width: 300px; /* Shortened search bar */
}

    .search-input input {
        width: 100%;
        padding: 0.5em;
        border-radius: 4px;
        border: 1px solid #ddd;
    }

.sort-options {
    flex: 1 1 200px;
    text-align: right;
}

    .sort-options label {
        margin-right: 0.5em;
        font-weight: bold;
    }

    .sort-options select {
        padding: 0.5em;
        border-radius: 4px;
        border: 1px solid #ddd;
    }

.amendData-button {
    display: flex;
    justify-content: flex-end;
}

.amendData-btn {
    background: black;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
}

/* responsive */
@media (max-width: 520px) {
  .category-btn {
    min-width: 90px;
    padding: 8px 10px;
  }
  .modal {
    width: 92%;
    padding: 14px;
  }
}
</style>