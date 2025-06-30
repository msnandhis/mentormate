import React, { useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Mail, Phone, MapPin, MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-background to-accent">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="font-body text-lg text-neutral-600">
              Have questions or feedback? We'd love to hear from you. Our team is here to help with any inquiries about our AI mentorship platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Cards */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">Email Us</h3>
                <p className="font-body text-neutral-600 mb-3">
                  For general inquiries and support:
                </p>
                <a 
                  href="mailto:support@mentormate.com" 
                  className="font-body font-medium text-primary hover:text-primary-600 transition-colors"
                >
                  support@mentormate.com
                </a>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">Call Us</h3>
                <p className="font-body text-neutral-600 mb-3">
                  Mon-Fri, 9am-5pm (PST):
                </p>
                <a 
                  href="tel:+18005551234" 
                  className="font-body font-medium text-primary hover:text-primary-600 transition-colors"
                >
                  +1 (800) 555-1234
                </a>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">Visit Us</h3>
                <p className="font-body text-neutral-600 mb-3">
                  Our headquarters:
                </p>
                <address className="font-body text-neutral-600 not-italic">
                  123 Innovation Drive<br />
                  San Francisco, CA 94107<br />
                  United States
                </address>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-8 border border-border shadow-md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-heading font-semibold text-2xl text-foreground">Send Us a Message</h2>
                </div>
                
                {submitted ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                      Message Received!
                    </h3>
                    <p className="font-body text-neutral-600 mb-6">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="John Smith"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Product Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Tell us how we can help..."
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};