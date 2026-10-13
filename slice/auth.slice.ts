import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Employee, LoginData } from "@/types/auth";

export interface AuthState {
  token: string | null;
  employee: Employee | null;
}

const initialState: AuthState = { token: null, employee: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginData>) {
      state.token = action.payload.access_token;
      state.employee = action.payload.employee;
    },
    logout(state) {
      state.token = null;
      state.employee = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
