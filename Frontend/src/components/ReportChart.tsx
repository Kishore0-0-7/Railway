import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ReportChartProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const ReportChart = ({ title, description, children }: ReportChartProps) => {
    const chartRef = useRef<any>(null); // ensure you have a ref to the chart instance

    useEffect(() => {
        // returns the first available color from known keys, or fallback green
        const readRevenueColor = (raw?: string) => {
            let parsed: any = {};
            try {
                parsed = raw
                    ? JSON.parse(raw)
                    : JSON.parse(localStorage.getItem("railwaySettings") || "{}");
            } catch {
                parsed = {};
            }
            return (
                parsed.revenueColorHex ||
                parsed.revenue_color_hex ||
                parsed.revenue_series_color ||
                parsed.revenueSeriesColor ||
                parsed.revenueColor ||
                parsed.revenue_color ||
                parsed.chartColor ||
                parsed.seriesColor ||
                parsed.primaryColor ||
                "#10B981" // fallback (green)
            );
        };

        const applyColor = (color: string) => {
            // TODO: Replace the sample update with your chart library's API.
            // Examples:
            // Chart.js: chartRef.current.data.datasets[0].borderColor = color; chartRef.current.update();
            // ApexCharts: chartRef.current.updateOptions({ colors: [color] });
            // ECharts: chartRef.current.setOption({ color: [color] });
            if (!chartRef.current) return;
            // Example placeholder (no-op) — replace below:
            try {
                // @ts-ignore
                if (chartRef.current.updateOptions) {
                    // ApexCharts
                    chartRef.current.updateOptions({ colors: [color] });
                } else if (chartRef.current.data && chartRef.current.update) {
                    // Chart.js
                    chartRef.current.data.datasets.forEach((ds: any) => {
                        ds.backgroundColor = color;
                        ds.borderColor = color;
                    });
                    chartRef.current.update();
                } else if (chartRef.current.setOption) {
                    // ECharts
                    chartRef.current.setOption({ color: [color] });
                }
            } catch (e) {
                // ignore
            }
        };

        // initial apply
        applyColor(readRevenueColor());

        // handler for custom event dispatched by Settings.tsx
        const onSettingsChanged = (ev: Event) => {
            const detail = (ev as CustomEvent).detail;
            const color = detail
                ? readRevenueColor(JSON.stringify(detail))
                : readRevenueColor();
            applyColor(color);
        };

        // storage event for other tabs
        const onStorage = (ev: StorageEvent) => {
            if (ev.key === "railwaySettings") {
                applyColor(readRevenueColor(ev.newValue || undefined));
            }
        };

        window.addEventListener(
            "railwaySettingsChanged",
            onSettingsChanged as EventListener
        );
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener(
                "railwaySettingsChanged",
                onSettingsChanged as EventListener
            );
            window.removeEventListener("storage", onStorage);
        };
    }, [chartRef]);

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-4 sm:p-6">
                <CardTitle className="text-gray-800 text-lg sm:text-xl">
                    {title}
                </CardTitle>
                {description && (
                    <p className="text-sm sm:text-base text-gray-600">
                        {description}
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex items-center justify-center">
                {/* Placeholder for the chart component */}
                <div className="flex items-center justify-center h-64 w-full">
                    {children}
                </div>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </CardContent>
        </Card>
    );
};

export default ReportChart; // or keep existing export