'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Globe, Rocket, BrainCircuit, Shield, TrendingUp, Zap, CheckCircle2, Star, Users, PieChart, BarChart, Award, Clock, LineChart } from 'lucide-react';
import Link from 'next/link';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

// Hero Section Component
const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 md:px-8 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-indigo-100/40 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto text-center relative z-10 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-full mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            AI-Powered Career Intelligence Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8"
        >
          Transform Your Career <br className="hidden md:block" />
          with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">AI Precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-600 mb-12 font-medium leading-relaxed"
        >
          Leverage cutting-edge AI to analyze your skills, discover opportunities, and accelerate your professional growth with personalized career strategies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
        >
          <Link href="/analyzer" className="w-full sm:w-auto">
            <button className="group w-full sm:px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
              Start Free Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="w-full sm:px-12 py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-lg">
              View Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Enhanced Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-3 border-white bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden shadow-md">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">
                Join <span className="text-blue-600">50,000+</span> professionals
              </p>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-slate-500 ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Feature Card Component
const FeatureCard = ({ icon: Icon, title, desc, delay, colorClass, accentColor }: {
  icon: React.ElementType,
  title: string,
  desc: string,
  delay: number,
  colorClass: string,
  accentColor: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="h-full group"
  >
    <CleanCard padding="p-10" className="h-full bg-white hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 border-slate-100 flex flex-col relative overflow-hidden">
      {/* Accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", accentColor)} />

      <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shrink-0 group-hover:scale-110 transition-transform duration-300", colorClass)}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tight leading-tight">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-medium text-base mb-10 flex-grow">{desc}</p>
      <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-4 transition-all mt-auto cursor-pointer">
        Learn more <ArrowRight className="w-4 h-4" />
      </div>
    </CleanCard>
  </motion.div>
);

// Features Section
const Features = () => {
  return (
    <section className="py-32 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full mb-6"
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Core Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Intelligence <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Redefined</span>
          </h2>
          <p className="text-slate-600 font-medium max-w-3xl mx-auto text-xl leading-relaxed">
            Our proprietary AI models analyze millions of data points to deliver actionable insights that accelerate your professional journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={BrainCircuit}
            title="Strategic Skill Mapping"
            desc="Identify high-impact skills that bridge expertise gaps, uncovering hidden career leverage through advanced pattern recognition and market analysis."
            delay={0.1}
            colorClass="bg-blue-50 text-blue-600"
            accentColor="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <FeatureCard
            icon={BarChart}
            title="Adaptive Roadmaps"
            desc="Dynamic career trajectories that evolve with market shifts, keeping you at the forefront of industry demand with real-time updates."
            delay={0.2}
            colorClass="bg-indigo-50 text-indigo-600"
            accentColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
          />
          <FeatureCard
            icon={Globe}
            title="Global Intelligence"
            desc="Real-time access to global salary trends, industry growth metrics, and competitive hiring landscape analysis across 150+ countries."
            delay={0.3}
            colorClass="bg-violet-50 text-violet-600"
            accentColor="bg-gradient-to-r from-violet-500 to-violet-600"
          />
        </div>
      </div>
    </section>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <main className="relative bg-white font-sans">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <section className="py-32 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full mb-6"
            >
              <Rocket className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Simple Process</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              How It <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-slate-600 font-medium max-w-3xl mx-auto text-xl leading-relaxed">
              Your journey to career excellence in three strategic steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Analyze Your Profile',
                desc: 'Upload your resume and let our advanced AI analyze your skills, experience, and career trajectory with precision.',
                color: 'bg-blue-50 text-blue-600',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                step: '02',
                icon: BrainCircuit,
                title: 'Get Personalized Insights',
                desc: 'Receive tailored recommendations, comprehensive skill gap analysis, and strategic career roadmaps designed for you.',
                color: 'bg-indigo-50 text-indigo-600',
                gradient: 'from-indigo-500 to-indigo-600'
              },
              {
                step: '03',
                icon: Rocket,
                title: 'Accelerate Your Growth',
                desc: 'Take action with guided learning paths, expert interview preparation, and intelligent job matching tools.',
                color: 'bg-violet-50 text-violet-600',
                gradient: 'from-violet-500 to-violet-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="text-[140px] font-black text-slate-50 absolute -top-12 -left-6 -z-10 leading-none select-none">
                  {item.step}
                </div>
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300", item.color)}>
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-base">{item.desc}</p>
                <div className={cn("h-1 w-16 rounded-full mt-6 bg-gradient-to-r", item.gradient)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '50K+', label: 'Active Users', icon: Users },
              { value: '95%', label: 'Success Rate', icon: Award },
              { value: '1M+', label: 'Resumes Analyzed', icon: LineChart },
              { value: '24/7', label: 'AI Support', icon: Clock }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-32 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Professional Integrity
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Engineered for the <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Career Architect</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              CarreAdviser isn't just a tool—it's your strategic advantage. We provide the architecture for absolute professional mastery in an era of rapid disruption.
            </p>
            <div className="space-y-5">
              {[
                { title: 'Privacy First', desc: 'Enterprise-grade encryption for all career data with SOC 2 compliance.', icon: Shield },
                { title: 'Neutral Intelligence', desc: 'Bias-free AI modeling powered by verified datasets and ethical algorithms.', icon: CheckCircle2 },
                { title: 'Real-time Updates', desc: 'Stay ahead with live market intelligence and emerging industry trends.', icon: TrendingUp }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-5 p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-slate-100 to-blue-50 rounded-[3rem] overflow-hidden relative group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="w-64 h-64 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
              </div>

              {/* Floating Cards Mockup */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 -right-8 w-64 p-7 bg-white rounded-3xl shadow-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Fit</div>
                </div>
                <div className="text-4xl font-black text-slate-900 mb-3">94.2%</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '94.2%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -left-8 w-72 p-7 bg-white rounded-3xl shadow-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Milestone</div>
                </div>
                <div className="text-base font-black text-slate-900 mb-4">Master Cloud Architecture</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase">Strategic Priority</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600" />)}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full mb-6"
            >
              <Star className="w-4 h-4 fill-blue-600" />
              <span className="text-xs font-bold uppercase tracking-widest">Testimonials</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Trusted by <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-slate-600 font-medium max-w-3xl mx-auto text-xl leading-relaxed">
              See how CarreAdviser has transformed careers across industries worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "CarreAdviser helped me identify skill gaps I didn't even know existed. Within 6 months, I landed my dream role at a Fortune 500 company with a 40% salary increase.",
                author: "Sarah Chen",
                role: "Senior Product Manager",
                company: "Tech Giant",
                rating: 5
              },
              {
                quote: "The AI-powered insights are incredibly accurate and actionable. It's like having a career coach, mentor, and industry analyst available 24/7 at your fingertips.",
                author: "Michael Rodriguez",
                role: "Software Engineer",
                company: "Startup Unicorn",
                rating: 5
              },
              {
                quote: "I've tried other career platforms, but nothing comes close to the depth, personalization, and real-world impact of CarreAdviser. Absolutely game-changing.",
                author: "Emily Watson",
                role: "Marketing Director",
                company: "Global Brand",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <CleanCard padding="p-8" className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-slate-200">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-8 flex-grow text-base italic font-medium">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{testimonial.author}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                      <div className="text-xs text-slate-400">{testimonial.company}</div>
                    </div>
                  </div>
                </CleanCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 md:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-16 md:p-24 text-center relative overflow-hidden text-white shadow-2xl"
        >
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Start Your Journey</span>
            </motion.div>
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-none">
              The Future of Work <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Starts Here</span>
            </h2>
            <p className="text-slate-300 text-xl md:text-2xl mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of professionals who are accelerating their careers with AI-powered insights. Your next breakthrough is one click away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <button className="group w-full sm:px-14 py-6 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-50 transition-all duration-300 shadow-2xl shadow-white/10 hover:scale-105 flex items-center justify-center gap-3">
                  Begin Your Trajectory
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/analyzer" className="w-full sm:w-auto">
                <button className="w-full sm:px-12 py-6 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-300">
                  Try Free Analysis
                </button>
              </Link>
            </div>
            <p className="text-slate-400 text-sm mt-8">
              No credit card required • Free forever plan available • Cancel anytime
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
