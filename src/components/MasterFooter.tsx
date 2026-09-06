import React from 'react';
import { ArrowUp, Sparkles, BookOpen, Layers, GraduationCap, FolderOpen, Calendar, Tag, Mail } from 'lucide-react';
import { MainNavTab } from './MasterHeader';

interface MasterFooterProps {
  onSelectTab?: (tab: MainNavTab) => void;
  onScrollToTop?: () => void;
}

export const MasterFooter: React.FC<MasterFooterProps> = ({
  onSelectTab,
  onScrollToTop,
}) => {
  const handleScrollTop = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNav = (tab: MainNavTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t-2 border-stone-800 mt-auto shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Massive Brand Statement */}
        <div className="border-b border-stone-800 pb-10 mb-10">
          <div className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent uppercase leading-none">
            PROUDLY <span className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">AFRIKAN</span>
          </div>
          <div className="font-mono text-xs sm:text-sm bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent tracking-widest uppercase mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D92B8A] inline-block animate-pulse"></span>
            <span>EMPOWERING CONTINENTAL INTELLECT & GLOBAL MASTERY</span>
          </div>
        </div>

        {/* Links and Suite Manifesto Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          {/* Col 1: About Platform */}
          <div className="md:col-span-6 space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">
              ABOUT THIS PLATFORM
            </h4>
            <p className="text-sm sm:text-base bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent max-w-lg leading-relaxed font-sans font-normal">
              Proudly Afrikan School is an African learning platform where you can study, test, create, and master anything. 
              Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, quizzes, and interactive study sets in seconds.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">
              <Mail className="w-4 h-4 text-[#D92B8A]" />
              <span>Institutional & billing inquiries: </span>
              <a href="mailto:support@proudlyafrikan.org" className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:underline font-bold">
                support@proudlyafrikan.org
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 font-mono text-xs font-bold bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">
              <li>
                <button
                  onClick={() => handleNav('STUDY')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ STUDY COMPANION</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('QUIZ')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ QUIZ GENERATOR</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('BUILD')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ RESOURCE BUILDER</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('MY SETS')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ MY SAVED SETS</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('PLANNER')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ STUDY PLANNER</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('PRICING')}
                  className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ PRICING PLANS</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Back to top & Version */}
          <div className="md:col-span-3 space-y-4 flex flex-col items-start md:items-end">
            <button
              onClick={handleScrollTop}
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-stone-800"
            >
              <span className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent">BACK TO TOP</span>
              <ArrowUp className="w-4 h-4 text-[#D92B8A]" />
            </button>
            <div className="font-mono text-[11px] bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent space-y-1 text-left md:text-right">
              <div>VERSION 1.0 • 2026</div>
              <div className="font-semibold">CAPS & IEB ALIGNED</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent gap-4">
          <div>
            © {new Date().getFullYear()} PROUDLY AFRIKAN EDUCATION. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2">
            <span>DESIGNED WITH EDITORIAL RIGOR</span>
            <span>•</span>
            <a
              href="https://sifisos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] bg-clip-text text-transparent hover:underline font-bold transition-colors"
            >
              POWERED BY SIFISOS.COM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
