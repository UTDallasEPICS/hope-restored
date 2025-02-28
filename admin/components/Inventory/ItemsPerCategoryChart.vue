<template>
    <div class="chart-container">
        <h2>Items per Category</h2>
        <Bar :chart-data="chartData" :chart-options="chartOptions" />
    </div>
</template>

<script>
    import { defineComponent, watch, ref } from 'vue';
    import { Bar } from 'vue-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
    } from 'chart.js';

    // Register Chart.js components
    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale
    );

    export default defineComponent({
        name: 'ItemsPerCategoryChart',
        components: {
            Bar,
        },
        props: {
            inventory: {
                type: Array,
                required: true,
            },
        },
        setup(props) {
            const chartData = ref({
                // test labels
                labels: ['Blouses', 'Shirts', 'Tops', 'Dresses', 'Dress Pants / Slacks', 'Suits', 'Jeans', 'Shorts', 'Socks', 'Underwear', 'Shoes / Boots', 'Sweater / Sweatshirt', 'Coats / Jackets / Hoodies'],
                datasets: [
                    {
                        label: 'Quantity',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        // test data
                        data: [200, 500, 300, 100, 150, 50, 250, 375, 600, 650, 80, 60, 120],
                    },
                ],
            });

            const chartOptions = ref({
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            });

            const updateChartData = () => {
                const categoryData = {};

                props.inventory.forEach((item) => {
                    if (categoryData[item.category]) {
                        categoryData[item.category] += item.quantity;
                    } else {
                        categoryData[item.category] = item.quantity;
                    }
                });

                //chartData.value.labels = Object.keys(categoryData);
                //chartData.value.datasets[0].data = Object.values(categoryData);
            };

            watch(
                () => props.inventory,
                () => {
                    updateChartData();
                },
                { immediate: true }
            );

            return {
                chartData,
                chartOptions,
            };
        },
    });
</script>



<style scoped>
    .chart-container {
        width: 100%;
        max-width: 600px;
        height: 400px;
        margin: 2em auto;
        padding: 1em;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

        .chart-container h2 {
            text-align: center;
            color: #36a2eb; /* Blue */
            margin-bottom: 1em;
        }
</style>
