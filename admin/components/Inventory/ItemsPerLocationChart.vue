<template>
    <div class="chart-container">
        <h2>Items per Location</h2>
        <Pie :chart-data="chartData" :chart-options="chartOptions" />
    </div>
</template>

<script>
    import { defineComponent, watch, ref } from 'vue';
    import { Pie } from 'vue-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

    // Register Chart.js components
    ChartJS.register(Title, Tooltip, Legend, ArcElement);

    export default defineComponent({
        name: 'ItemsPerLocationChart',
        components: {
            Pie,
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
                labels: ['Coppell', 'Frisco', 'Plano', 'Richardson', 'Carrollton'],
                datasets: [
                    {
                        label: 'Items',
                        backgroundColor: [
                            '#ff6384',
                            '#36a2eb',
                            '#cc65fe',
                            '#ffce56',
                            '#009688',
                        ],
                        // test data
                        data: [500, 700, 1000, 800, 350],
                    },
                ],
            });

            const chartOptions = ref({
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                },
            });

            const updateChartData = () => {
                const locationData = {};

                props.inventory.forEach((item) => {
                    if (locationData[item.location]) {
                        locationData[item.location] += item.quantity;
                    } else {
                        locationData[item.location] = item.quantity;
                    }
                });

                // chartData.value.labels = Object.keys(locationData);
                // chartData.value.datasets[0].data = Object.values(locationData);
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
            color: #ff9800; /* Orange */
            margin-bottom: 1em;
        }
</style>
