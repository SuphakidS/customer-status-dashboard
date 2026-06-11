import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Search,
  ShieldAlert,
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
import { mockCustomers } from "./data/mockCustomers";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Credit Hold": "bg-amber-50 text-amber-800 ring-amber-200",
  Suspended: "bg-rose-50 text-rose-700 ring-rose-200"
};

const riskStyles = {
  Low: "bg-teal-50 text-teal-700 ring-teal-200",
  Medium: "bg-sky-50 text-sky-700 ring-sky-200",
  High: "bg-red-50 text-red-700 ring-red-200"
};

const chartColors = {
  Active: "#059669",
  "Credit Hold": "#d97706",
  Suspended: "#dc2626",
  Low: "#0f766e",
  Medium: "#0284c7",
  High: "#dc2626"
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[value]}`}
    >
      {value}
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, tone }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${tone}`}>
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

  // Beginner note: derived data is calculated from mockCustomers instead of being typed twice.
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
    <main className="min-h-screen bg-[#eef3f8] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                Marketing & Supervisor View
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
                Customer Status Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Prototype dashboard for monitoring customer health, credit usage,
                payment status, and risk level in one clear overview.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-500">Last updated</p>
              <p className="mt-1 font-semibold text-slate-900">11 Jun 2026, 10:00</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Customers"
            value={mockCustomers.length}
            icon={Users}
            tone="bg-cyan-50 text-cyan-700"
          />
          <KpiCard
            title="Active Customers"
            value={mockCustomers.filter((customer) => customer.status === "Active").length}
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-700"
          />
          <KpiCard
            title="Outstanding Balance"
            value={formatCurrency(totalOutstanding)}
            icon={CircleDollarSign}
            tone="bg-indigo-50 text-indigo-700"
          />
          <KpiCard
            title="High Risk Customers"
            value={mockCustomers.filter((customer) => customer.riskLevel === "High").length}
            icon={ShieldAlert}
            tone="bg-red-50 text-red-700"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search customer code or name"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Credit Hold">Credit Hold</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="All">All risk levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer Code</th>
                    <th className="px-4 py-3 font-semibold">Customer Name</th>
                    <th className="px-4 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Marketing Owner</th>
                    <th className="px-4 py-3 font-semibold text-right">Outstanding</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Last Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.customerCode}
                      onClick={() => setSelectedCustomerCode(customer.customerCode)}
                      className={`cursor-pointer transition hover:bg-cyan-50/60 ${
                        selectedCustomer.customerCode === customer.customerCode
                          ? "bg-cyan-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {customer.customerCode}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{customer.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{customer.customerGroup}</td>
                      <td className="px-4 py-3">
                        <Badge value={customer.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.marketingOwner}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(customer.outstandingBalance)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{customer.paymentStatus}</td>
                      <td className="px-4 py-3">
                        <Badge value={customer.riskLevel} type="risk" />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {customer.lastTransactionDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No customers match the current filters.
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-700">Selected Customer</p>
                <h2 className="mt-1 text-xl font-bold tracking-normal text-slate-950">
                  {selectedCustomer.customerName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCustomer.customerCode} · {selectedCustomer.customerGroup}
                </p>
              </div>
              <Badge value={selectedCustomer.status} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Credit Limit" value={formatCurrency(selectedCustomer.creditLimit)} />
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

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Remark
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedCustomer.remark}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Customers by Status" icon={Banknote}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusChartData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={chartColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Customers by Risk Level" icon={ShieldAlert}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={riskChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                  label
                >
                  {riskChartData.map((entry) => (
                    <Cell key={entry.name} fill={chartColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3">
              {riskChartData.map((entry) => (
                <span key={entry.name} className="flex items-center gap-2 text-sm text-slate-600">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chartColors[entry.name] }}
                  />
                  {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </ChartCard>
        </section>
      </div>
    </main>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold tracking-normal text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default App;
