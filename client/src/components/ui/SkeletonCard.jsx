import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SkeletonCard = () => {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden animate-pulse">
      <CardHeader className="space-y-2 pb-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-full" />
            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-5/6" />
            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-4/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800" />
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="flex items-center p-4 gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3" />
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonKPI = () => {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3 w-full">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
