<template>
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 min-h-0 overflow-y-auto">
        <h2 v-if="selectedCategory" class="text-[1.15rem] font-semibold text-indigo-600 mb-4 mt-0">
            {{inForm? "Add " : "Remove "}} {{selectedCategory}}
        </h2>
        <h2 v-else class="text-[1.15rem] font-normal text-gray-500 mb-4 mt-0">
            Select a category to {{inForm? "add " : "remove "}}  items
        </h2>
        <form v-if="selectedCategory" class="flex flex-col gap-4" @submit.prevent="submitForm">
            <div v-if="items.length">
                <div v-if="isSimpleCategory">  
                    <label class="block mb-1 text-[0.95rem] font-medium text-gray-800">
                        Quantity
                    </label>
                    <input
                        type="number"
                        min="0"
                        placeholder="0"
                        v-model="items[0][0].quantity"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div v-else-if="isOtherCategory">
                    <div>
                        <label class="block mb-1 text-[0.95rem] font-medium text-gray-800">
                            Item Name
                        </label>
                        <input
                        type="text"
                        placeholder="e.g. Toaster, Diapers"
                        v-model="items[0][0].otherItemName"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">
                        Quantity
                        </label>
                        <input
                        type="number"
                        min="0"
                        placeholder="0"
                        v-model="items[0][0].quantity"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label for="add-subcategory" class="block mb-1 text-[0.95rem] font-medium text-gray-800">
                            Category
                        </label>
                        <div class="relative">
                            <select id="add-subcategory"
                                v-model="items[0][0].gender"
                                aria-required="true"
                                class="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select category</option>
                                <option
                                v-for="sub in otherItemsSubcategories"
                                :key="sub"
                                :value="sub"
                                >
                                {{ sub }}
                                </option>
                            </select>
                            <i
                                class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                aria-hidden="true"
                            ></i>
                        </div>
                    </div>
                </div>
                <div v-else>   
                    <section v-for="(gender,genIdx) in visibleGenders" :key="gender" class="border border-gray-200 rounded-lg p-3">
                        <h3 class="text-[1rem] font-semibold text-indigo-600 mb-2">{{ gender }}</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            <label
                                v-for="(size,idx) in (selectedCategory === 'Shoes' ? shoeSizes : apparelSizes)"
                                :key="`${gender}-${size}`"
                                class="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5"
                            >
                                <span class="min-w-[2.5rem] text-sm font-medium text-gray-800"> {{ size }} </span>
                                <input
                                    v-model="items[genIdx][idx].quantity"
                                    type="number"
                                    min="0"
                                    placeholder="qty"
                                   class=" w-10 sm:w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </label>
                        </div>
                    </section>
                </div>
            </div> 
           <div class="pt-2 flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center rounded-md px-5 py-2.5 text-white text-base font-semibold shadow-sm focus:outline-none focus:ring-2"
                :class="{'bg-green-600 hover:bg-green-700 focus:ring-green-500': inForm, 'bg-red-600 hover:bg-red-700 focus:ring-red-500':!inForm}"
              >
                {{inForm?"Confirm Addition":"Checkout"}}
              </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
        inForm:boolean,
        selectedCategory:string,
        isSimpleCategory:boolean,
        isOtherCategory:boolean,
        shoeSizes:string[],
        apparelSizes:string[],
        visibleGenders:string[],
        items:{name: string, gender:string, hasSize: boolean, size:string, quantity:number, otherItemName: string;}[][]
        submitForm:()=>void
    }>();

const otherItemsSubcategories = [
  "Appliances",
  "Infant care",
  "Hardware",
  "Electronics",
  "Furniture",
  "Bedding",
  "Kitchen",
  "Toys",
  "School supplies",
  "Personal care",
  "Cleaning supplies",
  "Other",
];
</script>