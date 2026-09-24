import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Search, X, ArrowRight, ShieldCheck, CheckCircle2,
  Trash2, Plus, Minus, Truck, Phone, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStorefrontCart } from '../../context/StorefrontCartContext';
import { useToast } from '../../context/ToastContext';
import { Product, Category, StoreSettings, Order } from '../../types';
import { Modal } from '../common/Modal';

export const PublicStoreView: React.FC = () => {
  const { activeTenant, activeTenantId, formatMoney } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal } = useStorefrontCart();
  const { addToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI Drawers & Modals
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showDetailProduct, setShowDetailProduct] = useState<Product | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const slug = activeTenant?.slug || 'lagos-tech';

  useEffect(() => {
    loadPublicStorefront();
  }, [slug]);

  const loadPublicStorefront = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/storefront/${slug}/info`);
      const data = await res.json();
      if (data.success) {
        setStoreSettings(data.data.settings);
        setCategories(data.data.categories);
      }

      const prodRes = await fetch(`/api/v1/storefront/${slug}/products`);
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      addToast('error', 'Missing Information', 'Please complete all required shipping fields.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await fetch(`/api/v1/storefront/${slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setPlacedOrder(data.data);
        clearCart();
        setShowCheckoutModal(false);
        addToast('success', 'Order Placed!', `Your order ${data.data.orderNumber} has been received.`);
      } else {
        addToast('error', 'Checkout Failed', data.error?.message);
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to submit order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCat || p.categoryId === selectedCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const flatShipping = storeSettings?.flatShippingRate || 2000;
  const finalTotal = subtotal + (cart.length > 0 ? flatShipping : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Promotional Announcement Banner */}
      {storeSettings?.bannerText && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2">
          <span>{storeSettings.bannerText}</span>
        </div>
      )}

      {/* Store Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-xl shadow-lg">
            {storeSettings?.storeName?.[0] || 'S'}
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight">{storeSettings?.storeName || activeTenant?.name}</h1>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{storeSettings?.tagline}</p>
          </div>
        </div>

        {/* Cart Trigger */}
        <button
          onClick={() => setShowCartDrawer(true)}
          className="relative p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <ShoppingBag size={20} />
          <span className="font-bold text-xs hidden sm:inline">My Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Hero Banner Section */}
      <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-block text-[11px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Verified Merchant Storefront
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
              {storeSettings?.storeName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              {storeSettings?.aboutText || 'Discover authentic original products with nationwide express delivery.'}
            </p>
          </div>

          <div className="relative w-full md:w-80 aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <img
              src={storeSettings?.bannerImageUrl || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop'}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Store Catalog Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search store products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap ${
                !selectedCat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Items
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap ${
                  selectedCat === c.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-emerald-600 transition-all group"
            >
              <div>
                <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden mb-3 relative">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-tight">{p.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-sm font-black text-emerald-400">{formatMoney(p.price)}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag size={20} className="text-emerald-400" /> Shopping Cart ({totalItems})
              </h3>
              <button onClick={() => setShowCartDrawer(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">Your shopping cart is currently empty.</div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 flex items-center gap-3">
                    <img src={item.product.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-950" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-emerald-400 font-bold">{formatMoney(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1"><Minus size={12} /></button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1"><Plus size={12} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Flat Rate Shipping</span><span>{formatMoney(flatShipping)}</span></div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-100 pt-1 border-t border-slate-800">
                    <span>Total</span><span className="text-emerald-400">{formatMoney(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCartDrawer(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Customer Checkout"
        subtitle="Provide shipping details to confirm order"
        maxWidth="md"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Dr. Fatima Bello"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="fatima@example.com"
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Shipping / Delivery Address *</label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              placeholder="Full delivery address, street, city..."
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between font-bold text-xs">
            <span>Total Payable:</span>
            <span className="text-emerald-400">{formatMoney(finalTotal)}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPlacingOrder}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              {isPlacingOrder ? 'Submitting...' : 'Place Order & Pay'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Confirmation Screen Modal */}
      {placedOrder && (
        <Modal
          isOpen={!!placedOrder}
          onClose={() => setPlacedOrder(null)}
          title="Order Confirmed!"
          subtitle="Thank you for shopping with us"
          maxWidth="md"
        >
          <div className="text-center space-y-4 text-xs py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Order #{placedOrder.orderNumber} Received</h3>
              <p className="text-slate-400 mt-1">A confirmation has been dispatched. Our team is processing your order.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl text-left border border-slate-800 space-y-1">
              <p className="text-slate-300"><span className="font-bold">Customer:</span> {placedOrder.customerName}</p>
              <p className="text-slate-300"><span className="font-bold">Total Paid:</span> {formatMoney(placedOrder.totalAmount)}</p>
              <p className="text-slate-300"><span className="font-bold">Delivery:</span> {placedOrder.shippingAddress}</p>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
            >
              Continue Shopping
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
