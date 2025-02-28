<template>
    <div class="chart-container">
        <h2>Total Donations Over Time</h2>
        <Line :chart-data="chartData" :chart-options="chartOptions" />
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import { Line } from 'vue-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        CategoryScale,
        LinearScale,
        PointElement,
    } from 'chart.js';

    // Register Chart.js components
    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        CategoryScale,
        LinearScale,
        PointElement
    );

    export default defineComponent({
        name: 'DonationsChart',
        components: {
            Line,
        },
        data() {
            return {
                chartData: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [
                        {
                            label: 'Donations ($)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            data: [500, 700, 800, 600, 900, 1200, 1500],
                            fill: true,
                        },
                    ],
                },
                chartOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
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
            color: #4caf50; /* Green */
            margin-bottom: 1em;
        }
</style>
