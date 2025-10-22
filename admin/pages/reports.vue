<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
        <h1 style="color: red;"> NOTE: Please enter data in chronological order from earliest date to the most recent date/today. Do NOT enter data for a date without entering any previous days' data. In addition, for each date, please enter all additions first and then all removals. This ensures that the reports and inventory show correct data for all dates. </h1>
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
                                :class="{ 'selected': selectedDate && 'year' in selectedDate && selectedDate.year === displayYear && selectedDate.month === idx }"
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

      <!-- Amend Data button -->
      <div class="amendData-button">
        <button class="amendData-btn" @click="openAmendData">
          Amend Data
        </button>
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
                    <tr v-for="aCat in allCategories" :key="aCat">
                        <td>{{ aCat }}</td>
                        <td>{{ todayTotals[aCat] ?? 0 }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useFetch } from 'nuxt/app'

// Type definitions
interface ReportRow {
  category: string
  total: number
  added: number
  removed: number
}

interface MonthSelection {
  year: number
  month: number
}

interface WeekSelection {
  weekStart: Date
  weekEnd: Date
}

type DateSelection = Date | MonthSelection | WeekSelection | null

interface DayInfo {
  date: Date
  inMonth: boolean
  key: string
  isSelected: boolean
}

interface AmendForm {
  category: string
  quantity: number | null
  action: string
}

// Modal states
const showPreviousReportsModal = ref(false)
const ChooseMonthlyReport = ref(false)
const ChooseWeeklyReport = ref(false)
const ChooseDailyReport = ref(false)
const showAmendData = ref(false)
const showAmendForm = ref(false)
const showSuccess = ref(false)

// Calendar state
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDate = ref<DateSelection>(null)
const displayYear = ref(today.getFullYear())

// Form state
const errorMessage = ref('')
const form = ref<AmendForm>({ 
  category: '', 
  quantity: null, 
  action: '' 
})

const categories = [
  'Shirts',
  'Jackets',
  'Pants',
  'Underwear',
  'Shoes',
  'Snack Packs',
  'Hygiene Packs'
]

// Selected report state
const viewingSelectedReport = ref(false)
const selectedReportRows = ref<ReportRow[]>([])
const selectedReportTitle = ref('')
const isLoadingSelected = ref(false)
const selectedError = ref<string | null>(null)

// Today's totals
const todayTotals = ref<Record<string, number>>({})
const allCategories = [
  'Shirts',
  'Jackets',
  'Pants',
  'Underwear',
  'Shoes',
  'Snack Packs',
  'Hygiene Packs',
  'Socks',
  'Tops'
]

// Reports data (SSR-friendly)
const reportRows = ref<ReportRow[]>([])
const { data: summaryData, error: summaryError } = await useFetch('/api/reports/summary')

watchEffect(() => {
  if (summaryError?.value) {
    console.error('Failed to load report summary', summaryError.value)
    reportRows.value = []
  } else if (summaryData?.value) {
    reportRows.value = Array.isArray(summaryData.value) 
    ? summaryData.value.map(row => ({
        category: row.category,
        total: Number(row.total) || 0,
        added: Number(row.added) || 0,
        removed: Number(row.removed) || 0
        }))
    : []
  }
})

// Computed properties
const monthNames = computed(() => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
])

const weekDayNames = computed(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

const visibleDays = computed((): DayInfo[] => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startDay)

  const days: DayInfo[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    const inMonth = d.getMonth() === month
    let isSelected = false
    
    if (selectedDate.value) {
      if (selectedDate.value instanceof Date) {
        isSelected = d.toDateString() === selectedDate.value.toDateString()
      } else if ('weekStart' in selectedDate.value) {
        isSelected = d >= selectedDate.value.weekStart && d <= selectedDate.value.weekEnd
      }
    }
    
    days.push({ 
      date: d, 
      inMonth, 
      key: d.toISOString(), 
      isSelected 
    })
  }
  return days
})

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return ''
  if (selectedDate.value instanceof Date) {
    return selectedDate.value.toDateString()
  }
  return ''
})

// Methods
function closePreviousReportsModal() {
  showPreviousReportsModal.value = false
}

function openMonthlyFromPrevious() {
  showPreviousReportsModal.value = false
  ChooseMonthlyReport.value = true
}

function openWeeklyFromPrevious() {
  showPreviousReportsModal.value = false
  ChooseWeeklyReport.value = true
}

function openDailyFromPrevious() {
  showPreviousReportsModal.value = false
  ChooseDailyReport.value = true
}

function openAmendData() {
  showAmendData.value = true
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function selectDate(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (selectedDate.value instanceof Date && selectedDate.value.toDateString() === d.toDateString()) {
    selectedDate.value = null
    return
  }
  
  selectedDate.value = d
  
  if (showAmendData.value) {
    showAmendData.value = false
    showAmendForm.value = true
  }
}

function selectWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  if (selectedDate.value && typeof selectedDate.value === 'object' && 'weekStart' in selectedDate.value) {
    const existingStart = new Date(selectedDate.value.weekStart)
    const existingEnd = new Date(selectedDate.value.weekEnd)
    if (existingStart.toDateString() === start.toDateString() && existingEnd.toDateString() === end.toDateString()) {
      selectedDate.value = null
      return
    }
  }
  
  selectedDate.value = { weekStart: start, weekEnd: end }
}

function prevYear() {
  displayYear.value -= 1
}

function nextYear() {
  displayYear.value += 1
}

function selectMonth(monthIndex: number) {
  if (selectedDate.value && typeof selectedDate.value === 'object' && 'year' in selectedDate.value) {
    if (selectedDate.value.year === displayYear.value && selectedDate.value.month === monthIndex) {
      selectedDate.value = null
      return
    }
  }
  selectedDate.value = { year: displayYear.value, month: monthIndex }
}

async function submitAmend() {
  errorMessage.value = ''
  const { category, quantity, action } = form.value
  
  if (!category || !quantity || !action || quantity <= 0) {
    errorMessage.value = 'Please fill all fields with valid values.'
    return
  }

  try {
    const res = await $fetch('/api/amend', {
      method: 'POST',
      body: {
        selectedDate: selectedDate.value,
        category,
        quantity,
        action
      }
    })
    
    if (res && typeof res === 'object' && 'success' in res && res.success) {
      showAmendForm.value = false
      showSuccess.value = true
      form.value = { category: '', quantity: null, action: '' }
      await fetchTodayTotals()
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'An error occurred.'
  }
}

async function saveMonthly() {
  if (!selectedDate.value || typeof selectedDate.value !== 'object' || !('year' in selectedDate.value)) {
    return
  }
  
  isLoadingSelected.value = true
  selectedError.value = null
  
  try {
    const year = selectedDate.value.year
    const month = selectedDate.value.month + 1
    const res = await fetch(`/api/reports/summary?year=${year}&month=${String(month).padStart(2, '0')}`)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data)
    selectedReportTitle.value = `${monthNames.value[selectedDate.value.month]} ${selectedDate.value.year}`
    viewingSelectedReport.value = true
    ChooseMonthlyReport.value = false
  } catch (err: any) {
    console.error('Failed to load monthly report', err)
    selectedError.value = err.message || String(err)
  } finally {
    isLoadingSelected.value = false
  }
}

async function saveWeekly() {
  if (!selectedDate.value || typeof selectedDate.value !== 'object' || !('weekStart' in selectedDate.value)) {
    return
  }
  
  isLoadingSelected.value = true
  selectedError.value = null
  
  try {
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const start = formatLocalDate(selectedDate.value.weekStart)
    const end = formatLocalDate(selectedDate.value.weekEnd)
    const res = await fetch(`/api/reports/summary?start=${start}&end=${end}`)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data)
    selectedReportTitle.value = `Week of ${start}`
    viewingSelectedReport.value = true
    ChooseWeeklyReport.value = false
  } catch (err: any) {
    console.error('Failed to load weekly report', err)
    selectedError.value = err.message || String(err)
  } finally {
    isLoadingSelected.value = false
  }
}

async function saveDaily() {
  if (!selectedDate.value || !(selectedDate.value instanceof Date)) return
  
  isLoadingSelected.value = true
  selectedError.value = null
  
  try {
    const year = selectedDate.value.getFullYear()
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.value.getDate()).padStart(2, '0')
    const d = `${year}-${month}-${day}`
    const res = await fetch(`/api/reports/summary?date=${d}`)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data)
    selectedReportTitle.value = d
    viewingSelectedReport.value = true
    ChooseDailyReport.value = false
  } catch (err: any) {
    console.error('Failed to load daily report', err)
    selectedError.value = err.message || String(err)
  } finally {
    isLoadingSelected.value = false
  }
}

function mapApiResponseToRows(apiData: any): ReportRow[] {
  if (!apiData) return []
  if (Array.isArray(apiData)) return apiData
  
  return Object.keys(apiData).map(k => {
    const v = apiData[k] || {}
    return {
      category: k,
      total: v.total ?? v.count ?? 0,
      added: v.added ?? 0,
      removed: v.removed ?? 0,
    }
  })
}

async function fetchTodayTotals() {
  try {
    const res = await fetch('/api/todayTotals')
    const data = await res.json()

    const totals: Record<string, number> = {}
    allCategories.forEach(aCat => {
      totals[aCat] = data[aCat] ?? 0
    })

    todayTotals.value = totals
  } catch (err) {
    console.error('Error fetching today totals:', err)
  }
}

onMounted(() => {
  fetchTodayTotals()
})
</script>

<style scoped>
.reports-container {
    font-family: 'Open Sans', sans-serif;
    padding: 2em;
    background-color: #f0f2f5;
    min-height: 100vh;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: auto;
}

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
    background-color: #3f51b5;
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
    color: #3f51b5;
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
    color: #3f51b5;
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
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    width: 100%;
}

.report-buttons > section {
    width: 100%;
}

.report-buttons button {
    width: 100%;
    justify-content: center;
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
    background-color: #4caf50;
}

.save-button:hover {
    background-color: #43a047;
}

.cancel-button {
    background-color: #f44336;
}

.cancel-button:hover {
    background-color: #e53935;
}

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
    max-width: 300px;
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
    background-color: blue;
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