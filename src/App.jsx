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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import officeBg from "./assets/glass-office-bg.png";
import { mockCustomers } from "./data/mockCustomers";

const statusStyles = {
  Active: "border-emerald-300/40 bg-emerald-300/18 text-emerald-100",
  "Credit Hold": "border-amber-300/40 bg-amber-300/18 text-amber-100",
  Suspended: "border-rose-300/45 bg-rose-300/20 text-rose-100"
};

const riskStyles = {
  Low: "border-teal-300/40 bg-teal-300/18 text-teal-100",
  Medium: "border-sky-300/40 bg-sky-300/18 text-sky-100",
  High: "border-red-300/45 bg-red-300/20 text-red-100"
};

const chartColors = {
  Active: "#b7dc25",
  "Credit Hold": "#f6c50f",
  Suspended: "#f05b5b",
  Low: "#36d49b",
  Medium: "#33b9ef",
  High: "#f05b5b"
};

const kpiTones = {
  cyan: "from-cyan-300/30 to-white/5 text-cyan-100",
  green: "from-lime-300/30 to-white/5 text-lime-100",
  yellow: "from-yellow-300/30 to-white/5 text-yellow-100",
  red: "from-red-300/30 to-white/5 text-red-100"
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
          <p className="text-sm font-medium text-white/62">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-white">{value}</p>
        </div>
        <div className={`rounded-full bg-gradient-to-br p-3 ${kpiTones[tone]}`}>
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

  return (
    <main
      className="dashboard-bg min-h-screen overflow-x-hidden px-4 py-6 text-white sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${officeBg})` }}
    >
      <div className="mx-auto flex max-w-[1500px] gap-5">
        <nav className="glass-nav hidden shrink-0 flex-col items-center gap-5 px-3 py-5 lg:flex">
          {[LayoutDashboard, Gauge, Users, SlidersHorizontal, ShieldAlert].map(
            (Icon, index) => (
              <button
                key={index}
                className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                  index === 0
                    ? "border-white/30 bg-white/22 text-white shadow-lg"
                    : "border-white/12 bg-white/8 text-white/72 hover:bg-white/16"
                }`}
                aria-label={`Dashboard navigation ${index + 1}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          )}
        </nav>

        <div className="glass-shell min-w-0 flex-1 p-5 md:p-7">
          <header className="flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-200/80">
                Marketing & Supervisor View
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-normal text-white md:text-5xl">
                Customer Status Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/68">
                Prototype dashboard for monitoring customer health, credit usage,
                payment status, and risk level in one clear overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-white/12 bg-white/10 p-3 text-white/80 sm:grid">
                <Bell className="h-5 w-5" />
              </div>
              <div className="rounded-full border border-white/16 bg-white/12 p-1">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-cyan-200 text-slate-900">
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
              <div className="border-b border-white/10 p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/46" />
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
                  <thead className="bg-white/8 text-xs uppercase text-white/50">
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
                        className={`cursor-pointer transition hover:bg-white/12 ${
                          selectedCustomer.customerCode === customer.customerCode
                            ? "bg-cyan-300/14"
                            : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {customer.customerCode}
                        </td>
                        <td className="px-4 py-3 text-white/82">
                          {customer.customerName}
                        </td>
                        <td className="px-4 py-3 text-white/62">
                          {customer.customerGroup}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={customer.status} />
                        </td>
                        <td className="px-4 py-3 text-white/62">
                          {customer.marketingOwner}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white/86">
                          {formatCurrency(customer.outstandingBalance)}
                        </td>
                        <td className="px-4 py-3 text-white/62">
                          {customer.paymentStatus}
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={customer.riskLevel} type="risk" />
                        </td>
                        <td className="px-4 py-3 text-white/62">
                          {customer.lastTransactionDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                  <div className="p-8 text-center text-sm text-white/58">
                    No customers match the current filters.
                  </div>
                )}
              </div>
            </div>

            <aside className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-lime-200/85">
                    Selected Customer
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-normal text-white">
                    {selectedCustomer.customerName}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
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

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/9 p-4 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <AlertTriangle className="h-4 w-4 text-yellow-200" />
                  Remark
                </div>
                <p className="mt-2 text-sm leading-6 text-white/66">
                  {selectedCustomer.remark}
                </p>
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <ChartCard title="Customers by Status" icon={Gauge}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statusChartData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="rgba(255,255,255,.62)" />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="rgba(255,255,255,.62)" />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={chartColors[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Customers by Risk Level" icon={ShieldAlert}>
              <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={4}
                      label
                    >
                      {riskChartData.map((entry) => (
                        <Cell key={entry.name} fill={chartColors[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {riskChartData.map((entry) => (
                    <span
                      key={entry.name}
                      className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm text-white/70"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: chartColors[entry.name] }}
                        />
                        {entry.name}
                      </span>
                      <strong className="text-white">{entry.value}</strong>
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

const tooltipStyle = {
  background: "rgba(20, 32, 36, 0.86)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  borderRadius: "14px",
  color: "#fff",
  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.28)"
};

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/9 p-3 shadow-inner">
      <dt className="text-xs font-semibold uppercase text-white/45">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/12 bg-white/12 p-2.5 text-lime-100">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-normal text-white">{title}</h2>
        </div>
        <span className="text-sm text-white/55">Monthly</span>
      </div>
      {children}
    </section>
  );
}

export default App;
