"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionChartProps {
  data: Array<{
    date: string;
    deposits: number;
    withdrawals: number;
  }>;
}

export function TransactionChart({ data }: TransactionChartProps) {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">Transaction Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                name="Deposits"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                name="Withdrawals"
                stroke="var(--chart-4)"
                fill="var(--chart-4)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
