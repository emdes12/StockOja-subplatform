import React, { useState, useEffect } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Printer,
  CreditCard, Banknote, ArrowRight, UserPlus, CheckCircle, PauseCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, Category, Order, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';

interface CartLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const PosView: React.FC = () => {
  const { activeTenantId, activeTenant, userName, formatMoney, currencySymbol } = useAuth();
  const { addToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartLine[]>([]);

  // Customer & Payment State
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');

  // Modal States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [heldCarts, setHeldCarts] = useState<{ id: string; name: string; items: CartLine[] }[]>([]);

  useEffect(() => {
    loadCatalog();
  }, [activeTenantId]);

  const loadCatalog = async () => {
    try {
      const prodRes = await fetch('/api/v1/products', { headers: { 'x-tenant-id': activeTenantId } });
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.data);

      const catRes = await fetch('/api/v1/categories', { headers: { 'x-tenant-id': activeTenantId } });
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data);
    } catch (e) {
      console.error('Error loading POS catalog:', e);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCategoryId || p.categoryId === selectedCategoryId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      addToast('error', 'Out of Stock', `${product.name} has no available stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          addToast('warning', 'Stock Limit Reached', `Only ${product.stockQuantity} units in stock.`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              addToast('warning', 'Stock Limit Reached', `Max available stock is ${item.product.stockQuantity}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `hold_${Date.now()}`,
      name: `${customerName} (${cart.length} items)`,
      items: cart
    };
    setHeldCarts(prev => [...prev, newHold]);
    clearCart();
    addToast('info', 'Cart Held', 'Current sale moved to held carts.');
  };

  const handleRetrieveCart = (holdId: string) => {
    const target = heldCarts.find(h => h.id === holdId);
    if (target) {
      setCart(target.items);
      setHeldCarts(prev => prev.filter(h => h.id !== holdId));
      addToast('success', 'Cart Retrieved', 'Held cart restored to active POS.');
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      addToast('error', 'Empty Cart', 'Please add items to cart before completing sale.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/pos/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          'x-user-name': userName
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod: selectedPaymentMethod,
          discount: discountAmount,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data.data);
        setShowReceiptModal(true);
        addToast('success', 'Sale Completed!', `Receipt ${data.data.orderNumber} generated.`);
        clearCart();
        loadCatalog(); // Refresh inventory stock in real-time
      } else {
        addToast('error', 'Checkout Failed', data.error?.message || 'Server error');
      }
    } catch (e) {
      console.error('POS Checkout error:', e);
      addToast('error', 'Checkout Error', 'Unable to reach backend server.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 overflow-hidden text-slate-900">
      {/* Product Search & Grid Workspace */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Search & Category Filter Header */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search product name, SKU, or scan barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 text-xs font-medium pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {heldCarts.length > 0 && (
              <div className="relative group">
                <button className="px-3 py-2.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <PauseCircle size={16} />
                  <span>Held ({heldCarts.length})</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 hidden group-hover:block p-2 text-xs">
                  <p className="font-bold text-slate-800 px-2 py-1 border-b border-slate-100">Restore Held Cart</p>
                  {heldCarts.map(hc => (
                    <button
                      key={hc.id}
                      onClick={() => handleRetrieveCart(hc.id)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg mt-1 text-slate-700 flex items-center justify-between"
                    >
                      <span className="truncate">{hc.name}</span>
                      <span className="text-emerald-600 text-[10px] font-bold">Restore</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                !selectedCategoryId
                  ? 'bg-emerald-500 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryId === cat.id
                    ? 'bg-emerald-500 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 bg-slate-50/50">
          {filteredProducts.map(p => {
            const isLowStock = p.stockQuantity <= p.lowStockThreshold;
            const isOutOfStock = p.stockQuantity <= 0;

            return (
              <button
                key={p.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(p)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                  isOutOfStock
                    ? 'bg-slate-100/60 border-slate-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md transition-shadow'
                }`}
              >
                <div>
                  <div className="relative aspect-square rounded-lg bg-slate-100 overflow-hidden mb-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isOutOfStock ? (
                      <span className="absolute top-2 right-2 bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {p.stockQuantity} Left
                      </span>
                    ) : null}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600">{formatMoney(p.price)}</span>
                  <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* POS Cart Panel */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Active POS Cart ({cart.length})</h3>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-rose-600 hover:text-rose-700 font-bold">
              Clear All
            </button>
          )}
        </div>

        {/* Customer Selector */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <UserPlus size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Customer Name (Default: Walk-in)"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="flex-1 bg-white text-slate-900 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none"
          />
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-medium">Cart is empty</p>
              <p className="text-[10px] opacity-70">Click items on the left to add to sale</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">{formatMoney(item.unitPrice)} each</p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-slate-900 px-1.5">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{formatMoney(item.unitPrice * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold ml-auto block mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Totals Summary */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          {/* Subtotal & Discount */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Discount (₦)</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-20 bg-slate-100 text-right text-slate-900 text-xs px-2 py-0.5 rounded border border-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Payable</span>
              <span className="text-emerald-600">{formatMoney(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  onClick={() => setSelectedPaymentMethod(pm)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                    selectedPaymentMethod === pm
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {pm.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 flex-1"
            >
              Hold Cart
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || isProcessing}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex-[2] flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? 'Processing...' : 'Complete & Print Receipt'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Thermal Sales Receipt"
        subtitle="StockỌja Transaction Confirmation"
        maxWidth="md"
      >
        {completedOrder && (
          <div className="space-y-4">
            {/* Printable Receipt Canvas */}
            <div id="receipt-printable" className="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs shadow-inner space-y-4 border border-slate-300">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-bold uppercase">{activeTenant?.name}</h2>
                <p className="text-[10px]">{activeTenant?.address}</p>
                <p className="text-[10px]">TEL: {activeTenant?.phone}</p>
                <p className="text-[10px] font-bold mt-1">OFFICIAL POS RECEIPT</p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <p><span className="font-bold">Receipt #:</span> {completedOrder.orderNumber}</p>
                <p><span className="font-bold">Date:</span> {new Date(completedOrder.createdAt).toLocaleString()}</p>
                <p><span className="font-bold">Cashier:</span> {completedOrder.cashierName || userName}</p>
                <p><span className="font-bold">Customer:</span> {completedOrder.customerName}</p>
                <p><span className="font-bold">Payment:</span> {completedOrder.paymentMethod} ({completedOrder.paymentStatus})</p>
              </div>

              <table className="w-full text-left text-[11px] border-y border-dashed border-slate-300 py-2">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-1">ITEM</th>
                    <th className="py-1 text-center">QTY</th>
                    <th className="py-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-1 pr-2">{item.productName}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right font-bold">{formatMoney(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatMoney(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-{formatMoney(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>AMOUNT PAID:</span>
                  <span>{formatMoney(completedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                <p>Thank you for your patronage!</p>
                <p>Powered by StockỌja Multi-Tenant Commerce</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700"
              >
                Close & Next Sale
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
