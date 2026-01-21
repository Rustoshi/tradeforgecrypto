"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
  }>;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              />
              <Bar
                dataKey="users"
                name="New Users"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
