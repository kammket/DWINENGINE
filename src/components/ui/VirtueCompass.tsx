"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

type VirtueData = {
  wisdom: number;
  courage: number;
  justice: number;
  temperance: number;
};

type Props = {
  current: VirtueData;
  previous?: VirtueData | null;
  size?: "sm" | "md" | "lg";
};

const HEIGHT: Record<string, number> = { sm: 200, md: 280, lg: 360 };

const VIRTUE_LABELS: Record<keyof VirtueData, string> = {
  wisdom: "Wisdom",
  courage: "Courage",
  justice: "Justice",
  temperance: "Temperance",
};

export function VirtueCompass({ current, previous, size = "md" }: Props) {
  const data = (Object.keys(VIRTUE_LABELS) as Array<keyof VirtueData>).map((key) => ({
    virtue: VIRTUE_LABELS[key],
    current: current[key],
    ...(previous ? { previous: previous[key] } : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={HEIGHT[size]}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#E7E5E4" />
        <PolarAngleAxis
          dataKey="virtue"
          tick={{ fontSize: 11, fill: "#44403C", fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 9, fill: "#A8A29E" }}
          tickCount={6}
        />
        <Tooltip
          contentStyle={{
            background: "#1C1C1E",
            border: "none",
            borderRadius: "10px",
            color: "#FAF9F6",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [
            `${value}/10`,
            name === "current" ? "This week" : "Last week",
          ]}
        />
        {previous && (
          <Radar
            name="previous"
            dataKey="previous"
            stroke="#94A3B8"
            fill="#94A3B8"
            fillOpacity={0.12}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        )}
        <Radar
          name="current"
          dataKey="current"
          stroke="#C9A84C"
          fill="#C9A84C"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: "#C9A84C", r: 3, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
