<!-- pages/reports.vue -->
<template>
    <div class="p-[2em] bg-[#f0f2f5] min-h-screen overflow-x-auto overflow-y-auto">
        <!-- Actions Row: View Previous Reports -->
        <div class="flex content-end justify-end gap-3 mb-4">
            <button @click="showPreviousReportsModal = true" class="py-2 px-6 bg-[#4c5baf] text-white border-none rounded-sm cursor-pointer text-[1em] uppercase transition-colors duration-300 ease-in flex items-center gap-[0.5em]">
                <i class="fas fa-folder-open"></i> View Report
            </button>
            <button @click="showFullInv= !showFullInv" class="py-2 px-6 bg-[#4c5baf] text-white border-none rounded-sm cursor-pointer text-[1em] uppercase transition-colors duration-300 ease-in flex items-center gap-[0.5em]">
                <i class="fas fa-folder-open"></i> {{ !showFullInv? "Master Report": "Detail View" }}
            </button>
        </div>

        <!-- Previous Reports Modal -->
        <div v-if="showPreviousReportsModal" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-10">
            <div class="bg-white p-8 shadow-md relative h-full w-full rounded-none sm:rounded-lg sm:h-3/4 sm:w-1/3 overflow-y-auto">
                <h2 class="mt-0 mb-4 text-[#3f51b5] text-center">Previous Reports</h2>
                <p>Select a report to view:</p>

                <!-- Report buttons --> 
                <div class="flex flex-col gap-3 items-stretch w-full report-buttons">
                    <section class="w-full">
                        <button @click="openDailyFromPrevious" class="w-full py-2 px-6 bg-[#4c5baf] text-white border-none rounded-sm cursor-pointer text-[1em] uppercase transition-colors duration-300 ease-in flex items-center justify-center gap-[0.5em]">
                            <i class="fas fa-plus"></i> Daily Report
                        </button>
                    </section>

                    <section class="w-full">
                        <button @click="openWeeklyFromPrevious" class="w-full py-2 px-6 bg-[#4c5baf] text-white border-none rounded-sm cursor-pointer text-[1em] uppercase transition-colors duration-300 ease-in flex justify-center items-center gap-[0.5em]">
                            <i class="fas fa-plus"></i> Weekly Report
                        </button>
                    </section>
                    <section class="w-full">
                        <button @click="openMonthlyFromPrevious" class="w-full py-2 px-6 bg-[#4c5baf] text-white border-none rounded-sm cursor-pointer text-[1em] uppercase transition-colors duration-300 ease-in flex justify-center items-center gap-[0.5em]">
                            <i class="fas fa-plus"></i> Monthly Report
                        </button>
                    </section>          
                </div>
                <div class="flex content-end gap-4" style="margin-top:1em;">
                    <button class="bg-[#f44336] hover:bg-[#e53935] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2" @click="showPreviousReportsModal = false">Close</button>
                </div>
            </div>
        </div>

        <!-- Individual report modals (can be opened directly or via Previous Reports) -->
        <div v-if="ChooseMonthlyReport" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-10">
            <div class="bg-white p-8 shadow-md relative h-full w-full rounded-none sm:rounded-lg sm:h-3/4 sm:w-1/3 overflow-y-auto">
                <h2 class="mt-0 mb-4 text-[#3f51b5] text-center">Monthly Report</h2>
                <p>Select a month to view:</p>

                <div class="calendar my-[1em] mx-0">
                    <div class="flex content-between items-center mb-2">
                        <button @click="prevYear" class="bg-transparent border-none text-lg cursor-pointer">‹</button>
                        <div>{{ displayYear }}</div>
                        <button @click="nextYear" class="bg-transparent border-none text-lg cursor-pointer">›</button>
                    </div>

                    <div class="grid grid-cols-3 gap-2 mt-2">
                        <button v-for="(mName, idx) in monthNames" :key="mName"
                                class="py-3 px-2 border rounded-md cursor-pointer text-center"
                                        :class="{ 
                                            'bg-[#fafafa]': !(selectedDate && selectedDate.year === displayYear && selectedDate.month === idx) && !isMonthDisabled(displayYear, idx),
                                            'bg-[#3f51b5] text-white font-semibold': selectedDate && selectedDate.year === displayYear && selectedDate.month === idx,
                                            'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-60 hover:bg-[#e0e0e0]': isMonthDisabled(displayYear, idx),
                                        }"
                                :disabled="isMonthDisabled(displayYear, idx)"
                                @click="selectMonth(idx)">
                            {{ mName }}
                        </button>
                    </div>
                </div>

                <div class="flex content-end gap-4">
    
                    <button class="bg-[#4caf50] hover:bg-[#43a047] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2" @click="saveMonthly">Select</button>
                    <button class="bg-[#f44336] hover:bg-[#e53935] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2"  @click="closeMonthlyReport">Close</button>
                </div>
            </div>
        </div>

        <div v-if="ChooseWeeklyReport" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-10">
            <div class="bg-white p-8 shadow-md relative h-full w-full rounded-none sm:rounded-lg sm:h-3/4 sm:w-1/3 overflow-y-auto">
                <h2 class="mt-0 mb-4 text-[#3f51b5] text-center">Weekly Report</h2>
                <p>Select a week to view:</p>

                <!-- Calendar for Weekly Report -->
                <div class="m-4">
                    <div class="flex content-between items-center mb-2">
                        <button @click="prevMonth" class="bg-transparent border-none text-lg cursor-pointer">‹</button>
                        <div>{{ monthNames[currentMonth] }} {{ currentYear }}</div>
                        <button @click="nextMonth" class="bg-transparent border-none text-lg cursor-pointer">›</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                        <div class="text-center font-semibold p-1 text-[#5b5a5a]" v-for="d in weekDayNames" :key="d">{{ d }}</div>
                        <button class="p-2 min-h-10 rounded-md border cursor-pointer text-center" 
                                v-for="day in visibleDays" 
                                :key="day.key"
                                   :class="{ 
                                        'bg-[#fafafa]': day.inMonth && !day.isSelected && !isWeekDisabled(day.date),
                                       'text-[#bbb] bg-white': !day.inMonth, 
                                       'bg-[#3f51b5] text-white border-[rgba(0,0,0,0.08)]': day.isSelected,
                                       'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-60 hover:bg-[#e0e0e0]': isWeekDisabled(day.date),
                                   }"
                                :disabled="isWeekDisabled(day.date)"
                                @click="selectWeek(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="flex content-end gap-4">
                    <button class="bg-[#4caf50] hover:bg-[#43a047] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2" @click="saveWeekly">Select</button>
                    <button class="bg-[#f44336] hover:bg-[#e53935] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2"  @click="closeWeeklyReport">Close</button>
                </div>
            </div>
        </div>
        <div v-if="ChooseDailyReport" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-10">
            <div class="bg-white p-8 shadow-md relative h-full w-full rounded-none sm:rounded-lg sm:h-3/4 sm:w-1/3 overflow-y-auto">
                <h2 class="mt-0 mb-4 text-[#3f51b5] text-center">Daily Report</h2>
                <p>Select a date to view:</p>

                <!-- Calendar for Daily Report -->
                <div class="m-4">
                    <div class="flex content-between items-center mb-2">
                        <button @click="prevMonth" class="bg-transparent border-none text-lg cursor-pointer">‹</button>
                        <div>{{ monthNames[currentMonth] }} {{ currentYear }}</div>
                        <button @click="nextMonth" class="bg-transparent border-none text-lg cursor-pointer">›</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                        <div class="text-center font-semibold p-1 text-[#5b5a5a]" v-for="d in weekDayNames" :key="d">{{ d }}</div>
                        <button class="p-2 min-h-10 rounded-md border cursor-pointer text-center "
                                v-for="day in visibleDays" 
                                :key="day.key"
                                   :class="{ 
                                       'bg-[#fafafa]': day.inMonth && !day.isSelected && !isWeekDisabled(day.date),
                                       'text-[#bbb] bg-white': !day.inMonth, 
                                       'bg-[#3f51b5] text-white border-[rgba(0,0,0,0.08)]': day.isSelected,
                                       'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-60 hover:bg-[#e0e0e0]': isDayDisabled(day.date),
                                   }"
                                :disabled="isDayDisabled(day.date)"
                                @click="selectDate(day.date)">
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </div>

                <div class="flex content-end gap-4">
                    <button class="bg-[#4caf50] hover:bg-[#43a047] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2" @click="saveDaily">Select</button>
                    <button class="bg-[#f44336] hover:bg-[#e53935] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2"  @click="closeDailyReport">Close</button>
                </div>
            </div>
        </div>

        <!-- Selected report results modal -->
        <div v-if="viewingSelectedReport" class="fixed top-0 left-0 w-full h-full bg-[rgba(20,20,20,0.45)] flex items-center justify-center z-10">
            <div class="bg-white p-8 rounded-lg w-full md:w-2/3 shadow-md relative h-3/4 overflow-y-auto">
                <div class="flex justify-between">
                    <button class="px-2 py-2 bg-[#757575] text-white rounded-sm cursor-pointer text-[0.9em]"  
                    @click="goBackToCalendar"> Back
                    </button>
                    <button @click="showFullReport= !showFullReport" class="px-2 py-2 mr-3 bg-[#4c5baf] text-white rounded-sm cursor-pointer text-[0.9em]">
                        {{ !showFullReport? "Master Report": "Detail View" }}
                    </button>
                </div>
                
                <h2 class="mt-0 mb-4 text-[#3f51b5] text-center">Report for: {{ selectedReportTitle }}</h2>
                
                <div v-if="isLoadingSelected">Loading...</div>
                <div v-else>
                    <div v-if="selectedError" style="color: #b00020; margin-bottom: 1em;">{{ selectedError }}</div>
                    <div v-else>
                        <div>
                            <table class="w-full border-collapse table-fixed bg-white rounded-lg shadow-lg">
                                <thead>
                                    <tr>
                                        <th class="bg-[#3f51b5] border-b text-white font-bold py-3">Category</th>
                                        <th class="bg-[#3f51b5] border-b text-white font-bold py-3">Total</th>
                                        <th class="bg-[#3f51b5] border-b text-white font-bold py-3">Added</th>
                                        <th class="bg-[#3f51b5] border-b text-white font-bold">Removed</th>
                                        <th class="bg-[#3f51b5] border-b text-white font-bold" v-if="!showFullReport">Details</th>
                                    </tr>
                                </thead>
                                <tbody v-for="row in selectedReportRows" :key="row.category">
                                    <tr class="hover:bg-[#e0e0e0]">
                                        <td class="font-bold text-lg p-3 border-b text-center">{{ row.category }}</td>
                                        <td class="p-3 border-b text-center text-[#333]">{{ row.quantity }}</td>
                                        <td class="p-3 border-b text-center text-[#333]">{{ row.additions }}</td>
                                        <td class="p-3 border-b text-center text-[#333]">{{ row.removals }}</td>
                                        <td v-if="!showFullReport" class="p-3 border-b text-center">
                                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-[#4c5baf] rounded-md p-2 text-white">
                                                {{row.category !== 'Other Items'? "View Sizes" : "View Items"}}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="showFullReport && !simpleCategores.includes(row.category)" class="bg-white border-b">
                                        <td colspan="4">
                                            <template v-for="gender in row.genders" :key="gender.name">
                                                <div class="mx-auto w-3/4 pb-4" v-if="gender.info.some(i => i.quantity !== 0)">
                                                    <h1 class="font-semibold text-left text-lg">{{ gender.name }}</h1>
                                                    <table class="w-full border">
                                                        <thead class=" border-b-[#ddd] border-b-2 text-center">
                                                            <tr class="text-black bg-[#c5cae9] font-bold p-4">
                                                                <th>{{row.category!=="Other Items"? "Size" : "Item"}}</th>
                                                                <th>Quantity</th>
                                                                <th>Added</th>
                                                                <th>Removed</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="text-center">
                                                            <template v-for="infoRow in gender.info" :key="infoRow.size">
                                                                <tr class="p-3 text-center text-[#333] border-b last:border-none odd:bg-white odd:hover:bg-gray-100 even:bg-gray-50 even:hover:bg-gray-100" v-if="infoRow.quantity !== 0">
                                                                    <td>{{ infoRow.size }}</td>
                                                                    <td>{{ infoRow.quantity }}</td>
                                                                    <td>{{ infoRow.additions }}</td>
                                                                    <td>{{ infoRow.removals }}</td>
                                                                </tr>
                                                            </template>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </template>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex content-end gap-4" style="margin-top:1em;">
                    <button class="bg-[#f44336] hover:bg-[#e53935] py-2 px-6 text-white border-none rounded-sm cursor-pointer flex items-center gap-2"  @click="viewingSelectedReport = false">Close</button>
                </div>
            </div>
        </div>
        <h2 class="text-[1.8em] text-[#3f51b5] mt-4 mx-0 mb-2">Today's Data:</h2>
        <div class="inventory_table_container shadow-xl">
            <table class="w-full border-collapse table-fixed bg-white rounded-lg shadow-sm">
                <thead>
                    <tr>
                        <th class="bg-[#3f51b5] text-white font-bold py-3 ml-1">Category</th>
                        <th class="bg-[#3f51b5] text-white font-bold py-3 ml-1">Quantity</th>
                        <th class="bg-[#3f51b5] text-white font-bold py-3 ml-1">Added</th>
                        <th class="bg-[#3f51b5] text-white font-bold py-3 ml-1">Removed</th>
                        <th class="bg-[#3f51b5] text-white font-bold" v-if="!showFullInv">Details</th>
                    </tr>
                </thead>
                <tbody v-for="row in fullReport" :key="row.category">
                    <tr class="hover:bg-[#e0e0e0] font-bold text-lg">
                        <td class="font-bold  border-b text-lg text-[#333] text-center">{{ row.category }}</td>
                        <td class="p-3 border-b text-center text-[#333]">{{ row.quantity }}</td>
                        <td class="p-3 border-b text-center text-[#333]">{{ row.additions }}</td>
                        <td class="p-3 border-b text-center text-[#333]">{{ row.removals }}</td>
                        <td v-if="!showFullInv" class="p-3 border-b text-center">
                            <button v-if="!simpleCategores.includes(row.category)" @click="getDetails(row.category,row.genders)" class="bg-[#4c5baf] rounded-md p-2 text-white">
                                {{row.category !== 'Other Items'? "View Sizes" : "View Items"}}
                            </button>
                        </td>
                    </tr>
                    <tr v-if="showFullInv && !simpleCategores.includes(row.category)" class="bg-white border-b">
                        <td colspan="4">
                            <template v-for="gender in row.genders" :key="gender.name">
                                <div class="mx-auto w-3/4 pb-4" v-if="gender.info.some(i => i.quantity !== 0)">
                                    <h1 class="font-semibold text-left text-lg">{{ gender.name }}</h1>
                                    <table class="w-full border">
                                        <thead class=" border-b-[#ddd] border-b-2 text-center">
                                            <tr class="text-black bg-[#c5cae9] font-bold p-4">
                                                <th>{{row.category!=="Other Items"? "Size" : "Item"}}</th>
                                                <th>Quantity</th>
                                                <th>Added</th>
                                                <th>Removed</th>
                                            </tr>
                                        </thead>
                                        <tbody class="text-center">
                                            <template v-for="infoRow in gender.info" :key="infoRow.size">
                                                <tr class="p-3 text-center text-[#333] border-b last:border-none odd:bg-white odd:hover:bg-gray-100 even:bg-gray-50 even:hover:bg-gray-100" v-if="infoRow.quantity !== 0">
                                                    <td>{{ infoRow.size }}</td>
                                                    <td>{{ infoRow.quantity }}</td>
                                                    <td>{{ infoRow.additions }}</td>
                                                    <td>{{ infoRow.removals }}</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
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
/* Month grid (3 columns x 4 rows) */
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
