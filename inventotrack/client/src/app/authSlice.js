import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from './api';

export const login = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try { return (await api.post('/auth/login', body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const register = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try { return (await api.post('/auth/register', body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const loadMe = createAsyncThunk('auth/me', async () => (await api.get('/auth/me')).data.user);

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: !!localStorage.getItem('token'), error: null },
  reducers: {
    logout(state) { state.user = null; localStorage.removeItem('token'); },
  },
  extraReducers: (b) => {
    const ok = (s, { payload }) => { s.user = payload.user; s.error = null; localStorage.setItem('token', payload.token); };
    b.addCase(login.fulfilled, ok).addCase(register.fulfilled, ok)
      .addCase(login.rejected, (s, a) => { s.error = a.payload; })
      .addCase(register.rejected, (s, a) => { s.error = a.payload; })
      .addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload; s.loading = false; })
      .addCase(loadMe.rejected, (s) => { s.loading = false; });
  },
});
export const { logout } = slice.actions;
export default slice.reducer;
