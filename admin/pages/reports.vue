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
  name: "PopupExample",
  data() {
    return {
      showPopup: false
    };
  },
  methods: {
    closePopup() {
      this.showPopup = false;
    },
    doAction(actionName) {
      alert(`You clicked ${actionName}`);
      this.closePopup();
    }
  }
};
</script>

<style scoped>
/* Basic styling for popup */
.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
</style>