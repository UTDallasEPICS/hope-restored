<!-- pages/reports.vue -->
<template>
    <div class="reports-container">
        <!-- Actions Row: View Previous Reports -->
        <div class="actions-row">
            <button @click="showPreviousReportsModal = true" class="monthly-reports-button">
                <i class="fas fa-folder-open"></i> View Report
            </button>
            <button @click="showFullInv= !showFullInv" class="monthly-reports-button">
                <i class="fas fa-folder-open"></i> {{ !showFullInv? "Master Report": "Detail View" }}
            </button>
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
                    <button class="cancel-button" @click="showPreviousReportsModal = false">Close</button>
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
                                            'disabled': isMonthDisabled(displayYear, idx),
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
                                       'disabled': isWeekDisabled(day.date),
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
                                       'disabled': isDayDisabled(day.date),
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
        <div v-if="viewingSelectedReport" class="modal-overlay w-1/2" >
            <div class="modal-content overflow-y-auto">
                <button class="absolute top-[1em] left-[1em] px-2 py-2 bg-[#757575] text-white rounded-sm cursor-pointer text-[0.9em]"  
                    @click="goBackToCalendar"> Back
                </button>
                <button @click="showFullReport= !showFullReport" class="absolute top-[1em] right-[1em] px-2 py-2 bg-[#4c5baf] text-white rounded-sm cursor-pointer text-[0.9em]">
                    {{ !showFullReport? "Master Report": "Detail View" }}
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
                                        <th v-if="!showFullReport">Details</th>
                                    </tr>
                                </thead>
                                <tbody v-for="row in selectedReportRows" :key="row.category">
                                    <tr class="hover:bg-[#e0e0e0]">
                                        <td class="font-bold text-lg">{{ row.category }}</td>
                                        <td>{{ row.quantity }}</td>
                                        <td>{{ row.additions }}</td>
                                        <td>{{ row.removals }}</td>
                                        <td v-if="!showFullReport">
                                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                                View Sizes
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="showFullReport && !simpleCategores.includes(row.category)" class="bg-white">
                                        <td colspan="4">
                                            <template v-for="gender in row.genders" :key="gender.name">
                                                <div>
                                                    <h1 class="font-semibold text-left text-lg border-b">{{ gender.name }}</h1>
                                                    <table class="w-full " v-if="gender.info.some(i => i.quantity !== 0)">
                                                        <thead class="text-black font-bold">
                                                            <tr>
                                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">{{row.category!=="Other Items"? "Size" : "Item"}}</th>
                                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Quantity</th>
                                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Added</th>
                                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Removed</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="bg-gray-100 text-center">
                                                            <template v-for="infoRow in gender.info" :key="infoRow.size">
                                                                <tr class="border-b-2 odd:bg-white even:bg-gray-50" v-if="infoRow.quantity !== 0">
                                                                    <td>{{ infoRow.size }}</td>
                                                                    <td>{{ infoRow.quantity }}</td>
                                                                    <td>{{ infoRow.additions }}</td>
                                                                    <td>{{ infoRow.removals }}</td>
                                                                </tr>
                                                            </template>
                                                        </tbody>
                                                    </table>
                                                    <div v-else>
                                                        <h1 class="bg-white text-left pb-3">None</h1>
                                                    </div>
                                                </div>
                                            </template>
                                        </td>
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
        <!-- Reports Summary Table Section -->
        <h2 class="reports-section-title">Today's Data:</h2>
        <div id="reports-summary" class="inventory_table_container">
            <table>
                <thead>
                    <tr>
                        <th class="bg-[#3f51b5] text-white font-bold">Category</th>
                        <th class="bg-[#3f51b5] text-white font-bold">Quantity</th>
                        <th class="bg-[#3f51b5] text-white font-bold">Added</th>
                        <th class="bg-[#3f51b5] text-white font-bold">Removed</th>
                        <th class="bg-[#3f51b5] text-white font-bold" v-if="!showFullInv">Details</th>
                    </tr>
                </thead>
                <tbody v-for="row in fullReport" :key="row.category">
                    <tr class="hover:bg-[#e0e0e0]">
                        <td class="font-bold text-lg">{{ row.category }}</td>
                        <td>{{ row.quantity }}</td>
                        <td>{{ row.additions }}</td>
                        <td>{{ row.removals }}</td>
                        <td v-if="!showFullInv">
                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                View Sizes
                            </button>
                        </td>
                    </tr>
                    <tr v-if="showFullInv && !simpleCategores.includes(row.category)" class="bg-white">
                        <td colspan="4">
                            <template v-for="gender in row.genders" :key="gender.name">
                                <div class="px-36 ">
                                    <h1 class="font-semibold text-left text-lg border-b">{{ gender.name }}</h1>
                                    <table class="w-full " v-if="gender.info.some(i => i.quantity !== 0)">
                                        <thead class="text-black font-bold">
                                            <tr>
                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">{{row.category!=="Other Items"? "Size" : "Item"}}</th>
                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Quantity</th>
                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Added</th>
                                            <th class="p-4 border-b-[#ddd] border-b-2 text-center">Removed</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-gray-100 text-center">
                                            <template v-for="infoRow in gender.info" :key="infoRow.size">
                                                <tr class="border-b-2 odd:bg-white even:bg-gray-50" v-if="infoRow.quantity !== 0">
                                                    <td>{{ infoRow.size }}</td>
                                                    <td>{{ infoRow.quantity }}</td>
                                                    <td>{{ infoRow.additions }}</td>
                                                    <td>{{ infoRow.removals }}</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                    <div v-else>
                                        <h1 class="bg-white text-left pb-3">None</h1>
                                    </div>
                                </div>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div  v-if="showDetails" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-20">
            <CategoryDetails  
                :genders=detailRow
                :close-function="closeDetails"
                :category="detailCategory"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useFetch } from '#app';
import CategoryDetails from '../components/categoryDetails.vue';

const fullReport = ref([]);
const showPreviousReportsModal = ref(false);
const ChooseDailyReport = ref(false);
const ChooseWeeklyReport = ref(false);
const ChooseMonthlyReport = ref(false);
const viewingSelectedReport = ref(false);
const selectedReportRows = ref([]);
const selectedReportTitle = ref('');
const isLoadingSelected = ref(false);
const selectedError = ref(null);
const lastReportType = ref(null);
const selectedDate = ref(null);
const showFullInv = ref(false);
const showFullReport = ref(false);
onMounted(()=>{
    $fetch(`/api/reports`,{
        method:"POST"
    })
})

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];
const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const today = getTodayInCentralTime();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const displayYear = ref(today.getFullYear());

const showDetails = ref(false);
const detailRow = ref();
const detailCategory = ref();
const simpleCategores = ['Blankets', 'Snack Packs', 'Hygiene Packs'];

const currentInventory = await $fetch('/api/inventory');
fullReport.value = currentInventory;

const firstInventoryDate = ref(null);
const { data: firstDateData } = await useFetch('/api/inventory/first-date');
watchEffect(() => {
  if (firstDateData?.value?.firstDate) {
    firstInventoryDate.value = new Date(firstDateData.value.firstDate);
  }
});

const firstAllowedDate = computed(() => {
    if (firstInventoryDate.value instanceof Date && !isNaN(firstInventoryDate.value.getTime())) {
        return firstInventoryDate.value;
    }
    return new Date(2020, 0, 1);
});

const visibleDays = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value;
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - startDay);

    const days = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        const inMonth = d.getMonth() === month;
        let isSelected = false;

        if (selectedDate.value instanceof Date) {
            isSelected = d.toDateString() === selectedDate.value.toDateString();
        } else if (selectedDate.value?.weekStart && selectedDate.value?.weekEnd) {
            isSelected = d >= selectedDate.value.weekStart && d <= selectedDate.value.weekEnd;
        }

        days.push({
            date: d,
            inMonth,
            key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${i}`,
            isSelected,
        });
    }

    return days;
});

function getTodayInCentralTime() {
    const now = new Date();
    const centralTimeString = now.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const [month, day, year] = centralTimeString.split('/');
    const centralDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    centralDate.setHours(0, 0, 0, 0);
    return centralDate;
}

function resetCalendarToToday() {
    const t = getTodayInCentralTime();
    currentMonth.value = t.getMonth();
    currentYear.value = t.getFullYear();
    displayYear.value = t.getFullYear();
    selectedDate.value = null;
}

function toMidnight(date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function isDayDisabled(date) {
    const checkDate = toMidnight(date);
    const firstDate = toMidnight(firstAllowedDate.value);
    const todayDate = getTodayInCentralTime();
    return checkDate < firstDate || checkDate > todayDate;
}

function isWeekDisabled(date) {
    const d = toMidnight(date);
    const day = d.getDay();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const firstDate = toMidnight(firstAllowedDate.value);
    const todayDate = getTodayInCentralTime();
    todayDate.setHours(23, 59, 59, 999);

    const intersectionStart = Math.max(weekStart.getTime(), firstDate.getTime());
    const intersectionEnd = Math.min(weekEnd.getTime(), todayDate.getTime());

    return intersectionStart > intersectionEnd;
}

function isMonthDisabled(year, monthIndex) {
    const monthStart = new Date(year, monthIndex, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const firstDate = toMidnight(firstAllowedDate.value);
    const todayDate = getTodayInCentralTime();
    todayDate.setHours(23, 59, 59, 999);

    const intersectionStart = Math.max(monthStart.getTime(), firstDate.getTime());
    const intersectionEnd = Math.min(monthEnd.getTime(), todayDate.getTime());

    return intersectionStart > intersectionEnd;
}

function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value -= 1;
    } else {
        currentMonth.value -= 1;
    }
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value += 1;
    } else {
        currentMonth.value += 1;
    }
}

function prevYear() {
    displayYear.value -= 1;
}

function nextYear() {
    displayYear.value += 1;
}

function openMonthlyFromPrevious() {
    showPreviousReportsModal.value = false;
    resetCalendarToToday();
    ChooseMonthlyReport.value = true;
}

function openWeeklyFromPrevious() {
    showPreviousReportsModal.value = false;
    resetCalendarToToday();
    ChooseWeeklyReport.value = true;
}

function openDailyFromPrevious() {
    showPreviousReportsModal.value = false;
    resetCalendarToToday();
    ChooseDailyReport.value = true;
}

function closeMonthlyReport() {
    ChooseMonthlyReport.value = false;
    selectedDate.value = null;
}

function closeWeeklyReport() {
    ChooseWeeklyReport.value = false;
    selectedDate.value = null;
}

function closeDailyReport() {
    ChooseDailyReport.value = false;
    selectedDate.value = null;
}

function goBackToCalendar() {
    viewingSelectedReport.value = false;
    if (lastReportType.value === 'daily') {
        ChooseDailyReport.value = true;
    } else if (lastReportType.value === 'weekly') {
        ChooseWeeklyReport.value = true;
    } else if (lastReportType.value === 'monthly') {
        ChooseMonthlyReport.value = true;
    }
}

function selectDate(date) {
    if (isDayDisabled(date)) return;
    const d = toMidnight(date);

    if (selectedDate.value instanceof Date && selectedDate.value.toDateString() === d.toDateString()) {
        selectedDate.value = null;
        return;
    }

    selectedDate.value = d;
}

function selectWeek(date) {
    if (isWeekDisabled(date)) return;

    const d = toMidnight(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    if (selectedDate.value?.weekStart && selectedDate.value?.weekEnd) {
        const existingStart = new Date(selectedDate.value.weekStart);
        const existingEnd = new Date(selectedDate.value.weekEnd);
        if (existingStart.toDateString() === start.toDateString() && existingEnd.toDateString() === end.toDateString()) {
            selectedDate.value = null;
            return;
        }
    }

    selectedDate.value = { weekStart: start, weekEnd: end };
}

function selectMonth(monthIndex) {
    if (isMonthDisabled(displayYear.value, monthIndex)) return;

    if (selectedDate.value?.year !== undefined && selectedDate.value?.month !== undefined) {
        if (selectedDate.value.year === displayYear.value && selectedDate.value.month === monthIndex) {
            selectedDate.value = null;
            return;
        }
    }

    selectedDate.value = { year: displayYear.value, month: monthIndex };
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function mapApiResponseToRows(apiData) {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;

    return Object.keys(apiData).map((key) => {
        const value = apiData[key] || {};
        return {
            category: key,
            quantity: value.total ?? value.count ?? value.quantity ?? 0,
            additions: value.added ?? value.additions ?? 0,
            removlas: value.removed ?? value.removals ?? 0,
        };
    });
}

async function saveMonthly() {
    if (!selectedDate.value || selectedDate.value.year === undefined || selectedDate.value.month === undefined) {
        return;
    }

    isLoadingSelected.value = true;
    selectedError.value = null;
    lastReportType.value = 'monthly';

    try {

        const year = selectedDate.value.year;
        const month = selectedDate.value.month + 1;
        const startDate = new Date(year,month-1,1);
        const endDate = new Date(year,month,0);
        const data = await $fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
        selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data);
        selectedReportTitle.value = `${monthNames[selectedDate.value.month]} ${selectedDate.value.year}`;
        viewingSelectedReport.value = true;
        ChooseMonthlyReport.value = false;
        selectedDate.value = null;
    } catch (err) {
        selectedError.value = err?.message || String(err);
    } finally {
        isLoadingSelected.value = false;
    }
}

async function saveWeekly() {
    if (!selectedDate.value?.weekStart || !selectedDate.value?.weekEnd) return;

    isLoadingSelected.value = true;
    selectedError.value = null;
    lastReportType.value = 'weekly';

    try {
        const start = formatLocalDate(selectedDate.value.weekStart);
        const end = formatLocalDate(selectedDate.value.weekEnd);
        const data = await $fetch(`/api/reports?startDate=${selectedDate.value.weekStart}&endDate=${selectedDate.value.weekEnd}`);
        selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data);

        const startDisplay = `${monthNames[selectedDate.value.weekStart.getMonth()]} ${selectedDate.value.weekStart.getDate()}`;
        const endDisplay = `${monthNames[selectedDate.value.weekEnd.getMonth()]} ${selectedDate.value.weekEnd.getDate()}`;
        selectedReportTitle.value = `${startDisplay} - ${endDisplay} ${selectedDate.value.weekEnd.getFullYear()}`;
        viewingSelectedReport.value = true;
        ChooseWeeklyReport.value = false;
        selectedDate.value = null;
    } catch (err) {
        selectedError.value = err?.message || String(err);
    } finally {
        isLoadingSelected.value = false;
    }
}

async function saveDaily() {
    if (!(selectedDate.value instanceof Date)) return;

    isLoadingSelected.value = true;
    selectedError.value = null;
    lastReportType.value = 'daily';

    try {
        const date = formatLocalDate(selectedDate.value);
        const data = await $fetch(`/api/reports?startDate=${selectedDate.value}&endDate=${selectedDate.value}`);
        selectedReportRows.value = Array.isArray(data) ? data : mapApiResponseToRows(data);
        selectedReportTitle.value = `${monthNames[selectedDate.value.getMonth()]} ${selectedDate.value.getDate()} ${selectedDate.value.getFullYear()}`;
        viewingSelectedReport.value = true;
        ChooseDailyReport.value = false;
        selectedDate.value = null;
        console.log(selectedReportRows.value);
    } catch (err) {
        selectedError.value = err?.message || String(err);
    } finally {
        isLoadingSelected.value = false;
    }
}

function getDetails(category, row){
    detailRow.value = row;
    detailCategory.value = category;
    showDetails.value = true;
}

async function getReport(){
    const Report = await  $fetch('/api/reports',{
        query:{
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
        }
    })
    fullReport.value=Report
    console.log(fullReport.value)
}

async function makeReport(){
    const Report = await  $fetch('/api/reports',{
        method:"POST"
    })
    fullReport.value=Report
}

function closeDetails(){
    detailRow.value = null;
    showDetails.value = false;
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
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}

#reports-summary th,
#reports-summary td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    text-align: center;
}

#reports-summary tr:nth-child(even) {
    /* background-color: #f9f9f9; */
}

#reports-summary tr:hover {
    /*  */
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
  max-width: 50%;
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
  z-index: 10;
}

.modal-content {
    background-color: #fff;
    padding: 2em;
    border-radius: 8px;
    width: 90%;
    max-width: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    height: 90%;
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

.updated-note {
    text-align: center;
    font-size: 0.95em;
    color: #666;
    margin-top: 0.25em;
    font-style: italic;
}
</style>
