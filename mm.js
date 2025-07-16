/* ───────────────────────────── 1. STYLE ───────────────────────────── */
const PAL = {
  brand: "#005450",
  accent: "#00746A", // Stronger for default dataset lines when color not set for contrast
  line: "rgba(0,84,80,.35)",
  grid: "#DDEECC",
  bg: "#F5F5F5",
  sectionBorder: "#E3E7E9",
};
const BLUE = "#2A70FF",
  BLUE_FILL = "rgba(42,112,255,.10)",
  RED = "#E93535";
const FONT_FAM = "Barlow, Helvetica, Arial, sans-serif";
const BRAND_PRIMARY = "#74BD85"; // dark green
const BRAND_PRIMARY_FILL = "#eef3f3"; // 18 % opacity fill
const BRAND_SECONDARY = "#1A7894"; // pastel mint
const BRAND_SECONDARY_FILL = "rgba(221, 238, 204, 0.3)"; // 30 % opacity
const BRAND_THIRD = "#FEBD59";

/* ── GLOBAL BOX-PLOT DEFAULTS ─────────────────────────────── */
Chart.defaults.set("datasets.boxplot", {
  outlierRadius: 0, //     ↳ hide outlier dots
  itemRadius: 0, //     ↳ hide individual-value dots
  meanRadius: 0, //     ↳ hide mean dot (works even if showMean=true)
  showMean: false,
  categoryPercentage: 1,
  barPercentage: 0.7,
});

/******************************************************************
 * Plug-in : writes the median value exactly on the median line,
 *           but shifted 10 px lower
 ******************************************************************/
const medianLabelPlugin = {
  id: "medianLabel",

  afterDatasetsDraw(chart, _args, opts) {
    const { ctx } = chart;

    chart.data.datasets.forEach((ds, dsIndex) => {
      if (ds.type !== "boxplot") return;

      const meta = chart.getDatasetMeta(dsIndex);

      meta.data.forEach((elem, i) => {
        const point = ds.data[i];
        if (!point || point[2] == null) return;

        const median = point[2];
        const x = elem.x;
        const y = meta.yScale.getPixelForValue(median) + (opts.offset ?? 5);

        ctx.save();
        ctx.font =
          `${opts.fontWeight || 500} ` +
          `${opts.fontSize || 9}px ` +
          (opts.fontFamily || FONT_FAM);

        /* NEW ► use the dataset colour (fall back to global default) */
        ctx.fillStyle = ds.borderColor || opts.color || "#000";

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("$" + median.toFixed(opts.decimals ?? 3), x, y);
        ctx.restore();
      });
    });
  },
};

/* Register once with your preferred defaults */
Chart.register({
  ...medianLabelPlugin,
  defaults: {
    fontWeight: 500,
    fontSize: 10,
    fontFamily: "Barlow, Helvetica, Arial",
    color: BRAND_PRIMARY,
    decimals: 3,
    offset: 2, // <── default downward shift
  },
});

Chart.register({
  id: "hideAxesForDoughnut",
  beforeInit(chart) {
    if (chart.config.type === "doughnut") {
      chart.options.scales = { x: { display: false }, y: { display: false } };
    }
  },
});

/* ── register the plug-in once ─────────────────────────────────── */
Chart.register(medianLabelPlugin);

/* helper to make section containers ---------------------------------- */
function makeSection(titleText) {
  // Section
  const section = document.createElement("section");
  section.classList.add("dashboard-section");
  Object.assign(section.style, {
    background: PAL.bg,
    border: `1px solid ${PAL.sectionBorder}`,
    borderRadius: "10px",
    margin: "64px auto 40px auto",
    padding: "28px 32px 22px 32px",
    boxShadow: "0 3px 18px 0 rgba(0,0,0,0.04)",
  });
  // Group heading
  const heading = document.createElement("h2");
  heading.className = "section-title";
  heading.textContent = titleText;
  Object.assign(heading.style, {
    margin: "0 0 20px",
  });
  section.appendChild(heading);

  // Chart grid
  const grid = document.createElement("div");
  grid.className = "chart-grid"; //  << add this line
  Object.assign(grid.style, {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "0",
  });
  Object.assign(grid.style, {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "0",
  });
  section.appendChild(grid);

  document.currentScript.parentNode.insertBefore(
    section,
    document.currentScript
  );

  return grid; // Return grid for charts
}

/* ───────────────────────────── 2. DATA ───────────────────────────── */

const sections = [
  {
    title: "Pricing",
    charts: [
      /* New sub-heading */
      { type: "subheading", text: "Median By Credit Type" },

      /* ─── 48 ITC (> $25 M) median price by vintage ─── */
      {
        title: "§48 ITC  (>$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of large §48 ITC deals change throughout the year. Transferable tax credits are subject to pricing seasonality, with pricing generally rising over time. Our §48 ITC pricing excludes residential solar and biogas/RNG, which we track separately.",
        type: "line",
        showLegend: true,

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2",
        ],

        /* three separate year-series, coloured blue / red / yellow */
        datasets: [
          /* 2024 ---------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY, //
            data: [0.92, 0.923, 0.93, 0.935, 0.945, 0.945],
            datalabels: {
              anchor: "end", // still attached to the point
              align: "bottom", // but shown underneath
            },
          },

          /* 2025 ---------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY, //
            data: [0.94, 0.935, null, null, null, null],
          },
        ],

        /* y-axis formatting (same scheme you use elsewhere) */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },

      /* ─── 48 ITC ($5-25 M) median price by vintage ─── */
      {
        title: "§48 ITC ($5M–$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of mid-sized §48 ITC deals change throughout the year. Transferable tax credits are subject to pricing seasonality, with pricing generally rising over time. Our §48 ITC pricing excludes residential solar and biogas/RNG, which we track separately.",
        type: "line",
        showLegend: true,

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2",
        ],

        /* year series */
        datasets: [
          /* 2024 ---------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY,
            data: [0.91, 0.915, 0.92, 0.93, 0.93, 0.925],
            datalabels: {
              anchor: "end",
              align: "bottom",
            },
          },

          /* 2025 ---------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY,
            data: [0.923, 0.92, null, null, null, null],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },

      /* ─── 45 PTC (> $25 M) median price by vintage ─── */
      {
        title: "§45 PTC  (>$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of large §45 PTC deals change throughout the year. §45 PTCs are not subject to §50 recapture and are often structured with quarterly payments in arrears.",
        type: "line",
        showLegend: true,

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2",
        ],

        /* year series (blue / red / yellow) */
        datasets: [
          /* 2024 ---------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY,
            data: [0.957, 0.958, 0.958, 0.955, 0.953, 0.953],
            datalabels: {
              anchor: "end", // still attached to the point
              align: "bottom", // but shown underneath
            },
          },

          /* 2025 ---------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY,
            data: [0.96, 0.958, null, null, null, null],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },
      /* ─── 45 PTC ($5-25 M) median price by vintage ─── */
      {
        title: "§45 PTC ($5M–$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of mid-sized §45 PTC deals change throughout the year. §45 PTCs are not subject to §50 recapture and are often structured with quarterly payments in arrears.",
        type: "line",
        showLegend: true,

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2",
        ],

        /* year series */
        datasets: [
          /* 2024 ---------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY,
            data: [0.935, 0.93, 0.943, 0.943, 0.95, 0.948],
            datalabels: { anchor: "end", align: "bottom" },
          },

          /* 2025 ---------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY,
            data: [0.95, 0.95, null, null, null, null],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },
      /* ─── 45X AMpC (> $25 M) median price by vintage ─── */
      {
        title: "§45X AMPC  (>$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of large §45X AMPC deals change throughout the year.",
        type: "line",
        showLegend: true,
        note: "* Not enough data or expected transaction volume",

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2*",
        ],

        /* year-series : blue / red / yellow */
        datasets: [
          /* 2024 ---------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY,
            data: [0.94, 0.95, 0.945, 0.955, 0.953, null],
          },

          /* 2025 ---------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY,
            data: [0.945, 0.943, null, null, null, null],
            datalabels: {
              anchor: "end", // still attached to the point
              align: "bottom", // but shown underneath
            },
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },
      /* ─── 45X AMPC ($5-25 M) median price by vintage ─── */
      {
        title: "§45X AMPC ($5M–$25M) Median Gross Pricing by Vintage",
        subtitle:
          "See how median prices for each vintage of mid-sized §45X AMPC deals change throughout the year.",
        type: "line",
        showLegend: true,

        /* x-axis */
        labels: [
          "Current Q1",
          "Current Q2",
          "Current Q3",
          "Current Q4",
          "Following Q1",
          "Following Q2",
        ],

        /* year-series */
        datasets: [
          /* 2024 -------------------------------------------------------- */
          {
            label: "2024",
            color: BRAND_PRIMARY,
            data: [0.935, 0.933, 0.925, 0.925, 0.93, 0.935],
            datalabels: { anchor: "end", align: "top" },
          },

          /* 2025 -------------------------------------------------------- */
          {
            label: "2025",
            color: BRAND_SECONDARY,
            data: [0.925, 0.925, null, null, null, null],
            datalabels: {
              anchor: "end", // still attached to the point
              align: "bottom", // but shown underneath
            },
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },

      /* New sub-heading */
      { type: "subheading", text: "Range By Credit Type" },

      /* New boxplot charts for "Credit Type" */

      {
        title: "§48 ITC  (>$25M) Gross Pricing by Quarter",
        subtitle:
          "Explore pricing trends for large 2024 §48 ITC deals in this chart that shows high, low, and median prices by quarter. Our §48 ITC pricing is exclusive of residential solar and biogas/RNG, which we track separately.",
        type: "boxplot",

        /* 1. x-axis -------------------------------------------------------- */
        labels: ["Q1 ‘24", "Q2 ‘24", "Q3 ‘24", "Q4 ‘24", "Q1 ‘25"],
        showMean: false,
        showLegend: false,
        meanRadius: 0, // mean symbol
        itemRadius: 0, // raw-item symbols
        outlierRadius: 0, // outliers

        /* 2. datasets ------------------------------------------------------ */
        datasets: [
          /* ── 2024 boxes (primary) ───────────────────────────────────────── */
          {
            label: "2024",
            type: "boxplot",
            showLegend: false,
            backgroundColor: "rgba(0, 84, 80, 0.1)",
            hoverBackgroundColor: "rgba(0, 84, 80, 0.1)",
            borderColor: BRAND_PRIMARY,
            outlierColor: BRAND_PRIMARY,
            borderWidth: 1.5,
            categoryPercentage: 0.8,
            barPercentage: 0.85,
            outlierRadius: 0,
            itemRadius: 0,
            datalabels: {
              align: "center",
              formatter: (v) => "$" + v[2].toFixed(3), // show MEDIAN on top
            },
            data: [
              /* Q1-24 */ [0.915, 0.915, 0.92, 0.93, 0.93],
              /* Q2-24 */ [0.91, 0.91, 0.923, 0.935, 0.935],
              /* Q3-24 */ [0.92, 0.92, 0.93, 0.94, 0.94],
              /* Q4-24 */ [0.93, 0.93, 0.935, 0.953, 0.953],
              /* Q1-25 */ [0.91, 0.91, 0.945, 0.95, 0.95],
            ],
          },
        ],

        /* 3. y-axis ------------------------------------------------------- */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
          drawBorder: false,
        },

        /* 4. override default options for the legend --------------------- */
        options: {
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                filter: (item) => {
                  const ds = item.chart.data.datasets[item.datasetIndex];
                  return ds.type === "boxplot"; // only the two boxes appear
                },
              },
              onClick: (evt, item, legend) => {
                const year = item.text; // "2024" or "2025"
                const chart = legend.chart;
                chart.data.datasets.forEach((ds, i) => {
                  if (ds.label.startsWith(year))
                    chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
                });
                chart.update();
              },
            },
          },
        },
      },
      {
        title: "§45 PTC  (>$25M) Gross Pricing by Quarter",
        subtitle:
          "Explore pricing trends for large 2024 §45 PTC deals in this chart that shows high, low, and median prices by quarter. §45 PTCs are not subject to §50 recapture and are often structured with quarterly payments in arrears.",
        type: "boxplot",
        showMean: false,
        showLegend: false,
        meanRadius: 0, // mean symbol
        itemRadius: 0, // raw-item symbols
        outlierRadius: 0, // outliers

        /* 1. x-axis -------------------------------------------------------- */
        labels: ["Q1 ‘24", "Q2 ‘24", "Q3 ‘24", "Q4 ‘24", "Q1 ‘25"],

        /* 2. datasets ------------------------------------------------------ */
        datasets: [
          /* ── 2024 boxes (blue) ───────────────────────────────────────── */
          {
            label: "2024",
            type: "boxplot",
            backgroundColor: "rgba(0, 84, 80, 0.1)",
            hoverBackgroundColor: "rgba(0, 84, 80, 0.1)",
            borderColor: BRAND_PRIMARY,
            outlierColor: BRAND_PRIMARY,
            borderWidth: 1.5,
            outlierRadius: 0,
            itemRadius: 0,
            categoryPercentage: 0.8,
            barPercentage: 0.85,
            datalabels: {
              align: "center",
              formatter: (v) => "$" + v[2].toFixed(3), // show MEDIAN on top
            },
            data: [
              /* Q1-24 */ [0.92, 0.92, 0.957, 0.975, 0.975],
              /* Q2-24 */ [0.943, 0.943, 0.958, 0.96, 0.96],
              /* Q3-24 */ [0.94, 0.94, 0.958, 0.96, 0.96],
              /* Q4-24 */ [0.94, 0.94, 0.955, 0.963, 0.963],
              /* Q1-25 */ [0.95, 0.95, 0.953, 0.965, 0.965],
            ],
          },
        ],

        /* 3. y-axis ------------------------------------------------------- */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
          drawBorder: false,
        },

        /* 4. override default options for the legend --------------------- */
        options: {
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                filter: (item) => {
                  const ds = item.chart.data.datasets[item.datasetIndex];
                  return ds.type === "boxplot"; // only the two boxes appear
                },
              },
              onClick: (evt, item, legend) => {
                const year = item.text; // "2024" or "2025"
                const chart = legend.chart;
                chart.data.datasets.forEach((ds, i) => {
                  if (ds.label.startsWith(year))
                    chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
                });
                chart.update();
              },
            },
          },
        },
      },

      {
        title: "§45X AMPC  (>$25M) Gross Pricing by Quarter",
        subtitle:
          "Explore pricing trends for large 2024 §45X AMPC deals in this chart that shows high, low, and median prices by quarter.",
        type: "boxplot",
        showLegend: false,
        showMean: false,
        meanRadius: 0, // mean symbol
        itemRadius: 0, // raw-item symbols
        outlierRadius: 0, // outliers

        /* 1. x-axis -------------------------------------------------------- */
        labels: ["Q1 ‘24", "Q2 ‘24", "Q3 ‘24", "Q4 ‘24", "Q1 ‘25"],

        /* 2. datasets ------------------------------------------------------ */
        datasets: [
          /* ── 2024 boxes ───────────────────────────────────────── */
          {
            label: "2024",
            type: "boxplot",
            backgroundColor: "rgba(0, 84, 80, 0.1)",
            hoverBackgroundColor: "rgba(0, 84, 80, 0.1)",
            borderColor: BRAND_PRIMARY,
            outlierColor: BRAND_PRIMARY,
            borderWidth: 1.5,
            outlierRadius: 0,
            itemRadius: 0,
            categoryPercentage: 0.8,
            barPercentage: 0.85,
            datalabels: {
              align: "center",
              formatter: (v) => "$" + v[2].toFixed(3), // show MEDIAN on top
            },
            data: [
              /* Q1-24 */ [0.93, 0.93, 0.94, 0.945, 0.945],
              /* Q2-24 */ [0.94, 0.94, 0.95, 0.955, 0.955],
              /* Q3-24 */ [0.945, 0.945, 0.945, 0.955, 0.955],
              /* Q4-24 */ [0.95, 0.95, 0.955, 0.955, 0.955],
              /* Q1-25 */ [0.945, 0.945, 0.953, 0.955, 0.955],
            ],
          },
        ],

        /* 3. y-axis ------------------------------------------------------- */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
          drawBorder: false,
        },

        /* 4. override default options for the legend --------------------- */
        options: {
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                filter: (item) => {
                  const ds = item.chart.data.datasets[item.datasetIndex];
                  return ds.type === "boxplot"; // only the two boxes appear
                },
              },
              onClick: (evt, item, legend) => {
                const year = item.text; // "2024" or "2025"
                const chart = legend.chart;
                chart.data.datasets.forEach((ds, i) => {
                  if (ds.label.startsWith(year))
                    chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
                });
                chart.update();
              },
            },
          },
        },
      },

      { type: "spacer" },

      /* New sub-heading */
      { type: "subheading", text: "Spread By Credit Type" },

      {
        /* ─── Spot §48 ITC histogram ────────────────────────────── */
        title: "Spot §48 ITC Transaction Count by Gross Price",
        subtitle:
          "Explore relative pricing frequency for §48 ITC deals in this chart that shows percentages of deals sold at each cent value from 70 to 98 cents. Our §48 ITC pricing is exclusive of residential solar and biogas/RNG, which we track separately.",
        type: "bar",
        stacked: false,
        showLegend: false,

        /* x-axis buckets */
        labels: [
          "$0.700 – $0.790",
          "$0.791 – $0.849",
          "$0.850 – $0.879",
          "$0.880 – $0.889", //  ← the bar with 0.7 %
          "$0.890 – $0.899",
          "$0.900 – $0.909",
          "$0.910 – $0.919",
          "$0.920 – $0.929",
          "$0.930 – $0.939",
          "$0.940 – $0.949",
          "$0.950 – $0.959",
          "$0.960 – $0.969",
          "$0.970 – $0.979",
          "$0.980 – $0.989",
          "$0.990 – $0.999",
          "$1.000",
        ],

        /* single-series histogram */
        datasets: [
          {
            label: "Share of transactions",
            color: BRAND_PRIMARY,
            data: [
              0.021, // 2.1 %
              0.014, // 1.4 %
              0.062, // 6.2 %
              0.007, // 0.7 %  ← special bar (index 3)
              0.014, // 1.4 %
              0.098, // 9.8 %
              0.161, // 16.1 %
              0.266, // 26.6 %
              0.168, // 16.8 %
              0.133, // 13.3 %
              0.035, // 3.5 %
              0.021, // 2.1 %
              0.0, // 0 %
              0.0, // 0 %
              0.0, // 0 %
              0.0, // 0 %
            ],

            /* per-bar label styling */
            datalabels: {
              /* black text & above-bar position ONLY for dataIndex 3 */
              color: (ctx) => (ctx.dataIndex === 3 ? "#000" : "#FFF"),
              anchor: (ctx) => (ctx.dataIndex === 3 ? "end" : "center"),
              align: (ctx) => (ctx.dataIndex === 3 ? "top" : "center"),
              offset: (ctx) => (ctx.dataIndex === 3 ? 6 : 0),
              formatter: (v) => (v * 100).toFixed(1) + "%", // 0.7 %, 2.1 % …
            },
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0, 0.1, 0.2, 0.3],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },

        options: {
          scales: {
            x: {
              ticks: { font: { family: FONT_FAM, size: 6 } },
            },
            y: {
              ticks: { font: { family: FONT_FAM, size: 6 } },
            },
          },
        },
      },
      {
        title: "Spot §45 PTC Transaction Count by Gross Price",
        subtitle:
          "Explore relative pricing frequency for §45 PTC deals in this chart that shows percentages of deals sold at each cent value from 70 to 98 cents. §45 PTCs are not subject to §50 recapture and are often structured with quarterly payments in arrears.",
        type: "bar",
        stacked: false,
        showLegend: false,

        /* x-axis buckets */
        labels: [
          "$0.700 – $0.790",
          "$0.791 – $0.849",
          "$0.850 – $0.879",
          "$0.880 – $0.889",
          "$0.890 – $0.899",
          "$0.900 – $0.909",
          "$0.910 – $0.919",
          "$0.920 – $0.929",
          "$0.930 – $0.939",
          "$0.940 – $0.949",
          "$0.950 – $0.959",
          "$0.960 – $0.969",
          "$0.970 – $0.979",
          "$0.980 – $0.989",
          "$0.990 – $0.999",
          "$1.000",
        ],

        /* single-series histogram */
        datasets: [
          {
            label: "Share of transactions",
            color: BRAND_PRIMARY,
            data: [
              0.0, // 0.0 %  ← corrected
              0.0, // 0.0 %  ← corrected
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.019, // 1.9 %
              0.0, // 0.0 %
              0.208, // 20.8 %
              0.094, // 9.4 %
              0.208, // 20.8 %
              0.283, // 28.3 %
              0.132, // 13.2 %
              0.057, // 5.7 %
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.0, // 0.0 %
            ],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0, 0.1, 0.2, 0.3],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },

        options: {
          plugins: {
            datalabels: {
              font: { family: FONT_FAM, weight: 600, size: 6 }, // numbers on the bars
            },
          },
          scales: {
            x: {
              ticks: { font: { family: FONT_FAM, size: 6 } }, // bucket labels
            },
            y: {
              ticks: { font: { family: FONT_FAM, size: 6 } }, // % scale at the left
            },
          },
        },
      },
      {
        title: "Spot §45X AMPC Transaction Count by Gross Price",
        subtitle:
          "Explore relative pricing frequency for §45X AMPC deals in this chart that shows percentages of deals sold at each cent value from 70 to 98 cents.",
        type: "bar",
        stacked: false,
        showLegend: false,

        labels: [
          "$0.700 – $0.790",
          "$0.791 – $0.849",
          "$0.850 – $0.879",
          "$0.880 – $0.889",
          "$0.890 – $0.899",
          "$0.900 – $0.909",
          "$0.910 – $0.919",
          "$0.920 – $0.929",
          "$0.930 – $0.939",
          "$0.940 – $0.949",
          "$0.950 – $0.959",
          "$0.960 – $0.969",
          "$0.970 – $0.979",
          "$0.980 – $0.989",
          "$0.990 – $0.999",
          "$1.000",
        ],

        datasets: [
          {
            label: "Share of transactions",
            color: BRAND_PRIMARY,
            data: [
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.04, // 4.0 %  ← corrected
              0.021, // 2.1 %
              0.0, // 0.0 %
              0.042, // 4.2 %
              0.042, // 4.2 %
              0.208, // 20.8 %
              0.083, // 8.3 %
              0.188, // 18.8 %
              0.313, // 31.3 %
              0.063, // 6.3 %
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.0, // 0.0 %
              0.0, // 0.0 %
            ],
          },
        ],

        y: {
          ticks: [0, 0.1, 0.2, 0.3, 0.4],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },

        options: {
          plugins: {
            datalabels: {
              font: { family: FONT_FAM, weight: 600, size: 6 }, // numbers on the bars
            },
          },
          scales: {
            x: {
              ticks: { font: { family: FONT_FAM, size: 6 } }, // bucket labels
            },
            y: {
              ticks: { font: { family: FONT_FAM, size: 6 } }, // % scale at the left
            },
          },
        },
      },
      { type: "spacer" },

      { type: "subheading", text: "By Technology" },
      /* ─── Residential-solar median price ─── */
      {
        title: "Residential Solar Median Pricing by Quarter",
        subtitle:
          "§48 ITCs generated by residential (“resi”) projects generally trade at a slight discount compared to §48 ITCs from solar, wind, and battery storage.",
        type: "line", // uses the ordinary line-builder you already have
        showLegend: false, // only one series, legend not needed

        /* x-axis */
        labels: ["Q1 ‘24", "Q2 ‘24", "Q3 ‘24", "Q4 ‘24", "Q1 ‘25", "Q2 ‘25"],

        /* single data-series (median) */
        datasets: [
          {
            label: "Median price",
            color: BRAND_PRIMARY,
            data: [0.925, 0.925, 0.928, 0.915, 0.92, 0.923],
          },
        ],

        /* y-axis formatting (same scale you use elsewhere) */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },
      /* ─── Biogas / RNG median price ─── */
      {
        title: "Biogas/RNG Median Pricing by Quarter",
        subtitle:
          "§48 ITCs generated by Biogas/RNG projects generally trade at a slight discount compared to §48 ITCs from solar, wind, and battery storage.",
        type: "line",
        showLegend: false, // only one series

        /* x-axis */
        labels: ["Q1 ‘24", "Q2 ‘24", "Q3 ‘24", "Q4 ‘24", "Q1 ‘25", "Q2 ‘25"],

        /* median prices */
        datasets: [
          {
            label: "Median price",
            color: BRAND_PRIMARY,
            data: [0.915, 0.92, 0.923, 0.938, 0.935, 0.92],
          },
        ],

        /* y-axis */
        y: {
          ticks: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0],
          fmt: (v) => "$" + v.toFixed(3),
        },
      },

      { type: "subheading", text: "Investment-Grade Indemnity" },
      /* ─── Premium paid for credits with investment-grade indemnity (2024) ─── */
      {
        title: "Price Premium For 2024 Credits With Investment-Grade Indemnity",
        subtitle:
          "Tax credits sold by investment grade (“IG”) sellers generally trade at a premium relative to unrated credits that carry tax credit insurance. This data is based on a survey of buyers we took in January of 2025.",
        type: "bar",
        stacked: false, //  ← grouped, not stacked
        showLegend: true,

        labels: ["No premium", "$0.00 – $0.01", "$0.01 – $0.02", ">$0.02"],

        datasets: [
          {
            label: "§48 ITCs",
            color: BRAND_PRIMARY,
            data: [0.09, 0.19, 0.6, 0.12],
          },
          {
            label: "§45 PTCs & §45X AMPCs",
            color: BRAND_SECONDARY,
            data: [0.09, 0.27, 0.64, 0.0],
          },
        ],

        y: {
          ticks: [0, 0.25, 0.5, 0.75, 1],
          fmt: (v) => (v * 100).toFixed(0) + "%",
        },
      },
    ],
  },

  {
    title: "Key Commercial Terms",
    charts: [
      /* ─ 1. Buyer fee reimbursement ─ */
      {
        title: "Buyer Fee Reimbursement (% of Credit Volume)",
        subtitle:
          "Tax credit buyers will often negotiate a capped fee reimbursement with sellers, covering transaction, legal, and/or diligence fees. Although we have reported a percentage, fees are often negotiated in whole dollars (e.g., $150,000). This data is based on Reunion-facilitated transactions.",
        type: "line",
        showLegend: true,

        labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025"],

        datasets: [
          {
            // Transfers >$25M
            label: "Transfers >$25M",
            color: BRAND_PRIMARY,
            data: [0.63, 0.2, 0.23, 0.28, 0.28], // → 0.63 %, 0.20 %, …
            datalabels: {
              anchor: "end", // still attached to the point
              align: "bottom", // but shown underneath
            },
          },
          {
            // Transfers <$25M
            label: "Transfers <$25M",
            color: BRAND_SECONDARY,
            data: [0.71, 0.92, 0.79, 0.86, 0.92],
          },
        ],

        y: {
          ticks: [0, 0.25, 0.5, 0.75, 1, 1.25], // 0 % … 1.25 %
          fmt: (v) => v.toFixed(2) + "%", // NO *100 !!
        },
      },

      /* ─── Exclusivity Period vs. Actual Deal Duration in Days ─── */
      {
        title: "Exclusivity Period vs. Actual Deal Duration in Days",
        subtitle:
          'The "exclusivity period" is the negotiated timeframe between signing a term sheet and executing a tax credit transfer agreement (TCTA). "Deal duration" is the actual period from term sheet signing to TCTA execution. This data represents Reunion-facilitated transactions.',
        type: "line",
        showLegend: true,
        options: {
          plugins: {
            legend: {
              labels: {
                generateLabels: (chart) => {
                  // 1. let Chart.js build the normal label array
                  const labels =
                    Chart.defaults.plugins.legend.labels.generateLabels(chart);

                  // 2. find the label we want to appear last …
                  const idx = labels.findIndex(
                    (l) => l.text === "Deal Duration (Std. Dev.)"
                  );

                  // 3. … pull it out and push it to the end
                  if (idx !== -1) {
                    labels.push(labels.splice(idx, 1)[0]);
                  }

                  // 4. hand the modified list back to Chart.js
                  return labels;
                },
              },
            },
          },
        },

        /* 1.  X-axis labels */
        labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025"],

        /* 2.  Datasets  (NOTE – dataset index matters for the fill!) */
        datasets: [
          /* 0 – upper invisible edge (dealDuration + σ) */
          {
            label: "",
            order: 0,
            data: [131, 92, 71, 51, 45],
            color: "rgba(0,0,0,0)",
            pointRadius: 0,
            tension: 0,
            borderWidth: 0,
            fill: false,
          },

          /* 1 – lower invisible edge that PROVIDES the red fill */
          {
            label: "Deal Duration (Std. Dev.)",
            order: 0,
            data: [7, 24, 19, 21, 21],
            color: "rgba(0,0,0,0)",
            backgroundColor: "rgba(255,153,153,.45)",
            pointRadius: 0,
            tension: 0,
            borderWidth: 0,
            fill: { target: 0 }, // ← shade up to dataset 0
          },

          /* 2 – blue line : Exclusivity Period  ───────────────────────────── */
          {
            label: "Exclusivity Period",
            order: 2,
            data: [45, 60, 30, 30, 45],
            color: BRAND_PRIMARY,
            pointRadius: 4,
            tension: 0,
            fill: false,
            datalabels: {
              anchor: "end",
              // put larger number on top, smaller underneath
              align: (ctx) => {
                const i = ctx.dataIndex;
                const exclusivity = ctx.dataset.data[i]; // this dataset
                const duration = ctx.chart.data.datasets[3].data[i]; // red dataset
                return exclusivity >= duration ? "top" : "bottom";
              },
              offset: 10,
            },
          },

          /* 3 – red line : Deal Duration  ─────────────────────────────────── */
          {
            label: "Deal Duration",
            order: 2,
            data: [69, 58, 45, 36, 33],
            color: BRAND_SECONDARY,
            pointRadius: 4,
            tension: 0,
            fill: false,
            datalabels: {
              anchor: "end",
              // put larger number on top, smaller underneath
              align: (ctx) => {
                const i = ctx.dataIndex;
                const duration = ctx.dataset.data[i]; // this dataset
                const exclusivity = ctx.chart.data.datasets[2].data[i]; // blue dataset
                return duration > exclusivity ? "top" : "bottom";
              },
              offset: 10,
            },
          },
        ],

        /* 3.  Y-axis formatting */
        y: {
          ticks: [0, 20, 40, 60, 80, 100, 120, 140],
          fmt: (v) => v, // simple integer labels
        },
      },
    ],
  },

  {
    title: "Macro",
    charts: [
      {
        title: "Supply: Availability of Credits by Quarter",
        subtitle:
          "Transferable tax credits of a given “vintage” (2024, 2025, etc.) can be sold before, during, and after the year in which they are generated. This data is based on 2024 vintage Reunion-facilitated transactions, highlighting percentages of credits that appeared in each quarter on the Reunion platform.",
        type: "bar",
        stacked: false, // single-series bars
        showLegend: false,

        labels: [
          "Q2 2023",
          "Q3 2023",
          "Q4 2023",
          "Q1 2024",
          "Q2 2024",
          "Q3 2024",
          "Q4 2024",
          "Q1 2025",
          "Q2 2025",
        ],

        datasets: [
          {
            label: "Total",
            color: BRAND_PRIMARY,
            // % of the total 2024-vintage supply becoming available each quarter
            data: [
              0.018, 0.172, 0.097, 0.196, 0.267, 0.107, 0.065, 0.05, 0.028,
            ],
          },
        ],

        y: {
          ticks: [0, 0.1, 0.2, 0.3, 0.4],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
      {
        title:
          "Demand: Executed Term Sheet For Credits by Est. Closing Quarter",
        subtitle:
          "Transferable tax credits of a given “vintage” (2024, 2025, etc.) can be sold before, during, and after the year in which they are generated. This data highlights all 2024 vintage credit transactions by the quarter the term sheet was signed in.",
        type: "bar",
        stacked: false, // single–series bars
        showLegend: false,

        labels: [
          "Q2 2023",
          "Q3 2023",
          "Q4 2023",
          "Q1 2024",
          "Q2 2024",
          "Q3 2024",
          "Q4 2024",
          "Q1 2025",
          "Q2 2025",
        ],

        datasets: [
          {
            label: "Signed term sheets",
            color: BRAND_PRIMARY,
            // % of total term-sheet volume expected to close in each quarter
            data: [0.0, 0.0, 0.012, 0.07, 0.096, 0.303, 0.332, 0.099, 0.088],
          },
        ],

        y: {
          ticks: [0, 0.1, 0.2, 0.3, 0.4],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
      {
        title: "Transaction Count by Seller Technology",
        subtitle:
          "Explore the renewable energy technology makeup of sellers in tax credit transfer transactions.",
        type: "bar",
        stacked: false,
        showLegend: false,

        /* x-axis categories (order = highest → lowest share) */
        labels: [
          "Onshore wind",
          "Component manufacturing",
          "Solar (Utility)",
          "Battery storage",
          "Biogas (RNG)",
          "Solar (Community)",
          "Solar (Residential)",
          "Solar + wind",
          "Nuclear",
          "Solar + storage",
          "Critical minerals",
          "Fuel cell",
          "Solar (C&I)",
          "Combined heat and power",
          "CCUS",
          "EV charging",
          "Geothermal",
        ],

        /* one-series vertical bar chart */
        datasets: [
          {
            label: "Share of transactions",
            color: BRAND_PRIMARY, // primary brand colour
            data: [
              0.182, // Onshore wind
              0.141, // Component manufacturing
              0.124, // Solar (Utility)
              0.124, // Battery storage
              0.096, // Biogas (RNG)
              0.096, // Solar (Community)
              0.062, // Solar (Residential)
              0.038, // Solar + wind
              0.027, // Nuclear
              0.027, // Solar + storage
              0.024, // Critical minerals
              0.014, // Fuel cell
              0.014, // Solar (C&I)
              0.014, // Combined heat and power
              0.007, // CCUS
              0.007, // EV charging
              0.003, // Geothermal
            ],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0, 0.05, 0.1, 0.15, 0.2],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
      {
        title: "Transaction Count by Notional Deal Size ($M)",
        subtitle:
          "Explore the spread in transaction size across all credit types.",
        type: "bar",
        stacked: false,
        showLegend: false,

        /* deal-size buckets */
        labels: [
          "<$1",
          "$1 – $3",
          "$3 – $5",
          "$5 – $10",
          "$10 – $20",
          "$20 – $50",
          "$50 – $100",
          "$100 – $150",
          "$150 – $250",
          "$250 – $500",
          "$500 – $1,000",
          "$1,000+",
        ],

        /* single-series distribution */
        datasets: [
          {
            label: "Share of transactions",
            color: BRAND_PRIMARY,
            data: [
              0.01, // <$1
              0.062, // $1 – $3
              0.041, // $3 – $5
              0.144, // $5 – $10
              0.168, // $10 – $20
              0.247, // $20 – $50
              0.116, // $50 – $100
              0.092, // $100 – $150
              0.062, // $150 – $250
              0.021, // $250 – $500
              0.027, // $500 – $1,000
              0.01, // $1,000+
            ],
          },
        ],

        /* y-axis formatting */
        y: {
          ticks: [0, 0.05, 0.1, 0.15, 0.2, 0.25],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
      {
        title: "Transaction Count by Buyer Industry",
        subtitle:
          "Explore the industry makeup of tax credit purchasers across all credit types.",
        type: "doughnut",
        showLegend: false,

        labels: [
          "Finance",
          "Industrials",
          "Consumer Discretionary",
          "Telecommunications",
          "Consumer Staples",
          "Health Care",
          "Energy",
          "Technology",
          "Materials",
          "Utilities",
          "N/A (Individuals)",
          "Real Estate",
        ],

        datasets: [
          {
            label: "Share of transactions",
            backgroundColor: [
              BRAND_PRIMARY, // Finance
              BRAND_SECONDARY, // Industrials
              BRAND_THIRD, // Consumer Discretionary
              "#6096FF",
              "#FFA45B",
              "#FF5C58",
              "#7DCE82",
              "#B6E2A1",
              "#FAC748",
              "#D8B4F8",
              "#A0C4FF",
              "#C2C2C2",
            ],
            borderColor: "#FFF",
            borderWidth: 1,
            data: [
              0.276, 0.19, 0.149, 0.077, 0.068, 0.059, 0.054, 0.041, 0.027,
              0.027, 0.023, 0.009,
            ],

            /* ─── slice-labels INSIDE the wedges ───────────────────────── */
            datalabels: {
              // NEW ► hide labels for the four tiny slices
              display: (ctx) => {
                const skip = [
                  "Materials",
                  "Utilities",
                  "N/A (Individuals)",
                  "Real Estate",
                ];
                const label = ctx.chart.data.labels[ctx.dataIndex];
                return !skip.includes(label); // draw all others
              },

              anchor: "center",
              align: "center",
              offset: 0,
              clamp: true,
              color: "#FFF",
              font: { family: FONT_FAM, weight: 600, size: 11 },

              formatter: (v, ctx) =>
                ctx.chart.data.labels[ctx.dataIndex] +
                "\n" +
                (v * 100).toFixed(1) +
                "%",
            },

            /* ─── tooltip text ───────────────────────────────────────── */
            tooltip: {
              callbacks: {
                label: (c) =>
                  c.label + ": " + (c.parsed * 100).toFixed(1) + "%",
              },
            },
          },
        ],

        /* dummy y-axis object for the builder */
        y: { ticks: [0], fmt: (v) => (v * 100).toFixed(1) + "%" },
      },
    ],
  },
  {
    title: "Credit Values",
    charts: [
      // ── LMI adder ────────────────────────────────────────────────────────────────
      {
        title: "LMI Adder Claims (% of Credit Volume)",
        subtitle:
          "§48 ITCs may receive a bonus tax credit of 10% or 20% if they are located in a specified low-income community and apply for and receive an “LMI” allocation from the Department of Energy.",
        type: "line",
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "§48 ITCs",
            color: BRAND_PRIMARY,
            data: [0.016, 0.085, 0.052, 0.198],
          },
        ],
        y: {
          ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },

      // ── Energy-community adder ───────────────────────────────────────────────────
      {
        title: "Energy Community Adder Claims (% of Credit Volume)",
        subtitle:
          "§45 PTCs and §48 ITCs may receive a bonus tax credit of 10% if they are located in an energy community. There are three energy community types: brownfield, coal closure community, and statistical area. The percentage in the chart is weighted by count, not by deal size.",
        type: "line",
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "§48 ITCs",
            color: BRAND_PRIMARY,
            data: [0.409, 0.459, 0.518, 0.543],
          },
          {
            label: "§45 PTCs",
            color: BRAND_SECONDARY,
            data: [0.004, 0.089, 0.138, 0.234],
          },
        ],
        y: {
          ticks: [0, 0.15, 0.3, 0.45, 0.6],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },

      // ── Domestic-content adder ───────────────────────────────────────────────────
      {
        title: "Domestic Content Adder Claims (% of Credit Volume)",
        subtitle:
          "§45 PTCs and §48 ITCs may receive a bonus tax credit of 10% if they meet domestic content requirements. The percentage in the chart is weighted by count, not by deal size.",
        type: "line",
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "§48 ITCs",
            color: BRAND_PRIMARY,
            data: [0.137, 0.224, 0.236],
          },
          {
            label: "§45 PTCs",
            color: BRAND_SECONDARY,
            data: [0.0, 0.0, 0.029],
          },
        ],
        y: {
          ticks: [0, 0.12, 0.24, 0.36, 0.48, 0.6],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },

      // ── $-weighted average credit, incl. all adders ──────────────────────────────
      {
        title: "Average Credit % Inclusive of All Adders",
        subtitle:
          "The tax credit value for §45 PTCs and §48 ITCs is 30%, provided PWA requirements are met or exempted. Bonus adders (domestic content, energy community, low-income community) can enhance this value. The percentage is weighted by count, not by deal size.",
        type: "bar",
        stacked: false,
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "§48 ITCs",
            color: BRAND_PRIMARY,
            data: [0.356, 0.377, 0.381, 0.384],
          },
          {
            label: "§45 PTCs",
            color: BRAND_SECONDARY,
            data: [0.301, 0.309, 0.315, 0.333],
          },
        ],
        y: {
          ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
    ],
  },
  {
    title: "PWA Compliance",
    charts: [
      {
        title: "PWA Compliance for §48 ITC",
        subtitle:
          "Clean energy projects that meet PWA requirements are eligible for a 5x increase in tax credit value. Projects may still qualify for the 5x increase if they meet the beginning of construction (BoC) or one megawatt (1MW) exemption. The percentage is weighted by count, not by deal size.",
        plugins: {
          datalabels: {
            /* keep the rules you already have … ---------------------------------- */
            display: (ctx) => !isBox, // still hide labels on box-plots
            anchor: (ctx) => (isBar ? "center" : "end"),
            align: (ctx) => (isBar ? "center" : "top"),
            offset: 20,
            color: (ctx) => {
              if (isBar) {
                const v =
                  ctx.raw ?? ctx.parsed ?? ctx.dataset.data[ctx.dataIndex];
                return v === 0 ? "#000" : "#FFF";
              }
              const c = ctx.dataset.borderColor || ctx.dataset.backgroundColor;
              return (Array.isArray(c) ? c[ctx.dataIndex] : c) || "#000";
            },
            font: { family: FONT_FAM, weight: 600, size: 12 },

            /*  ───  NEW: hide the label when it is “0 %” and we are on a PWA chart  */
            formatter: (v, ctx) => {
              /* test whether this is one of the two PWA charts */
              const title = ctx.chart?.config?._cfgTitle || "";
              const isPWA = /PWA Compliance/i.test(title);

              /*  ── hide label when it is null OR zero on a PWA chart ── */
              if (isPWA && (v == null || v === 0)) return "";

              /* otherwise use your normal formatter */
              return cfg.y.fmt(v); // e.g. "35.0 %"
            },
          },
        },
        type: "bar",
        stacked: true,
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "Exempt (Net Output <1MW)",
            color: BRAND_PRIMARY,
            data: [null, 0.035, 0.252],
          },
          {
            label: "Exempt (BOC prior to Jan 29, 2023)",
            color: BRAND_SECONDARY,
            data: [0.951, 0.394, 0.128],
          },
          {
            label: "Compliance Required",
            color: BRAND_THIRD,
            data: [0.049, 0.57, 0.62],
          },
        ],
        y: {
          ticks: [0, 0.25, 0.5, 0.75, 1],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },

      {
        title: "PWA Compliance for §45 PTC",
        subtitle:
          "Clean energy projects that meet PWA requirements are eligible for a 5x increase in tax credit value. Projects may still qualify for the 5x increase if they meet the beginning of construction (BoC) or one megawatt (1MW) exemption.The percentage is weighted by count, not by deal size.",
        type: "bar",
        stacked: true,
        showLegend: true,
        labels: ["2023 COD", "2024 COD", "2025 COD"],
        datasets: [
          {
            label: "Exempt (BOC prior to Jan 29, 2023)",
            color: BRAND_SECONDARY,
            data: [1.0, 0.861, 0.713],
          },
          {
            label: "Compliance Required",
            color: BRAND_THIRD,
            data: [null, 0.139, 0.287],
          },
        ],
        y: {
          ticks: [0, 0.25, 0.5, 0.75, 1],
          fmt: (v) => (v * 100).toFixed(1) + "%",
        },
      },
    ],
  },
];

/* ───────────────────────────── 3. CHART BUILDER ───────────────────────────── */
function buildChart(grid, cfg) {
  /* 1) ── NEW : an empty grid cell ───────────────────────────────── */
  if (cfg.type === "spacer") {
    const empty = document.createElement("div");
    empty.style.minHeight = "1px";
    grid.appendChild(empty);
    return;
  }
  // If subheading item, just create an H3 and return
  if (cfg.type === "subheading") {
    const subH = document.createElement("h3");
    subH.className = "section-subtitle";
    subH.textContent = cfg.text;
    Object.assign(subH.style, {
      gridColumn: "1 / span 2",
      margin: "0 0 10px",
    });
    grid.appendChild(subH);
    return;
  }

  const isBar = cfg.type === "bar";
  const isLine = cfg.type === "line";
  const isBox = cfg.type === "boxplot";
  const isPWAChart = /PWA Compliance/i.test(cfg.title);

  // for bar charts honour the `stacked` flag that the caller
  // may have provided (default = true when nothing is specified)
  const barStacked = isBar ? cfg.stacked ?? true : false;

  /* card wrapper */
  const wrap = document.createElement("div");
  wrap.classList.add("chart-card");
  Object.assign(wrap.style, {
    background: "#fff",
    padding: "32px 32px",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "12px", // nice, consistent spacing
    fontFamily: FONT_FAM,
    boxShadow: "0 1px 8px 0 rgba(0,0,0,0.02)",
    border: `1px solid ${PAL.sectionBorder}`,
  });
  grid.appendChild(wrap);

  /* title */
  const title = document.createElement("h4");
  title.className = "graph-title";
  title.textContent = cfg.title;
  wrap.appendChild(title);

  if (cfg.subtitle) {
    const sub = document.createElement("p");
    sub.className = "graph-subtitle";
    sub.textContent = cfg.subtitle;
    Object.assign(sub.style, {
      margin: "0 0 48px",
    });
    wrap.appendChild(sub);
  }

  /* canvas */
  const canvas = document.createElement("canvas");
  canvas.height = 440;
  wrap.appendChild(canvas);

  /* ─── OPTIONAL NOTE/FOOTER ────────────────────────── */
  if (cfg.note) {
    // <= new field
    const note = document.createElement("p");
    note.textContent = cfg.note;
    Object.assign(note.style, {
      marginTop: "16px",
      fontSize: "12px",
      lineHeight: "1.4",
      color: "#000",
    });
    wrap.appendChild(note);
  }

  /* datasets with styling */
  let ds;
  /* ──────────────────────────────────────────────────────────────────
   * 3-A  DATASET MAPPING  (keeps caller’s own settings)
   * ────────────────────────────────────────────────────────────────── */
  if (isBox) {
    /* ── BOX-PLOT DATASETS ───────────────────────────────────────── */
    ds = cfg.datasets.map((d) => ({
      /* keep everything the caller supplied */
      ...d,

      /* add defaults only when the field is still missing */
      borderColor: d.borderColor ?? d.color ?? PAL.accent,
      backgroundColor: d.backgroundColor ?? d.color ?? PAL.accent,
      pointBackgroundColor: d.pointBackgroundColor ?? d.color ?? PAL.accent,

      outlierRadius: d.outlierRadius ?? 0,
      itemRadius: d.itemRadius ?? 0,
      hidden: false,
    }));
  } else {
    /* ── LINE / BAR DATASETS ─────────────────────────────────────── */
    ds = cfg.datasets.map((d) => {
      const o = { ...d }; // 1) copy everything first

      /* 2) add defaults only when property is absent --------------- */
      if (o.borderColor === undefined) o.borderColor = d.color ?? PAL.accent;
      if (o.backgroundColor === undefined)
        o.backgroundColor = d.color ?? PAL.accent;
      if (o.hoverBackgroundColor === undefined)
        o.hoverBackgroundColor = o.backgroundColor;
      if (o.hoverBorderColor === undefined) o.hoverBorderColor = o.borderColor;
      if (o.pointBackgroundColor === undefined)
        o.pointBackgroundColor = d.color ?? PAL.accent;
      if (o.pointRadius === undefined) o.pointRadius = isBar ? 0 : 5;
      if (o.pointHoverRadius === undefined) o.pointHoverRadius = isBar ? 0 : 7;
      if (o.tension === undefined) o.tension = isBar ? 0 : 0.0;
      if (o.fill === undefined) o.fill = isBar; // ← DO NOT overwrite if present

      o.type = cfg.type; // always set correct type
      return o;
    });
  }

  /* legend rule */
  const showLegend = cfg.showLegend ?? (isBar || isBox);

  new Chart(canvas.getContext("2d"), {
    type: isBox ? "boxplot" : cfg.type,
    plugins: [ChartDataLabels],
    data: { labels: cfg.labels, datasets: ds },
    options: {
      layout: { padding: { right: 12 } },
      plugins: {
        legend: {
          display: showLegend,
          position: "bottom",
          labels: { font: { family: FONT_FAM, size: 12 }, boxWidth: 16 },
        },
        datalabels: {
          display(ctx) {
            /* don’t draw labels on box-plots (your old rule) */
            if (isBox) return false;

            /* extra rule for the two PWA charts */
            if (isPWAChart) {
              const v =
                ctx.raw ?? ctx.parsed ?? ctx.dataset.data[ctx.dataIndex];
              return v != null && v !== 0; // show only when the value is > 0
            }

            /* every other chart keeps its labels */
            return true;
          },
          anchor: (ctx) => (isBar ? "center" : "end"),
          align: (ctx) => (isBar ? "center" : "top"),
          offset: 20,
          color: (ctx) => {
            if (isBar) {
              // numeric value of the current bar
              const v =
                ctx.raw ?? ctx.parsed ?? ctx.dataset.data[ctx.dataIndex];

              // 0-percent → black    everything else → white
              return v === 0 ? "#000" : "#FFF";
            }

            // line / other charts keep the old rule
            const c = ctx.dataset.borderColor || ctx.dataset.backgroundColor;
            return (Array.isArray(c) ? c[ctx.dataIndex] : c) || "#000";
          },
          font: { family: FONT_FAM, weight: "600", size: 12 },
          formatter(v) {
            /* suppress the text for a 0-value on PWA charts (safety net) */
            if (isPWAChart && (v == null || v === 0)) return "";
            return cfg.y.fmt(v); // e.g. “35.0 %”
          },
        },
        tooltip: {
          backgroundColor: PAL.brand,
          callbacks: {
            label: (c) =>
              isBox ? boxTooltip(c.parsed) : cfg.y.fmt(c.parsed.y),
          },
        },
      },
      scales: {
        x: {
          stacked: barStacked,
          grid: { display: false, drawBorder: false, color: "rgba(0,0,0,0)" },
          border: { color: "rgba(0,0,0,0)" },
          ticks: { color: "#000", font: { family: FONT_FAM } },
        },
        y: {
          stacked: barStacked,
          min: Math.min(...cfg.y.ticks),
          max: Math.max(...cfg.y.ticks),
          afterBuildTicks: (axis) => {
            axis.ticks = cfg.y.ticks.map((v) => ({ value: v }));
          },
          ticks: {
            callback: (v) => cfg.y.fmt(v),
            color: "#000",
            font: { family: FONT_FAM },
          },
          grid: { drawBorder: false },
        },
      },
    },
  });

  /* custom tooltip for boxplot so it shows Low/Median/High (or min/med/max) */
  function boxTooltip(parsed) {
    if (!parsed || typeof parsed.min === "undefined") return "";
    // If it's a single-line point, min==median==max
    if (parsed.min === parsed.max) {
      return "Median: " + cfg.y.fmt(parsed.min);
    }
    // Otherwise, typical box
    // parsed = { min, q1, median, q3, max }
    return (
      "Low: " +
      cfg.y.fmt(parsed.min) +
      " | Median: " +
      cfg.y.fmt(parsed.median) +
      " | High: " +
      cfg.y.fmt(parsed.max)
    );
  }
}

/* ───────────────────────────── 4. RENDER SECTIONS ───────────────────────────── */
sections.forEach((sec) => {
  const grid = makeSection(sec.title);
  sec.charts.forEach((c) => buildChart(grid, c));
});
