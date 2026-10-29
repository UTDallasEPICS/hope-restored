<template>
  <div class="bg-gray-100 min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-8 font-sans">
    <div class="max-w-4xl mx-auto flex flex-col gap-6">

      <!-- Create Account Section -->
      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6">
        <h1 class="text-2xl font-bold text-indigo-600 mb-4">Create Account</h1>

        <p v-if="createError" class="text-red-600 text-sm mb-3">{{ createError }}</p>
        <p v-if="createSuccess" class="text-green-600 text-sm mb-3">Account created successfully.</p>

        <form @submit.prevent="handleCreate" class="flex flex-col gap-3 max-w-md">
          <input
            type="text"
            v-model="newName"
            placeholder="Full Name"
            class="auth-input"
          />
          <input
            type="email"
            v-model="newEmail"
            placeholder="example@email.com"
            class="auth-input"
          />
          <button type="submit" class="auth-submit">Create Account</button>
        </form>
      </section>

      <!-- Existing Accounts Section -->
      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6">
        <h2 class="text-xl font-bold text-indigo-600 mb-4">Existing Accounts</h2>

        <p v-if="users.length === 0" class="text-gray-500 text-sm">No accounts found.</p>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left border-b border-gray-200">
              <th class="py-2">Name</th>
              <th class="py-2">Email</th>
              <th class="py-2">Role</th>
              <th class="py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-gray-100">
              <td class="py-2">{{ user.name }}</td>
              <td class="py-2">{{ user.email }}</td>
              <td class="py-2">{{ user.role }}</td>
              <td class="py-2 text-right">
                <button
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="userToDelete"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <p class="mb-4">
          Are you sure you want to delete
          <strong>{{ userToDelete.email }}</strong>? This cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="userToDelete = null" class="px-4 py-2 rounded-md border border-gray-300">
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthenticatedFetch } from "~/composables/useAuthenticatedFetch";
import { useStaffAccounts } from "~/composables/useStaffAccounts";
import type { StaffAccount } from "~/types/staff-account";

const apiFetch = useAuthenticatedFetch();
const { createStaffAccount, deleteStaffAccount } = useStaffAccounts();

const users = ref<StaffAccount[]>([]);
const newName = ref("");
const newEmail = ref("");
const createError = ref("");
const createSuccess = ref(false);
const userToDelete = ref<StaffAccount | null>(null);

async function fetchUsers() {
  users.value = await apiFetch<StaffAccount[]>("/api/user/accounts");
}

async function handleCreate() {
  createError.value = "";
  createSuccess.value = false;

  if (!newName.value || !newEmail.value) {
    createError.value = "Name and email are required.";
    return;
  }

  try {
    await createStaffAccount({ name: newName.value, email: newEmail.value });
    createSuccess.value = true;
    newName.value = "";
    newEmail.value = "";
    await fetchUsers();
  } catch (err) {
    createError.value = (err as Error)?.message || "Failed to create account.";
  }
}

function confirmDelete(user: StaffAccount) {
  userToDelete.value = user;
}

async function handleDelete() {
  if (!userToDelete.value) return;
  await deleteStaffAccount(userToDelete.value.id);
  userToDelete.value = null;
  await fetchUsers();
}

onMounted(fetchUsers);
</script>

<style scoped>
.auth-input {
  width: 100%;
  padding: 0.75rem 0.875rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.auth-submit {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #2563eb;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
.auth-submit:hover {
  background-color: #1d4ed8;
}
</style>
