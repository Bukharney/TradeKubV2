import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

function CandleChart({ data, interval = "1M" }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const closeArray = data?.close || [];
    if (closeArray.length > 0 && chartRef.current) {
      const openArray = data?.open || [];
      const highArray = data?.high || [];
      const lowArray = data?.low || [];
      const volumeArray = data?.volume || [];
      const valueArray = data?.value || [];
      const nowSec = Math.floor(Date.now() / 1000);

      const spanMap = {
        "1D": 86400,
        "5D": 5 * 86400,
        "1M": 30 * 86400,
        "3M": 90 * 86400,
        "1Y": 365 * 86400,
      };
      const totalSpan = spanMap[interval] || 30 * 86400;
      const stepSec = data?.step || totalSpan / Math.max(closeArray.length - 1, 1);
      const rawTimeArray = Array.isArray(data?.time)
        ? data.time
        : closeArray.map((_, i) => nowSec - (closeArray.length - 1 - i) * stepSec);

      const parseDate = (timestamp) => {
        if (!timestamp) return new Date();
        const date = new Date(
          typeof timestamp === "number"
            ? timestamp < 1e11
              ? timestamp * 1000
              : timestamp
            : timestamp
        );
        return isNaN(date.getTime()) ? new Date() : date;
      };

      const pad = (n) => String(n).padStart(2, "0");
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const formatAxisLabel = (timestamp) => {
        const date = parseDate(timestamp);
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const day = pad(date.getDate());
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        if (interval === "1D") {
          return `${hours}:${minutes}`;
        } else if (interval === "5D") {
          return `${day} ${month}`;
        } else if (interval === "1Y") {
          return `${month} ${year}`;
        } else {
          return `${day} ${month}`;
        }
      };

      const formatTooltipLabel = (timestamp) => {
        const date = parseDate(timestamp);
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const day = pad(date.getDate());
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year} ${hours}:${minutes}`;
      };

      const formattedData = closeArray.map((_, index) => {
        const timeVal = rawTimeArray[index];
        const axisLabel = formatAxisLabel(timeVal);
        const fullTooltip = formatTooltipLabel(timeVal);
        const open = Number(openArray[index] ?? closeArray[index] ?? 0);
        const high = Number(highArray[index] ?? Math.max(open, closeArray[index] ?? 0));
        const low = Number(lowArray[index] ?? Math.min(open, closeArray[index] ?? 0));
        const close = Number(closeArray[index] ?? open);

        return {
          x: axisLabel,
          y: [open, high, low, close],
          fullTime: fullTooltip,
          volume: volumeArray[index] ?? 0,
          value: valueArray[index] ?? 0,
        };
      });

      const totalBars = formattedData.length;
      const targetTickCount = Math.min(totalBars, 6);
      const step = Math.max(1, Math.floor(totalBars / targetTickCount));

      const chartOptions = {
        chart: {
          type: "candlestick",
          width: "100%",
          height: "100%",
          foreColor: "#8E9093",
          background: "transparent",
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          pan: {
            enabled: false,
          },
          animations: {
            enabled: true,
            speed: 300,
          },
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: "#00E396",
              downward: "#FF334B",
            },
            wick: {
              useFillColor: true,
            },
          },
        },
        series: [
          {
            name: "Candles",
            data: formattedData,
          },
        ],
        xaxis: {
          type: "category",
          tickPlacement: "between",
          labels: {
            show: true,
            rotate: 0,
            rotateAlways: false,
            hideOverlappingLabels: false,
            trim: false,
            style: {
              colors: "#8E9093",
              fontSize: "11px",
              fontFamily: "Poppins, sans-serif",
            },
            formatter: function (val, timestamp, opts) {
              if (!opts || typeof opts.i !== "number") return val || "";
              const idx = opts.i;
              // Show label on first, last, and every `step` bar to prevent overlapping and truncation
              if (idx === 0 || idx === totalBars - 1 || idx % step === 0) {
                return val;
              }
              return "";
            },
          },
          axisBorder: {
            show: true,
            color: "#282A2E",
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          opposite: true,
          tooltip: {
            enabled: true,
          },
          labels: {
            formatter: (val) => (typeof val === "number" ? val.toFixed(2) : val),
            style: {
              colors: "#8E9093",
              fontSize: "11px",
              fontFamily: "Poppins, sans-serif",
            },
          },
        },
        grid: {
          borderColor: "#1E2024",
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        tooltip: {
          enabled: true,
          theme: "dark",
          style: {
            fontSize: "12px",
            fontFamily: "Poppins, sans-serif",
          },
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
            const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
            const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
            const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
            const fullTime =
              formattedData[dataPointIndex]?.fullTime ||
              w.globals.categoryLabels[dataPointIndex] ||
              "";
            const isUp = c >= o;
            const change = c - o;
            const changePercent = o > 0 ? ((change / o) * 100).toFixed(2) : "0.00";
            const colorClass = isUp ? "#00E396" : "#FF334B";

            return `
              <div style="background: #181A1F; border: 1px solid #282A2E; padding: 10px 14px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 150px;">
                <div style="color: #A0A3A8; font-size: 11px; margin-bottom: 6px; border-bottom: 1px solid #282A2E; padding-bottom: 4px;">${fullTime}</div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                  <span style="color: #71757D;">Open:</span>
                  <span style="color: #FFF; font-weight: 500;">${o?.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                  <span style="color: #71757D;">High:</span>
                  <span style="color: #00E396; font-weight: 500;">${h?.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                  <span style="color: #71757D;">Low:</span>
                  <span style="color: #FF334B; font-weight: 500;">${l?.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                  <span style="color: #71757D;">Close:</span>
                  <span style="color: ${colorClass}; font-weight: 600;">${c?.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px solid #282A2E; font-size: 11px;">
                  <span style="color: #71757D;">Change:</span>
                  <span style="color: ${colorClass}; font-weight: 600;">${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent}%)</span>
                </div>
              </div>
            `;
          },
        },
      };

      const chart = new ApexCharts(chartRef.current, chartOptions);
      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [data, interval]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}

export default CandleChart;
