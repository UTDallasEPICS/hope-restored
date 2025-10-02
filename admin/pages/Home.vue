<!-- pages/index.vue -->
<template>
    <div class="home-container">
        <!-- Welcome Section -->
        <header class="welcome-section">
            <h1>Welcome to Hope Restored Missions!</h1>
            <p>Your hope is our mission.</p>
            <button onclick="location.href='https://hoperestoredmissions.org/'" target="_blank" class="cta-button">Get Involved</button>
        </header>

        <!-- About Us Section -->
        <section id="about-us" class="about-us-section">
            <h2 class="who-we-are-title">Who We Are</h2>
            <p class="mission-statement">
                Hope Restored Missions exists to restore hope to those oppressed by the circumstances and tragedies of their lives.
                We focus on the homeless and those facing housing insecurities.
            </p>
        </section>

        <!-- Features Section -->
        <section id="features" class="features-section">
            <div class="feature">
                <i class="fas fa-hands-helping"></i>
                <h3>Community Support</h3>
                <p>Join our efforts to help and provide aid to those in need.</p>
            </div>
            <div class="feature">
                <i class="fas fa-chart-line"></i>
                <h3>Track Impact</h3>
                <p>See how your contributions make a difference.</p>
            </div>
            <div class="feature">
                <i class="fas fa-heart"></i>
                <h3>Volunteer Opportunities</h3>
                <p>Get involved and help us restore hope.</p>
            </div>
        </section>

        <!-- Charts Section -->
        <!-- TEMPORARILY DISABLED.
            <section id="charts" class="charts-section">
            <DonationsChart />
            <InventoryDistributionChart />
        </section>
        -->
        
    </div>
</template>

<script>
     import DonationsChart from '../components/Inventory/DonationsChart.vue';
     import InventoryDistributionChart from '../components/Inventory/InventoryDistributionChart.vue';

     export default {
         components: {
             DonationsChart,
             InventoryDistributionChart,
         },
     };
</script>

<style scoped>
    /* General Page Styling */
    .home-container {
        font-family: 'Open Sans', sans-serif;
        padding: 2em;
        background-color: #f9fafc; /* Lighter background */
        min-height: 100vh;
    }

    /* Welcome Section Styling */
    .welcome-section {
        text-align: center;
        padding: 3em 1em;
        background: linear-gradient(135deg, #3f51b5, #5c6bc0); /* Indigo Gradient */
        color: #ffffff;
        border-radius: 8px;
        margin-bottom: 2em;
        /* Animation */
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
    }

        .welcome-section h1 {
            font-size: 3em;
            margin-bottom: 0.5em;
        }

        .welcome-section p {
            font-size: 1.5em;
        }

        .welcome-section .cta-button {
            margin-top: 1.5em;
            padding: 0.75em 2em;
            font-size: 1.2em;
            color: #fff;
            background-color: #ff9800; /* Orange */
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            text-transform: uppercase;
        }

            .welcome-section .cta-button:hover {
                background-color: #e68900;
            }

    /* About Us Section Styling */
    .about-us-section {
        background-color: #ffffff;
        padding: 2em;
        border-radius: 8px;
        color: #333333;
        line-height: 1.6;
        text-align: center;
        margin-bottom: 2em;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        /* Animation */
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
        animation-delay: 0.5s;
    }

    .who-we-are-title {
        font-size: 2.5em;
        font-weight: bold;
        color: #3f51b5; /* Indigo */
        margin-bottom: 0.5em;
    }

    .mission-statement {
        font-size: 1.2em;
        color: #555555;
        max-width: 800px;
        margin: 0 auto;
    }

    /* Features Section Styling */
    .features-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2em 0;
        background-color: #e8eaf6; /* Light Indigo */
        border-radius: 8px;
        margin-bottom: 2em;
        /* Animation */
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
        animation-delay: 1s;
    }

    .feature {
        text-align: center;
        margin-bottom: 2em;
    }

        .feature i {
            font-size: 3em;
            color: #3f51b5; /* Indigo */
            margin-bottom: 0.5em;
        }

        .feature h3 {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 0.5em;
        }

        .feature p {
            font-size: 1em;
            color: #555;
            max-width: 300px;
            margin: 0 auto;
        }

    @media (min-width: 768px) {
        .features-section {
            flex-direction: row;
            justify-content: space-around;
            padding: 4em 0;
        }

        .feature {
            width: 30%;
            margin-bottom: 0;
        }
    }

    /* Charts Section Styling */
    .charts-section {
        display: flex;
        flex-direction: column;
        gap: 2em;
        align-items: center;
        padding: 2em 0;
        /* Animation */
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
        animation-delay: 1.5s;
    }

    /* Responsive Design */
    @media (min-width: 768px) {
        .charts-section {
            flex-direction: row;
            justify-content: space-around;
        }

        .chart-container {
            width: 45%;
        }
    }

    /* Fade In Animation */
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
