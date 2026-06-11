// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Terminal, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas border-t border-hairline pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="OpenCraft logo" className="w-6 h-6" />
              <span className="font-display font-normal text-lg text-ink tracking-sm">OpenCraft</span>
            </div>
            <p className="text-sm text-body max-w-sm">
              The contribution-first platform. Bridge the gap between developer learning and real-world employment by shipping verified open source PRs.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-body hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-xs font-semibold text-primary uppercase tracking-widest mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-body">
              <li><a href="#tasks" className="hover:text-ink hover:underline transition-colors">Explore Issues</a></li>
              <li><a href="#mentors" className="hover:text-ink hover:underline transition-colors">Mentor Network</a></li>
              <li><a href="#orgs" className="hover:text-ink hover:underline transition-colors">For Organizations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-primary uppercase tracking-widest mb-3">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-semantic-success bg-surface-strong/30 border border-hairline px-2.5 py-1.5 rounded-md w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse"></span>
                API ONLINE v1.0.0
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-body">
                <Terminal className="w-3.5 h-3.5" />
                Response: ~140ms
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-body">
          <div>
            &copy; {new Date().getFullYear()} OpenCraft. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            Built for developers with
            <Heart className="w-3.5 h-3.5 text-semantic-error fill-semantic-error/20 animate-pulse" />
            by the OpenCraft team
          </div>
        </div>
      </div>
    </footer>
  );
};
