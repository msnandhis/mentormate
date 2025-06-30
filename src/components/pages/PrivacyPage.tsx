import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  const lastUpdated = 'June 1, 2024';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-background to-accent">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="font-body text-neutral-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
            </p>
            <p className="font-body text-sm text-neutral-500 mt-4">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Policy Content */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-border">
            <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-neutral-700 max-w-none">
              <h2>1. Introduction</h2>
              <p>
                MentorMate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p>
                By accessing or using our service, you consent to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
              
              <h2>2. Information We Collect</h2>
              <h3>2.1 Personal Information</h3>
              <p>We may collect personally identifiable information, such as:</p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number (optional)</li>
                <li>Account login credentials</li>
                <li>Personal goals and habit tracking information</li>
                <li>Check-in responses and reflections</li>
                <li>Communication preferences</li>
              </ul>
              
              <h3>2.2 Usage Data</h3>
              <p>
                We may also collect information about how our service is accessed and used. This usage data may include:
              </p>
              <ul>
                <li>Your device's Internet Protocol address (IP address)</li>
                <li>Browser type and version</li>
                <li>Pages of our service that you visit</li>
                <li>Time and date of your visit</li>
                <li>Time spent on those pages</li>
                <li>Features used on our platform</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including to:</p>
              <ul>
                <li>Provide, operate, and maintain our services</li>
                <li>Personalize your experience with our AI mentors</li>
                <li>Generate insights about your habits and progress</li>
                <li>Improve our services and user experience</li>
                <li>Communicate with you about updates, support, or promotional offers</li>
                <li>Prevent, detect, and address technical or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2>4. Data Protection and Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security. Any information you transmit to us is done at your own risk.
              </p>
              
              <h2>5. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
              </p>
              
              <h2>6. Third-Party Services</h2>
              <p>
                Our service may contain links to third-party websites and services that are not owned or controlled by MentorMate. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              
              <h2>7. Children's Privacy</h2>
              <p>
                Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
              </p>
              
              <h2>8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@mentormate.com</li>
                <li>Address: 123 Innovation Drive, San Francisco, CA 94107, United States</li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100 text-center">
            <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
              Questions About Your Data?
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              We're committed to transparency and protecting your privacy. If you have any questions about how we handle your data, please reach out to our team.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};