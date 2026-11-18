import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatDateShort, formatPkr } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

export const AccountPage: React.FC = () => {
  const {
    currentCustomer,
    demoCustomerProfiles,
    orders,
    loginCustomer,
    loginDemoCustomer,
    registerCustomer,
    logoutCustomer,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('ayesha.demo@example.pk');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Lahore');
  const [regAddress, setRegAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await loginCustomer(loginEmail, loginPassword);
    if (!res.ok) setAuthError(res.message);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regEmail.trim() || regPassword.length < 6) {
      setAuthError('Full name, valid email, and password (6+ characters) are required.');
      return;
    }
    const res = await registerCustomer({
      fullName: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim() || '03000000000',
      city: regCity,
      address: regAddress.trim() || 'Lahore, Pakistan',
    });
    if (!res.ok) setAuthError(res.message);
  };

  const customerOrders = currentCustomer
    ? orders.filter(
        (o) =>
          o.customerId === currentCustomer.id ||
          o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase()
      )
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="Client Account"
        title={currentCustomer ? `Welcome, ${currentCustomer.fullName}` : 'My Account'}
        description="Access your customer profile, saved delivery details, and demo order history. Strictly isolated from Staff Admin access."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'My Account' }]}
      />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {currentCustomer ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 border border-[#252525]/10 bg-[#FAF8F3] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-[#252525] text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-xl font-medium text-[#252525]">
                    {currentCustomer.fullName}
                  </p>
                  <p className="text-xs text-[#66635D]">Customer Role Account</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#252525]/10 pt-4 text-xs text-[#66635D]">
                <p>
                  <strong className="text-[#252525]">Email:</strong> {currentCustomer.email}
                </p>
                <p>
                  <strong className="text-[#252525]">Phone:</strong> {currentCustomer.phone}
                </p>
                <p>
                  <strong className="text-[#252525]">City:</strong> {currentCustomer.city}
                </p>
                <p>
                  <strong className="text-[#252525]">Address:</strong> {currentCustomer.address}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void logoutCustomer()}
                className="w-full inline-flex items-center justify-center gap-2 border border-[#252525]/25 bg-white py-2.5 text-xs font-medium uppercase tracking-wider text-[#252525] hover:border-[#252525]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <h2 className="font-display text-2xl font-medium text-[#252525]">
                Demo Order History ({customerOrders.length})
              </h2>

              {customerOrders.length === 0 ? (
                <div className="border border-[#252525]/10 bg-[#FAF8F3] p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-[#D4AF6A] mb-2" />
                  <p className="text-sm text-[#66635D]">
                    No demo orders placed under this profile yet.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block bg-[#252525] px-5 py-2.5 text-xs uppercase tracking-wider text-white"
                  >
                    Explore Fragrances
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#252525]/10 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <p className="font-mono text-xs text-[#8E4D57] font-medium">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#252525]">
                          {order.items.map((i) => `${i.name} (${i.sizeMl})`).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-[#66635D]">
                          {formatDateShort(order.createdAt)} · {order.orderStatus} ·{' '}
                          {order.paymentMethod}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatPkr(order.totalPkr)}
                        </span>
                        <Link
                          to={`/track-order?order=${order.orderNumber}`}
                          className="text-xs font-medium text-[#8E4D57] hover:underline"
                        >
                          Track Order →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg border border-[#252525]/10 bg-white p-6 sm:p-8">
            <div className="grid grid-cols-2 border-b border-[#252525]/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError('');
                }}
                className={`pb-3 text-xs font-semibold uppercase tracking-[0.14em] border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-[#D4AF6A] text-[#252525]'
                    : 'border-transparent text-[#66635D]'
                }`}
              >
                Customer Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthError('');
                }}
                className={`pb-3 text-xs font-semibold uppercase tracking-[0.14em] border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-[#D4AF6A] text-[#252525]'
                    : 'border-transparent text-[#66635D]'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="account-login-email" className="block text-xs text-[#66635D] mb-1">
                    Customer Email
                  </label>
                  <input
                    id="account-login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="account-login-password" className="block text-xs text-[#66635D] mb-1">
                    Password
                  </label>
                  <input
                    id="account-login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>

                {authError && (
                  <p role="alert" className="text-xs text-rose-700">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#252525] py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
                >
                  Sign In
                </button>

                <div className="border-t border-[#252525]/10 pt-4">
                  <p className="text-xs text-[#66635D] mb-2">
                    Quick Sample Customer Profiles (Customer Role Only):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {demoCustomerProfiles.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => void loginDemoCustomer(c.email)}
                        className="border border-[#252525]/15 bg-[#FAF8F3] px-3 py-2 text-xs hover:border-[#B76E79]"
                      >
                        {c.fullName.replace(' (Sample)', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="reg-full-name" className="block text-xs text-[#66635D] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="reg-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-xs text-[#66635D] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-xs text-[#66635D] mb-1">
                    Password (min 6 characters) *
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-phone" className="block text-xs text-[#66635D] mb-1">
                      Phone
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      autoComplete="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-city" className="block text-xs text-[#66635D] mb-1">
                      City
                    </label>
                    <input
                      id="reg-city"
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="City"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-address" className="block text-xs text-[#66635D] mb-1">
                    Delivery Address
                  </label>
                  <input
                    id="reg-address"
                    type="text"
                    autoComplete="street-address"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Delivery Address"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                {authError && (
                  <p role="alert" className="text-xs text-rose-700">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#252525] py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
                >
                  Create Customer Account
                </button>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
