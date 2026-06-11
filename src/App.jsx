import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  LayoutDashboard,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  UserRound,
  Users
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { mockCustomers } from "./data/mockCustomers";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

const statusStyles = {
  Active: "border-emerald-300 bg-emerald-50 text-emerald-700",
  "Credit Hold": "border-amber-300 bg-amber-50 text-amber-700",
  Suspended: "border-rose-300 bg-rose-50 text-rose-700"
};

const riskStyles = {
  Low: "border-teal-300 bg-teal-50 text-teal-700",
  Medium: "border-sky-300 bg-sky-50 text-sky-700",
  High: "border-red-300 bg-red-50 text-red-700"
};

const chartColors = {
  Active: "#0ea5a3",
  "Credit Hold": "#f59e0b",
  Suspended: "#ef4444",
  Low: "#14b8a6",
  Medium: "#0284c7",
  High: "#ef4444"
};

const kpiTones = {
  cyan: "from-cyan-500 to-sky-400 text-white shadow-cyan-500/20",
  green: "from-teal-500 to-emerald-400 text-white shadow-teal-500/20",
  yellow: "from-amber-400 to-orange-400 text-white shadow-amber-500/20",
  red: "from-rose-500 to-red-400 text-white shadow-rose-500/20"
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(value);

const countByField = (customers, field) =>
  Object.entries(
    customers.reduce((summary, customer) => {
      summary[customer[field]] = (summary[customer[field]] || 0) + 1;
      return summary;
    }, {})
  ).map(([name, value]) => ({ name, value }));

function Badge({ value, type }) {
  const styles = type === "risk" ? riskStyles : statusStyles;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${styles[value]}`}
    >
      {value}
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, tone }) {
  return (
    <section className="glass-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sky-800/65">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-sky-950">{value}</p>
        </div>
        <div className={`rounded-full bg-gradient-to-br p-3 shadow-lg ${kpiTones[tone]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedCustomerCode, setSelectedCustomerCode] = useState(
    mockCustomers[0].customerCode
  );

  // Beginner note: filter values live in state, then this derived list updates from mock data.
  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mockCustomers.filter((customer) => {
      const matchesSearch =
        customer.customerCode.toLowerCase().includes(normalizedSearch) ||
        customer.customerName.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;
      const matchesRisk = riskFilter === "All" || customer.riskLevel === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [searchTerm, statusFilter, riskFilter]);

  const selectedCustomer =
    mockCustomers.find((customer) => customer.customerCode === selectedCustomerCode) ||
    filteredCustomers[0] ||
    mockCustomers[0];

  const totalOutstanding = mockCustomers.reduce(
    (total, customer) => total + customer.outstandingBalance,
    0
  );

  const statusChartData = countByField(mockCustomers, "status");
  const riskChartData = countByField(mockCustomers, "riskLevel");

  const statusBarData = {
    labels: statusChartData.map((entry) => entry.name),
    datasets: [
      {
        label: "Customers",
        data: statusChartData.map((entry) => entry.value),
        backgroundColor: statusChartData.map((entry) => chartColors[entry.name]),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 64
      }
    ]
  };

  const riskDoughnutData = {
    labels: riskChartData.map((entry) => entry.name),
    datasets: [
      {
        data: riskChartData.map((entry) => entry.value),
        backgroundColor: riskChartData.map((entry) => chartColors[entry.name]),
        borderColor: "rgba(255, 255, 255, 0.82)",
        borderWidth: 2,
        hoverOffset: 8,
        cutout: "64%"
      }
    ]
  };

  return (
    <main
      className="dashboard-bg min-h-screen overflow-x-hidden px-4 py-6 text-sky-950 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1500px] gap-5">
        <nav className="glass-nav hidden shrink-0 flex-col items-center gap-5 px-3 py-5 lg:flex">
          {[LayoutDashboard, Gauge, Users, SlidersHorizontal, ShieldAlert].map(
            (Icon, index) => (
              <button
                key={index}
                className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                  index === 0
                    ? "border-sky-300 bg-white/65 text-sky-700 shadow-lg"
                    : "border-sky-200/60 bg-white/35 text-sky-700/72 hover:bg-white/60"
                }`}
                aria-label={`Dashboard navigation ${index + 1}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          )}
        </nav>

        <div className="glass-shell min-w-0 flex-1 p-5 md:p-7">
          <header className="flex flex-col gap-5 border-b border-sky-200/60 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Marketing & Supervisor View
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-normal text-sky-950 md:text-5xl">
                Customer Status Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-sky-900/68">
                Prototype dashboard for monitoring customer health, credit usage,
                payment status, and risk level in one clear overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-sky-200/70 bg-white/50 p-3 text-sky-700 sm:grid">
                <Bell className="h-5 w-5" />
              </div>
              <div className="rounded-full border border-sky-200/70 bg-white/45 p-1">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-400 text-white">
                  <UserRound className="h-6 w-6" />
                </div>
              </div>
            </div>
          </header>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Customers"
              value={mockCustomers.length}
              icon={Users}
              tone="cyan"
            />
            <KpiCard
              title="Active Customers"
              value={mockCustomers.filter((customer) => customer.status === "Active").length}
              icon={CheckCircle2}
              tone="green"
            />
            <KpiCard
              title="Outstanding Balance"
              value={formatCurrency(totalOutstanding)}
              icon={CircleDollarSign}
              tone="yellow"
            />
            <KpiCard
              title="High Risk Customers"
              value={mockCustomers.filter((customer) => customer.riskLevel === "High").length}
              icon={ShieldAlert}
              tone="red"
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="glass-card min-w-0 overflow-hidden">
              <div className="border-b border-sky-200/60 p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-700/45" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search customer code or name"
                      className="glass-input h-11 w-full pl-10 pr-3"
                    />
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="glass-input h-11 px-3"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Credit Hold">Credit Hold</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <select
                    value={riskFilter}
                    onChange={(event) => setRiskFilter(event.target.value)}
                    className="glass-input h-11 px-3"
                  >
                    <option value="All">All risk levels</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-sky-100/55 text-xs uppercase text-sky-800/55">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Customer Code</th>
                      <th className="px-4 py-3 font-semibold">Customer Name</th>
                      <th className="px-4 py-3 font-semibold">Group</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Marketing Owner</th>
                      <th className="px-4 py-3 text-right font-semibold">Outstanding</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Risk</th>
                      <th className="px-4 py-3 font-semibold">Last Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customerCode}
                        onClick={() => setSelectedCustomerCode(customer.customerCode)}
                        className={`cursor-pointer transition hover:bg-sky-100/70 ${
                          selectedCustomer.customerCode === customer.customerCode
                            ? "bg-cyan-100/75"
                            : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-sky-950">
                          {customer.customerCode}
                        </td>
                        <td className="px-4 py-3 text-sky-900/82">
                          {customer.customerName}
                        </td>
                        <td className="px-4 py-3 text-sky-900/62">
                          {customer.customerGroup}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={customer.status} />
                        </td>
                        <td className="px-4 py-3 text-sky-900/62">
                          {customer.marketingOwner}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-sky-950/86">
                          {formatCurrency(customer.outstandingBalance)}
                        </td>
                        <td className="px-4 py-3 text-sky-900/62">
                          {customer.paymentStatus}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={customer.riskLevel} type="risk" />
                        </td>
                        <td className="px-4 py-3 text-sky-900/62">
                          {customer.lastTransactionDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                  <div className="p-8 text-center text-sm text-sky-800/58">
                    No customers match the current filters.
                  </div>
                )}
              </div>
            </div>

            <aside className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-700">
                    Selected Customer
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-normal text-sky-950">
                    {selectedCustomer.customerName}
                  </h2>
                  <p className="mt-1 text-sm text-sky-800/55">
                    {selectedCustomer.customerCode} - {selectedCustomer.customerGroup}
                  </p>
                </div>
                <Badge value={selectedCustomer.status} />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <DetailItem
                  label="Credit Limit"
                  value={formatCurrency(selectedCustomer.creditLimit)}
                />
                <DetailItem
                  label="Available Credit"
                  value={formatCurrency(selectedCustomer.availableCredit)}
                />
                <DetailItem
                  label="Outstanding"
                  value={formatCurrency(selectedCustomer.outstandingBalance)}
                />
                <DetailItem
                  label="Monthly Usage"
                  value={formatCurrency(selectedCustomer.monthlyUsage)}
                />
                <DetailItem label="Payment Status" value={selectedCustomer.paymentStatus} />
                <DetailItem
                  label="Risk Level"
                  value={<Badge value={selectedCustomer.riskLevel} type="risk" />}
                />
                <DetailItem label="Marketing Owner" value={selectedCustomer.marketingOwner} />
                <DetailItem label="Supervisor" value={selectedCustomer.supervisor} />
              </dl>

              <div className="mt-5 rounded-2xl border border-sky-200/60 bg-white/45 p-4 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-semibold text-sky-950">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Remark
                </div>
                <p className="mt-2 text-sm leading-6 text-sky-900/66">
                  {selectedCustomer.remark}
                </p>
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <ChartCard title="Customers by Status" icon={Gauge}>
              <div className="h-[260px]">
                <Bar data={statusBarData} options={barChartOptions} />
              </div>
            </ChartCard>

            <ChartCard title="Customers by Risk Level" icon={ShieldAlert}>
              <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <div className="h-[260px]">
                  <Doughnut data={riskDoughnutData} options={doughnutChartOptions} />
                </div>
                <div className="space-y-4">
                  {riskChartData.map((entry) => (
                    <span
                      key={entry.name}
                      className="flex items-center justify-between gap-3 border-b border-sky-200/70 pb-3 text-sm text-sky-900/70"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: chartColors[entry.name] }}
                        />
                        {entry.name}
                      </span>
                      <strong className="text-sky-950">{entry.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </ChartCard>
          </section>
        </div>
      </div>
    </main>
  );
}

const chartTextColor = "rgba(12, 74, 110, 0.68)";
const chartGridColor = "rgba(14, 116, 144, 0.14)";

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(8, 47, 73, 0.92)",
      borderColor: "rgba(255, 255, 255, 0.74)",
      borderWidth: 1,
      cornerRadius: 14,
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: chartTextColor }
    },
    y: {
      beginAtZero: true,
      precision: 0,
      grid: { color: chartGridColor },
      ticks: { color: chartTextColor, stepSize: 1 }
    }
  }
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(8, 47, 73, 0.92)",
      borderColor: "rgba(255, 255, 255, 0.74)",
      borderWidth: 1,
      cornerRadius: 14,
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12
    }
  }
};

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-sky-200/60 bg-white/45 p-3 shadow-inner">
      <dt className="text-xs font-semibold uppercase text-sky-800/55">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-sky-950">{value}</dd>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-sky-200/70 bg-white/55 p-2.5 text-cyan-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-normal text-sky-950">{title}</h2>
        </div>
        <span className="text-sm text-sky-800/55">Monthly</span>
      </div>
      {children}
    </section>
  );
}

export default App;
