<template>
  <div
    class="bg-gray-100 min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8 font-sans"
  >
    <div class="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6">
      <section
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1
              class="text-[clamp(1.5rem,3vw+0.5rem,2.25rem)] font-bold text-indigo-600"
            >
              Recent Changes
            </h1>
            <p class="mt-2 text-sm text-gray-600">
              This page shows updates made in the system.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:min-w-[280px]">
            <div
              class="rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2"
            >
              <p
                class="text-[11px] uppercase font-semibold tracking-wide text-indigo-700"
              >
                Entries Shown
              </p>
              <p class="text-xl font-bold text-indigo-800">
                {{ entries.length }}
              </p>
            </div>
            <div
              class="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2"
            >
              <p
                class="text-[11px] uppercase font-semibold tracking-wide text-emerald-700"
              >
                Last Updated
              </p>
              <p class="text-sm font-semibold text-emerald-800 truncate">
                {{ lastRefreshLabel }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Find</label
            >
            <input
              v-model.trim="search"
              type="text"
              placeholder="person, page, or IP address"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Action Type</label
            >
            <div class="relative">
              <select
                v-model="method"
                class="appearance-none w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-9 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">All Action Types</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i class="fas fa-chevron-down text-xs" aria-hidden="true"></i>
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >How Many Lines</label
            >
            <div class="relative">
              <select
                v-model.number="limit"
                class="appearance-none w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-9 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option :value="100">100 Rows</option>
                <option :value="200">200 Rows</option>
                <option :value="500">500 Rows</option>
                <option :value="1000">1000 Rows</option>
              </select>
              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i class="fas fa-chevron-down text-xs" aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            @click="loadEntries"
          >
            Update
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-200"
            @click="resetFilters"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-0 overflow-hidden"
      >
        <div v-if="loading" class="p-5 text-sm text-gray-600 animate-pulse">
          Loading changes...
        </div>
        <div v-else-if="!entries.length" class="p-8 text-center">
          <p class="text-sm font-semibold text-gray-700">No changes yet</p>
          <p class="text-xs text-gray-500 mt-1">
            Try resetting filters or come back after someone makes an update.
          </p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[860px] text-sm">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-3 py-2 text-left border-b border-gray-200">
                  Date & Time
                </th>
                <th class="px-3 py-2 text-left border-b border-gray-200">
                  When
                </th>
                <th class="px-3 py-2 text-left border-b border-gray-200">
                  Who
                </th>
                <th class="px-3 py-2 text-left border-b border-gray-200">
                  What Happened
                </th>
                <th class="px-3 py-2 text-left border-b border-gray-200">
                  Item Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in entries"
                :key="entry.id"
                class="odd:bg-white even:bg-gray-50"
              >
                <td
                  class="px-3 py-2 border-b border-gray-100 whitespace-nowrap"
                >
                  {{ formatTime(entry.timestamp) }}
                </td>
                <td
                  class="px-3 py-2 border-b border-gray-100 whitespace-nowrap text-gray-600"
                >
                  {{ formatRelativeTime(entry.timestamp) }}
                </td>
                <td
                  class="px-3 py-2 border-b border-gray-100 whitespace-nowrap"
                >
                  <span
                    class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
                  >
                    {{ entry.actor }}
                  </span>
                </td>
                <td class="px-3 py-2 border-b border-gray-100">
                  <p class="text-sm text-gray-900 font-medium">
                    {{ entry.summary || describeAction(entry) }}
                  </p>
                </td>
                <td class="px-3 py-2 border-b border-gray-100">
                  <div v-if="entry.details?.length" class="space-y-1">
                    <p
                      v-for="(detail, index) in entry.details"
                      :key="`${entry.id}-detail-${index}`"
                      class="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1 leading-relaxed break-words"
                    >
                      {{ detail }}
                    </p>
                  </div>
                  <span v-else class="text-xs text-gray-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type ActivityEntry = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  actor: string;
  actorEmail: string | null;
  ip: string | null;
  userAgent: string | null;
  summary?: string | null;
  details?: string[] | null;
};

const entries = ref<ActivityEntry[]>([]);
const loading = ref(false);
const search = ref("");
const method = ref("");
const limit = ref(200);
const lastRefreshAt = ref<Date | null>(null);

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

const lastRefreshLabel = computed(() =>
  lastRefreshAt.value ? lastRefreshAt.value.toLocaleTimeString() : "Never",
);

function methodBadgeClass(requestMethod: string) {
  const upper = requestMethod.toUpperCase();
  if (upper === "POST") return "bg-emerald-100 text-emerald-800";
  if (upper === "PUT") return "bg-blue-100 text-blue-800";
  if (upper === "PATCH") return "bg-amber-100 text-amber-800";
  if (upper === "DELETE") return "bg-rose-100 text-rose-800";
  return "bg-gray-100 text-gray-700";
}

function describeAction(entry: ActivityEntry) {
  const path = entry.path;
  const methodName = entry.method.toUpperCase();

  if (path.startsWith("/api/checkout") && methodName === "POST") {
    return "Removed item(s) from the catalog through Checkout.";
  }
  if (path.startsWith("/api/inventory") && methodName === "POST") {
    return "Added item(s) to the catalog.";
  }
  if (path.startsWith("/api/inventory") && methodName === "PUT") {
    return "Updated catalog item details or quantity.";
  }
  if (path.startsWith("/api/inventory") && methodName === "DELETE") {
    return "Removed item(s) from the catalog.";
  }
  if (path.startsWith("/api/amend") && methodName === "POST") {
    return "Adjusted inventory counts.";
  }
  if (path.startsWith("/api/resource/create") && methodName === "POST") {
    return "Added a new resource listing.";
  }
  if (path.startsWith("/api/resource/update") && methodName === "PUT") {
    return "Updated a resource listing.";
  }
  if (path.startsWith("/api/resource/delete") && methodName === "DELETE") {
    return "Removed a resource listing.";
  }
  if (path.startsWith("/api/reports") && methodName === "POST") {
    return "Generated or updated report data.";
  }
  return "Made a system change.";
}

async function loadEntries() {
  loading.value = true;
  try {
    const data = await $fetch<ActivityEntry[]>("/api/activity", {
      params: {
        search: search.value || undefined,
        method: method.value || undefined,
        limit: limit.value,
      },
    });
    entries.value = Array.isArray(data) ? data : [];
    lastRefreshAt.value = new Date();
  } catch (error) {
    console.error("Failed to load activity log", error);
    alert("Could not load the changes right now.");
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  search.value = "";
  method.value = "";
  limit.value = 200;
  void loadEntries();
}

onMounted(() => {
  void loadEntries();
});
</script>
