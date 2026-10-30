import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import inventory from './inventorySlice';
import cart from './cartSlice';
export default configureStore({ reducer: { auth, inventory, cart } });
