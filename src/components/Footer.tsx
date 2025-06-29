import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Twitter, Instagram, Linkedin, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">MentorMate</span>
            </Link>
            <p className="font-body text-neutral-400 mb-6 leading-relaxed">
              AI-powered daily accountability that transforms habits through personalized mentorship.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@mentormate.com" className="text-neutral-400 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Product</h3>
            <ul className="font-body space-y-3">
              <li><a href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#mentors" className="text-neutral-400 hover:text-white transition-colors">AI Mentors</a></li>
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
              <li><Link to="/careers" className="text-neutral-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-neutral-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/partners" className="text-neutral-400 hover:text-white transition-colors">Partners</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Support</h3>
            <ul className="font-body space-y-3">
              <li><Link to="/help" className="text-neutral-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/status" className="text-neutral-400 hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="font-body text-neutral-400 text-sm">
            © {new Date().getFullYear()} MentorMate. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-neutral-400 text-sm mt-4 md:mt-0">
            <span className="font-body">Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-body">for habit builders everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};