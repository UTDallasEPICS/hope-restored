<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
        <h1>Reports</h1>

        <!-- View Previous Reports Button -->
        <section class="view-previous-reports">
            <button @click="showPreviousReportsModal = true" class="monthly-reports-button">
                <i class="fas fa-folder-open"></i> View Previous Reports
            </button>
        </section>

        <!-- Previous Reports Modal -->
        <div v-if="showPreviousReportsModal" class="modal-overlay" @click.self="closePreviousReportsModal">
            <div class="modal-content">
                <h2>Previous Reports</h2>
                <p>Select a report to view:</p>

                <!-- Put the existing report buttons here -->
                <div class="report-buttons">
                    <section class="choose-monthly-report">
                        <button @click="openMonthlyFromPrevious" class="monthly-reports-button">
                            <i class="fas fa-plus"></i> Monthly Report
                        </button>
                    </section>

                    <section class="choose-weekly-report">
                        <button @click="openWeeklyFromPrevious" class="weekly-reports-button">
                            <i class="fas fa-plus"></i> Weekly Report
                        </button>
                    </section>

                    <section class="choose-daily-report">
                        <button @click="openDailyFromPrevious" class="daily-reports-button">
                            <i class="fas fa-plus"></i> Daily Report
                        </button>
                    </section>
                </div>

                <div class="form-actions" style="margin-top:1em;">
                    <button class="cancel-button" @click="closePreviousReportsModal">Close</button>
                </div>
            </div>
        </div>

        <!-- Individual report modals (can be opened directly or via Previous Reports) -->
        <div v-if="ChooseMonthlyReport" class="modal-overlay" @click.self="ChooseMonthlyReport = false">
            <div class="modal-content">
                <h2>Monthly Report</h2>
                <p>Monthly report content goes here.</p>
                <div class="form-actions">
                    <button class="cancel-button" @click="ChooseMonthlyReport = false">Close</button>
                </div>
            </div>
        </div>

        <div v-if="ChooseWeeklyReport" class="modal-overlay" @click.self="ChooseWeeklyReport = false">
            <div class="modal-content">
                <h2>Weekly Report</h2>
                <p>Select a week to view:</p>

                <!-- Calendar for Weekly Report -->
                <div class="calendar">
                    <div class="calendar-header">
                        <button @click="prevMonth">‹</button>
                        <div>{{ monthNames[currentMonth] }} {{ currentYear }}</div>
                        <button @click="nextMonth">›</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-weekday" v-for="d in weekDayNames" :key="d">{{ d }}</div>
                        <button class="calendar-day" 
                                v-for="day in visibleDays" 
                                :key="day.key"
                                :class="{ 'other-month': !day.inMonth, 'selected': day.isSelected }"
                                @click="selectWeek(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="cancel-button" @click="ChooseWeeklyReport = false">Close</button>
                </div>
            </div>
        </div>

        <div v-if="ChooseDailyReport" class="modal-overlay" @click.self="ChooseDailyReport = false">
            <div class="modal-content">
                <h2>Daily Report</h2>
                <p>Select a date to view:</p>

                <!-- Calendar for Daily Report -->
                <div class="calendar">
                    <div class="calendar-header">
                        <button @click="prevMonth">‹</button>
                        <div>{{ monthNames[currentMonth] }} {{ currentYear }}</div>
                        <button @click="nextMonth">›</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-weekday" v-for="d in weekDayNames" :key="d">{{ d }}</div>
                        <button class="calendar-day" 
                                v-for="day in visibleDays" 
                                :key="day.key"
                                :class="{ 'other-month': !day.inMonth, 'selected': day.isSelected }"
                                @click="selectDate(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="cancel-button" @click="ChooseDailyReport = false">Close</button>
                </div>
            </div>
        </div>

    </div>
</template>
<script>

export default {
    name: 'ReportsLandingPage',
    data() {
        return {
            // Controls the "Previous Reports" chooser modal
            showPreviousReportsModal: false,

            // Individual report modals
            ChooseMonthlyReport: false,
            ChooseWeeklyReport: false,
            ChooseDailyReport: false,
            // Calendar state (shared by daily and weekly views)
            today: new Date(),
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            selectedDate: null,
        }
    },
    methods: {
        closePreviousReportsModal() {
            this.showPreviousReportsModal = false;
        },
        openMonthlyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.ChooseMonthlyReport = true;
        },
        openWeeklyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.ChooseWeeklyReport = true;
        },
        openDailyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.ChooseDailyReport = true;
        }
        ,
        // Calendar helpers
        prevMonth() {
            if (this.currentMonth === 0) {
                this.currentMonth = 11;
                this.currentYear -= 1;
            } else {
                this.currentMonth -= 1;
            }
        },
        nextMonth() {
            if (this.currentMonth === 11) {
                this.currentMonth = 0;
                this.currentYear += 1;
            } else {
                this.currentMonth += 1;
            }
        },
        // Select a specific date for daily report
        selectDate(date) {
            this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            // you can load report data here
            // keep the daily modal open (or close chooser if it came from chooser)
        },
        // Select a week containing the clicked date (for weekly report)
        selectWeek(date) {
            // compute week start (Sunday) and end (Saturday)
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const day = d.getDay();
            const start = new Date(d);
            start.setDate(d.getDate() - day);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            // store or load weekly report for the range start..end
            this.selectedDate = { weekStart: start, weekEnd: end };
        }
    }
    ,
    computed: {
        monthNames() {
            return [
                'January','February','March','April','May','June',
                'July','August','September','October','November','December'
            ];
        },
        weekDayNames() {
            return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        },
        visibleDays() {
            // Build calendar grid: 6 rows x 7 days = 42 cells
            const year = this.currentYear;
            const month = this.currentMonth;

            const firstOfMonth = new Date(year, month, 1);
            const startDay = firstOfMonth.getDay(); // 0-6 (Sun-Sat)

            // Determine the date that will be placed in the first cell
            const gridStart = new Date(year, month, 1 - startDay);

            const days = [];
            for (let i = 0; i < 42; i++) {
                const d = new Date(gridStart);
                d.setDate(gridStart.getDate() + i);
                const inMonth = d.getMonth() === month;
                let isSelected = false;
                if (this.selectedDate) {
                    if (this.selectedDate instanceof Date) {
                        isSelected = d.toDateString() === this.selectedDate.toDateString();
                    } else if (this.selectedDate && this.selectedDate.weekStart) {
                        // weekly selection: check if date is within week range
                        isSelected = d >= this.selectedDate.weekStart && d <= this.selectedDate.weekEnd;
                    }
                }
                days.push({ date: d, inMonth, key: d.toISOString(), isSelected });
            }
            return days;
        }
    }
}
</script>

<script setup>
// NOTE: We left the classic options API above; this small section is intentionally empty
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

        /* Calendar styles */
        .calendar {
            margin: 1em 0;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5em;
        }
        .calendar-header button {
            background: transparent;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.25em;
        }
        .calendar-weekday {
            text-align: center;
            font-weight: 600;
            padding: 0.25em 0;
            font-size: 0.9em;
            color: #666;
        }
        .calendar-day {
            padding: 0.5em 0.25em;
            min-height: 40px;
            border-radius: 6px;
            border: 1px solid transparent;
            background: #fafafa;
            cursor: pointer;
            text-align: center;
        }
        .calendar-day.other-month {
            color: #bbb;
            background: #fff;
        }
        .calendar-day.selected {
            background: #3f51b5;
            color: white;
            border-color: rgba(0,0,0,0.08);
        }
</style>