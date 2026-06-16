<!-- pages/index.vue -->
<template>
    <div class="home-container">
        <!-- Welcome Section -->
        <header class="welcome-section">
            <h1>Welcome to Hope Restored Missions!</h1>
            <p>Your hope is our mission.</p>
            <a
                v-if="!isAuthenticated"
                href="https://hoperestoredmissions.org/"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-button"
            >Get Involved</a>
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
        
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { authClient } from "~/lib/auth-client";

const sessionState = authClient.useSession(useFetch);
const isAuthenticated = computed(() => Boolean(sessionState?.data?.value));
</script>

<style scoped>
    /* General Page Styling */
    .home-container {
        font-family: 'sans-serif', Arial;
        padding: clamp(0.75rem, 4vw, 2em);
        background-color: #f0f2f5;
        min-height: 100vh;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    /* Welcome Section Styling */
    .welcome-section {
        text-align: center;
        padding: clamp(1.5rem, 7vw, 3em) clamp(0.75rem, 4vw, 1em);
        background: linear-gradient(135deg, #3f51b5, #5c6bc0);
        color: #ffffff;
        border-radius: 8px;
        margin-bottom: clamp(1rem, 4vw, 2em);
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
    }

    .welcome-section h1 {
        font-size: clamp(1.5rem, 6vw + 0.35rem, 3rem);
        line-height: 1.2;
        margin: 0 0 0.75em;
        word-wrap: break-word;
    }

    .welcome-section p {
        font-size: clamp(1rem, 3.2vw + 0.2rem, 1.5rem);
        line-height: 1.45;
        margin: 0 0 0.5em;
    }

    .welcome-section .cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: clamp(0.75rem, 3vw, 1.5em);
        padding: clamp(0.65rem, 2vw, 0.5em) clamp(1.25rem, 5vw, 2em);
        min-height: 2.75rem;
        font-size: clamp(0.9rem, 2.5vw + 0.2rem, 1.2rem);
        color: #fff;
        background-color: #ff9800;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        text-transform: uppercase;
        text-decoration: none;
        letter-spacing: 0.04em;
    }

    .welcome-section .cta-button:hover {
        background-color: #e68900;
    }

    /* About Us Section Styling */
    .about-us-section {
        background-color: #ffffff;
        padding: clamp(1rem, 4vw, 2em);
        border-radius: 8px;
        color: #333333;
        line-height: 1.65;
        text-align: center;
        margin-bottom: clamp(1rem, 4vw, 2em);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
        animation-delay: 0.5s;
    }

    .who-we-are-title {
        font-size: clamp(1.35rem, 5vw + 0.25rem, 2.5rem);
        font-weight: bold;
        color: #3f51b5;
        margin: 0 0 0.5em;
        line-height: 1.25;
    }

    .mission-statement {
        font-size: clamp(0.95rem, 2.6vw + 0.15rem, 1.2rem);
        color: #555555;
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.65;
    }

    /* Features Section Styling */
    .features-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: clamp(1.25rem, 4vw, 2em) clamp(0.75rem, 3vw, 1em);
        background-color: #e8eaf6;
        border-radius: 8px;
        margin-bottom: clamp(1rem, 4vw, 2em);
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 1s forwards;
        animation-delay: 1s;
    }

    .feature {
        text-align: center;
        margin-bottom: clamp(1.25rem, 5vw, 2em);
        width: 100%;
        max-width: 22rem;
        padding: 0 clamp(0.25rem, 2vw, 0.5rem);
        box-sizing: border-box;
    }

    .feature:last-child {
        margin-bottom: 0;
    }

    .feature i {
        font-size: clamp(2rem, 8vw, 3rem);
        color: #3f51b5;
        margin-bottom: 0.5em;
    }

    .feature h3 {
        font-size: clamp(1.1rem, 3.2vw + 0.15rem, 1.5rem);
        color: #333;
        margin: 0 0 0.5em;
        line-height: 1.3;
    }

    .feature p {
        font-size: clamp(0.9rem, 2.4vw + 0.1rem, 1rem);
        color: #555;
        max-width: 100%;
        margin: 0 auto;
        line-height: 1.55;
    }

    @media (max-width: 767px) {
        .welcome-section .cta-button {
            width: min(100%, 18rem);
        }

        .mission-statement {
            text-align: left;
        }
    }

    @media (min-width: 768px) {
        .features-section {
            flex-direction: row;
            justify-content: space-around;
            padding: 4em 0;
        }

        .feature {
            width: 30%;
            max-width: none;
            margin-bottom: 0;
        }

        .feature:last-child {
            margin-bottom: 0;
        }

        .mission-statement {
            text-align: center;
        }
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
