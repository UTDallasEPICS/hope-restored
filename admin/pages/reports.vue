<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
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
    </div>
</template>
<script>
export default {
    name: 'ReportsLandingPage'
}
</script>

<style scoped>
.reports-landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

</style>