<template>
    <!-- Desktop: category grid -->
    <div 
        class="hidden md:grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2"
        role="list"
        aria-label="Inventory categories"
    >
        <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="flex flex-col items-center justify-center gap-1.5 h-20 min-h-[5rem] px-2 rounded-lg border-2 border-gray-200 bg-white text-gray-800 font-semibold transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300"
        :aria-pressed="selectedCategory === cat"
        :aria-current="selectedCategory === cat ? 'true' : undefined"
        :class="{
            'bg-indigo-600 text-white border-indigo-600 shadow':
            selectedCategory === cat,
        }"
        @click="selectCategory(cat)"
        >
        <i class="fas fa-box" aria-hidden="true"></i>
        <span class="text-sm text-center leading-tight">{{ cat }}</span>
        </button>
    </div>

    <!-- Mobile: accordion dropdown -->
    <div class="md:hidden w-full relative">
        <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-lg"
        :aria-expanded="accordionOpen"
        aria-haspopup="listbox"
        aria-label="Select category"
        @click="accordionOpen = !accordionOpen"
        >
        <span class="flex-1 text-left">{{
            selectedCategory || "Select category"
        }}</span>
        <i
            class="fas"
            :class="accordionOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
            aria-hidden="true"
        ></i>
        <span
            class="ml-2 inline-flex items-center text-gray-500"
            aria-hidden="true"
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            class="w-4 h-4"
            fill="currentColor"
            >
            <path
                d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"
            />
            </svg>
        </span>
        </button>
        <div
        v-show="accordionOpen"
        class="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto"
        role="listbox"
        >
        <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            role="option"
            class="w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            :aria-selected="selectedCategory === cat"
            :class="{
            'bg-indigo-600 text-white hover:bg-indigo-600':
                selectedCategory === cat,
            }"
            @click="
            selectCategory(cat);
            accordionOpen = false;
            "
        >
            {{ cat }}
        </button>
        </div>
    </div>

</template>

<script setup lang = "ts"> 

    import {ref, onMounted, onUnmounted} from 'vue';
    
    const props = defineProps<{
        category?: string;
    }>();

    const emit = defineEmits<{
        (e: 'update:category', value: string): void;
    }>();

    const categories = ['Shirts', 'Pants', 'Jackets', 'Underwear', 'Shoes', 'Snack Packs', 'Hygiene Packs', 'Blankets', 'Other Items'];
    const selectedCategory = ref(props.category ?? '');

    const accordionOpen = ref(false);
    const isMobileView = ref(false);
    const MOBILE_BREAKPOINT = 1100;
    
    function selectCategory(cat: string) {
        selectedCategory.value = cat;
        emit('update:category', cat);
    }


    function updateMobileView() {
        isMobileView.value = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
        if (!isMobileView.value) accordionOpen.value = false;
    }
    
    onMounted(() => {
        
        updateMobileView();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateMobileView);
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', updateMobileView);
        }
    });
</script>