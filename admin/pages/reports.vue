<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
        <h1 style="color: red;"> NOTE: Please enter data in chronological order from earliest date to the most recent date/today. Do NOT enter data for a date without entering any previous days' data. In addition, for each date, please enter all additions first and then all removals. This ensures that the reports and inventory show correct data for all dates. </h1>

        <!-- Actions Row: View Previous Reports + Amend Data -->
        <div class="actions-row">
            <button @click="showPreviousReportsModal = true" class="monthly-reports-button">
                <i class="fas fa-folder-open"></i> View Previous Reports
            </button>
            <button class="amendData-btn" @click="openAmendData">Amend Data</button>
        </div>

        <!-- Previous Reports Modal -->
        <div v-if="showPreviousReportsModal" class="modal-overlay" @click.self="closePreviousReportsModal">
            <div class="modal-content">
                <h2>Previous Reports</h2>
                <p>Select a report to view:</p>

                <!-- Put the existing report buttons here -->
                <div class="report-buttons">
                    <section class="choose-daily-report">
                        <button @click="openDailyFromPrevious" class="daily-reports-button">
                            <i class="fas fa-plus"></i> Daily Report
                        </button>
                    </section>

                    <section class="choose-weekly-report">
                        <button @click="openWeeklyFromPrevious" class="weekly-reports-button">
                            <i class="fas fa-plus"></i> Weekly Report
                        </button>
                    </section>

                    <section class="choose-monthly-report">
                        <button @click="openMonthlyFromPrevious" class="monthly-reports-button">
                            <i class="fas fa-plus"></i> Monthly Report
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
                <p>Select a month to view:</p>

                <div class="calendar">
                    <div class="calendar-header">
                        <button @click="prevYear">‹</button>
                        <div>{{ displayYear }}</div>
                        <button @click="nextYear">›</button>
                    </div>

                    <div class="month-grid">
                        <button v-for="(mName, idx) in monthNames" :key="mName"
                                class="month-cell"
                                :class="{ 'selected': selectedDate && selectedDate.year === displayYear && selectedDate.month === idx }"
                                @click="selectMonth(idx)">
                            {{ mName }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="save-button" @click="saveMonthly">Save</button>
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
                    <button class="save-button" @click="saveWeekly">Save</button>
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
                    <button class="save-button" @click="saveDaily">Save</button>
                    <button class="cancel-button" @click="ChooseDailyReport = false">Close</button>
                </div>
            </div>
        </div>

        <!-- Selected report results modal -->
        <div v-if="viewingSelectedReport" class="modal-overlay" @click.self="viewingSelectedReport = false">
            <div class="modal-content">
                <h2>Report for: {{ selectedReportTitle }}</h2>

                <div v-if="isLoadingSelected">Loading...</div>
                <div v-else>
                    <div v-if="selectedError" style="color: #b00020; margin-bottom: 1em;">{{ selectedError }}</div>
                    <div v-else>
                        <div id="reports-summary">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Total</th>
                                        <th>Added</th>
                                        <th>Removed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="r in selectedReportRows" :key="r.category">
                                        <td>{{ r.category }}</td>
                                        <td>{{ r.total }}</td>
                                        <td>{{ r.added }}</td>
                                        <td>{{ r.removed }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="form-actions" style="margin-top:1em;">
                    <button class="cancel-button" @click="viewingSelectedReport = false">Close</button>
                </div>
            </div>
        </div>

      

      <!-- Amend Data Modal -->
      <div v-if="showAmendData" class="modal-overlay" @click.self="showAmendData = false">
        <div class="modal-content">
            <h2>Amend Data</h2>
            <p>Choose a date to amend data for that date:</p>

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
                <button class="cancel-button" @click="showAmendData = false">Close</button>
            </div>
        </div>
      </div>

        <!-- Second pop-up: Amend Data Form -->
        <div v-if="showAmendForm" class="modal-overlay" @click.self="showAmendForm = false">
        <div class="modal-content">
            <h2>Amend Data for {{ selectedDateFormatted }}</h2>

            <div v-if="errorMessage" style="color: red; margin-bottom: 1em;">{{ errorMessage }}</div>

            <div class="form-group">
            <label>Category:</label>
            <select v-model="form.category">
                <option disabled value="">Select category</option>
                <option v-for="opt in categories" :key="opt">{{ opt }}</option>
            </select>
            </div>

            <div class="form-group">
            <label>Quantity:</label>
            <input type="number" v-model.number="form.quantity" min="1" />
            </div>

            <div class="form-group">
            <label>Action:</label>
            <select v-model="form.action">
                <option disabled value="">Select action</option>
                <option>Add</option>
                <option>Remove</option>
            </select>
            </div>

            <div class="form-actions">
            <button class="save-button" @click="submitAmend">Confirm</button>
            <button class="cancel-button" @click="showAmendForm = false">Cancel</button>
            </div>
        </div>
        </div>

        <!-- Success message -->
        <div v-if="showSuccess" class="modal-overlay" @click.self="showSuccess = false">
        <div class="modal-content">
            <h2>Amendment of data successful!</h2>
            <div class="form-actions">
            <button class="save-button" @click="showSuccess = false">OK</button>
            </div>
        </div>
        </div>

        <!-- Reports Summary Table Section -->
        <h2 class="reports-section-title">Today's Data:</h2>
        <div id="reports-summary" class="inventory_table_container">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Total</th>
                        <th>Added</th>
                        <th>Removed</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in reportRows" :key="row.category">
                        <td>{{ row.category }}</td>
                        <td>{{ row.total }}</td>
                        <td>{{ row.added }}</td>
                        <td>{{ row.removed }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, getCurrentInstance } from 'vue';
import { useFetch } from '#app';

// Reports data (SSR-friendly): fetch at top-level so renders data immediately
const reportRows = ref([]);
const { data: summaryData, error: summaryError, refresh: refreshSummary } = await useFetch('/api/reports/summary');

watchEffect(() => {
  if (summaryError?.value) {
    // eslint-disable-next-line no-console
    console.error('Failed to load report summary', summaryError.value);
    reportRows.value = [];
  } else if (summaryData?.value) {
    reportRows.value = Array.isArray(summaryData.value) ? summaryData.value : [];
  }
});

// Expose refreshSummary to the Options API part via the instance
const instance = getCurrentInstance();
if (instance) {
  instance.appContext.config.globalProperties.$refreshSummaryData = refreshSummary;
}
</script>

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
            // Monthly view year display
            displayYear: new Date().getFullYear(),
            showAmendData: false,
            showAmendForm: false,
            showSuccess: false,
            errorMessage: '',
            form: { category: '', quantity: null, action: '' },
            categories: ['Shirts','Jackets','Pants','Underwear','Shoes','Snack Packs','Hygiene Packs'],
            // Selected-report popup
            viewingSelectedReport: false,
            selectedReportRows: [],
            selectedReportTitle: '',
            isLoadingSelected: false,
            selectedError: null
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
        },
        openAmendData() {
            this.showAmendData = true;
        },
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
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            // if already selected same day, deselect
            if (this.selectedDate instanceof Date && this.selectedDate.toDateString() === d.toDateString()) {
                this.selectedDate = null;
                return;
            }
            this.selectedDate = d;
            // you can load report data here
            // keep the daily modal open (or close chooser if it came from chooser)
            if (this.showAmendData) {
                // Close calendar pop-up
                this.showAmendData = false;
                // Open amend form modal
                this.showAmendForm = true;
            }
        },
        // Select a week containing the clicked date (for weekly report)
        selectWeek(date) {
            // compute week start (Sunday) and end (Saturday)
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const day = d.getDay();
            const start = new Date(d);
            start.setDate(d.getDate() - day);
            start.setHours(0,0,0,0);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23,59,59,999);
            // if same week already selected, deselect
            if (this.selectedDate && this.selectedDate.weekStart) {
                const existingStart = new Date(this.selectedDate.weekStart);
                const existingEnd = new Date(this.selectedDate.weekEnd);
                if (existingStart.toDateString() === start.toDateString() && existingEnd.toDateString() === end.toDateString()) {
                    this.selectedDate = null;
                    return;
                }
            }
            // store or load weekly report for the range start..end
            this.selectedDate = { weekStart: start, weekEnd: end };
        },
        // Monthly navigation and selection
        prevYear() {
            this.displayYear -= 1;
        },
        nextYear() {
            this.displayYear += 1;
        },
        selectMonth(monthIndex) {
            // If current selectedDate is a month selection
            if (this.selectedDate && this.selectedDate.year !== undefined && this.selectedDate.month !== undefined) {
                if (this.selectedDate.year === this.displayYear && this.selectedDate.month === monthIndex) {
                    // toggle off
                    this.selectedDate = null;
                    return;
                }
            }
            // set month selection
            this.selectedDate = { year: this.displayYear, month: monthIndex };
        },
        async submitAmend() {
            this.errorMessage = '';
            const { category, quantity, action } = this.form;
            if (!category || !quantity || !action || quantity <= 0) {
                this.errorMessage = 'Please fill all fields with valid values.';
                return;
            }

            try {
                const res = await $fetch('/api/amend', {
                    method: 'POST',
                    body: {
                        selectedDate: this.selectedDate,
                        category,
                        quantity,
                        action
                    }
                });
                if (res.success) {
                    this.showAmendForm = false;
                    this.showSuccess = true;
                    this.form = { category: '', quantity: null, action: '' };
                    
                    // CRITICAL: Refresh the summary data to show updated totals without page reload
                    await this.$refreshSummaryData();
                }
            } catch (err) {
                this.errorMessage = err.data?.message || 'An error occurred.';
            }
        },
        // Placeholder save handlers for the modal Save buttons
        async saveMonthly() {
            if (!this.selectedDate || this.selectedDate.year === undefined || this.selectedDate.month === undefined) {
                // nothing selected: do nothing (keep modal open)
                return;
            }
            this.isLoadingSelected = true;
            this.selectedError = null;
            try {
                const year = this.selectedDate.year;
                const month = this.selectedDate.month + 1; // 1-based
                const res = await fetch(`/api/reports/summary?year=${year}&month=${String(month).padStart(2,'0')}`);
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data = await res.json();
                this.selectedReportRows = Array.isArray(data) ? data : this.mapApiResponseToRows(data);
                this.selectedReportTitle = `${this.monthNames[this.selectedDate.month]} ${this.selectedDate.year}`;
                this.viewingSelectedReport = true;
                this.ChooseMonthlyReport = false;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to load monthly report', err);
                this.selectedError = err.message || String(err);
            } finally {
                this.isLoadingSelected = false;
            }
        },
        async saveWeekly() {
            if (!this.selectedDate || !this.selectedDate.weekStart || !this.selectedDate.weekEnd) return;
            this.isLoadingSelected = true;
            this.selectedError = null;
            try {
                // Format dates as YYYY-MM-DD in local timezone (not UTC)
                const formatLocalDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                const start = formatLocalDate(this.selectedDate.weekStart);
                const end = formatLocalDate(this.selectedDate.weekEnd);
                const res = await fetch(`/api/reports/summary?start=${start}&end=${end}`);
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data = await res.json();
                this.selectedReportRows = Array.isArray(data) ? data : this.mapApiResponseToRows(data);
                this.selectedReportTitle = `Week of ${start}`;
                this.viewingSelectedReport = true;
                this.ChooseWeeklyReport = false;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to load weekly report', err);
                this.selectedError = err.message || String(err);
            } finally {
                this.isLoadingSelected = false;
            }
        },
        async saveDaily() {
            if (!this.selectedDate || !(this.selectedDate instanceof Date)) return;
            this.isLoadingSelected = true;
            this.selectedError = null;
            try {
                // Format date as YYYY-MM-DD in local timezone (not UTC)
                const year = this.selectedDate.getFullYear();
                const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(this.selectedDate.getDate()).padStart(2, '0');
                const d = `${year}-${month}-${day}`;
                const res = await fetch(`/api/reports/summary?date=${d}`);
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data = await res.json();
                this.selectedReportRows = Array.isArray(data) ? data : this.mapApiResponseToRows(data);
                this.selectedReportTitle = d;
                this.viewingSelectedReport = true;
                this.ChooseDailyReport = false;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to load daily report', err);
                this.selectedError = err.message || String(err);
            } finally {
                this.isLoadingSelected = false;
            }
        },

        // Normalize API shapes like object-by-category into an array of rows
        mapApiResponseToRows(apiData) {
            if (!apiData) return [];
            if (Array.isArray(apiData)) return apiData;
            // if keyed object { category: { total, added, removed }, ... }
            return Object.keys(apiData).map(k => {
                const v = apiData[k] || {};
                return {
                    category: k,
                    total: v.total ?? v.count ?? 0,
                    added: v.added ?? 0,
                    removed: v.removed ?? 0,
                };
            });
        }
    },
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
        },
        selectedDateFormatted() {
            if (!this.selectedDate) return '';
            return this.selectedDate.toDateString();
        }
    }
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

/* Reuse inventory table styles */
#reports-summary table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#reports-summary th,
#reports-summary td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    text-align: center;
}

#reports-summary th {
    background-color: #3f51b5; /* Indigo */
    color: #fff;
    font-weight: bold;
}

#reports-summary tr:nth-child(even) {
    background-color: #f9f9f9;
}

#reports-summary tr:hover {
    background-color: #e0e0e0;
}

#reports-summary td {
    color: #333;
}

.reports-section-title {
    font-size: 1.8em;
    color: #3f51b5; /* Indigo */
    margin: 1em 0 0.5em;
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
    background-color: #4c5baf; 
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
    background-color: #4c5baf; 
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
    background-color: #4c5baf;
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

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.report-buttons {
    display: flex;
    flex-direction: column;   /* stack vertically */
    gap: 0.75rem;
    align-items: stretch;     /* make children fill width if you want */
    width: 100%;
}

.report-buttons > section {
    width: 100%;
}

.report-buttons button {
    width: 100%;              /* make each button full width inside its section */
    justify-content: center;  /* center icon + text */
}

.actions-row {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-bottom: 1em;
}


.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
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

/* Month grid (3 columns x 4 rows) */
.month-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5em;
    margin-top: 0.5em;
}
.month-cell {
    padding: 0.75em 0.5em;
    background: #fafafa;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
}
.month-cell.selected {
    background: #3f51b5;
    color: #fff;
    font-weight: 700;
}
.amendData-btn {
    padding: 0.5em 1.5em;
    background-color: #4c5baf;
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
</style>