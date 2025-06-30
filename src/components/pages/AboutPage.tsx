import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Users, Clock, Target, Award, MessageCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-background to-accent">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              About <span className="text-primary">MentorMate</span>
            </h1>
            <p className="font-body text-xl text-neutral-600 leading-relaxed">
              We're on a mission to transform how people build sustainable habits through 
              personalized AI mentorship and data-driven accountability.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h2 className="font-heading font-bold text-3xl text-foreground mb-4">Our Story</h2>
                <div className="space-y-4">
                  <p className="font-body text-neutral-700 leading-relaxed">
                    MentorMate was born during an intense 48-hour hackathon in 2025 when our team identified a critical problem: most people know what they need to do to achieve their goals, but staying consistent is the real challenge.
                  </p>
                  <p className="font-body text-neutral-700 leading-relaxed">
                    We created a proof of concept that combined AI-powered video mentors with accountability tracking. The judges were impressed by our innovative approach to habit formation, and we won first place in the AI for Good category.
                  </p>
                  <p className="font-body text-neutral-700 leading-relaxed">
                    After the hackathon, we received overwhelming feedback from early testers who saw real results from using our prototype. We decided to turn our hackathon project into a full-fledged platform, refining our AI models and user experience.
                  </p>
                  <p className="font-body text-neutral-700 leading-relaxed">
                    Today, MentorMate helps thousands of people stick to their goals and build lasting habits across fitness, wellness, learning, and career development through personalized AI mentorship.
                  </p>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full transform translate-x-16 -translate-y-16" />
                  <div className="relative z-10">
                    <div className="mb-6">
                      <MessageCircle className="w-12 h-12 text-primary mb-2" />
                      <h3 className="font-heading font-bold text-2xl mb-2">Our Philosophy</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <p className="font-body text-neutral-200">Consistency over intensity - small daily actions lead to remarkable results</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <p className="font-body text-neutral-200">Personalization is key - one size never fits all in personal development</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <p className="font-body text-neutral-200">Data-driven insights create self-awareness and sustainable change</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">4</span>
                        </div>
                        <p className="font-body text-neutral-200">Human connection matters - even in AI interactions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <h2 className="font-heading font-bold text-3xl text-center text-foreground mb-12">Our Core Values</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3 text-foreground">Human-Centered</h3>
              <p className="font-body text-neutral-600">
                Technology should enhance human potential, not replace it. Our AI mentors are designed to bring out the best in you.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3 text-foreground">Goal-Oriented</h3>
              <p className="font-body text-neutral-600">
                We believe in meaningful progress toward clearly defined outcomes. Every feature is designed to move you closer to your goals.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3 text-foreground">Excellence</h3>
              <p className="font-body text-neutral-600">
                We hold ourselves to the highest standards in AI safety, user experience, and scientific validity of our approach.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3 text-foreground">Sustainability</h3>
              <p className="font-body text-neutral-600">
                True change happens over time. We're focused on helping you build habits that last a lifetime, not quick fixes.
              </p>
            </div>
          </div>
        </section>

        {/* Hackathon Journey */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <h2 className="font-heading font-bold text-3xl text-center text-foreground mb-12">Our Hackathon Journey</h2>
          
          <div className="bg-white rounded-xl p-8 border border-border shadow-xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl border border-primary-100">
                <h3 className="font-heading font-bold text-xl text-foreground mb-4">Inspiration</h3>
                <p className="font-body text-neutral-700">
                  We were inspired by the gap between intention and action in habit formation. Research shows that 92% of people fail to achieve their goals without proper accountability. We saw an opportunity to leverage AI to bridge this gap.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-heading font-bold text-xl text-foreground mb-4">Building Process</h3>
                <p className="font-body text-neutral-700">
                  During the hackathon, we focused on creating AI personas with distinct mentorship styles. We built a prototype with daily video check-ins and a basic analytics dashboard to demonstrate the concept of personalized accountability.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                <h3 className="font-heading font-bold text-xl text-foreground mb-4">Challenges</h3>
                <p className="font-body text-neutral-700">
                  Our biggest challenge was designing AI mentors that felt genuinely personal and adaptive. We also faced technical hurdles in real-time video generation and integrating behavioral science into our algorithm design.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-accent rounded-xl border border-primary-100">
              <h3 className="font-heading font-bold text-xl text-primary-800 text-center mb-4">What We Learned</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <p className="font-body text-neutral-700">
                  The hackathon taught us the importance of user-centered design in AI applications. We discovered that users respond better to mentors with distinct personalities and communication styles rather than generic AI assistance.
                </p>
                <p className="font-body text-neutral-700">
                  We also learned that data visualization and progress tracking are just as important as the AI interactions themselves. Users need to see their progress to stay motivated and engaged with the platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center shadow-xl">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Join Us on Our Mission</h2>
            <p className="font-body text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Be part of the AI-powered revolution in personal development and habit formation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-neutral-100 transition-colors font-body font-semibold"
              >
                Start Your Free Trial
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-primary-500 text-white border border-white/30 rounded-lg hover:bg-primary-500/80 transition-colors font-body font-semibold"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};