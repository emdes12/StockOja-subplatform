import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit3, Trash2, Package, Layers, Upload, Download,
  Eye, EyeOff, Filter, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, Category } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const ProductsView: React.FC = () => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Modals
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    lowStockThreshold: '5',
    description: '',
    imageUrl: '',
    isStorefrontVisible: true
  });

  useEffect(() => {
    loadProductsAndCategories();
  }, [activeTenantId]);

  const loadProductsAndCategories = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/v1/products', { headers: { 'x-tenant-id': activeTenantId } }),
        fetch('/api/v1/categories', { headers: { 'x-tenant-id': activeTenantId } })
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (e) {
      console.error('Error loading product catalog:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.categoryId,
        price: product.price.toString(),
        costPrice: product.costPrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        isStorefrontVisible: product.isStorefrontVisible
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        barcode: '',
        categoryId: categories[0]?.id || '',
        price: '',
        costPrice: '',
        stockQuantity: '10',
        lowStockThreshold: '3',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        isStorefrontVisible: true
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      addToast('error', 'Validation Error', 'Product Name and Selling Price are required.');
      return;
    }

    try {
      const selectedCat = categories.find(c => c.id === formData.categoryId);
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        categoryId: formData.categoryId,
        categoryName: selectedCat?.name || '',
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        stockQuantity: Number(formData.stockQuantity || 0),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
        description: formData.description,
        imageUrl: formData.imageUrl,
        isStorefrontVisible: formData.isStorefrontVisible
      };

      const url = editingProduct ? `/api/v1/products/${editingProduct.id}` : '/api/v1/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Product Saved', `Successfully ${editingProduct ? 'updated' : 'created'} ${formData.name}`);
        setShowProductModal(false);
        loadProductsAndCategories();
      } else {
        addToast('error', 'Save Failed', data.error?.message);
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to reach backend service.');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Category Created', `Added category ${newCategoryName}`);
        setNewCategoryName('');
        setShowCategoryModal(false);
        loadProductsAndCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package size={22} className="text-emerald-400" />
            Product Catalog & Management
          </h2>
          <p className="text-xs text-slate-400">Manage SKUs, selling prices, cost prices, stock thresholds, and storefront visibility.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 text-xs font-medium pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none w-full sm:w-48"
        >
          <option value="">All Categories ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <LoadingState message="Loading catalog..." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Product details</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Storefront</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map(p => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800"
                          />
                          <div>
                            <p className="font-semibold text-slate-100">{p.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-[10px] text-slate-500">{p.barcode}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">{p.categoryName || 'Unassigned'}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{formatMoney(p.price)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-400">{formatMoney(p.costPrice)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.stockQuantity === 0 ? 'danger' : isLow ? 'warning' : 'success'} size="sm">
                          {p.stockQuantity} in stock
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {p.isStorefrontVisible ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                            <Eye size={12} /> Visible
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1 font-medium text-[11px]">
                            <EyeOff size={12} /> Hidden
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle="Configure product details, stock, prices, and visibility"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. iPhone 15 Pro Max 256GB"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Barcode (UPC/EAN)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Scan or type barcode"
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selling Price (₦) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cost Price (₦)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Opening Stock</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Public Online Storefront Visibility</p>
              <p className="text-[10px] text-slate-400">Display this product on your customer-facing store</p>
            </div>
            <input
              type="checkbox"
              checked={formData.isStorefrontVisible}
              onChange={e => setFormData({ ...formData, isStorefrontVisible: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Manage Categories"
        subtitle="Organize your product catalog into categories"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="flex-1 bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map(c => (
              <div key={c.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-slate-200">{c.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{c.slug}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
