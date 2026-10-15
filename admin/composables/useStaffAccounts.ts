import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import type { CreateStaffAccountInput, StaffAccount } from "~/types/staff-account";

/** Call from setup. The API enforces administrator authorization for both operations. */
export function useStaffAccounts() {
  const apiFetch = useAuthenticatedFetch();

  function createStaffAccount(input: CreateStaffAccountInput) {
    return apiFetch<StaffAccount>("/api/user", { method: "POST", body: input });
  }

  function deleteStaffAccount(id: string) {
    if (!id.trim()) throw new Error("A staff account ID is required.");
    return apiFetch<void>(`/api/user/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  return { createStaffAccount, deleteStaffAccount };
}
