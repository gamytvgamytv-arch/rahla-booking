import { useState, useMemo } from 'react';
import {
  Star,
  MapPin,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  X,
  ArrowLeft,
  ArrowRight,
  Pill,
  Moon,
  FlaskConical,
  Apple,
  Activity,
  CheckCircle2,
  Bike,
  AlertTriangle,
  Trash2,
  Navigation,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type ProductCategory = 'sleep' | 'supplements' | 'vitamins' | 'painkillers';

interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  doseEn: string;
  doseAr: string;
  category: ProductCategory;
  priceUSD: number;
  image: string;
  inStock: boolean;
  popular: boolean;
}

interface PharmacyInfo {
  id: string;
  name: string;
  image: string;
  city: string;
  district: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
}

const PHARMACIES: Record<string, PharmacyInfo> = {
  'p1': { id: 'p1', name: 'صيدلية النهدي', image: 'https://images.pexels.com/photos/14797864/pexels-photo-14797864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', city: 'الرياض', district: 'حي العليا', rating: 4.4, ratingCount: 890, deliveryTime: '30-45 دقيقة' },
  'p2': { id: 'p2', name: 'صيدلية الأدوية الحديثة', image: 'https://images.pexels.com/photos/8657373/pexels-photo-8657373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', city: 'جدة', district: 'حي الروضة', rating: 4.2, ratingCount: 230, deliveryTime: '30-45 دقيقة' },
};

const PRODUCTS: Product[] = [
  { id: 'pr1', nameEn: 'Melatonin 10mg', nameAr: 'ميلاتونين 10 ملغ', doseEn: '10mg - 60 tablets', doseAr: '10 ملغ - 60 قرص', category: 'sleep', priceUSD: 12.8, image: 'https://images.pexels.com/photos/30801239/pexels-photo-30801239.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr2', nameEn: 'Vitamin C 1000mg', nameAr: 'فيتامين C 1000 ملغ', doseEn: '1000mg - 90 tablets', doseAr: '1000 ملغ - 90 قرص', category: 'vitamins', priceUSD: 9.6, image: 'https://images.pexels.com/photos/13787562/pexels-photo-13787562.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr3', nameEn: 'Paracetamol 500mg', nameAr: 'باراسيتامول 500 ملغ', doseEn: '500mg - 24 tablets', doseAr: '500 ملغ - 24 قرص', category: 'painkillers', priceUSD: 3.2, image: 'https://images.pexels.com/photos/13779112/pexels-photo-13779112.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr4', nameEn: 'Omega-3 Fish Oil', nameAr: 'أوميغا-3 زيت السمك', doseEn: '1000mg - 120 softgels', doseAr: '1000 ملغ - 120 كبسولة', category: 'supplements', priceUSD: 16.0, image: 'https://images.pexels.com/photos/13779111/pexels-photo-13779111.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr5', nameEn: 'Vitamin D3 5000IU', nameAr: 'فيتامين D3 5000 وحدة', doseEn: '5000IU - 60 tablets', doseAr: '5000 وحدة - 60 قرص', category: 'vitamins', priceUSD: 8.0, image: 'https://images.pexels.com/photos/13779102/pexels-photo-13779102.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr6', nameEn: 'Ibuprofen 400mg', nameAr: 'ايبوبروفين 400 ملغ', doseEn: '400mg - 30 tablets', doseAr: '400 ملغ - 30 قرص', category: 'painkillers', priceUSD: 4.8, image: 'https://images.pexels.com/photos/13779104/pexels-photo-13779104.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: false, popular: false },
  { id: 'pr7', nameEn: 'Magnesium Glycinate', nameAr: 'مغنيسيوم جلايسينات', doseEn: '400mg - 90 tablets', doseAr: '400 ملغ - 90 قرص', category: 'sleep', priceUSD: 14.4, image: 'https://images.pexels.com/photos/13779106/pexels-photo-13779106.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr8', nameEn: 'Gummy Vitamins Mix', nameAr: 'فيتامينات جيلي متنوعة', doseEn: 'Mixed - 60 gummies', doseAr: 'متنوعة - 60 قطعة', category: 'vitamins', priceUSD: 11.2, image: 'https://images.pexels.com/photos/14027302/pexels-photo-14027302.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: false },
  { id: 'pr9', nameEn: 'Zinc + Vitamin C', nameAr: 'زنك + فيتامين C', doseEn: '15mg + 500mg - 60 tabs', doseAr: '15 ملغ + 500 ملغ - 60 قرص', category: 'supplements', priceUSD: 10.4, image: 'https://images.pexels.com/photos/13779115/pexels-photo-13779115.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: false },
  { id: 'pr10', nameEn: 'Valerian Root Extract', nameAr: 'خلاصة جذر الناردين', doseEn: '500mg - 45 capsules', doseAr: '500 ملغ - 45 كبسولة', category: 'sleep', priceUSD: 13.6, image: 'https://images.pexels.com/photos/14027300/pexels-photo-14027300.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: false, popular: false },
  { id: 'pr11', nameEn: 'Multivitamin Complete', nameAr: 'ملتي فيتامين الشامل', doseEn: 'Daily - 90 tablets', doseAr: 'يومي - 90 قرص', category: 'supplements', priceUSD: 18.4, image: 'https://images.pexels.com/photos/14029290/pexels-photo-14029290.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: true },
  { id: 'pr12', nameEn: 'Aspirin 300mg', nameAr: 'أسبرين 300 ملغ', doseEn: '300mg - 20 tablets', doseAr: '300 ملغ - 20 قرص', category: 'painkillers', priceUSD: 2.4, image: 'https://images.pexels.com/photos/13779110/pexels-photo-13779110.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', inStock: true, popular: false },
];

const CATEGORY_CONFIG: { key: ProductCategory | 'all'; icon: LucideIcon }[] = [
  { key: 'all', icon: Pill },
  { key: 'sleep', icon: Moon },
  { key: 'supplements', icon: FlaskConical },
  { key: 'vitamins', icon: Apple },
  { key: 'painkillers', icon: Activity },
];

interface CartItem {
  product: Product;
  qty: number;
}

function renderStars(rating: number): React.ReactNode {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
      ))}
    </div>
  );
}

export function PharmacyStorePage({ pharmacyId, onNavigate }: { pharmacyId: string; onNavigate: (view: string) => void }) {
  const { t, formatPrice, direction } = useApp();
  const ArrowBack = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const pharmacy = PHARMACIES[pharmacyId] || PHARMACIES['p1'];
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [orderState, setOrderState] = useState<'idle' | 'placing' | 'success' | 'error'>('idle');

  const popularProducts = useMemo(() => PRODUCTS.filter((p) => p.popular), []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return popularProducts;
    return popularProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory, popularProducts]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalUSD = cart.reduce((sum, item) => sum + item.product.priceUSD * item.qty, 0);
  const deliveryFeeUSD = cartTotalUSD > 0 ? 2.67 : 0;
  const grandTotalUSD = cartTotalUSD + deliveryFeeUSD;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((i) => {
      if (i.product.id !== productId) return i;
      const newQty = i.qty + delta;
      return newQty <= 0 ? null as unknown as CartItem : { ...i, qty: newQty };
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const placeOrder = () => {
    if (!address.trim()) return;
    setOrderState('placing');
    setTimeout(() => {
      setOrderState('success');
      setCart([]);
      setCartOpen(false);
    }, 1800);
  };

  if (orderState === 'success') {
    return (
      <div className="bg-neutral-50 min-h-screen flex items-center justify-center py-12">
        <div className="max-w-lg w-full mx-4 bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-primary-100 ring-4 ring-primary-50">
            <CheckCircle2 className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-neutral-900">{t.pharmacyStore.orderSuccess}</h2>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{t.pharmacyStore.orderSuccessDesc}</p>

          <div className="mt-6 rounded-xl bg-neutral-50 border border-neutral-200 p-5 text-start space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 flex-shrink-0">
                <Bike className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">{t.pharmacyStore.agentAssigned}</p>
                <p className="text-xs text-neutral-500">{t.pharmacyStore.agentAssignedDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
              <div className="rounded-lg bg-neutral-100 px-3 py-2">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">{t.pharmacyStore.agentFee}</p>
                <p className="text-sm font-bold text-neutral-700 mt-0.5">{formatPrice(deliveryFeeUSD)}</p>
              </div>
              <div className="rounded-lg bg-neutral-100 px-3 py-2">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">{t.pharmacyStore.platformFee}</p>
                <p className="text-sm font-bold text-neutral-700 mt-0.5">{formatPrice(cartTotalUSD * 0.05)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700">{t.pharmacyStore.latePenalty}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{t.pharmacyStore.latePenaltyDesc}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => { setOrderState('idle'); onNavigate('tracking'); }}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
            >
              <Navigation className="h-4 w-4" />
              {t.tracking.title}
            </button>
            <button
              onClick={() => { setOrderState('idle'); onNavigate('facilities'); }}
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50"
            >
              {t.pharmacyStore.backToFacilities}
            </button>
            <button
              onClick={() => setOrderState('idle')}
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50"
            >
              {t.pharmacyStore.continueShopping}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Pharmacy header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-8 lg:py-10">
        <div className="container-x">
          <button
            onClick={() => onNavigate('facilities')}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-100 hover:text-white transition-colors mb-5"
          >
            <ArrowBack className="h-4 w-4" />
            {t.pharmacyStore.backToFacilities}
          </button>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
            <div className="flex h-20 w-20 lg:h-24 lg:w-24 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/30 shadow-lg">
              <img src={pharmacy.image} alt={pharmacy.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold">{pharmacy.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {renderStars(pharmacy.rating)}
                  <span className="text-sm font-bold text-white">{pharmacy.rating.toFixed(1)}</span>
                  <span className="text-xs text-primary-200">({pharmacy.ratingCount} {t.facilities.ratingsCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-primary-100">
                  <MapPin className="h-4 w-4" />
                  <span>{pharmacy.city} - {pharmacy.district}</span>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-sm font-semibold">
                <Clock className="h-4 w-4 text-green-300" />
                <span>{t.pharmacyStore.deliveryTime}: {t.pharmacyStore.deliveryTimeValue}</span>
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('most-ordered');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-white text-primary-700 px-6 py-3 text-sm font-bold shadow-lg transition-all hover:bg-primary-50 hover:-translate-y-0.5"
            >
              <Pill className="h-5 w-5" />
              {t.pharmacyStore.browseProducts}
            </button>
          </div>
        </div>
      </div>

      <div className="container-x py-6 lg:py-8">
        {/* Most ordered products section */}
        <div id="most-ordered">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-neutral-900">{t.pharmacyStore.mostOrdered}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t.pharmacyStore.mostOrderedSubtitle}</p>
            </div>
            {/* Floating cart button */}
            {cartCount > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
              >
                <ShoppingCart className="h-4 w-4" />
                {t.pharmacyStore.cart} ({cartCount})
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{formatPrice(cartTotalUSD)}</span>
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-3 mb-5 -mx-1 px-1">
            {CATEGORY_CONFIG.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-200 hover:text-primary-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.pharmacyStore[`cat${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}` as keyof typeof t.pharmacyStore]}
                </button>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((i) => i.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200"
                >
                  {/* Product image */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-50">
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category badge */}
                    <span className="absolute top-2 start-2 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-neutral-600 shadow-sm">
                      {t.pharmacyStore[`cat${product.category.charAt(0).toUpperCase() + product.category.slice(1)}` as keyof typeof t.pharmacyStore]}
                    </span>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-neutral-900/30 flex items-center justify-center">
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          {t.pharmacyStore.outOfStock}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-3">
                    <p className="text-sm font-bold text-neutral-900 leading-tight">{product.nameEn}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{product.nameAr}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{product.doseEn}</p>
                    <p className="text-[11px] text-neutral-400">{product.doseAr}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-primary-700">{formatPrice(product.priceUSD)}</span>

                      {product.inStock ? (
                        cartItem ? (
                          <div className="flex items-center gap-1.5 rounded-lg bg-primary-50 border border-primary-200 px-1.5 py-1">
                            <button
                              onClick={() => updateQty(product.id, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-primary-700 shadow-sm transition-colors hover:bg-primary-100"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-bold text-primary-700 min-w-[1rem] text-center">{cartItem.qty}</span>
                            <button
                              onClick={() => updateQty(product.id, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-primary-700 shadow-sm transition-colors hover:bg-primary-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md active:scale-95"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {t.pharmacyStore.addToCart}
                          </button>
                        )
                      ) : (
                        <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">
                          {t.pharmacyStore.outOfStock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-neutral-200">
              <Pill className="h-10 w-10 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-400">{t.facilities.noResults}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setCartOpen(false)} />
          <div className="absolute end-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-down overflow-y-auto scrollbar-thin flex flex-col">
            {/* Cart header */}
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
                <h3 className="font-bold text-neutral-900">{t.pharmacyStore.cart}</h3>
                {cartCount > 0 && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">{cartCount}</span>}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <ShoppingCart className="h-12 w-12 text-neutral-200 mb-4" />
                <p className="text-sm font-bold text-neutral-700">{t.pharmacyStore.cartEmpty}</p>
                <p className="mt-1 text-xs text-neutral-400">{t.pharmacyStore.cartEmptyDesc}</p>
              </div>
            ) : (
              <>
                {/* Cart items */}
                <div className="flex-1 p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                      <img src={item.product.image} alt={item.product.nameEn} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">{item.product.nameEn}</p>
                        <p className="text-xs text-neutral-500 truncate">{item.product.nameAr}</p>
                        <p className="text-sm font-bold text-primary-700 mt-1">{formatPrice(item.product.priceUSD * item.qty)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-neutral-50 border border-neutral-200 px-1.5 py-1">
                          <button onClick={() => updateQty(item.product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-neutral-700 shadow-sm hover:bg-neutral-100">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-bold text-neutral-700 min-w-[1rem] text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-neutral-700 shadow-sm hover:bg-neutral-100">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.pharmacyStore.removeItem}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={clearCart}
                    className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    {t.pharmacyStore.clearCart}
                  </button>
                </div>

                {/* Checkout section */}
                <div className="border-t border-neutral-100 p-4 space-y-3 sticky bottom-0 bg-white">
                  {/* Address input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.pharmacyStore.deliveryAddress}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.pharmacyStore.deliveryAddressPlaceholder}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{t.pharmacyStore.orderTotal}</span>
                      <span className="font-medium text-neutral-900">{formatPrice(cartTotalUSD)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{t.pharmacyStore.deliveryFee}</span>
                      <span className="font-medium text-neutral-900">{deliveryFeeUSD > 0 ? formatPrice(deliveryFeeUSD) : t.pharmacyStore.free}</span>
                    </div>
                    <div className="flex items-center justify-between text-base pt-2 border-t border-neutral-100">
                      <span className="font-bold text-neutral-900">{t.pharmacyStore.orderTotal}</span>
                      <span className="font-bold text-primary-700">{formatPrice(grandTotalUSD)}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={!address.trim() || orderState === 'placing'}
                    className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {orderState === 'placing' ? t.pharmacyStore.placingOrder : t.pharmacyStore.placeOrder}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
