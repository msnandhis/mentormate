import React from 'react';
import { MessageCircle, Twitter, Instagram, Linkedin, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">MentorMate</span>
            </div>
            <p className="font-body text-neutral-400 mb-6 leading-relaxed">
              AI-powered daily accountability that transforms habits through personalized mentorship.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
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
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Company</h3>
            <ul className="font-body space-y-3">
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Support</h3>
            <ul className="font-body space-y-3">
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="font-body text-neutral-400 text-sm">
            © 2024 MentorMate. All rights reserved.
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