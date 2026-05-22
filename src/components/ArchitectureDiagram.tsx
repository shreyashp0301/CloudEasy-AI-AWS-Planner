'use client';

type ArchitectureDiagramProps = {
  prompt: string;
};

type DiagramNode = {
  id: string;
  label: string;
  detail: string;
  icon: string;
  color: string;
};

const keywordNodes: Array<{ keywords: string[]; node: DiagramNode }> = [
  {
    keywords: ['load balancer', 'elb', 'alb', 'traffic'],
    node: {
      id: 'elb',
      label: 'Elastic Load Balancer',
      detail: 'Routes requests across healthy targets',
      icon: '⚖️',
      color: 'from-violet-500 to-fuchsia-500',
    },
  },
  {
    keywords: ['autoscaling', 'auto scaling', 'scale', 'production'],
    node: {
      id: 'asg',
      label: 'Auto Scaling Group',
      detail: 'Keeps capacity responsive and resilient',
      icon: '📈',
      color: 'from-orange-500 to-amber-400',
    },
  },
  {
    keywords: ['serverless', 'lambda', 'function'],
    node: {
      id: 'lambda',
      label: 'AWS Lambda',
      detail: 'Runs event-driven compute without servers',
      icon: 'λ',
      color: 'from-yellow-500 to-orange-500',
    },
  },
  {
    keywords: ['storage', 's3', 'bucket', 'static', 'files'],
    node: {
      id: 's3',
      label: 'Amazon S3',
      detail: 'Stores assets, uploads, and backups',
      icon: '🪣',
      color: 'from-emerald-500 to-teal-400',
    },
  },
  {
    keywords: ['database', 'db', 'postgres', 'mysql', 'rds'],
    node: {
      id: 'rds',
      label: 'Amazon RDS',
      detail: 'Managed relational database layer',
      icon: '🗄️',
      color: 'from-sky-500 to-cyan-400',
    },
  },
];

const baseNodes: DiagramNode[] = [
  {
    id: 'user',
    label: 'Users',
    detail: 'Browser and mobile traffic',
    icon: '👤',
    color: 'from-slate-500 to-slate-300',
  },
  {
    id: 'cloudfront',
    label: 'AWS Edge',
    detail: 'Fast entry point for requests',
    icon: '☁️',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'ec2',
    label: 'EC2 App Tier',
    detail: 'Runs your application workload',
    icon: '🖥️',
    color: 'from-orange-500 to-red-500',
  },
];

function buildNodes(prompt: string) {
  const text = prompt.toLowerCase();
  const selected = keywordNodes
    .filter(({ keywords }) => keywords.some((keyword) => text.includes(keyword)))
    .map(({ node }) => node);

  const unique = selected.filter(
    (node, index, nodes) => nodes.findIndex((item) => item.id === node.id) === index,
  );

  const hasServerless = unique.some((node) => node.id === 'lambda');
  const appTier = hasServerless ? [] : [baseNodes[2]];
  const middle = unique.filter((node) => node.id !== 'rds' && node.id !== 's3');
  const data = unique.filter((node) => node.id === 'rds' || node.id === 's3');

  return [baseNodes[0], baseNodes[1], ...middle, ...appTier, ...data];
}

export default function ArchitectureDiagram({ prompt }: ArchitectureDiagramProps) {
  const nodes = buildNodes(prompt);

  return (
    <section className="premium-card relative overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />
      <div className="pointer-events-none absolute right-8 top-10 h-36 w-36 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">
            Architecture overview
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">Architecture Diagram</h2>
        </div>
        <div className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 shadow-lg shadow-orange-950/20">
          Animated AWS flow
        </div>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="flex flex-col gap-5 xl:min-w-max xl:flex-row xl:items-stretch">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-stretch gap-5 xl:flex-row">
              <article className="group relative min-h-52 flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070b14]/90 p-5 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-orange-300/50 hover:shadow-2xl hover:shadow-orange-500/10 xl:w-52 2xl:w-56">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${node.color}`} />
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${node.color} opacity-15 blur-2xl transition duration-300 group-hover:opacity-25`} />
                <div className="flex h-full flex-col justify-between gap-7">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${node.color} text-3xl shadow-lg shadow-black/30 ring-1 ring-white/20 transition duration-300 group-hover:scale-110`}
                    >
                      {node.icon}
                    </div>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Step {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{node.label}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-400">{node.detail}</p>
                  </div>
                </div>
              </article>
              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center xl:px-1">
                  <div className="relative hidden h-px w-14 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 xl:block">
                    <span className="absolute -right-1 -top-1.5 h-3 w-3 rotate-45 border-r-2 border-t-2 border-amber-200" />
                    <span className="absolute inset-0 animate-pulse bg-white/70 blur-sm" />
                  </div>
                  <div className="relative h-10 w-px bg-gradient-to-b from-orange-300 via-amber-200 to-orange-300 xl:hidden">
                    <span className="absolute -bottom-1 -left-1.5 h-3 w-3 rotate-[135deg] border-r-2 border-t-2 border-amber-200" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
