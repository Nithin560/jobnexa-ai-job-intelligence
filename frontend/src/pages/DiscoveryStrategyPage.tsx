import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, ShieldCheck, CheckCircle2, XCircle, Terminal, 
  Layers, Database, Clock, Cpu, Server, FileText, ArrowRight, 
  ExternalLink, Building2, Globe, Code2, AlertTriangle,
  Search, BookOpen, Check, Copy, ChevronRight, Award, Zap, ArrowLeft
} from 'lucide-react';
import { useLoadingBar } from '../components/TopLoadingBar';

export const DiscoveryStrategyPage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerLoading } = useLoadingBar();
  const [activeTab, setActiveTab] = useState<'strategy' | 'taxonomy' | 'ats' | 'stack' | 'schedule' | 'prep'>('strategy');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Ensure that pressing browser Back button reliably returns directly to Home
  useEffect(() => {
    const handlePopState = () => {
      navigate('/', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Back to Home Button */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition group"
          title="Return to Home"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition shadow-2xs">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          </div>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">

        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-blue-500/30">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>JobNexa Engineering Blueprint • Dated 14 October 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Bengaluru IT Company Discovery Strategy
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed font-normal">
            A practical, zero-cost blueprint for high-coverage company discovery and strict IT/engineering job scanning across Bengaluru and Karnataka tech parks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> IT & Engineering Exclusive
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> ₹0 Zero-Cost Architecture
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Daily Scan: 06:00 AM IST
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" /> 100% Direct Apply
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'strategy', label: '1. Discovery Strategy & Rings', icon: Compass },
          { id: 'taxonomy', label: '2. 7 IT Roles & 9 Categories', icon: Layers },
          { id: 'ats', label: '3. Zero-Cost ATS Probing', icon: Terminal },
          { id: 'stack', label: '4. ₹0 Tech Stack & Evidence', icon: Server },
          { id: 'schedule', label: '5. Daily 06:00 IST Schedule', icon: Clock },
          { id: 'prep', label: '6. Interview & Resume Prep', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerLoading(300);
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Discovery Strategy & Rings */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          
          {/* Core Design Decision */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 2</span>
              <span>•</span>
              <span>Core Architectural Principle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Why "Company-First" Beats "Keyword-First"
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard job scrapers search the open web with keywords like <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">"software engineer Bangalore"</code>. 
              This causes massive data decay: spam from aggregators, non-existent ghost jobs, overseas jobs falsely tagged Bengaluru, and non-technical listings. 
              JobNexa reverses this flow with a verified <strong>Company-First</strong> discovery model.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Keyword-First Crawlers (Broken)</span>
                </div>
                <ul className="text-xs text-rose-900/80 space-y-2 list-disc pl-4 font-medium">
                  <li>Flooded with staffing agency duplicates and ghost reposts.</li>
                  <li>US/European roles falsely tagged as Bengaluru for remote reach.</li>
                  <li>Non-IT roles (sales, tele-calling, office boys) polluting feeds.</li>
                  <li>High crawler breakage from constantly shifting HTML DOM layouts.</li>
                  <li>Frequent 404 links and referral-gated application paywalls.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>JobNexa Company-First Registry (Robust)</span>
                </div>
                <ul className="text-xs text-emerald-900/80 space-y-2 list-disc pl-4 font-medium">
                  <li>Maintains a verified registry of employers with physical tech offices in Karnataka.</li>
                  <li>Directly queries canonical ATS endpoints (Greenhouse, Lever, Ashby, Workable).</li>
                  <li>Strict deterministic negative filter rejects sales, HR, marketing, finance.</li>
                  <li>Zero referral link decay: 100% direct canonical applicant portals.</li>
                  <li>₹0 operational cost with lightweight asynchronous HTTP pipeline.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Four Expansion Rings */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 4</span>
              <span>•</span>
              <span>Four Discovery Expansion Rings</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Zero-Cost Multi-Ring Architecture
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">RING 0</span>
                  <span className="text-xs font-bold text-slate-400">Deterministic Seed</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Curated Seed Registry</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100-150 foundational Bengaluru employers categorized into Unicorns, GCCs, IT Services, and Tier-1 startups (e.g. Swiggy, Razorpay, Flipkart, Zerodha, Target BLR, Cisco, Qualcomm).
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  100% verified physical presence in Koramangala, Whitefield, E-City, Manyata, HSR.
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">RING 1</span>
                  <span className="text-xs font-bold text-slate-400">Zero-Cost ATS</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">ATS Ecosystem Probing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct programmatic JSON endpoints provided by major Applicant Tracking Systems without API keys or browser overhead (Greenhouse, Lever, Ashby HQ, Workable, SmartRecruiters).
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Structured JSON output, direct application links, near-zero bandwidth footprint.
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">RING 2</span>
                  <span className="text-xs font-bold text-slate-400">Syndication</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Free Public Aggregators</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Syndicated public feeds and developer boards filtered exclusively for Bengaluru and Karnataka entities (e.g., Arbeitnow, Jobicy, open GitHub jobs repos).
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Canonical URL verification to trace original employer careers page.
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">RING 3</span>
                  <span className="text-xs font-bold text-slate-400">Discovery Signals</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Free Structured Signals</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Public open registries including Wikidata SPARQL queries for Karnataka IT employers, OpenStreetMap tech park nodes, and NASSCOM member directories.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Expands the company registry autonomously while maintaining zero cost.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Tab 2: 7 IT Roles & 9 Categories */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-6">
          
          {/* 7 IT Role Families */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 3 & 7</span>
              <span>•</span>
              <span>Canonical IT Classification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              The 7 Official IT Role Families
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              JobNexa strictly indexes positions belonging to one of these 7 engineering disciplines. 
              Jobs that cannot be mapped into these families with high confidence are rejected.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  code: 'software_engineering',
                  title: 'Software & Product Engineering',
                  desc: 'Backend, Frontend, Full Stack, Mobile (iOS/Android), Distributed Systems, Systems Programming (Go, Rust, C++, Java).',
                  color: 'blue'
                },
                {
                  code: 'infrastructure_reliability',
                  title: 'Infrastructure & Reliability',
                  desc: 'Cloud Engineers, SRE, DevOps, Platform Engineering, Kubernetes, Terraform, Linux Systems, Network Infrastructure.',
                  color: 'indigo'
                },
                {
                  code: 'security',
                  title: 'Cybersecurity & InfoSec',
                  desc: 'Security Engineers, SOC Analysts, Penetration Testing, Threat Intelligence, AppSec, Cloud Security, Cryptography.',
                  color: 'purple'
                },
                {
                  code: 'data_ai',
                  title: 'Data & AI / ML',
                  desc: 'Data Engineers, Analytics Engineers, ML Engineers, AI Researchers, Computer Vision, NLP, Data Scientists, MLOps.',
                  color: 'teal'
                },
                {
                  code: 'quality_release',
                  title: 'Quality & SDET',
                  desc: 'SDET, Test Automation, QA Engineers, Performance Testing, CI/CD Pipeline Release Engineers.',
                  color: 'emerald'
                },
                {
                  code: 'hardware_embedded',
                  title: 'Hardware & Embedded',
                  desc: 'Embedded Systems, Firmware, VLSI, ASIC Design, FPGA, SoC, IoT Hardware, Board Bring-up, Robotics.',
                  color: 'amber'
                },
                {
                  code: 'technical_product',
                  title: 'Technical Product & Architecture',
                  desc: 'Technical Product Managers (TPMs), Enterprise Architects, Solutions Architects, Staff Tech Leads.',
                  color: 'rose'
                },
              ].map((role) => (
                <div key={role.code} className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {role.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{role.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>

            {/* Outright Exclusions */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 space-y-2.5 mt-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Deterministic Negative Filter (Outright Rejections)</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                The scanner immediately discards non-technical positions: <strong>Sales, Business Development, Marketing, SEO, Social Media, Recruitment, HR, Talent Acquisition, Accounting, Finance, Legal, Compliance, Facilities, Admin, and Non-Technical Customer Support</strong>.
              </p>
            </div>
          </div>

          {/* 9 Company Categories */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 3</span>
              <span>•</span>
              <span>Bengaluru Ecosystem Taxonomy</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              The 9 Bengaluru Tech Company Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { title: 'Product & Software', examples: 'Flipkart, Swiggy, Meesho, Postman, Hasura' },
                { title: 'IT Services & Consulting', examples: 'TCS, Infosys, Wipro, LTIMindtree, Mphasis' },
                { title: 'SaaS & Cloud', examples: 'Freshworks, BrowserStack, Chargebee, Zoho BLR' },
                { title: 'Cybersecurity', examples: 'Quick Heal, Fortinet BLR, CrowdStrike BLR, SentinelOne' },
                { title: 'AI & Data Platforms', examples: 'Fractal, Mu Sigma, Sigmoid, Quantiphi, Tiger Analytics' },
                { title: 'Fintech Technology', examples: 'Razorpay, PhonePe, Zerodha, CRED, Slice' },
                { title: 'Gaming & Media Tech', examples: 'MPL, Gameskraft, Dream11 BLR, Glance, InMobi' },
                { title: 'Semiconductor & Hardware', examples: 'Intel, Qualcomm, Texas Instruments, AMD, Nvidia BLR' },
                { title: 'GCC / Engineering Centre', examples: 'Target India, Walmart Global Tech, Cisco, SAP Labs' },
              ].map((cat, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-900">{cat.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Eg: {cat.examples}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Zero-Cost ATS Probing */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 5</span>
              <span>•</span>
              <span>Zero-Cost ATS API Mechanics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Direct Programmatic ATS Ingestion
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Applicant Tracking Systems provide public JSON feeds that allow JobNexa to ingest 100% accurate, active job descriptions without paid scrapers, proxies, or headless browser memory overhead.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Greenhouse */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Greenhouse Public JSON API</span>
                  <button 
                    onClick={() => handleCopy('https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true', 'gh')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer font-medium"
                  >
                    {copiedCode === 'gh' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'gh' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-blue-700 overflow-x-auto">
                  GET https://boards-api.greenhouse.io/v1/boards/{'{board_token}'}/jobs?content=true
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Returns title, location, full HTML/plain JD, departments, and canonical apply URLs for companies like Swiggy, Razorpay, Zepto.
                </p>
              </div>

              {/* Lever */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Lever Postings API</span>
                  <button 
                    onClick={() => handleCopy('https://api.lever.co/v0/postings/{company}?mode=json', 'lever')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer font-medium"
                  >
                    {copiedCode === 'lever' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'lever' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-blue-700 overflow-x-auto">
                  GET https://api.lever.co/v0/postings/{'{company}'}?mode=json
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clean JSON containing workplaceType, categories, location (Bengaluru), and direct application URLs.
                </p>
              </div>

              {/* Ashby HQ */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Ashby HQ Public Job Board API</span>
                  <button 
                    onClick={() => handleCopy('https://api.ashbyhq.com/posting-api/job-board/{organization}', 'ashby')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer font-medium"
                  >
                    {copiedCode === 'ashby' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'ashby' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-blue-700 overflow-x-auto">
                  POST https://api.ashbyhq.com/posting-api/job-board/{'{organization}'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Widely adopted by modern AI and fintech startups in Bengaluru. High-fidelity location and compensation data.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 4: ₹0 Tech Stack & Evidence */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 8 & 10</span>
              <span>•</span>
              <span>₹0 Zero-Cost Architecture & Trust Model</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              The ₹0 Production Technology Stack
            </h2>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Architecture Layer</th>
                    <th className="py-3 px-4">Core Technology</th>
                    <th className="py-3 px-4">Engineering Role & Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Async Ingestion Engine</td>
                    <td className="py-3.5 px-4 font-mono text-blue-700 font-medium">FastAPI & Python 3.11</td>
                    <td className="py-3.5 px-4 text-slate-600">Non-blocking HTTPX async clients handle 100+ company endpoints concurrently in under 45 seconds.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Zero-Overhead Persistence</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-medium">SQLite (WAL) / PostgreSQL</td>
                    <td className="py-3.5 px-4 text-slate-600">Write-Ahead Logging ensures zero database lock contention during concurrent daily scans and candidate queries.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Client-Side Presentation</td>
                    <td className="py-3.5 px-4 font-mono text-cyan-700 font-medium">React + Vite + Tailwind CSS</td>
                    <td className="py-3.5 px-4 text-slate-600">Ultra-fast single-page interface with sub-second filtering by tech hub, role, and experience tier.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Evidence & Confidence Score 0-100 */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 mt-4">
              <h3 className="font-bold text-base text-slate-900">Provenance & Trust Confidence Score (0 - 100)</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold">Score 95 - 100: Canonical ATS Endpoint</span>
                  <span>Direct Greenhouse / Lever / Ashby feed + physical BLR unit verified</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <span className="font-bold">Score 85 - 94: Official Career Portal HTML</span>
                  <span>Scraped directly from employer domain with verified apply form</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold">Score 70 - 84: Syndicated Free Portal</span>
                  <span>Arbeitnow / Jobicy feed with canonical employer website URL attached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Daily 06:00 IST Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 9 & 12</span>
              <span>•</span>
              <span>Operational Schedule</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Daily Scan Schedule: 06:00 AM IST
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every morning at <strong>06:00 AM Asia/Kolkata (IST)</strong>, JobNexa executes a clean, polite discovery scan across all career portals and ATS systems before candidates start their morning job search.
            </p>

            <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  06:00
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Morning Discovery Pass (IST)</div>
                  <div className="text-xs text-slate-500">Full crawl across all 120+ registered Bengaluru tech employers</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  12:00
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Mid-day Incremental Verification (IST)</div>
                  <div className="text-xs text-slate-500">Detects rapid afternoon postings and marks closed positions</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  Auto
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Platform-Open Verification</div>
                  <div className="text-xs text-slate-500">Triggers an automatic background check if the latest scan is older than 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Interview & Resume Prep */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <span>Section 18</span>
              <span>•</span>
              <span>Career Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Leveraging Job Descriptions for Interview & Resume Prep
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Job descriptions collected by JobNexa reflect current technical expectations at top Bengaluru engineering teams. Candidates can leverage this data to optimize resumes and prepare for technical interviews.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-blue-50/40">
                <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Resume Optimization Rules</span>
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium">
                  <li><strong>Echo Exact Tech Stack Terminology:</strong> Match high-frequency tokens (e.g. AWS, Kubernetes, FastAPI, Postgres, Kafka).</li>
                  <li><strong>Quantify Scale & Impact:</strong> Bengaluru product teams prioritize metrics: throughput (RPS), latency reduction, cost savings.</li>
                  <li><strong>Highlight Architectural Ownership:</strong> Emphasize system design, microservices decomposition, and cloud infrastructure.</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-indigo-50/40">
                <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Interview Preparation Signals</span>
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium">
                  <li><strong>System Design Focus:</strong> High QPS, distributed caching (Redis), event streaming (Kafka/RabbitMQ).</li>
                  <li><strong>Data Structures & Algorithms:</strong> Standard LC mediums with practical complexity trade-off justifications.</li>
                  <li><strong>Production Reliability:</strong> Observability, Prometheus metrics, structured logging, CI/CD pipelines.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-200"
              >
                <span>Browse Bengaluru IT Jobs Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
