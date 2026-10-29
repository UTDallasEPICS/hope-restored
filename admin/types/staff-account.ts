export type CreateStaffAccountInput = {
  name: string;
  email: string;
};

export type StaffAccount = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};
