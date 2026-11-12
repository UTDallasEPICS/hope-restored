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
          <label class="text-sm">
            Role
            <select v-model="newRole" class="auth-input">
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="scanner">Scanner</option>
            </select>
          </label>
          <button type="submit" class="auth-submit">Create Account</button>
        </form>
      </section>

      <!-- Existing Accounts Section -->
      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6">
        <h2 class="text-xl font-bold text-indigo-600 mb-4">Existing Accounts</h2>
        <p v-if="updateSuccess" class="text-green-600 text-sm mb-3" role="status">Account updated successfully.</p>

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
                  @click="openUpdate(user)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-3"
                >
                  Update
                </button>
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

    <dialog
      ref="updateDialog"
      class="bg-white rounded-lg shadow-lg p-6 max-w-md w-[calc(100%-2rem)] backdrop:bg-black/40 m-auto"
      aria-labelledby="update-account-title"
      @cancel="updating && $event.preventDefault()"
      @close="userToUpdate = null"
    >
      <form v-if="userToUpdate" @submit.prevent="handleUpdate" class="flex flex-col gap-3">
        <h2 id="update-account-title" class="text-xl font-bold text-indigo-600">Update Account</h2>
        <p v-if="updateError" class="text-red-600 text-sm" role="alert">{{ updateError }}</p>
        <label class="text-sm">
          Full Name
          <input v-model="editName" type="text" required maxlength="200" autofocus class="auth-input" :disabled="updating" />
        </label>
        <label class="text-sm">
          Email
          <input :value="userToUpdate.email" type="email" readonly class="auth-input bg-gray-100 text-gray-500" />
        </label>
        <label class="text-sm">
          Role
          <select v-model="editRole" class="auth-input" :disabled="updating">
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="scanner">Scanner</option>
          </select>
        </label>
        <div class="flex justify-end gap-3 mt-2">
          <button type="button" @click="updateDialog?.close()" :disabled="updating" class="px-4 py-2 rounded-md border border-gray-300">
            Cancel
          </button>
          <button type="submit" :disabled="updating" class="auth-submit disabled:opacity-50">
            {{ updating ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </form>
    </dialog>

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
import { ref, onMounted, nextTick } from "vue";
import { useAuthenticatedFetch } from "~/composables/useAuthenticatedFetch";
import { useStaffAccounts } from "~/composables/useStaffAccounts";
import type { StaffAccount } from "~/types/staff-account";
import type { AppRole } from "~/utils/permissions";
import { formatApiError } from "~/utils/format-api-error";
import { authClient } from "~/lib/auth-client";

const apiFetch = useAuthenticatedFetch();
const { createStaffAccount, deleteStaffAccount, updateStaffAccount } = useStaffAccounts();
const sessionState = authClient.useSession();

const users = ref<StaffAccount[]>([]);
const newName = ref("");
const newEmail = ref("");
const newRole = ref<AppRole>("staff");
const createError = ref("");
const createSuccess = ref(false);
const userToDelete = ref<StaffAccount | null>(null);
const userToUpdate = ref<StaffAccount | null>(null);
const updateDialog = ref<HTMLDialogElement | null>(null);
const editName = ref("");
const editRole = ref<AppRole>("staff");
const updateError = ref("");
const updateSuccess = ref(false);
const updating = ref(false);

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
    await createStaffAccount({ name: newName.value, email: newEmail.value, role: newRole.value });
    createSuccess.value = true;
    newName.value = "";
    newEmail.value = "";
    newRole.value = "staff";
    await fetchUsers();
  } catch (err) {
    createError.value = (err as Error)?.message || "Failed to create account.";
  }
}

function confirmDelete(user: StaffAccount) {
  userToDelete.value = user;
}

async function openUpdate(user: StaffAccount) {
  userToUpdate.value = user;
  editName.value = user.name ?? "";
  editRole.value = user.role;
  updateError.value = "";
  updateSuccess.value = false;
  await nextTick();
  updateDialog.value?.showModal();
}

async function handleUpdate() {
  if (!userToUpdate.value || updating.value) return;
  updateError.value = "";
  updating.value = true;
  try {
    const updated = await updateStaffAccount(userToUpdate.value.id, {
      name: editName.value,
      role: editRole.value,
    });
    users.value = users.value.map((user) => user.id === updated.id ? updated : user);
    updateSuccess.value = true;
    updateDialog.value?.close();
    if (sessionState.value?.data?.user.id === updated.id) {
      await sessionState.value.refetch();
      if (updated.role !== "admin") await navigateTo("/Home");
    }
  } catch (err) {
    updateError.value = formatApiError(err, "Failed to update account.");
  } finally {
    updating.value = false;
  }
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
