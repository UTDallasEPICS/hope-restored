<template>
    <div class="rounded-md p-2 shadow-2xl relative w-3/4 h-4/5 overflow-y-auto bg-white z-50">
        <!-- send in selected date range and category -->
        <h1 class="text-center text-3xl"> Viewing Details for {{ category }}</h1> 
        <div class="flex justify-around my-4">          
            <div class="w-1/4 relative">
                <button class="w-full flex items-center content-between p-3 text-lg font-bold text-[#333] bg-white border-2 border-[rgba(0,0,0,0.08)]
                    rounded-lg cursor-pointer text-left hover:border-[rgba(63,81,181,0.4)]" 
                    @click="accordionOpen = !accordionOpen">
                    <span>{{ gender }}</span>
                    <i class="fas" :class="accordionOpen ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
                    <span class="shrink-0 ml-auto opacity-[0.85] inline-flex items-center" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-6 h-6" fill="currentColor"><path d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"/></svg>
                    </span>
                </button>
                <div v-show="accordionOpen" class="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[rgba(0,0,0,0.08)] rounded-lg
                shadow-lg max-h-[70] overflow-y-auto z-10"
                >
                    <button v-for="g in genderList"  @click="changeData(g)" 
                        class="block w-full p-2.5 text-left border-none cursor-pointer border-b-2 border-b-[#eee]
                        last:border-none"
                        :class="{
                            'bg-[#3f51b5] text-white' : gender==g,
                            'bg-none text-[#333] hover:bg-[#f0f2f5]': gender != g

                        }"
                    >
                        <span>{{ g }}</span>
                    </button>

                </div>
            </div>
            
            <div class="flex gap-2">
                <button class="flex-col items-center justify-center gap-1 min-h-5 max-h-10 p-1.5 rounded-md  border-2 cursor-pointer bg-[#b53f3f] border-[#b53f3f]
                    font-bold transition-[transform,box-shadow,background-color,border-color] duration-100 ease-in mx-3 text-white text-center
                    hover:shadow-lg hover:border-[rgba(181,79,63,0.4)] **transition hover:-translate-y-0.5**" @click="props.closeFunction">Close</button>
                <!-- <button>Print Report</button> -->
            </div>
        </div>
        <table class="w-full h-full">
            <thead class=" bg-[#3f51b5] text-white font-bold">
                <tr>
                    <th class="p-4 border-b-[#ddd] border-b-2 text-center">Size</th>
                    <th class="p-4 border-b-[#ddd] border-b-2 text-center">Quantity</th>
                    <th class="p-4 border-b-[#ddd] border-b-2 text-center">Added</th>
                    <th class="p-4 border-b-[#ddd] border-b-2 text-center">Removed</th>
                </tr>
            </thead>
            <tbody class="bg-gray-100 text-center">
                <tr class="border-b-2 odd:bg-white even:bg-gray-50" v-for="row in tableData?.info">
                    <td>{{ row.size }}</td>
                    <td>{{ row.quantity }}</td>
                    <td>{{ row.additions }}</td>
                    <td>{{ row.removals }}</td>
                    
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

    const props = defineProps<{
        genders:{name:string, info:{size:string,quantity:number,additions:number,removals:number}[]}[]
        category:string
        closeFunction:() => void;
    }>();

    const genderList = ref<string[]>([]);
    const gender = ref<string>();
    onMounted(()=>{
        for(const gender of props.genders){
            genderList.value.push(gender.name)
        }
        gender.value = genderList.value[0];
        console.log(props.genders);
    })
    const accordionOpen = ref(false);
    const tableData = computed(()=>{
        for(const g of props.genders){
            if(g.name == gender.value){
                return g;
            }
        }
    })
    function changeData(newGender:string){
        gender.value = newGender;
        accordionOpen.value = false;
    }
</script>