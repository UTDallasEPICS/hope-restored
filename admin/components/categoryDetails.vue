<template>
    <div class="category-details-panel" role="dialog" aria-modal="true" :aria-label="`Details for ${category}`">
        <h1 class="category-details-title">Viewing Details for {{ category }}</h1>

        <div class="category-details-toolbar">
            <div class="category-details-select-wrap">
                <button
                    type="button"
                    class="category-details-select"
                    :aria-expanded="accordionOpen"
                    aria-haspopup="listbox"
                    :aria-label="`Select group, currently ${gender}`"
                    @click="accordionOpen = !accordionOpen"
                >
                    <span class="category-details-select__label">{{ gender }}</span>
                    <span class="category-details-select__filter-icon" aria-hidden="true">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            class="category-details-select__filter-svg"
                        >
                            <path
                                d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"
                            />
                        </svg>
                    </span>
                </button>
                <div
                    v-show="accordionOpen"
                    class="category-details-dropdown"
                    role="listbox"
                >
                    <button
                        v-for="g in genderList"
                        :key="g"
                        type="button"
                        role="option"
                        class="category-details-dropdown__item"
                        :aria-selected="gender === g"
                        :class="{ 'category-details-dropdown__item--active': gender === g }"
                        @click="changeData(g)"
                    >
                        {{ g }}
                    </button>
                </div>
            </div>

            <button
                type="button"
                class="category-details-close"
                @click="props.closeFunction"
            >
                Close
            </button>
        </div>

        <div class="category-details-table-wrap">
            <table class="category-details-table">
                <thead>
                    <tr>
                        <th scope="col">{{ sizeColumnLabel }}</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Added</th>
                        <th scope="col">Removed</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in tableData?.info"
                        :key="row.size"
                        class="category-details-table__row"
                    >
                        <td data-label="Size">{{ row.size }}</td>
                        <td data-label="Quantity">{{ row.quantity }}</td>
                        <td data-label="Added">{{ row.additions }}</td>
                        <td data-label="Removed">{{ row.removals }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
    genders: {
        name: string;
        info: {
            size: string;
            quantity: number;
            additions: number;
            removals: number;
        }[];
    }[];
    category: string;
    closeFunction: () => void;
}>();

const genderList = ref<string[]>([]);
const gender = ref<string>();
const accordionOpen = ref(false);

const sizeColumnLabel = computed(() =>
    props.category === 'Other Items' ? 'Item' : 'Size',
);

onMounted(() => {
    for (const g of props.genders) {
        genderList.value.push(g.name);
    }
    gender.value = genderList.value[0];
});

const tableData = computed(() => {
    for (const g of props.genders) {
        if (g.name === gender.value) {
            return g;
        }
    }
    return undefined;
});

function changeData(newGender: string) {
    gender.value = newGender;
    accordionOpen.value = false;
}
</script>

<style scoped>
.category-details-panel {
    position: relative;
    width: min(95vw, 42rem);
    max-height: min(90vh, 40rem);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    padding: clamp(0.75rem, 4vw, 1.25rem);
    box-sizing: border-box;
    z-index: 50;
}

.category-details-title {
    margin: 0 0 clamp(0.75rem, 3vw, 1rem);
    text-align: center;
    font-size: clamp(1.1rem, 4.5vw + 0.2rem, 1.75rem);
    font-weight: 700;
    color: #3f51b5;
    line-height: 1.25;
    word-break: break-word;
}

.category-details-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: clamp(0.75rem, 3vw, 1rem);
}

.category-details-select-wrap {
    position: relative;
    flex: 1 1 12rem;
    min-width: 0;
}

.category-details-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: clamp(0.6rem, 2.5vw, 0.75rem) clamp(0.75rem, 3vw, 1rem);
    font-size: clamp(0.9rem, 2.8vw + 0.1rem, 1.05rem);
    font-weight: 700;
    color: #333;
    background: #fff;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
}

.category-details-select:hover {
    border-color: rgba(63, 81, 181, 0.4);
}

.category-details-select__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.category-details-select__filter-icon {
    flex-shrink: 0;
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    color: #374151;
    opacity: 0.85;
}

.category-details-select__filter-svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
}

.category-details-select:hover .category-details-select__filter-icon {
    color: #4f46e5;
}

.category-details-dropdown {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    z-index: 10;
    max-height: 12rem;
    overflow-y: auto;
    background: #fff;
    border: 2px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-details-dropdown__item {
    display: block;
    width: 100%;
    padding: clamp(0.55rem, 2vw, 0.65rem) clamp(0.75rem, 3vw, 1rem);
    font-size: clamp(0.85rem, 2.5vw, 0.95rem);
    text-align: left;
    border: none;
    border-bottom: 1px solid #eee;
    background: transparent;
    color: #333;
    cursor: pointer;
}

.category-details-dropdown__item:last-child {
    border-bottom: none;
}

.category-details-dropdown__item:hover {
    background: #f0f2f5;
}

.category-details-dropdown__item--active {
    background: #3f51b5;
    color: #fff;
}

.category-details-close {
    flex-shrink: 0;
    min-height: 2.75rem;
    padding: 0.55rem 1.25rem;
    font-size: clamp(0.85rem, 2.5vw, 0.95rem);
    font-weight: 700;
    color: #fff;
    background: #b53f3f;
    border: 2px solid #b53f3f;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.category-details-close:hover {
    background: #9e3535;
    border-color: #9e3535;
    box-shadow: 0 4px 12px rgba(181, 63, 63, 0.35);
}

.category-details-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
}

.category-details-table {
    width: 100%;
    min-width: 16rem;
    border-collapse: collapse;
    table-layout: fixed;
}

.category-details-table thead {
    background: #3f51b5;
    color: #fff;
}

.category-details-table th {
    padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.35rem, 1.5vw, 0.5rem);
    font-size: clamp(0.7rem, 2.2vw + 0.1rem, 0.85rem);
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #ddd;
}

.category-details-table td {
    padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.35rem, 1.5vw, 0.5rem);
    font-size: clamp(0.8rem, 2.4vw + 0.05rem, 0.95rem);
    text-align: center;
    color: #333;
    border-bottom: 1px solid #e8e8e8;
    word-break: break-word;
}

.category-details-table__row:nth-child(odd) {
    background: #fff;
}

.category-details-table__row:nth-child(even) {
    background: #f9f9f9;
}

@media (max-width: 480px) {
    .category-details-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .category-details-select-wrap {
        flex: 1 1 auto;
        width: 100%;
    }

    .category-details-close {
        width: 100%;
    }
}

@media (min-width: 768px) {
    .category-details-panel {
        width: min(75vw, 42rem);
    }
}
</style>
