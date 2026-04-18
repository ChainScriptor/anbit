import React from 'react';
import { TrendingUp, CreditCard, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { REVENUE_HISTORY } from '@/constants';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

interface MetricsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  fulfillmentRate: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  fulfillmentRate,
}) => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
      {/* Left: stacked metrics card with three stats */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4 md:p-8 md:pb-6">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 md:text-lg">
              Orders Revenue
            </CardTitle>
            <CardDescription className="text-sm">All time</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Revenue
            </p>
            <p className="anbit-tabular-nums mt-1 text-3xl font-semibold text-slate-900 md:text-4xl">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              7.2%
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6 md:px-8 md:pb-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border-slate-100 bg-white p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-slate-400">
                  Total Orders
                </CardTitle>
                <p className="anbit-tabular-nums mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                  {totalOrders.toLocaleString('en-US')}
                </p>
                <p className="mt-2 text-sm text-slate-400">All time</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-emerald-500">+5.2%</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-slate-400">
                  Avg. Orders Value
                </CardTitle>
                <p className="anbit-tabular-nums mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                  {formatCurrency(averageOrderValue)}
                </p>
                <p className="mt-2 text-sm text-slate-400">All time</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-rose-500">-3.6%</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-slate-400">
                  Orders Fulfillment Rate
                </CardTitle>
                <p className="anbit-tabular-nums mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                  {fulfillmentRate.toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-slate-400">All time</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-emerald-500">+0.5%</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Right: revenue mini-chart card */}
      <Card className="flex flex-col justify-between border-slate-200">
        <CardHeader className="p-6 pb-4 md:p-8 md:pb-6">
          <CardTitle className="text-sm font-semibold text-slate-400">
            Revenue Overview
          </CardTitle>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-400">All time</p>
              <p className="anbit-tabular-nums mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <Activity className="h-4 w-4" />
              <span>Stable</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6 md:px-8 md:pb-8">
          <div className="h-32 w-full md:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_HISTORY}>
                <defs>
                  <linearGradient
                    id="revenueArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#0f172a"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#0f172a"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fill="url(#revenueArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;

