export default function renderHorizontalBarChar(labels, impacts) {
  const canvas = document.getElementById("shapChart");
  // Plugin created to include drop shadow on bars
  const barShadowPlugin = {
    id: "barShadow",
    beforeDatasetDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];
      ctx.save();
      dataset.backgroundColor.forEach((color, index) => {
        const meta = chart.getDatasetMeta(0);
        const bar = meta.data[index];
        ctx.save();
        // Create shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor ="rgba(0, 0, 0, 0.2)";
        // Render bars
        bar.draw(ctx);
        ctx.restore();
      });
      ctx.restore();

      return false;
    },
  };
  // Create the chart
  new Chart(canvas, {
    type: "bar",
    plugins: [barShadowPlugin],
    data: {
      labels: labels,
      datasets: [
        {
          data: impacts,
          backgroundColor: impacts.map((value) =>
          // Display features that contribute to churn risk in red (positive values)
          // Display features that reduce churn risk in green (negative values)
            value > 0 ? "rgb(220, 53, 69)" : "rgb(25, 135, 84)",
          ),
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}