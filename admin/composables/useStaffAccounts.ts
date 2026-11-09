import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import type { CreateStaffAccountInput, StaffAccount, UpdateStaffAccountInput } from "~/types/staff-account";

/** Call from setup. The API enforces administrator authorization for all operations. */
export function useStaffAccounts() {
  const apiFetch = useAuthenticatedFetch();

  function createStaffAccount(input: CreateStaffAccountInput) {
    return apiFetch<StaffAccount>("/api/user/accounts", { method: "POST", body: input });
  }

  function deleteStaffAccount(id: string) {
    if (!id.trim()) throw new Error("An account ID is required.");
    return apiFetch<void>(`/api/user/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  function updateStaffAccount(id: string, input: UpdateStaffAccountInput) {
    if (!id.trim()) throw new Error("An account ID is required.");
    return apiFetch<StaffAccount>(`/api/user/accounts/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
  }

  return { createStaffAccount, deleteStaffAccount, updateStaffAccount };
}
