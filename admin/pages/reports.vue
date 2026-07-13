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
        <div v-if="viewingSelectedReport" class="modal-overlay report-results-overlay">
            <div class="modal-content report-results-modal overflow-y-auto">
                <div class="report-modal-toolbar">
                    <button
                        type="button"
                        class="report-toolbar-btn report-toolbar-btn--back"
                        @click="goBackToCalendar"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        class="report-toolbar-btn report-toolbar-btn--toggle"
                        @click="showFullReport = !showFullReport"
                    >
                        {{ !showFullReport ? "Master Report" : "Detail View" }}
                    </button>
                </div>
                <h2 class="report-modal-title">Report for: {{ selectedReportTitle }}</h2>
                
                <div v-if="isLoadingSelected">Loading...</div>
                <div v-else>
                    <div v-if="selectedError" style="color: #b00020; margin-bottom: 1em;">{{ selectedError }}</div>
                    <div v-else>
                        <div id="reports-summary">
                            <table class="report-data-table" :class="{ 'report-data-table--master': showFullReport }">
                                <colgroup>
                                    <col class="report-col-category" />
                                    <col class="report-col-num" />
                                    <col class="report-col-num" />
                                    <col class="report-col-num" />
                                    <col v-if="!showFullReport" class="report-col-details" />
                                </colgroup>
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
                                    <tr class="master-category-row report-summary-row">
                                        <td class="master-category-label">{{ row.category }}</td>
                                        <td class="master-value">{{ row.quantity }}</td>
                                        <td class="master-value">{{ row.additions }}</td>
                                        <td class="master-value">{{ row.removals }}</td>
                                        <td v-if="!showFullReport">
                                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                                View Sizes
                                            </button>
                                            <button v-if="row.category === 'Other Items'" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                                View Items
                                            </button>
                                        </td>
                                    </tr>
                                    <template v-if="showFullReport && hasMasterBreakdown(row)">
                                        <template v-for="gender in gendersWithQuantity(row.genders)" :key="`${row.category}-${gender.name}`">
                                            <tr class="master-section-row">
                                                <td class="master-section-label">{{ gender.name }}</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr
                                                v-for="infoRow in infoRowsWithQuantity(gender)"
                                                :key="`${row.category}-${gender.name}-${infoRow.size}`"
                                                class="master-detail-row"
                                            >
                                                <td class="master-detail-label">{{ infoRow.size }}</td>
                                                <td class="master-value">{{ infoRow.quantity }}</td>
                                                <td class="master-value">{{ infoRow.additions }}</td>
                                                <td class="master-value">{{ infoRow.removals }}</td>
                                            </tr>
                                        </template>
                                    </template>
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
        <p v-if="pageLoading" class="text-sm text-gray-600 mb-3">Loading report data…</p>
        <p v-else-if="pageLoadError" class="text-sm text-red-600 mb-3">{{ pageLoadError }}</p>
        <div id="reports-summary" class="inventory_table_container">
            <table class="report-data-table" :class="{ 'report-data-table--master': showFullInv }">
                <colgroup>
                    <col class="report-col-category" />
                    <col class="report-col-num" />
                    <col class="report-col-num" />
                    <col class="report-col-num" />
                    <col v-if="!showFullInv" class="report-col-details" />
                </colgroup>
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
                    <tr class="master-category-row report-summary-row">
                        <td class="master-category-label">{{ row.category }}</td>
                        <td class="master-value">{{ row.quantity }}</td>
                        <td class="master-value">{{ row.additions }}</td>
                        <td class="master-value">{{ row.removals }}</td>
                        <td v-if="!showFullInv">
                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                View Sizes
                            </button>
                            <button v-if="row.category === 'Other Items'" @click="getDetails(row.category,row.genders)" class="bg-blue-700 rounded-md p-2 text-white">
                                View Items
                            </button>
                        </td>
                    </tr>
                    <template v-if="showFullInv && hasMasterBreakdown(row)">
                        <template v-for="gender in gendersWithQuantity(row.genders)" :key="`${row.category}-${gender.name}`">
                            <tr class="master-section-row">
                                <td class="master-section-label">{{ gender.name }}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr
                                v-for="infoRow in infoRowsWithQuantity(gender)"
                                :key="`${row.category}-${gender.name}-${infoRow.size}`"
                                class="master-detail-row"
                            >
                                <td class="master-detail-label">{{ infoRow.size }}</td>
                                <td class="master-value">{{ infoRow.quantity }}</td>
                                <td class="master-value">{{ infoRow.additions }}</td>
                                <td class="master-value">{{ infoRow.removals }}</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
        <div
            v-if="showDetails"
            class="category-details-overlay"
            @click.self="closeDetails"
        >
            <CategoryDetails
                :genders="detailRow"
                :close-function="closeDetails"
                :category="detailCategory"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue';
import CategoryDetails from '../components/categoryDetails.vue';

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

const fullReport = ref([]);
const pageLoading = ref(true);
const pageLoadError = ref('');
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
const simpleCategores = ['Blankets', 'Snack Packs', 'Hygiene Packs', 'Other Items'];

const firstInventoryDate = ref(null);

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

onMounted(async () => {
    pageLoading.value = true;
    pageLoadError.value = '';
    try {
        const [inventory, firstDate] = await Promise.all([
            $fetch('/api/inventory'),
            $fetch('/api/inventory/first-date').catch(() => null),
        ]);
        fullReport.value = Array.isArray(inventory) ? inventory : [];
        if (firstDate?.firstDate) {
            firstInventoryDate.value = new Date(firstDate.firstDate);
        }
        try {
            await $fetch('/api/reports', { method: 'POST' });
        } catch (reportErr) {
            console.warn('Daily report snapshot failed', reportErr);
        }
    } catch (err) {
        console.error('Failed to load reports page data', err);
        const status = err?.statusCode ?? err?.status ?? err?.response?.status;
        if (status === 401) {
            pageLoadError.value =
                'You are not signed in (or your session expired). Log in again, then return to Reports.';
        } else if (status === 403) {
            pageLoadError.value =
                'Your account does not have staff access. Add your email to BETTER_AUTH_STAFF_EMAILS or BETTER_AUTH_ADMIN_EMAILS in admin/.env.';
        } else {
            pageLoadError.value =
                status
                    ? `Could not load inventory data (HTTP ${status}).`
                    : 'Could not load inventory data. Try logging in again or refresh the page.';
        }
        fullReport.value = [];
    } finally {
        pageLoading.value = false;
    }
});

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
            removals: value.removed ?? value.removals ?? 0,
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
        console.log(data);
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

function gendersWithQuantity(genders) {
    return (genders ?? []).filter((g) =>
        g.info?.some((i) => i.quantity !== 0),
    );
}

function infoRowsWithQuantity(gender) {
    return (gender.info ?? []).filter((i) => i.quantity !== 0);
}

function hasMasterBreakdown(row) {
    if (simpleCategores.includes(row.category)) {
        return false;
    }
    return gendersWithQuantity(row.genders).length > 0;
}
</script>

<style scoped>
.reports-container {
    font-family: 'Open Sans', sans-serif;
    padding: clamp(0.75rem, 3vw, 2em);
    background-color: #f0f2f5;
    min-height: 100vh;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
}

.inventory_table_container {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
}

/* Reuse inventory table styles */
#reports-summary table.report-data-table {
    width: 100%;
    min-width: min(100%, 32rem);
    border-collapse: collapse;
    table-layout: fixed;
    background-color: #fff;
    border-radius: 8px;
}

.report-col-category {
    width: 42%;
}

.report-col-num {
    width: 19%;
}

.report-col-details {
    width: 20%;
}

#reports-summary .report-data-table thead th {
    background: #3f51b5;
    color: #fff;
    font-weight: 700;
}

#reports-summary .report-data-table thead th:first-child {
    border-top-left-radius: 8px;
}

#reports-summary .report-data-table thead th:last-child {
    border-top-right-radius: 8px;
}

#reports-summary th,
#reports-summary td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    text-align: center;
    vertical-align: middle;
}

#reports-summary td {
    color: #333;
}

/* Shared summary row styling (detail + master category rows) */
.report-data-table .report-summary-row:hover {
    background: #e0e0e0;
}

.report-data-table .master-category-label {
    font-weight: 700;
    font-size: 1.125rem;
    color: #333;
    text-align: center;
}

.report-data-table .master-category-row .master-value {
    font-weight: 400;
    font-size: 1rem;
    color: #333;
}

/* Master report: match detail view sizing; subtle hierarchy for nested rows */
.report-data-table--master .master-section-row td {
    background: #f9f9f9;
    border-bottom: 1px solid #ddd;
}

.report-data-table--master .master-section-label {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    text-align: center;
}

.report-data-table--master .master-detail-row:hover {
    background: #f5f5f5;
}

.report-data-table--master .master-detail-label {
    font-weight: 400;
    font-size: 0.9375rem;
    color: #333;
    text-align: center;
}

.report-data-table--master .master-detail-row .master-value {
    font-weight: 400;
    font-size: 0.9375rem;
    color: #333;
}

.report-data-table--master .master-value {
    font-variant-numeric: tabular-nums;
    text-align: center;
}

.category-details-overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(0.5rem, 3vw, 1rem);
    background: rgba(20, 20, 20, 0.45);
    box-sizing: border-box;
}

.report-results-overlay {
    width: 100%;
}

.report-results-modal {
    display: flex;
    flex-direction: column;
}

.report-modal-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.report-toolbar-btn {
    padding: 0.5em 1em;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: clamp(0.8rem, 2.5vw, 0.9em);
    white-space: nowrap;
}

.report-toolbar-btn--back {
    background-color: #757575;
}

.report-toolbar-btn--toggle {
    background-color: #4c5baf;
}

.report-modal-title {
    margin-top: 0;
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
    padding: clamp(1rem, 4vw, 2em);
    border-radius: 8px;
    width: min(95vw, 100%);
    max-width: min(50rem, 95vw);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    max-height: 92vh;
    height: auto;
    box-sizing: border-box;
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
    flex-wrap: wrap;
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
    gap: 0.5rem;
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
}
.calendar-header button {
    background: transparent;
    border: none;
    font-size: clamp(1.1rem, 4vw, 1.4em);
    cursor: pointer;
    flex-shrink: 0;
    min-width: 2rem;
    min-height: 2rem;
}
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: clamp(0.1rem, 1vw, 0.25em);
    width: 100%;
}
.calendar-weekday {
    text-align: center;
    font-weight: 600;
    padding: 0.25em 0;
    font-size: 0.9em;
    color: #666;
}
.calendar-day {
    padding: clamp(0.25em, 1.5vw, 0.5em) clamp(0.1em, 1vw, 0.25em);
    min-height: clamp(2rem, 9vw, 2.5rem);
    border-radius: 6px;
    border: 1px solid transparent;
    background: #fafafa;
    cursor: pointer;
    text-align: center;
    font-size: clamp(0.75rem, 2.5vw, 1rem);
    width: 100%;
    box-sizing: border-box;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(0.35em, 2vw, 0.5em);
    margin-top: 0.5em;
    width: 100%;
}
.month-cell {
    padding: clamp(0.45em, 2vw, 0.75em) clamp(0.25em, 1.5vw, 0.5em);
    background: #fafafa;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    font-size: clamp(0.7rem, 2.8vw, 1rem);
    word-break: break-word;
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

@media (max-width: 768px) {
    .reports-section-title {
        font-size: clamp(1.15rem, 5vw, 1.35rem);
        margin: 0.75em 0 0.5em;
    }

    .actions-row {
        flex-direction: column;
        align-items: stretch;
    }

    .actions-row .monthly-reports-button {
        width: 100%;
        justify-content: center;
        font-size: clamp(0.75rem, 3vw, 0.9rem);
        padding: 0.65em 1em;
        text-transform: none;
    }

    .report-buttons .daily-reports-button,
    .report-buttons .weekly-reports-button,
    .report-buttons .monthly-reports-button {
        width: 100%;
        justify-content: center;
        font-size: 1em;
        padding: 0.65em 1em;
        text-transform: uppercase;
    }

    #reports-summary th,
    #reports-summary td {
        padding: clamp(6px, 2vw, 10px) clamp(4px, 1.5vw, 8px);
        font-size: clamp(0.7rem, 2.8vw, 0.875rem);
    }

    #reports-summary td.font-bold.text-lg,
    #reports-summary .font-bold.text-lg {
        font-size: clamp(0.8rem, 3vw, 1rem);
    }

    .report-data-table .master-category-label {
        font-size: 1rem;
    }

    .report-data-table--master .master-section-label,
    .report-data-table--master .master-detail-label,
    .report-data-table--master .master-detail-row .master-value {
        font-size: 0.875rem;
    }

    #reports-summary .bg-blue-700 {
        padding: 0.35em 0.5em;
        font-size: clamp(0.65rem, 2.5vw, 0.8rem);
    }

    .modal-content {
        width: 95vw;
        max-width: 95vw;
        max-height: 90vh;
        padding: 1rem;
    }

    .modal-content h2 {
        font-size: clamp(1rem, 4.5vw, 1.25rem);
    }

    .report-modal-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .report-toolbar-btn {
        width: 100%;
        text-align: center;
    }

    .report-modal-title {
        font-size: clamp(1rem, 4vw, 1.2rem);
        line-height: 1.3;
        word-break: break-word;
    }

    .calendar-weekday {
        font-size: clamp(0.6rem, 2.2vw, 0.75rem);
        padding: 0.15em 0;
    }

    .form-actions {
        flex-wrap: wrap;
        justify-content: stretch;
        gap: 0.5rem;
    }

    .save-button,
    .cancel-button {
        flex: 1 1 45%;
        justify-content: center;
        padding: 0.5em 0.75em;
        font-size: 0.9rem;
    }
}

@media (max-width: 400px) {
    .month-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .calendar-day {
        min-height: 1.75rem;
    }
}
</style>
