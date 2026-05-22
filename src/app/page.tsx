'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import CopyButton from '@/components/CopyButton';
import CostEstimator, { estimateMonthlyCost } from '@/components/CostEstimator';

type ParsedResponse = {
  architecture: string;
  security: string;
  terraform: string;
  steps: string;
};

const examples = [
  'Deploy my Node.js app with database and auto scaling',
  'Create a serverless image upload app with S3 storage',
  'Production React app with load balancer, EC2, RDS, and security best practices',
];

const serviceRules = [
  { label: 'EC2', icon: 'Compute', keywords: ['ec2', 'server', 'node', 'app', 'backend'] },
  { label: 'ELB', icon: 'Traffic', keywords: ['load balancer', 'elb', 'alb', 'traffic'] },
  { label: 'Auto Scaling', icon: 'Scale', keywords: ['autoscaling', 'auto scaling', 'scale', 'production'] },
  { label: 'RDS', icon: 'Data', keywords: ['database', 'postgres', 'mysql', 'rds', 'db'] },
  { label: 'S3', icon: 'Storage', keywords: ['storage', 's3', 'bucket', 'uploads', 'files'] },
  { label: 'Lambda', icon: 'Serverless', keywords: ['serverless', 'lambda', 'function'] },
  { label: 'IAM', icon: 'Security', keywords: ['security', 'iam', 'least privilege', 'secure'] },
];

function detectPromptServices(prompt: string) {
  const text = prompt.toLowerCase();
  const detected = serviceRules.filter((service) =>
    service.keywords.some((keyword) => text.includes(keyword)),
  );
  return detected.length ? detected : serviceRules.slice(0, 3);
}

function readinessScore(prompt: string, beginner: boolean) {
  const text = prompt.toLowerCase();
  let score = beginner ? 62 : 76;
  if (/database|rds|postgres|mysql/.test(text)) score += 6;
  if (/autoscaling|auto scaling|load balancer|elb|alb/.test(text)) score += 8;
  if (/security|iam|encrypt|https/.test(text)) score += 7;
  if (/production|monitor|backup|logging/.test(text)) score += 5;
  return Math.min(score, 98);
}

function pickSection(result: string, names: string[]) {
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const matcher = new RegExp(
    `(?:^|\\n)\\s*(?:#{1,3}\\s*)?(?:\\d+\\.\\s*)?(?:${escaped})\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:#{1,3}\\s*)?(?:\\d+\\.\\s*)?(?:architecture|cost|security|terraform|deployment|steps|checklist)\\b|$)`,
    'i',
  );
  return result.match(matcher)?.[1]?.trim() ?? '';
}

function extractTerraform(result: string) {
  const fenced = result.match(/```(?:hcl|terraform|tf)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced) return fenced;

  const lines = result
    .split('\n')
    .filter((line) => /resource\s+"|provider\s+"|module\s+"|variable\s+"|terraform\s+{/.test(line));

  return lines.join('\n').trim();
}

function parseResponse(result: string): ParsedResponse {
  const terraform = extractTerraform(result);
  const security =
    pickSection(result, ['security tips', 'security checklist', 'security']) ||
    result
      .split('\n')
      .filter((line) => /security|iam|encrypt|https|least privilege|secret|vpc|firewall/i.test(line))
      .slice(0, 8)
      .join('\n');
  const steps =
    pickSection(result, ['deployment steps', 'steps', 'step-by-step deployment']) ||
    result
      .split('\n')
      .filter((line) => /^\s*(?:\d+\.|-)\s+/.test(line))
      .slice(0, 10)
      .join('\n');

  return {
    architecture: pickSection(result, ['architecture', 'architecture plan']) || result.slice(0, 700),
    security: security || 'Use least-privilege IAM, private networking where possible, encryption at rest, HTTPS, and environment-based secrets.',
    terraform: terraform || '# Terraform example was not detected in the AI response. Ask for Advanced Mode to generate infrastructure code.',
    steps: steps || '1. Review the generated plan.\n2. Create or update Terraform files.\n3. Configure AWS credentials.\n4. Run terraform init, plan, and apply.\n5. Verify logs, metrics, and security settings.',
  };
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function makeSimplePdf(title: string, body: string) {
  const lines = [title, '', ...body.split('\n')]
    .flatMap((line) => (line.length > 88 ? line.match(/.{1,88}(\s|$)/g) ?? [line] : [line]))
    .slice(0, 58);
  const text = lines
    .map((line, index) => `BT /F1 10 Tf 48 ${780 - index * 12} Td (${escapePdfText(line.trim())}) Tj ET`)
    .join('\n');
  const stream = `<< /Length ${text.length} >>\nstream\n${text}\nendstream`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj ${stream} endobj`,
  ];
  let offset = 9;
  const xref = ['0000000000 65535 f '];
  const content = objects
    .map((object) => {
      const entry = `${offset.toString().padStart(10, '0')} 00000 n `;
      xref.push(entry);
      offset += object.length + 1;
      return object;
    })
    .join('\n');
  return `%PDF-1.4\n${content}\nxref\n0 6\n${xref.join('\n')}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
}

function buildMarkdown(prompt: string, beginner: boolean, result: string, parsed: ParsedResponse) {
  const estimate = estimateMonthlyCost(prompt, beginner);
  return `# CloudEasy Deployment Plan

## Prompt
${prompt}

## Mode
${beginner ? 'Beginner' : 'Advanced'}

## Estimated Cost
$${estimate.amount}/month

## Architecture
${parsed.architecture}

## Security Tips
${parsed.security}

## Terraform Code
\`\`\`hcl
${parsed.terraform}
\`\`\`

## Deployment Steps
${parsed.steps}

## Full AI Response
${result}
`;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [beginner, setBeginner] = useState(true);

  const parsed = useMemo(() => parseResponse(result), [result]);
  const serviceInsights = useMemo(() => detectPromptServices(prompt), [prompt]);
  const score = useMemo(() => readinessScore(prompt, beginner), [prompt, beginner]);
  const liveEstimate = useMemo(() => estimateMonthlyCost(prompt, beginner), [prompt, beginner]);

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, beginner }),
      });
      const data = await res.json();
      setResult(data.result);
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = (format: 'pdf' | 'md' | 'json') => {
    const markdown = buildMarkdown(prompt, beginner, result, parsed);

    if (format === 'md') {
      downloadFile('cloudeasy-deployment-plan.md', markdown, 'text/markdown');
      return;
    }

    if (format === 'json') {
      downloadFile(
        'cloudeasy-deployment-plan.json',
        JSON.stringify({ prompt, mode: beginner ? 'beginner' : 'advanced', ...parsed, raw: result }, null, 2),
        'application/json',
      );
      return;
    }

    downloadFile('cloudeasy-deployment-plan.pdf', makeSimplePdf('CloudEasy Deployment Plan', markdown), 'application/pdf');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="app-background" aria-hidden="true">
        <div className="gradient-mesh" />
        <div className="mesh-glow mesh-glow-orange" />
        <div className="mesh-glow mesh-glow-blue" />
        <div className="mesh-glow mesh-glow-teal" />
        <div className="hero-radial-glow" />
        <div className="animated-grid" />
        <div className="background-vignette" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-6 py-7 sm:px-10 lg:px-14 2xl:px-16">
        <nav className="mb-12 flex items-center justify-between rounded-full border border-white/10 bg-white/[0.045] px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/30 bg-orange-400/15 shadow-lg shadow-orange-950/30">
              ☁️
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white">CloudEasy</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                AI Infrastructure Platform
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm font-bold text-slate-400 sm:flex">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-emerald-100">
              AI engine connected
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
              Production workspace
            </span>
          </div>
        </nav>

        <header className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100 shadow-lg shadow-sky-950/20">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
              Cloud infrastructure intelligence
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-[84px] 2xl:text-[88px]">
              AI-powered AWS deployment planner
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Generate architecture, Terraform, security guidance, and deployment workflows instantly.
            </p>
          </div>
          <div className="premium-card p-5 lg:w-96">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">Operational workflow</div>
              <div className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                Live
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm text-slate-300">
              <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">Design</span>
              <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">Govern</span>
              <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">Deploy</span>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-8 xl:grid-cols-[minmax(460px,0.85fr)_minmax(0,1.65fr)] 2xl:gap-10">
          <section className="premium-card group relative h-fit min-w-0 overflow-hidden p-6 transition duration-500 hover:-translate-y-1 hover:border-orange-300/25 md:p-8">
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl transition duration-500 group-hover:bg-orange-500/20" />
            <div className="pointer-events-none absolute -bottom-28 right-0 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative">
            <div className="mb-7 grid grid-cols-2 gap-3 rounded-3xl bg-black/25 p-2">
              <button
                type="button"
                onClick={() => setBeginner(true)}
                className={`rounded-2xl px-5 py-4 text-base font-bold transition duration-300 ${
                  beginner
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-950/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                🟢 Beginner
              </button>
              <button
                type="button"
                onClick={() => setBeginner(false)}
                className={`rounded-2xl px-5 py-4 text-base font-bold transition duration-300 ${
                  !beginner
                    ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-lg shadow-sky-950/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                ⚡ Advanced
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <label htmlFor="prompt" className="text-base font-semibold text-slate-200">
                Deployment prompt
              </label>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                AI input
              </span>
            </div>
            <textarea
              id="prompt"
              className="h-64 w-full resize-none rounded-[1.75rem] border border-white/10 bg-black/35 p-6 text-lg leading-8 text-white shadow-inner shadow-black/50 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-orange-300/60 focus:bg-slate-950/80 focus:ring-4 focus:ring-orange-500/10"
              placeholder='e.g. "Deploy my Node.js app with database and auto scaling"'
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />

            <div className="mt-5 flex flex-wrap gap-3">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2.5 text-left text-sm font-medium text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300/40 hover:bg-orange-500/10 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="mt-7 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Project intelligence
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">Live AWS profile</h2>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-right">
                  <div className="text-2xl font-black text-emerald-100">{score}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                    ready
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Mode" value={beginner ? 'Guided' : 'Architect'} />
                <Metric label="Estimate" value={`$${liveEstimate.amount}/mo`} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {serviceInsights.map((service) => (
                  <span
                    key={service.label}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200"
                  >
                    {service.icon} · {service.label}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 py-5 text-lg font-black text-slate-950 shadow-2xl shadow-orange-950/40 transition duration-300 hover:-translate-y-1 hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 hover:translate-x-full" />
              {loading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />}
              {loading ? 'Generating Plan...' : '🚀 Generate Deployment Plan'}
            </button>
            </div>
          </section>

          <section className="min-w-0 space-y-8">
            {!result && !loading && (
              <div className="premium-card relative flex min-h-[44rem] items-center justify-center overflow-hidden p-10 text-center">
                <div className="absolute inset-x-12 top-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3 opacity-70">
                  <div className="h-24 rounded-3xl border border-orange-300/10 bg-orange-400/5" />
                  <div className="h-24 rounded-3xl border border-sky-300/10 bg-sky-400/5" />
                  <div className="h-24 rounded-3xl border border-emerald-300/10 bg-emerald-400/5" />
                </div>
                <div className="relative">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-orange-300/20 bg-orange-500/15 text-5xl shadow-2xl shadow-orange-950/30">
                    🧭
                  </div>
                  <h2 className="mt-7 text-4xl font-black tracking-tight text-white">Your cloud planning workspace is ready</h2>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                    Enter an AWS idea and CloudEasy will turn it into a visual architecture,
                    cost estimate, Terraform, security checklist, and launch workflow.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="premium-card flex min-h-[44rem] items-center justify-center overflow-hidden p-10 text-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-orange-400/20 blur-3xl" />
                  <div className="relative mx-auto h-24 w-24 animate-spin rounded-full border-4 border-orange-400/15 border-t-orange-300 shadow-2xl shadow-orange-950/40" />
                  <h2 className="mt-8 text-4xl font-black text-white">Designing your AWS plan</h2>
                  <p className="mt-4 text-base text-slate-400">Calling OpenRouter and assembling the deployment dashboard.</p>
                  <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
                    {['Architecture', 'Terraform', 'Security'].map((item) => (
                      <div key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && (
              <>
                <LaunchSummary prompt={prompt} beginner={beginner} score={score} />
                <ArchitectureDiagram prompt={prompt} />
                <CostEstimator prompt={prompt} beginner={beginner} />

                <div className="premium-card flex flex-wrap items-center justify-between gap-5 p-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Exports</p>
                    <h2 className="mt-1 text-2xl font-black text-white">Share-ready deployment package</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => exportPlan('pdf')} className="download-button">
                    ⬇ Export PDF
                  </button>
                  <button type="button" onClick={() => exportPlan('md')} className="download-button">
                    ⬇ Export Markdown
                  </button>
                  <button type="button" onClick={() => exportPlan('json')} className="download-button">
                    ⬇ Export JSON
                  </button>
                  </div>
                </div>

                <div className="grid gap-8">
                  <ResultCard title="Architecture Overview" icon="🏗️" tone="orange">
                    <FormattedText value={parsed.architecture} />
                  </ResultCard>

                  <ResultCard
                    title="Security Checklist"
                    icon="🛡️"
                    tone="sky"
                    action={<CopyButton label="Copy" value={parsed.security} />}
                  >
                    <FormattedText value={parsed.security} />
                  </ResultCard>

                  <ResultCard
                    title="Terraform Code"
                    icon="{}"
                    tone="violet"
                    action={<CopyButton label="Copy" value={parsed.terraform} />}
                  >
                    <pre className="overflow-x-auto rounded-2xl border border-emerald-300/15 bg-[#060a12] p-5 text-sm leading-7 text-emerald-200 shadow-inner shadow-black/50">
                      <code>{parsed.terraform}</code>
                    </pre>
                  </ResultCard>

                  <ResultCard
                    title="Deployment Steps"
                    icon="✅"
                    tone="emerald"
                    action={<CopyButton label="Copy" value={parsed.steps} />}
                  >
                    <FormattedText value={parsed.steps} />
                  </ResultCard>
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="mt-14 border-t border-white/10 py-8 text-center">
          <p className="text-sm font-semibold text-slate-300">
            © 2026 CloudEasy • AI-powered AWS deployment planning platform
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Built for the DoraHacks AWS Prompt Planet Challenge using Next.js, TailwindCSS,
            OpenRouter AI, and AWS-inspired architecture.
          </p>
        </footer>
      </section>
    </main>
  );
}

function ResultCard({
  title,
  icon,
  tone,
  action,
  children,
}: {
  title: string;
  icon: string;
  tone: 'orange' | 'sky' | 'violet' | 'emerald';
  action?: ReactNode;
  children: ReactNode;
}) {
  const tones = {
    orange: 'from-orange-500/20 via-orange-400/6 to-transparent text-orange-200 border-orange-300/20',
    sky: 'from-sky-500/20 via-sky-400/6 to-transparent text-sky-200 border-sky-300/20',
    violet: 'from-violet-500/20 via-fuchsia-400/6 to-transparent text-violet-200 border-violet-300/20',
    emerald: 'from-emerald-500/20 via-teal-400/6 to-transparent text-emerald-200 border-emerald-300/20',
  };

  return (
    <article className={`group overflow-hidden rounded-[1.75rem] border bg-slate-950/72 shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:shadow-black/40 ${tones[tone]}`}>
      <div className={`flex flex-col gap-5 border-b border-white/10 bg-gradient-to-r ${tones[tone]} p-6 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-lg shadow-black/20 transition duration-300 group-hover:scale-105">
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">CloudEasy output</p>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </article>
  );
}

function FormattedText({ value }: { value: string }) {
  const lines = value.split('\n').filter((line) => line.trim());

  return (
    <div className="space-y-4 text-base leading-8 text-slate-300">
      {lines.map((line, index) => {
        const clean = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        const isList = /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);

        if (isList) {
          return (
            <div key={`${clean}-${index}`} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-300 shadow-[0_0_14px_rgba(251,146,60,.85)]" />
              <p>{clean}</p>
            </div>
          );
        }

        return <p key={`${clean}-${index}`}>{clean.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-inner shadow-black/20">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-base font-black text-white">{value}</div>
    </div>
  );
}

function LaunchSummary({
  prompt,
  beginner,
  score,
}: {
  prompt: string;
  beginner: boolean;
  score: number;
}) {
  const estimate = estimateMonthlyCost(prompt, beginner);
  const services = detectPromptServices(prompt);

  return (
    <section className="premium-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
            Launch summary
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">Professional deployment brief</h2>
          <p className="mt-4 line-clamp-2 text-base leading-7 text-slate-400">{prompt}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {services.map((service) => (
              <span
                key={service.label}
                className="rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-100"
              >
                {service.label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.03] md:border-l md:border-t-0">
          <SummaryStat label="Readiness" value={`${score}%`} />
          <SummaryStat label="Cost" value={`$${estimate.amount}`} />
          <SummaryStat label="Mode" value={beginner ? 'Lite' : 'Pro'} />
        </div>
      </div>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-40 flex-col justify-center border-r border-white/10 p-5 last:border-r-0">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
    </div>
  );
}
