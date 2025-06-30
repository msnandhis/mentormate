import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  const lastUpdated = 'June 1, 2024';
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-background to-accent">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="font-body text-neutral-600 max-w-2xl mx-auto">
              Please read these terms carefully before using our platform and services.
            </p>
            <p className="font-body text-sm text-neutral-500 mt-4">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Policy Content */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-border">
            <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-neutral-700 max-w-none">
              <h2>1. Agreement to Terms</h2>
              <p>
                These Terms of Service govern your access to and use of MentorMate's website, mobile application, and services.
              </p>
              <p>
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
              
              <h2>2. Account Registration</h2>
              <p>
                To use certain features of our service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
              
              <h2>3. Subscription and Billing</h2>
              <h3>3.1 Free Trial</h3>
              <p>
                We may offer a free trial period for our services. By providing your payment information during the registration process, you agree that we may automatically begin charging you for the subscription service once the free trial period ends, unless you cancel before the end of the trial period.
              </p>
              
              <h3>3.2 Recurring Billing</h3>
              <p>
                When you purchase a subscription, you authorize us to charge the payment method on file on a recurring basis until you cancel. You can cancel your subscription at any time through your account settings or by contacting our customer support.
              </p>
              
              <h2>4. User Content</h2>
              <p>
                You retain ownership of any content you submit, post, or display on or through our service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of providing and improving our services.
              </p>
              <p>
                You represent and warrant that:
              </p>
              <ul>
                <li>You own or have the right to use and share the User Content</li>
                <li>The User Content does not violate the privacy rights, publicity rights, copyright, contractual rights, or any other rights of any person</li>
              </ul>
              
              <h2>5. Acceptable Use</h2>
              <p>
                You agree not to use our service for any purpose that is unlawful or prohibited by these Terms. You may not use the service in any manner that could damage, disable, overburden, or impair our servers or networks, or interfere with any other party's use and enjoyment of the service.
              </p>
              <p>
                Specifically, you agree not to:
              </p>
              <ul>
                <li>Use our service for any illegal purpose or in violation of any local, state, national, or international law</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Upload or transmit viruses or any other type of malicious code</li>
                <li>Attempt to gain unauthorized access to our service, other accounts, or computer systems</li>
                <li>Collect or track the personal information of others</li>
                <li>Spam, phish, or engage in any other unwanted solicitation</li>
              </ul>
              
              <h2>6. Intellectual Property</h2>
              <p>
                Our service and its original content, features, and functionality are and will remain the exclusive property of MentorMate and its licensors. The service is protected by copyright, trademark, and other intellectual property laws.
              </p>
              
              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service or contact our support team.
              </p>
              
              <h2>8. Limitation of Liability</h2>
              <p>
                In no event shall MentorMate, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the service</li>
                <li>Any conduct or content of any third party on the service</li>
                <li>Any content obtained from the service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              
              <h2>9. Disclaimer</h2>
              <p>
                Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied.
              </p>
              
              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              
              <h2>11. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of California, United States, without regard to its conflict of law provisions.
              </p>
              
              <h2>12. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul>
                <li>Email: legal@mentormate.com</li>
                <li>Address: 123 Innovation Drive, San Francisco, CA 94107, United States</li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-1">
                Need Clarification?
              </h3>
              <p className="font-body text-neutral-600">
                We're here to answer any questions about our terms and conditions.
              </p>
            </div>
            <Link 
              to="/contact" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
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