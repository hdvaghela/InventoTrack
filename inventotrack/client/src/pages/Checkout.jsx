import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setQty, removeFromCart, checkout } from '../app/cartSlice';

export default function Checkout() {
  const dispatch = useDispatch();
  const { items, status, error, lastSale } = useSelector((s) => s.cart);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  return (
    <>
      <h2>Checkout</h2>
      {lastSale && items.length === 0 && (
        <p className="ok">Sale recorded: ${lastSale.total.toFixed(2)}. Stock levels are updated.</p>
      )}
      {items.length === 0 ? (
        <p className="muted">Your cart is empty. <Link to="/products">Pick products to sell</Link>.</p>
      ) : (
        <>
          <table>
            <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>{items.map((i) => (
              <tr key={i._id}>
                <td>{i.name}<div className="muted">{i.sku}</div></td><td>${i.price.toFixed(2)}</td>
                <td><input className="qty" type="number" min="1" max={i.quantity} value={i.qty}
                  onChange={(e) => dispatch(setQty({ id: i._id, qty: +e.target.value || 1 }))} /></td>
                <td>${(i.price * i.qty).toFixed(2)}</td>
                <td><button className="link" onClick={() => dispatch(removeFromCart(i._id))}>Remove</button></td>
              </tr>
            ))}</tbody>
          </table>
          <div className="row"><strong>Total: ${total.toFixed(2)}</strong>
            <button className="btn" disabled={status === 'loading'} onClick={() => dispatch(checkout())}>Complete sale</button>
          </div>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </>
  );
}
