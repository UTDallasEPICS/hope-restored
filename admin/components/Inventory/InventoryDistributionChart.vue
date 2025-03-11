<!-- components/InventoryDistributionChart.vue -->
<template>
    <div class="chart-container">
        <h2>Current Inventory Distribution</h2>
        <Pie :chart-data="chartData" :chart-options="chartOptions" />
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import { Pie } from 'vue-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

    ChartJS.register(Title, Tooltip, Legend, ArcElement);

    export default defineComponent({
        name: 'InventoryDistributionChart',
        components: {
            Pie,
        },
        data() {
            return {
                chartData: {
                    labels: ['Clothing', 'Food', 'Hygiene Products', 'Blankets', 'Other'],
                    datasets: [
                        {
                            label: 'Inventory Items',
                            backgroundColor: [
                                '#ff6384',
                                '#36a2eb',
                                '#cc65fe',
                                '#ffce56',
                                '#009688',
                            ],
                            data: [50, 30, 20, 10, 5],
                        },
                    ],
                },
                chartOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                    },
                },
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
            color: #ff9800; /* Orange */
            margin-bottom: 1em;
        }
</style>
