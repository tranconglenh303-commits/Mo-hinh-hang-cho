import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LinearQueueFlowSimulation } from './components/LinearQueueFlowSimulation';
import { QueueSystemArchitecture } from './components/QueueSystemArchitecture';
import { FormulaCalculator } from './components/FormulaCalculator';
import { EconomicOptimization } from './components/EconomicOptimization';
import { RealWorldApplications } from './components/RealWorldApplications';
import { KnowledgeQuiz } from './components/KnowledgeQuiz';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Hero />

        {/* Section 1: Real-time Visual Interactive Simulator */}
        <section id="simulator" className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-wider">MÔ PHỎNG ĐỘNG HỆ THỐNG</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-0.5">
                Mô Phỏng Trực Quan Dòng Chảy Hàng Chờ
              </h2>
            </div>
          </div>

          <LinearQueueFlowSimulation />
        </section>

        {/* Section 2: Architecture & Principles of Queueing Models */}
        <QueueSystemArchitecture />

        {/* Section 3: Mathematical Formulas Stage-by-Stage Breakdown */}
        <FormulaCalculator />

        {/* Section 4: Economic Cost Optimization */}
        <EconomicOptimization />

        {/* Section 5: Real-World Applications & Case Studies */}
        <RealWorldApplications />

        {/* Section 6: Knowledge Verification Quiz */}
        <KnowledgeQuiz />
      </main>

      <Footer />
    </div>
  );
}
