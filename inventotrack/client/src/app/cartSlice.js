import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from './api';

export const checkout = createAsyncThunk('cart/checkout', async (_, { getState, rejectWithValue }) => {
  const items = getState().cart.items.map((i) => ({ productId: i._id, quantity: i.qty }));
  try { return (await api.post('/sales/checkout', { items })).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'cart',
  initialState: { items: [], status: 'idle', error: null, lastSale: null },
  reducers: {
    addToCart(s, { payload: p }) {
      const found = s.items.find((i) => i._id === p._id);
      if (found) { if (found.qty < p.quantity) found.qty += 1; }
      else s.items.push({ _id: p._id, name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, qty: 1 });
    },
    setQty(s, { payload: { id, qty } }) {
      const it = s.items.find((i) => i._id === id);
      if (it) it.qty = Math.max(1, Math.min(qty, it.quantity));
    },
    removeFromCart(s, { payload }) { s.items = s.items.filter((i) => i._id !== payload); },
  },
  extraReducers: (b) => {
    b.addCase(checkout.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(checkout.fulfilled, (s, a) => { s.status = 'idle'; s.items = []; s.lastSale = a.payload; })
      .addCase(checkout.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload; });
  },
});
export const { addToCart, setQty, removeFromCart } = slice.actions;
export default slice.reducer;
