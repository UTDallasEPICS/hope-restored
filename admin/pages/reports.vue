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
        <div v-if="showPreviousReportsModal" class="modal-overlay" >
            <div class="modal-content">
                <h2>Previous Reports</h2>
                <p>Select a report to view:</p>

                <!-- Report buttons -->
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
        <div v-if="ChooseMonthlyReport" class="modal-overlay" >
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
                                :class="{ 
                                    'selected': selectedDate && selectedDate.year === displayYear && selectedDate.month === idx,
                                    'disabled': isMonthDisabled(displayYear, idx)
                                }"
                                :disabled="isMonthDisabled(displayYear, idx)"
                                @click="selectMonth(idx)">
                            {{ mName }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="save-button" @click="saveMonthly">Select</button>
                    <button class="cancel-button" @click="closeMonthlyReport">Close</button>
                </div>
            </div>
        </div>

        <div v-if="ChooseWeeklyReport" class="modal-overlay" >
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
                                :class="{ 
                                    'other-month': !day.inMonth, 
                                    'selected': day.isSelected,
                                    'disabled': isWeekDisabled(day.date)
                                }"
                                :disabled="isWeekDisabled(day.date)"
                                @click="selectWeek(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="save-button" @click="saveWeekly">Select</button>
                    <button class="cancel-button" @click="closeWeeklyReport">Close</button>
                </div>
            </div>
        </div>

        <div v-if="ChooseDailyReport" class="modal-overlay" >
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
                                :class="{ 
                                    'other-month': !day.inMonth, 
                                    'selected': day.isSelected,
                                    'disabled': isDayDisabled(day.date)
                                }"
                                :disabled="isDayDisabled(day.date)"
                                @click="selectDate(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="save-button" @click="saveDaily">Select</button>
                    <button class="cancel-button" @click="closeDailyReport">Close</button>
                </div>
            </div>
        </div>

        <!-- Selected report results modal -->
        <div v-if="viewingSelectedReport" class="modal-overlay" >
            <div class="modal-content">
                <button class="back-button" @click="goBackToCalendar"> Back
                </button>
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
      <div v-if="showAmendData" class="modal-overlay">
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
                            :class="{ 
                                'other-month': !day.inMonth, 
                                'selected': day.isSelected,
                                'disabled': isDayDisabled(day.date)
                            }"
                            :disabled="isDayDisabled(day.date)"
                            @click="selectDate(day.date)">
                        {{ day.date.getDate() }}
                    </button>
                </div>
            </div>

            <div class="form-actions">
                <button class="save-button" @click="selectDateForAmend">Select</button>
                <button class="cancel-button" @click="closeAmendData">Close</button>
            </div>
        </div>
      </div>

        <!-- Second pop-up: Amend Data Form -->
        <div v-if="showAmendForm" class="modal-overlay" >
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
        <div v-if="showSuccess" class="modal-overlay" >
        <div class="modal-content">
            <h2>Amendment of data successful for</h2>
            <div v-if="lastAmendDateDisplay" style="color:#333; margin-top:0.5em; text-align:center;">
                {{ lastAmendDateDisplay }}
            </div>
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

// Fetch the first inventory date dynamically
const firstInventoryDate = ref(null);
const { data: firstDateData } = await useFetch('/api/inventory/first-date');
watchEffect(() => {
  if (firstDateData?.value?.firstDate) {
    firstInventoryDate.value = new Date(firstDateData.value.firstDate);
  }
});

// Expose refreshSummary and firstInventoryDate to the Options API part via the instance
const instance = getCurrentInstance();
if (instance) {
  instance.appContext.config.globalProperties.$refreshSummaryData = refreshSummary;
  instance.appContext.config.globalProperties.$firstInventoryDate = firstInventoryDate;
}
</script>

<script>
export default {
    name: 'ReportsLandingPage',
    data() {
        // Calculate today in Central Time before returning data
        const now = new Date();
        const centralTimeString = now.toLocaleString('en-US', { 
            timeZone: 'America/Chicago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const [month, day, year] = centralTimeString.split('/');
        const todayCentral = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        todayCentral.setHours(0, 0, 0, 0);
        
        return {
            // Controls the "Previous Reports" chooser modal
            showPreviousReportsModal: false,

            // Individual report modals
            ChooseMonthlyReport: false,
            ChooseWeeklyReport: false,
            ChooseDailyReport: false,
            // Calendar state (shared by daily and weekly views)
            today: todayCentral,
            currentMonth: todayCentral.getMonth(),
            currentYear: todayCentral.getFullYear(),
            selectedDate: null,
            // Monthly view year display
            displayYear: new Date().getFullYear(),
            showAmendData: false,
            showAmendForm: false,
            showSuccess: false,           
            lastAmendDate: null,
            errorMessage: '',
            form: { category: '', quantity: null, action: '' },
            categories: ['Shirts','Jackets','Pants','Underwear','Shoes','Snack Packs','Hygiene Packs','Blankets'],
            // Selected-report popup
            viewingSelectedReport: false,
            selectedReportRows: [],
            selectedReportTitle: '',
            isLoadingSelected: false,
            selectedError: null,
            lastReportType: null, // Track which report type was selected (daily, weekly, or monthly)
        }
    },
    methods: {
        // Get today's date in US Central Time
        getTodayInCentralTime() {
            const now = new Date();
            // Get the date/time components in Central Time
            const centralTimeString = now.toLocaleString('en-US', { 
                timeZone: 'America/Chicago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            // Parse the MM/DD/YYYY format
            const [month, day, year] = centralTimeString.split('/');
            // Create a new date at midnight
            const centralDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            centralDate.setHours(0, 0, 0, 0);
            return centralDate;
        },
        // Reset calendar state to today and clear any selection
        resetCalendarToToday() {
            const t = this.getTodayInCentralTime();
            this.today = new Date(t);
            this.currentMonth = t.getMonth();
            this.currentYear = t.getFullYear();
            this.displayYear = t.getFullYear();
            this.selectedDate = null;
        },
        // Helper method to check if a date (day) is disabled
        // Helper method to check if a date (day) is disabled
        isDayDisabled(date) {
            // Normalize all dates to midnight for accurate comparison
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            checkDate.setHours(0, 0, 0, 0);
            
            // Get today in Central Time
            const todayDate = this.getTodayInCentralTime();
            
            const firstDate = new Date(this.firstAllowedDate.getFullYear(), this.firstAllowedDate.getMonth(), this.firstAllowedDate.getDate());
            firstDate.setHours(0, 0, 0, 0);
            
            // Disable if before first allowed date or after today (allow today)
            return checkDate < firstDate || checkDate > todayDate;
        },
        
        // Helper method to check if a week is disabled
        isWeekDisabled(date) {
            // Calculate the week start (Sunday) for the clicked date
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const day = d.getDay();
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - day);
            weekStart.setHours(0, 0, 0, 0);
            
            // Calculate week end (Saturday) at end of day
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            // Get first allowed date and today
            const firstDate = new Date(this.firstAllowedDate.getFullYear(), this.firstAllowedDate.getMonth(), this.firstAllowedDate.getDate());
            firstDate.setHours(0, 0, 0, 0);
            
            const today = this.getTodayInCentralTime();
            today.setHours(23, 59, 59, 999); // Include all of today
            
            // The week is valid only if the intersection of [weekStart, weekEnd] and [firstDate, today] is non-empty
            // Intersection is non-empty if: max(weekStart, firstDate) <= min(weekEnd, today)
            const intersectionStart = Math.max(weekStart.getTime(), firstDate.getTime());
            const intersectionEnd = Math.min(weekEnd.getTime(), today.getTime());
            
            const hasValidDates = intersectionStart <= intersectionEnd;
            
            return !hasValidDates;
        },
        
        // Helper method to check if a month is disabled
        isMonthDisabled(year, monthIndex) {
            // Create date for last day of the selected month at end of day
            const selectedMonthEnd = new Date(year, monthIndex + 1, 0);
            selectedMonthEnd.setHours(23, 59, 59, 999);
            
            // Create first day of selected month at start of day
            const selectedMonthStart = new Date(year, monthIndex, 1);
            selectedMonthStart.setHours(0, 0, 0, 0);
            
            // Get first allowed date and today
            const firstDate = new Date(this.firstAllowedDate.getFullYear(), this.firstAllowedDate.getMonth(), this.firstAllowedDate.getDate());
            firstDate.setHours(0, 0, 0, 0);
            
            const today = this.getTodayInCentralTime();
            today.setHours(23, 59, 59, 999); // Include all of today
            
            // The month is valid only if the intersection of [monthStart, monthEnd] and [firstDate, today] is non-empty
            // Intersection is non-empty if: max(monthStart, firstDate) <= min(monthEnd, today)
            const intersectionStart = Math.max(selectedMonthStart.getTime(), firstDate.getTime());
            const intersectionEnd = Math.min(selectedMonthEnd.getTime(), today.getTime());
            
            const hasValidDates = intersectionStart <= intersectionEnd;
            
            return !hasValidDates;
        },
        
        closePreviousReportsModal() {
            this.showPreviousReportsModal = false;
        },
        closeMonthlyReport() {
            this.ChooseMonthlyReport = false;
            this.selectedDate = null;
        },
        closeWeeklyReport() {
            this.ChooseWeeklyReport = false;
            this.selectedDate = null;
        },
        closeDailyReport() {
            this.ChooseDailyReport = false;
            this.selectedDate = null;
        },
        closeAmendData() {
            this.showAmendData = false;
            this.selectedDate = null;
        },
        openMonthlyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.resetCalendarToToday();
            this.ChooseMonthlyReport = true;
        },
        openWeeklyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.resetCalendarToToday();
            this.ChooseWeeklyReport = true;
        },
        openDailyFromPrevious() {
            this.showPreviousReportsModal = false;
            this.resetCalendarToToday();
            this.ChooseDailyReport = true;
        },
        openAmendData() {
            this.showAmendData = true;
        },
        goBackToCalendar() {
            // Close the report view
            this.viewingSelectedReport = false;
            // Reopen the appropriate calendar modal based on last report type
            if (this.lastReportType === 'daily') {
                this.ChooseDailyReport = true;
            } else if (this.lastReportType === 'weekly') {
                this.ChooseWeeklyReport = true;
            } else if (this.lastReportType === 'monthly') {
                this.ChooseMonthlyReport = true;
            }
        },
        selectDateForAmend() {
            if (!this.selectedDate || !(this.selectedDate instanceof Date)) {
                // No date selected, do nothing
                return;
            }
            // Close calendar pop-up
            this.showAmendData = false;
            // Open amend form modal
            this.showAmendForm = true;
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
            // Check if date is disabled
            if (this.isDayDisabled(date)) {
                return;
            }
            
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            // if already selected same day, deselect
            if (this.selectedDate instanceof Date && this.selectedDate.toDateString() === d.toDateString()) {
                this.selectedDate = null;
                return;
            }
            this.selectedDate = d;
        },
        // Select a week containing the clicked date (for weekly report)
        selectWeek(date) {
            // Check if week is disabled
            if (this.isWeekDisabled(date)) {
                return;
            }
            
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
            // Check if month is disabled
            if (this.isMonthDisabled(this.displayYear, monthIndex)) {
                return;
            }
            
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
                // Use native fetch API with JSON serialization
                const response = await fetch('/api/amend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        selectedDate: this.selectedDate,
                        category,
                        quantity,
                        action
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error ${response.status}`);
                }

                const res = await response.json();
                
                if (res.success) {
                    if (this.selectedDate && this.selectedDate instanceof Date) {
                        this.lastAmendDate = new Date(this.selectedDate.getTime()); // clone
                    } else {
                        this.lastAmendDate = null;
                    }
                    this.showAmendForm = false;
                    this.showSuccess = true;
                    this.form = { category: '', quantity: null, action: '' };
                    
                    if (this.$refreshSummaryData) {
                        await this.$refreshSummaryData();
                    } else {
                    }
                }
            } catch (err) {
                console.error('Amendment error:', err);
                this.errorMessage = err.message || 'An error occurred.';
            }
        }
        ,
        // Placeholder save handlers for the modal Save buttons
        async saveMonthly() {
            if (!this.selectedDate || this.selectedDate.year === undefined || this.selectedDate.month === undefined) {
                // nothing selected: do nothing (keep modal open)
                return;
            }
            this.isLoadingSelected = true;
            this.selectedError = null;
            this.lastReportType = 'monthly'; // Track report type
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
                this.selectedDate = null;
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
            this.lastReportType = 'weekly'; // Track report type
            try {
                // Format dates as YYYY-MM-DD in local timezone (not UTC)
                const formatLocalDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                // Format dates for display (e.g., "October 19")
                const formatDisplayDate = (date) => {
                    const monthName = this.monthNames[date.getMonth()];
                    const day = date.getDate();
                    return `${monthName} ${day}`;
                };
                const start = formatLocalDate(this.selectedDate.weekStart);
                const end = formatLocalDate(this.selectedDate.weekEnd);
                const res = await fetch(`/api/reports/summary?start=${start}&end=${end}`);
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data = await res.json();
                this.selectedReportRows = Array.isArray(data) ? data : this.mapApiResponseToRows(data);
                // Create readable title with full date range
                const startDisplay = formatDisplayDate(this.selectedDate.weekStart);
                const endDisplay = formatDisplayDate(this.selectedDate.weekEnd);
                const year = this.selectedDate.weekEnd.getFullYear();
                this.selectedReportTitle = `${startDisplay} - ${endDisplay} ${year}`;
                this.viewingSelectedReport = true;
                this.ChooseWeeklyReport = false;
                this.selectedDate = null;
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
            this.lastReportType = 'daily'; // Track report type
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
                // Format display title (e.g., "October 19 2025")
                const monthName = this.monthNames[this.selectedDate.getMonth()];
                const dayNum = this.selectedDate.getDate();
                this.selectedReportTitle = `${monthName} ${dayNum} ${year}`;
                this.viewingSelectedReport = true;
                this.ChooseDailyReport = false;
                this.selectedDate = null;
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
        // display only the day (no time) in Central Time
        lastAmendDateDisplay() {
            if (!this.lastAmendDate) return '';
            return new Date(this.lastAmendDate).toLocaleDateString('en-US', {
                timeZone: 'America/Chicago',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        },
        firstAllowedDate() {
            // Get the dynamically fetched first inventory date
            // Fall back to a safe default if not yet loaded
            const dynamicDate = this.$firstInventoryDate?.value;
            if (dynamicDate instanceof Date && !isNaN(dynamicDate.getTime())) {
                return dynamicDate;
            }
            // Default fallback date (very old date that won't restrict much)
            return new Date(2020, 0, 1);
        },
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
    max-height: 300px; 
    overflow-y: auto; /* Vertical scroll */
    overflow-x: auto; /* Horizontal scroll */
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
    position: relative;
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
    align-items: stretch;     /* make children fill width */
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
.calendar-day.disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.6;
}
.calendar-day.disabled:hover {
    background: #e0e0e0;
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
.month-cell.disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.6;
}
.month-cell.disabled:hover {
    background: #e0e0e0;
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

.back-button {
    position: absolute;
    top: 1em;
    left: 1em;
    padding: 0.5em 1em;
    background-color: #757575;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 0em;
    transition: background-color 0.3s ease;
}

.back-button:hover {
    background-color: #616161;
}
</style>