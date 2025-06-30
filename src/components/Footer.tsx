import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">MentorMate</span>
            </Link>
            <p className="font-body text-neutral-400 mb-6 leading-relaxed">
              AI-powered daily accountability that transforms habits through personalized mentorship.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Product</h3>
            <ul className="font-body space-y-3">
              <li><a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/register" className="text-neutral-400 hover:text-white transition-colors">Free Trial</Link></li>
              <li><Link to="/login" className="text-neutral-400 hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Company</h3>
            <ul className="font-body space-y-3">
              <li><Link to="/about" className="text-neutral-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Legal</h3>
            <ul className="font-body space-y-3">
              <li><Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex justify-center">
          <p className="font-body text-neutral-400 text-sm">
            © {new Date().getFullYear()} MentorMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};