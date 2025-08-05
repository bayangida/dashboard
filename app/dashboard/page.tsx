"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Users, Tractor, Truck, CreditCard, Package, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalUsers: number
  totalFarmers: number
  totalDrivers: number
  pendingTransactions: number
  pendingProduce: number
  pendingPayouts: number
  monthlyRevenue: number
  weeklyGrowth: number
}

const monthlyData = [
  { month: "Jan", users: 120, farmers: 45, drivers: 12, revenue: 45000 },
  { month: "Feb", users: 180, farmers: 62, drivers: 18, revenue: 52000 },
  { month: "Mar", users: 240, farmers: 78, drivers: 25, revenue: 61000 },
  { month: "Apr", users: 320, farmers: 95, drivers: 32, revenue: 74000 },
  { month: "May", users: 450, farmers: 125, drivers: 45, revenue: 89000 },
  { month: "Jun", users: 580, farmers: 156, drivers: 58, revenue: 105000 },
]

const transactionData = [
  { name: "Completed", value: 65, color: "#B0FF66" },
  { name: "Processing", value: 25, color: "#042E22" },
  { name: "Pending", value: 10, color: "#6B7280" },
]

const revenueData = [
  { day: "Mon", revenue: 12000 },
  { day: "Tue", revenue: 15000 },
  { day: "Wed", revenue: 18000 },
  { day: "Thu", revenue: 14000 },
  { day: "Fri", revenue: 22000 },
  { day: "Sat", revenue: 25000 },
  { day: "Sun", revenue: 19000 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFarmers: 0,
    totalDrivers: 0,
    pendingTransactions: 0,
    pendingProduce: 0,
    pendingPayouts: 0,
    monthlyRevenue: 0,
    weeklyGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count
        const usersQuery = query(collection(db, "users"))
        const usersSnapshot = await getCountFromServer(usersQuery)
        const totalUsers = usersSnapshot.data().count

        // Fetch farmers count (users with userType = 'farmer')
        const farmersQuery = query(collection(db, "users"), where("userType", "==", "farmer"))
        const farmersSnapshot = await getCountFromServer(farmersQuery)
        const totalFarmers = farmersSnapshot.data().count

        // Fetch drivers count (users with userType = 'driver')
        const driversQuery = query(collection(db, "users"), where("userType", "==", "driver"))
        const driversSnapshot = await getCountFromServer(driversQuery)
        const totalDrivers = driversSnapshot.data().count

        // Fetch pending transactions (example - you'll need to adjust based on your data structure)
        const pendingTransactionsQuery = query(collection(db, "transactions"), where("status", "==", "pending"))
        const pendingTransactionsSnapshot = await getCountFromServer(pendingTransactionsQuery)
        const pendingTransactions = pendingTransactionsSnapshot.data().count

        // Fetch pending produce (example - adjust based on your data)
        const pendingProduceQuery = query(collection(db, "produce"), where("status", "==", "pending"))
        const pendingProduceSnapshot = await getCountFromServer(pendingProduceQuery)
        const pendingProduce = pendingProduceSnapshot.data().count

        // Fetch pending payouts (example - adjust based on your data)
        const pendingPayoutsQuery = query(collection(db, "payouts"), where("status", "==", "pending"))
        const pendingPayoutsSnapshot = await getCountFromServer(pendingPayoutsQuery)
        const pendingPayouts = pendingPayoutsSnapshot.data().count

        // Calculate growth percentage (example logic)
        const lastMonthUsers = 1100 // You would fetch this from historical data
        const weeklyGrowth = ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100

        setStats({
          totalUsers,
          totalFarmers,
          totalDrivers,
          pendingTransactions,
          pendingProduce,
          pendingPayouts,
          monthlyRevenue: 105000, // You would calculate this from transactions
          weeklyGrowth,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth.toFixed(1)}% from last month`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      trend: stats.weeklyGrowth >= 0 ? "up" : "down",
      change: `${stats.weeklyGrowth >= 0 ? '+' : ''}${stats.weeklyGrowth.toFixed(1)}%`,
    },
    {
      title: "Active Farmers",
      value: stats.totalFarmers,
      description: "+8% from last month", // You would calculate this like weeklyGrowth
      icon: Tractor,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      trend: "up",
      change: "+8%",
    },
    {
      title: "Active Drivers",
      value: stats.totalDrivers,
      description: "+15% from last month", // You would calculate this like weeklyGrowth
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      trend: "up",
      change: "+15%",
    },
    {
      title: "Monthly Revenue",
      value: `₦${stats.monthlyRevenue.toLocaleString()}`,
      description: "+18% from last month", // You would calculate this like weeklyGrowth
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      trend: "up",
      change: "+18%",
    },
    {
      title: "Pending Orders",
      value: stats.pendingTransactions,
      description: "Awaiting processing",
      icon: CreditCard,
      color: "from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600",
      trend: "neutral",
      change: `${stats.pendingTransactions} orders`,
    },
    {
      title: "Pending Approvals",
      value: stats.pendingProduce + stats.pendingPayouts,
      description: "Require attention",
      icon: Package,
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
      trend: "neutral",
      change: `${stats.pendingProduce + stats.pendingPayouts} items`,
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Dashboard Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Bayangida Admin
          </h1>
          <p className="text-muted-foreground">Manage your agricultural platform operations and monitor key metrics.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold mb-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    typeof card.value === 'number' ? card.value.toLocaleString() : card.value
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span
                    className={`font-medium ${card.trend === "up" ? "text-green-600" : card.trend === "down" ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">{card.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                User Growth Trends
              </CardTitle>
              <CardDescription>Monthly user acquisition across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: "Users", color: "#3B82F6" },
                  farmers: { label: "Farmers", color: "#B0FF66" },
                  drivers: { label: "Drivers", color: "#F59E0B" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B0FF66" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#B0FF66" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="farmers"
                      stroke="#B0FF66"
                      fillOpacity={1}
                      fill="url(#colorFarmers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Transaction Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                Transaction Status
              </CardTitle>
              <CardDescription>Current distribution of transaction statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: { label: "Completed", color: "#B0FF66" },
                  processing: { label: "Processing", color: "#042E22" },
                  pending: { label: "Pending", color: "#6B7280" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {transactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <DollarSign className="h-4 w-4" />
              </div>
              Weekly Revenue Trends
            </CardTitle>
            <CardDescription>Daily revenue for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue (₦)", color: "#8B5CF6" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Review Users</p>
                    <p className="text-sm text-muted-foreground">Manage signups</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Approve Produce</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingProduce} pending</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Process Orders</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingTransactions} waiting</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Handle Payouts</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingPayouts} requests</p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}