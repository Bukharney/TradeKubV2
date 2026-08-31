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
      const timeArray = Array.isArray(data?.time)
        ? data.time
        : closeArray.map((_, i) => nowSec - (closeArray.length - 1 - i) * stepSec);

      const formattedData = closeArray.map((_, index) => {
        const timestamp = timeArray[index];
        return {
          x: new Date(typeof timestamp === "number" ? timestamp * 1000 : timestamp),
          y: [
            openArray[index] ?? 0,
            highArray[index] ?? 0,
            lowArray[index] ?? 0,
            closeArray[index] ?? 0,
          ],
          volume: volumeArray[index] ?? 0,
          value: valueArray[index] ?? 0,
        };
      });

      const chartOptions = {
        chart: {
          type: "candlestick",
          width: "235%",
          height: "95%",
          foreColor: "#4E4F51",
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          pan: {
            enabled: false,
          },
        },
        series: [
          {
            data: formattedData,
          },
        ],
        xaxis: {
          type: "datetime",
          labels: {
            datetimeUTC: false,
            style: {
              height: "1px",
              colors: "#4E4F51",
            },
          },
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
          opposite: true,
          labels: {
            style: {
              colors: "#4E4F51",
            },
          },
        },
        grid: {
          borderColor: "#282A2E",
        },
        tooltip: {
          enabled: true,
          theme: "dark",
          x: {
            show: true,
            datetimeUTC: false,
            format: interval === "1D" ? "HH:mm" : interval === "5D" ? "dd MMM HH:mm" : interval === "1Y" ? "MMM yyyy" : "dd MMM",
          },
          y: {
            show: true,
            formatter: (value) => {
              return value.toFixed(2);
            },
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

  // const formatDataWithColor = (data) => {
  //   return data.map((item, index) => {
  //     const close = item.y[3];
  //     const color =
  //       index > 0 && close > data[index - 1].y[3] ? "#00b894" : "#e74c3c";
  //     return {
  //       x: item.x,
  //       y: item.y,
  //       color: color,
  //     };
  //   });
  // };

  return <div ref={chartRef} />;
}

export default CandleChart;


