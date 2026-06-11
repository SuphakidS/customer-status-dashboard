import { useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Package,
  Plane,
  Search,
  Settings,
  ShieldAlert,
  Ticket,
  UserRound,
  Users
} from "lucide-react";
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

const mockBookings = [
  {
    pnr: "A8K2LD",
    routing: "BKK - SIN",
    departureDate: "2026-06-18",
    status: "Confirmed"
  },
  {
    pnr: "Q7N4PX",
    routing: "BKK - HND",
    departureDate: "2026-06-21",
    status: "Ticketed"
  },
  {
    pnr: "J2V9SM",
    routing: "CNX - BKK",
    departureDate: "2026-06-24",
    status: "Cancelled"
  },
  {
    pnr: "M5T1RA",
    routing: "BKK - ICN",
    departureDate: "2026-06-28",
    status: "Ticketed"
  },
  {
    pnr: "Z3P8UC",
    routing: "HKT - BKK",
    departureDate: "2026-07-02",
    status: "Refunded"
  },
  {
    pnr: "L9B6HY",
    routing: "BKK - DPS",
    departureDate: "2026-07-06",
    status: "Confirmed"
  }
];

const mockInvoices = [
  {
    invoiceNo: "INV-2026-031",
    date: "2026-06-10",
    amount: 1680000,
    status: "Issued"
  },
  {
    invoiceNo: "INV-2026-030",
    date: "2026-06-08",
    amount: 560000,
    status: "Paid"
  },
  {
    invoiceNo: "INV-2026-029",
    date: "2026-06-05",
    amount: 970000,
    status: "Overdue"
  },
  {
    invoiceNo: "INV-2026-028",
    date: "2026-06-03",
    amount: 435000,
    status: "Paid"
  },
  {
    invoiceNo: "INV-2026-027",
    date: "2026-05-30",
    amount: 260000,
    status: "Cancelled"
  }
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Bookings", icon: Plane },
  { label: "Packages", icon: Package },
  { label: "Customers", icon: Users },
  { label: "Invoices", icon: FileText },
  { label: "Analytics", icon: Gauge },
  { label: "Settings", icon: Settings }
];

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Credit Hold": "bg-red-50 text-red-700 ring-red-200",
  Suspended: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-red-50 text-red-700 ring-red-200",
  High: "bg-rose-50 text-rose-700 ring-rose-200",
  Confirmed: "bg-red-50 text-red-700 ring-red-200",
  Ticketed: "bg-zinc-900 text-white ring-zinc-900",
  Cancelled: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  Refunded: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  Issued: "bg-red-50 text-red-700 ring-red-200",
  Paid: "bg-zinc-900 text-white ring-zinc-900",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-200"
};

const chartColors = {
  Active: "#e70f25",
  "Credit Hold": "#111827",
  Suspended: "#d1d5db",
  Low: "#e70f25",
  Medium: "#111827",
  High: "#9f1239"
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

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerCode, setSelectedCustomerCode] = useState(
    mockCustomers[0].customerCode
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mockCustomers.filter((customer) => {
      return (
        customer.customerCode.toLowerCase().includes(normalizedSearch) ||
        customer.customerName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm]);

  const selectedCustomer =
    mockCustomers.find((customer) => customer.customerCode === selectedCustomerCode) ||
    filteredCustomers[0] ||
    mockCustomers[0];

  const totalOutstanding = mockCustomers.reduce(
    (total, customer) => total + customer.outstandingBalance,
    0
  );

  const activeCustomers = mockCustomers.filter(
    (customer) => customer.status === "Active"
  ).length;
  const highRiskCustomers = mockCustomers.filter(
    (customer) => customer.riskLevel === "High"
  ).length;
  const ticketedBookings = mockBookings.filter(
    (booking) => booking.status === "Ticketed"
  ).length;
  const paidInvoices = mockInvoices.filter((invoice) => invoice.status === "Paid").length;

  const statusChartData = countByField(mockCustomers, "status");
  const riskChartData = countByField(mockCustomers, "riskLevel");

  const statusBarData = {
    labels: statusChartData.map((entry) => entry.name),
    datasets: [
      {
        label: "Customers",
        data: statusChartData.map((entry) => entry.value),
        backgroundColor: statusChartData.map((entry) => chartColors[entry.name]),
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 44
      }
    ]
  };

  const riskDoughnutData = {
    labels: riskChartData.map((entry) => entry.name),
    datasets: [
      {
        data: riskChartData.map((entry) => entry.value),
        backgroundColor: riskChartData.map((entry) => chartColors[entry.name]),
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 8,
        cutout: "66%"
      }
    ]
  };

  return (
    <main className="dashboard-bg min-h-screen overflow-x-hidden px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="app-shell mx-auto grid max-w-[1500px] grid-cols-1 overflow-hidden lg:grid-cols-[230px_minmax(0,1fr)]">
        <Sidebar />

        <section className="dashboard-surface min-w-0 p-5 md:p-7">
          <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
            <section className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Total Customers"
                value={mockCustomers.length}
                change="+3.3%"
                icon={Users}
              />
              <MetricCard
                title="Outstanding Balance"
                value={formatCurrency(totalOutstanding)}
                change="+6.1%"
                icon={CircleDollarSign}
              />
              <MetricCard
                title="Ticketed Bookings"
                value={ticketedBookings}
                change="+2.1%"
                icon={Ticket}
                featured
              />
              <MetricCard
                title="Paid Invoices"
                value={`${paidInvoices}/5`}
                change="+3.2%"
                icon={CreditCard}
              />
            </section>

            <section className="dashboard-card grid min-h-[220px] grid-cols-[110px_minmax(0,1fr)] gap-4 p-5">
              <div>
                <p className="text-lg font-bold text-zinc-950">Customer Pulse</p>
                <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
                  {activeCustomers}
                </div>
                <p className="mt-5 text-4xl font-bold text-zinc-950">
                  {highRiskCustomers}
                </p>
                <p className="text-sm text-zinc-500">High risk accounts</p>
              </div>
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-zinc-950 via-red-950 to-red-600 p-5 text-white">
                <p className="text-sm text-white/70">Today</p>
                <h2 className="mt-1 text-xl font-bold">{selectedCustomer.customerName}</h2>
                <p className="mt-1 text-sm text-white/70">
                  {selectedCustomer.customerCode} - {selectedCustomer.customerGroup}
                </p>
                <div className="absolute -bottom-8 -right-5 h-32 w-32 rounded-full bg-white/12" />
                <Plane className="absolute bottom-7 right-8 h-16 w-16 rotate-12 text-white/82" />
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
            <BookingStatusCard bookings={mockBookings} />
            <InvoiceCard invoices={mockInvoices} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
            <CustomerSummaryCard
              customers={filteredCustomers}
              selectedCustomer={selectedCustomer}
              onSelect={setSelectedCustomerCode}
            />
            <InsightsCard />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Customer Status Overview">
              <div className="h-[220px]">
                <Bar data={statusBarData} options={barChartOptions} />
              </div>
            </ChartCard>
            <ChartCard title="Team Performance Metrics">
              <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_190px]">
                <div className="h-[220px]">
                  <Doughnut data={riskDoughnutData} options={doughnutChartOptions} />
                </div>
                <div className="space-y-3">
                  {riskChartData.map((entry) => (
                    <MetricLegend key={entry.name} entry={entry} />
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar-shell hidden min-h-[760px] flex-col justify-between p-5 lg:flex">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/25">
            <Plane className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-zinc-950">Dashboard</span>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ label, icon: Icon }, index) => (
            <button
              key={label}
              className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                index === 0
                  ? "bg-red-50 text-red-600"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-red-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-3xl bg-zinc-950 p-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-9 w-9 rounded-2xl bg-white/10 p-2 text-red-100" />
          <div>
            <p className="text-lg font-bold">11 Jun</p>
            <p className="text-xs text-white/62">Updated 10:00</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-red-600">&raquo;</span>
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-zinc-950">
            Customer Status Dashboard
          </h1>
          <p className="text-sm text-zinc-500">Marketing & Supervisor View</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block min-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search customers, bookings, and invoices"
            className="glass-input h-11 w-full pl-10 pr-3"
          />
        </label>
        <button className="relative grid h-11 w-11 place-items-center rounded-full border border-zinc-100 bg-white text-zinc-700 shadow-sm">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600" />
        </button>
        <div className="flex items-center gap-3 rounded-full border border-zinc-100 bg-white py-1 pl-1 pr-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-red-600 to-red-500 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-950">Steven</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ title, value, change, icon: Icon, featured = false }) {
  return (
    <section
      className={`dashboard-card min-h-[126px] p-5 ${
        featured ? "featured-card text-white" : "text-zinc-950"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-bold ${featured ? "text-white" : "text-red-600"}`}
          >
            ↗ {change}
          </p>
          <p className="mt-5 text-3xl font-bold">{value}</p>
          <p className={`mt-1 text-sm ${featured ? "text-white/82" : "text-zinc-500"}`}>
            {title}
          </p>
        </div>
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl ${
            featured ? "bg-white/16 text-white" : "bg-red-50 text-red-600"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
}

function BookingStatusCard({ bookings }) {
  return (
    <DataListCard title="Booking Status" action="See Details">
      <div className="space-y-2">
        {bookings.map((booking) => (
          <div
            key={booking.pnr}
            className="grid grid-cols-[82px_minmax(0,1fr)_112px] items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3"
          >
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-400">PNR</p>
              <p className="font-bold text-zinc-950">{booking.pnr}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-800">{booking.routing}</p>
              <p className="text-xs text-zinc-500">{booking.departureDate}</p>
            </div>
            <StatusPill status={booking.status} />
          </div>
        ))}
      </div>
    </DataListCard>
  );
}

function InvoiceCard({ invoices }) {
  return (
    <DataListCard title="Latest Invoices" action="See all">
      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div
            key={invoice.invoiceNo}
            className="grid grid-cols-[minmax(0,1fr)_96px_116px] items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3"
          >
            <div>
              <p className="font-bold text-zinc-950">{invoice.invoiceNo}</p>
              <p className="text-xs text-zinc-500">{invoice.date}</p>
            </div>
            <p className="text-right font-semibold text-zinc-800">
              {formatCurrency(invoice.amount)}
            </p>
            <StatusPill status={invoice.status} />
          </div>
        ))}
      </div>
    </DataListCard>
  );
}

function CustomerSummaryCard({ customers, selectedCustomer, onSelect }) {
  return (
    <DataListCard title="Customer Snapshot" action="View Customers">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2">
          {customers.slice(0, 5).map((customer) => (
            <button
              key={customer.customerCode}
              onClick={() => onSelect(customer.customerCode)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                selectedCustomer.customerCode === customer.customerCode
                  ? "bg-red-50"
                  : "bg-zinc-50 hover:bg-red-50/70"
              }`}
            >
              <div>
                <p className="font-bold text-zinc-950">{customer.customerName}</p>
                <p className="text-xs text-zinc-500">
                  {customer.customerCode} - {customer.marketingOwner}
                </p>
              </div>
              <StatusPill status={customer.status} />
            </button>
          ))}
        </div>
        <div className="rounded-[26px] bg-zinc-950 p-4 text-white">
          <p className="text-sm text-white/60">Selected Customer</p>
          <h3 className="mt-2 text-xl font-bold">{selectedCustomer.customerName}</h3>
          <div className="mt-4 space-y-3 text-sm">
            <DetailLine label="Credit Limit" value={formatCurrency(selectedCustomer.creditLimit)} />
            <DetailLine
              label="Available"
              value={formatCurrency(selectedCustomer.availableCredit)}
            />
            <DetailLine
              label="Outstanding"
              value={formatCurrency(selectedCustomer.outstandingBalance)}
            />
            <DetailLine label="Risk" value={selectedCustomer.riskLevel} />
          </div>
        </div>
      </div>
    </DataListCard>
  );
}

function InsightsCard() {
  const insights = [
    {
      icon: Plane,
      title: "Booking Growth",
      text: "Ticketed bookings remain stable across active corporate accounts."
    },
    {
      icon: MapPin,
      title: "Route Demand",
      text: "BKK regional routes show higher upcoming departure volume."
    },
    {
      icon: ShieldAlert,
      title: "Risk Attention",
      text: "High-risk customers should be reviewed before new credit approval."
    }
  ];

  return (
    <DataListCard title="AI Insights" action="See Details">
      <div className="space-y-3">
        {insights.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 rounded-2xl bg-zinc-50 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-red-600">{title}</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </DataListCard>
  );
}

function DataListCard({ title, action, children }) {
  return (
    <section className="dashboard-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-normal text-zinc-950">{title}</h2>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
          {action}
        </span>
      </div>
      {children}
    </section>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="dashboard-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-normal text-zinc-950">{title}</h2>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
          See Details
        </span>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className={`justify-self-end rounded-full px-3 py-1 text-center text-xs font-bold ring-1 ${
        statusStyles[status] || "bg-zinc-100 text-zinc-700 ring-zinc-200"
      }`}
    >
      {status}
    </span>
  );
}

function MetricLegend({ entry }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm text-zinc-600">
      <span className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: chartColors[entry.name] }}
        />
        {entry.name}
      </span>
      <strong className="text-zinc-950">{entry.value}</strong>
    </div>
  );
}

function DetailLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
      <span className="text-white/58">{label}</span>
      <strong className="text-right text-white">{value}</strong>
    </div>
  );
}

const chartTextColor = "rgba(63, 63, 70, 0.72)";
const chartGridColor = "rgba(228, 228, 231, 0.9)";

const tooltipOptions = {
  backgroundColor: "rgba(24, 24, 27, 0.92)",
  borderColor: "rgba(255, 255, 255, 0.9)",
  borderWidth: 1,
  cornerRadius: 14,
  titleColor: "#fff",
  bodyColor: "#fff",
  padding: 12
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: tooltipOptions
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
    tooltip: tooltipOptions
  }
};

export default App;
