import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from './api';

export const fetchProducts = createAsyncThunk('inventory/fetch', async (params, { rejectWithValue }) => {
  try { return (await api.get('/products', { params })).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const adjustStock = createAsyncThunk('inventory/adjust', async ({ id, delta }, { rejectWithValue }) => {
  try { return (await api.patch(`/products/${id}/stock`, { delta })).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const saveProduct = createAsyncThunk('inventory/save', async (p, { rejectWithValue }) => {
  try {
    const res = p._id ? await api.put(`/products/${p._id}`, p) : await api.post('/products', p);
    return res.data;
  } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'inventory',
  initialState: { items: [], total: 0, pages: 1, loading: false, error: null },
  reducers: { clearError(s) { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled, (s, { payload }) => { Object.assign(s, payload, { loading: false, error: null }); })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(adjustStock.fulfilled, (s, { payload }) => {
        const i = s.items.findIndex((p) => p._id === payload._id);
        if (i >= 0) s.items[i].quantity = payload.quantity;
      })
      .addCase(adjustStock.rejected, (s, a) => { s.error = a.payload; })
      .addCase(saveProduct.rejected, (s, a) => { s.error = a.payload; });
  },
});
export const { clearError } = slice.actions;
export default slice.reducer;
