'use client';

type CostEstimatorProps = {
  prompt: string;
  beginner: boolean;
};

export function estimateMonthlyCost(prompt: string, beginner: boolean) {
  const text = prompt.toLowerCase();
  let amount = beginner ? 15 : 45;
  const drivers: string[] = [];

  if (/(production|prod|high traffic|scale)/.test(text)) {
    amount += 35;
    drivers.push('production readiness');
  }

  if (/(autoscaling|auto scaling|load balancer|elb|alb)/.test(text)) {
    amount += 40;
    drivers.push('elastic traffic layer');
  }

  if (/(database|postgres|mysql|rds)/.test(text)) {
    amount += 25;
    drivers.push('managed database');
  }

  if (/(storage|s3|uploads|files|backup)/.test(text)) {
    amount += 10;
    drivers.push('object storage');
  }

  if (/(serverless|lambda)/.test(text)) {
    amount = Math.max(20, amount - 15);
    drivers.push('serverless efficiency');
  }

  return {
    amount: Math.min(amount, 220),
    drivers: drivers.length ? drivers : ['small beginner app baseline'],
  };
}

export default function CostEstimator({ prompt, beginner }: CostEstimatorProps) {
  const estimate = estimateMonthlyCost(prompt, beginner);

  return (
    <section className="premium-card relative overflow-hidden border-emerald-300/20 p-7 md:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/55 to-transparent" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Cost estimate
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">AWS Cost Estimator</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/70">
            A quick planning estimate based on workload size, storage, scaling, database, and
            serverless keywords in your prompt.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-emerald-200/20 bg-black/30 p-7 text-center shadow-2xl shadow-emerald-950/30">
          <div className="text-6xl font-black text-white">${estimate.amount}</div>
          <div className="mt-2 text-base font-medium text-emerald-100">per month</div>
        </div>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-3">
        {estimate.drivers.map((driver) => (
          <span
            key={driver}
            className="rounded-full border border-emerald-200/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-50"
          >
            {driver}
          </span>
        ))}
      </div>
    </section>
  );
}
