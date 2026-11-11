<template>
    <div class="charts-overlay">
        <div class="charts-modal">
            <h2>Inventory Charts</h2>

            <div class="charts-tabs">
                <button :class="{ active: tab === 'bar' }" @click="tab = 'bar'">Current Inventory</button>
                <button :class="{ active: tab === 'line' }" @click="tab = 'line'">Inventory Over Time</button>
            </div>

            <p v-if="error" class="charts-error">{{ error }}</p>

            <ClientOnly>
                <!-- Set 1: bar charts -->
                <div v-if="tab === 'bar'">
                    <p v-if="loadingSnapshot">Loading...</p>
                    <template v-else>
                        <div class="chart-block">
                            <div class="chart-title-row">
                                <h3>Quantity by Category</h3>
                                <div class="chart-selects">
                                    <select v-model="categoryGender" aria-label="Gender">
                                        <option v-for="g in genderFilters" :key="g" :value="g">{{ g }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-box">
                                <Bar :chart-data="allCategoriesData" :chart-options="barOptions" />
                            </div>
                        </div>

                        <div class="chart-block">
                            <div class="chart-title-row">
                                <h3>Quantity by Size</h3>
                                <div class="chart-selects">
                                    <select v-model="sizeCategory" aria-label="Category">
                                        <option v-for="c in sizedCategories" :key="c" :value="c">{{ c }}</option>
                                    </select>
                                    <select v-model="sizeGender" aria-label="Gender">
                                        <option v-for="g in sizeGenderFilters" :key="g" :value="g">{{ g }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-box">
                                <Bar :chart-data="sizesData" :chart-options="barOptions" />
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Set 2: line charts -->
                <div v-else>
                    <div class="chart-block">
                        <div class="chart-title-row">
                            <h3>Inventory</h3>
                            <div class="chart-selects">
                                <select v-model="totalGranularity" aria-label="Inventory time period">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-box">
                            <p v-if="loadingTotal">Loading...</p>
                            <Line v-else :chart-data="totalLineData" :chart-options="lineOptions" />
                        </div>
                    </div>
                    <div class="chart-block">
                        <div class="chart-title-row">
                            <h3>{{ lineCategory }}</h3>
                            <div class="chart-selects">
                                <select v-model="lineCategory" aria-label="Category">
                                    <option v-for="c in allCategories" :key="c" :value="c">{{ c }}</option>
                                </select>
                                <select v-model="categoryGranularity" aria-label="Category time period">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-box">
                            <p v-if="loadingCategory">Loading...</p>
                            <Line v-else :chart-data="categoryLineData" :chart-options="lineOptions" />
                        </div>
                    </div>
                </div>
            </ClientOnly>

            <div class="charts-actions">
                <button class="cancel-button" @click="$emit('close')">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';
import { normalizeGenderSizes } from '../composables/inventorySizes.ts';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

defineEmits(['close']);

const GENDERS = ['Male', 'Female', 'Child', 'Unisex'];
const GENDER_COLORS = { Male: '#29a3e0', Female: '#f4a6c0', Child: '#8c8c8c', Unisex: '#7cb342' };
const CLOTHING_CATEGORIES = ['Shirts', 'Pants', 'Jackets', 'Dresses', 'Underwear', 'Shoes'];
const SIMPLE_CATEGORIES = ['Blankets', 'Snack Packs', 'Hygiene Packs', 'Other Items'];
const genderFilters = ['All', ...GENDERS];
const sizeGenderFilters = ['All', ...GENDERS.filter((g) => g !== 'Unisex')];

const tab = ref('bar');
const error = ref('');
const categoryGender = ref('All');
const sizeGender = ref('All');

const snapshot = ref([]);
const loadingSnapshot = ref(true);

const sizeCategory = ref('');
const lineCategory = ref('');
const totalGranularity = ref('monthly');
const categoryGranularity = ref('monthly');
const seriesByMode = ref({});
const loadingModes = ref({});

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
};
const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
};

function sumGender(genderRow) {
    return (genderRow?.info ?? []).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function categoryTotal(row) {
    return row.genders.reduce((sum, g) => sum + sumGender(g), 0);
}

const allCategories = computed(() => snapshot.value.map((row) => row.category));
const sizedCategories = computed(() =>
    allCategories.value.filter((c) => !SIMPLE_CATEGORIES.includes(c)),
);
const gendersFor = (selected) => (selected === 'All' ? GENDERS : [selected]);

// Non-clothing categories no gender, so whole quantity treated as Unisex.
// null leaves a gap so a bar only shows where that gender applies.
function genderValue(row, name) {
    const isClothing = CLOTHING_CATEGORIES.includes(row.category);
    if (name === 'Unisex') {
        return isClothing ? null : (row.quantity ?? categoryTotal(row));
    }
    return isClothing ? sumGender(row.genders.find((g) => g.name === name)) : null;
}

const allCategoriesData = computed(() => {
    const rows = snapshot.value;
    return {
        labels: rows.map((r) => r.category),
        datasets: gendersFor(categoryGender.value).map((name) => ({
            label: name,
            backgroundColor: GENDER_COLORS[name],
            data: rows.map((r) => genderValue(r, name)),
        })),
    };
});

const sizesData = computed(() => {
    const row = snapshot.value.find((r) => r.category === sizeCategory.value);
    if (!row) return { labels: [], datasets: [] };
    const genders = normalizeGenderSizes(row.category, row.genders);
    const labels = genders[0]?.info.map((i) => i.size) ?? [];
    return {
        labels,
        datasets: gendersFor(sizeGender.value).filter((name) => name !== 'Unisex').map((name) => {
            const g = genders.find((x) => x.name === name);
            return {
                label: name,
                backgroundColor: GENDER_COLORS[name],
                data: labels.map((size) => g?.info.find((i) => i.size === size)?.quantity ?? 0),
            };
        }),
    };
});

const totalSeries = computed(() => seriesByMode.value[totalGranularity.value] ?? []);
const categorySeries = computed(() => seriesByMode.value[categoryGranularity.value] ?? []);
const loadingTotal = computed(() => Boolean(loadingModes.value[totalGranularity.value]));
const loadingCategory = computed(() => Boolean(loadingModes.value[categoryGranularity.value]));

const totalLineData = computed(() => ({
    labels: totalSeries.value.map((p) => p.label),
    datasets: [{
        label: 'Total quantity',
        borderColor: '#3f51b5',
        backgroundColor: '#3f51b5',
        tension: 0.2,
        data: totalSeries.value.map((p) => p.total),
    }],
}));

const categoryLineData = computed(() => ({
    labels: categorySeries.value.map((p) => p.label),
    datasets: [{
        label: lineCategory.value,
        borderColor: '#3f51b5',
        backgroundColor: '#3f51b5',
        tension: 0.2,
        data: categorySeries.value.map((p) => p.categories[lineCategory.value] ?? 0),
    }],
}));

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Bucket end dates, oldest first, never later than today
function bucketDates(mode) {
    const today = startOfDay(new Date());
    const dates = [];
    if (mode === 'daily') {
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d);
        }
    } else if (mode === 'weekly') {
        for (let i = 7; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i * 7);
            dates.push(d);
        }
    } else {
        for (let i = 11; i >= 0; i--) {
            const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            dates.push(end > today ? today : end);
        }
    }
    return dates;
}

function formatLabel(date, mode) {
    if (mode === 'monthly') {
        return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    }
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

async function fetchReport(date) {
    return await $fetch(`/api/reports?startDate=${encodeURIComponent(date.toString())}&endDate=${encodeURIComponent(date.toString())}`);
}

// Get reports data, runs when page mounted
async function loadSnapshot() {
    loadingSnapshot.value = true;
    error.value = '';
    try {
        const data = await fetchReport(startOfDay(new Date()));
        console.log(data)
        snapshot.value = Array.isArray(data) ? data : [];
        sizeCategory.value = sizedCategories.value[0] ?? '';
        lineCategory.value = allCategories.value[0] ?? '';
    } catch (err) {
        error.value = err?.message || String(err);
    } finally {
        loadingSnapshot.value = false;
    }
}

// Used for line charts 
async function loadSeries(mode) {
    if (seriesByMode.value[mode] || loadingModes.value[mode]) return;
    loadingModes.value = { ...loadingModes.value, [mode]: true };
    error.value = '';
    try {
        const dates = bucketDates(mode);
        const reports = await Promise.all(dates.map(fetchReport));
        const points = dates.map((date, idx) => {
            const rows = Array.isArray(reports[idx]) ? reports[idx] : [];
            const categories = {};
            let total = 0;
            for (const row of rows) {
                categories[row.category] = row.quantity ?? categoryTotal(row);
                total += categories[row.category];
            }
            return { label: formatLabel(date, mode), total, categories };
        });
        // Buckets with no records at all carry the previous value forward
        for (let i = 1; i < points.length; i++) {
            if (points[i].total === 0 && points[i - 1].total > 0) {
                points[i] = { ...points[i], total: points[i - 1].total, categories: points[i - 1].categories };
            }
        }
        seriesByMode.value = { ...seriesByMode.value, [mode]: points };
    } catch (err) {
        error.value = err?.message || String(err);
    } finally {
        loadingModes.value = { ...loadingModes.value, [mode]: false };
    }
}

watch([tab, totalGranularity, categoryGranularity], () => {
    if (tab.value !== 'line') return;
    loadSeries(totalGranularity.value);
    loadSeries(categoryGranularity.value);
});

onMounted(loadSnapshot);
</script>

<style scoped>
.charts-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(20, 20, 20, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}
.charts-modal {
    background: #fff;
    padding: clamp(1rem, 4vw, 2em);
    border-radius: 8px;
    width: min(95vw, 60rem);
    max-height: 92vh;
    overflow-y: auto;
    box-sizing: border-box;
}
.charts-modal h2 {
    margin-top: 0;
    color: #3f51b5;
    text-align: center;
}
.charts-tabs {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
}
.charts-tabs button {
    padding: 0.5rem 1rem;
    border: 1px solid #3f51b5;
    border-radius: 6px;
    background: #fff;
    color: #3f51b5;
    cursor: pointer;
}
.charts-tabs button.active {
    background: #3f51b5;
    color: #fff;
}
.chart-block {
    margin-bottom: 3rem;
}
.chart-block h3 {
    text-align: center;
    margin: 0 0 0.75rem;
}
.chart-title-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 0.75rem;
}
.chart-title-row h3 {
    grid-column: 2;
    margin: 0;
}
.chart-selects {
    grid-column: 3;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}
.chart-selects select {
    border: 1px solid #333;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
}
.chart-box {
    position: relative;
    height: 280px;
    overflow: hidden;
}
.chart-box :deep(div),
.chart-box :deep(canvas) {
    height: 100% !important;
    width: 100% !important;
}
.charts-error {
    color: #b00020;
}
.charts-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}
.cancel-button {
    padding: 0.5em 1.5em;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5em;
    background-color: #f44336;
}
.cancel-button:hover {
    background-color: #e53935;
}
</style>
