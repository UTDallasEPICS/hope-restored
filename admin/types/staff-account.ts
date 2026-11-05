import type { AppRole } from "~/utils/permissions";

export type CreateStaffAccountInput = {
  name: string;
  email: string;
  role?: AppRole;
};

export type UpdateStaffAccountInput = {
  name: string;
  role: AppRole;
};

export type StaffAccount = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
};
