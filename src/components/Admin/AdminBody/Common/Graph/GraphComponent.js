import React, { useEffect } from "react";
import Chart, { registerables } from "chart.js/auto";

const CardGraph = (props) => {
  useEffect(() => {
    const ctx = document.getElementById(props.id);
    Chart.register(...registerables);

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: props.id,
            data: props.data,
            fill: true,
            borderColor: props.brColor,
            backgroundColor: props.bgColor,
            tension: 0.5,
          },
        ],
      },
      options: {
        scales: {
          x: {
            display: false,
            title: { display: false },
          },
          y: {
            display: false,
            title: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    });
  }, []);

  return <canvas id={props.id} className={props.className}></canvas>;
};

const GeneralGraph = (props) => {
  useEffect(() => {
    const ctx = document.getElementById(props.id);
    Chart.register(...registerables);

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: props.type ? props.type : "line",
      data: {
        labels: props.xAxisLabels,
        datasets: props.datasets,
      },
      options: {
        scales: {},
        plugins: {
          legend: { display: "bottom" },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    });
  }, []);

  return <canvas id={props.id} className={props.className}></canvas>;
};

export { CardGraph, GeneralGraph };
