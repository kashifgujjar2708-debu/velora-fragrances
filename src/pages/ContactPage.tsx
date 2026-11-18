import React, { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { isValidEmail } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

export const ContactPage: React.FC = () => {
  const { settings, submitContactMessage } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Fragrance Consultation');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !isValidEmail(email) || !message.trim()) {
      setError('Please enter your name, a valid email, and your message.');
      return;
    }
    const res = await submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
    });
    if (res.ok) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Client Concierge (Demo)"
        title="Contact Us"
        description="Reach our demonstration fragrance desk in Lahore for scent consultations, corporate gifting inquiries, or portfolio feedback."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#252525]/10 bg-[#FAF8F3] p-6 space-y-5">
              <h2 className="font-display text-2xl font-medium text-[#252525]">
                Demo Contact Directory
              </h2>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 text-[#8E4D57] shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#252525]">Demo WhatsApp / Phone</p>
                  <p className="text-[#66635D] tabular-nums">{settings.contactPhone}</p>
                  <p className="text-[11px] text-[#66635D] mt-0.5">
                    Live WhatsApp Business API is disabled in portfolio mode.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 text-[#8E4D57] shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#252525]">Demo Email</p>
                  <p className="text-[#66635D]">{settings.contactEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-[#8E4D57] shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#252525]">Demo Location</p>
                  <p className="text-[#66635D]">{settings.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Clock className="h-4 w-4 text-[#8E4D57] shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#252525]">Customer Support Hours</p>
                  <p className="text-[#66635D]">{settings.supportHours}</p>
                </div>
              </div>

              <div className="border-t border-[#252525]/10 pt-4">
                <p className="text-xs uppercase tracking-wider text-[#66635D] mb-2">
                  Placeholder Social Links
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#252525]">
                  <span>Instagram</span>
                  <span>·</span>
                  <span>Facebook</span>
                  <span>·</span>
                  <span>TikTok</span>
                  <span>·</span>
                  <span>Pinterest</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="border border-[#252525]/10 bg-white p-6 sm:p-8 space-y-5"
            >
              <h2 className="font-display text-2xl font-medium text-[#252525]">
                Send an Inquiry (Demo)
              </h2>

              {submitted && (
                <div className="border border-[#D4AF6A] bg-[#FAF8F3] px-4 py-3 text-xs text-[#252525]">
                  Your message has been logged in local demonstration storage. No external email or
                  WhatsApp message was dispatched.
                </div>
              )}

              {error && (
                <div className="border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs text-[#66635D] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs text-[#66635D] mb-1">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs text-[#66635D] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs text-[#66635D] mb-1">
                    Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-[#252525]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  >
                    <option value="Fragrance Consultation">Fragrance Consultation</option>
                    <option value="Wedding & Corporate Gift Coffrets">
                      Wedding & Corporate Gift Coffrets
                    </option>
                    <option value="Demo Order Inquiry">Demo Order Inquiry</option>
                    <option value="Portfolio Feedback">Portfolio Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs text-[#66635D] mb-1">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#252525] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#8E4D57] transition-colors"
              >
                Send Demo Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
