<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
        <h1>  </h1>
    </div>
</template>
<script>

export default {
    name: 'ReportsLandingPage'
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

        /* Modal Styling */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
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
</style>