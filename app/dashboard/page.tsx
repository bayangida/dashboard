"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Users, Tractor, Truck, CreditCard, Package, DollarSign, TrendingUp, TrendingDown, Calendar, User, Download } from "lucide-react"
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
import { collection, query, where, getDocs, getCountFromServer, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardStats {
  totalUsers: number
  totalFarmers: number
  totalDrivers: number
  totalConsumers: number
  pendingTransactions: number
  pendingProduce: number
  pendingPayouts: number
  monthlyRevenue: number
  weeklyGrowth: number
  userGrowth: number
  totalDownloads: number
  downloadGrowth: number
}

interface DailySignupData {
  date: string
  fullDate: string
  farmers: number
  drivers: number
  consumers: number
  total: number
}

interface UserData {
  userType: string
  createdAt: Timestamp
}

interface TransactionData {
  status: string
  amount?: number
  createdAt: Timestamp
}

const transactionData = [
  { name: "Completed", value: 65, color: "#B0FF66" },
  { name: "Processing", value: 25, color: "#042E22" },
  { name: "Pending", value: 10, color: "#6B7280" },
]

// Custom Tooltip Component for Daily Downloads
const DailyDownloadsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.fullDate}</p>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip Component for Revenue
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.fullDate}</p>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">₦{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFarmers: 0,
    totalDrivers: 0,
    totalConsumers: 0,
    pendingTransactions: 0,
    pendingProduce: 0,
    pendingPayouts: 0,
    monthlyRevenue: 0,
    weeklyGrowth: 0,
    userGrowth: 0,
    totalDownloads: 0,
    downloadGrowth: 0,
  })
  const [dailySignups, setDailySignups] = useState<DailySignupData[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month">("week")
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users with their data
        const usersQuery = query(collection(db, "users"))
        const usersSnapshot = await getDocs(usersQuery)
        const usersData: UserData[] = usersSnapshot.docs.map(doc => doc.data() as UserData)
        const totalUsers = usersData.length

        // Calculate user type counts
        const totalFarmers = usersData.filter(user => user.userType === "farmer").length
        const totalDrivers = usersData.filter(user => user.userType === "driver").length
        const totalConsumers = usersData.filter(user => user.userType === "user").length

        // Calculate total downloads (sum of all users)
        const totalDownloads = totalUsers

        // Fetch pending transactions
        const pendingTransactionsQuery = query(collection(db, "transactions"), where("status", "==", "pending"))
        const pendingTransactionsSnapshot = await getCountFromServer(pendingTransactionsQuery)
        const pendingTransactions = pendingTransactionsSnapshot.data().count

        // Fetch pending produce
        const pendingProduceQuery = query(collection(db, "produce"), where("status", "==", "pending"))
        const pendingProduceSnapshot = await getCountFromServer(pendingProduceQuery)
        const pendingProduce = pendingProduceSnapshot.data().count

        // Fetch pending payouts
        const pendingPayoutsQuery = query(collection(db, "payouts"), where("status", "==", "pending"))
        const pendingPayoutsSnapshot = await getCountFromServer(pendingPayoutsQuery)
        const pendingPayouts = pendingPayoutsSnapshot.data().count

        // Fetch transactions for revenue calculation
        const transactionsQuery = query(collection(db, "transactions"))
        const transactionsSnapshot = await getDocs(transactionsQuery)
        const transactionsData: TransactionData[] = transactionsSnapshot.docs.map(doc => doc.data() as TransactionData)

        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const monthlyRevenue = transactionsData
          .filter(transaction => 
            transaction.createdAt && 
            transaction.createdAt.toDate() >= thirtyDaysAgo &&
            transaction.amount
          )
          .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

        // Calculate growth percentage for all users (compared to previous period)
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        
        const previousPeriodUsers = usersData.filter(user => 
          user.createdAt && 
          user.createdAt.toDate() >= sixtyDaysAgo &&
          user.createdAt.toDate() < thirtyDaysAgo
        ).length

        const currentPeriodUsers = usersData.filter(user => 
          user.createdAt && 
          user.createdAt.toDate() >= thirtyDaysAgo
        ).length

        const weeklyGrowth = previousPeriodUsers > 0 
          ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
          : currentPeriodUsers > 0 ? 100 : 0

        // Calculate user growth specifically for consumers
        const previousPeriodConsumers = usersData.filter(user => 
          user.createdAt && 
          user.userType === "user" &&
          user.createdAt.toDate() >= sixtyDaysAgo &&
          user.createdAt.toDate() < thirtyDaysAgo
        ).length

        const currentPeriodConsumers = usersData.filter(user => 
          user.createdAt && 
          user.userType === "user" &&
          user.createdAt.toDate() >= thirtyDaysAgo
        ).length

        const userGrowth = previousPeriodConsumers > 0 
          ? ((currentPeriodConsumers - previousPeriodConsumers) / previousPeriodConsumers) * 100 
          : currentPeriodConsumers > 0 ? 100 : 0

        // Calculate download growth (same as total users growth)
        const downloadGrowth = weeklyGrowth

        // Process daily signups data
        const dailyData = processDailySignups(usersData)
        setDailySignups(dailyData)

        // Process weekly data for user growth trends
        const weeklyChartData = processWeeklyData(usersData)
        setWeeklyData(weeklyChartData)

        // Process monthly data for user growth trends
        const monthlyChartData = processMonthlyData(usersData)
        setMonthlyData(monthlyChartData)

        // Process weekly revenue data
        const weeklyRevenueData = processWeeklyRevenue(transactionsData)
        setRevenueData(weeklyRevenueData)

        setStats({
          totalUsers,
          totalFarmers,
          totalDrivers,
          totalConsumers,
          pendingTransactions,
          pendingProduce,
          pendingPayouts,
          monthlyRevenue,
          weeklyGrowth,
          userGrowth,
          totalDownloads,
          downloadGrowth,
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

    const processDailySignups = (usersData: UserData[]): DailySignupData[] => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date
      }).reverse()

      return last7Days.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))

        const dayUsers = usersData.filter(user => {
          if (!user.createdAt) return false
          const userDate = user.createdAt.toDate()
          return userDate >= dayStart && userDate <= dayEnd
        })

        const farmers = dayUsers.filter(user => user.userType === "farmer").length
        const drivers = dayUsers.filter(user => user.userType === "driver").length
        const consumers = dayUsers.filter(user => user.userType === "user").length
        const total = farmers + drivers + consumers

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          farmers,
          drivers,
          consumers,
          total
        }
      })
    }

    const processWeeklyData = (usersData: UserData[]): any[] => {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      return weeks.map((week, weekIndex) => {
        const weekStart = new Date(currentYear, currentMonth, weekIndex * 7 + 1)
        const weekEnd = new Date(currentYear, currentMonth, (weekIndex + 1) * 7, 23, 59, 59, 999)

        const weekUsers = usersData.filter(user => {
          if (!user.createdAt) return false
          const userDate = user.createdAt.toDate()
          return userDate >= weekStart && userDate <= weekEnd
        })

        const farmers = weekUsers.filter(user => user.userType === "farmer").length
        const drivers = weekUsers.filter(user => user.userType === "driver").length
        const consumers = weekUsers.filter(user => user.userType === "user").length
        const users = weekUsers.length

        // Calculate revenue for the week (you would need to fetch transaction data for this)
        const revenue = Math.floor(users * 375) // Placeholder calculation

        return {
          week,
          users,
          farmers,
          drivers,
          consumers,
          revenue
        }
      })
    }

    const processMonthlyData = (usersData: UserData[]): any[] => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentYear = new Date().getFullYear()
      
      return months.map((month, monthIndex) => {
        const monthStart = new Date(currentYear, monthIndex, 1)
        const monthEnd = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59, 999)

        const monthUsers = usersData.filter(user => {
          if (!user.createdAt) return false
          const userDate = user.createdAt.toDate()
          return userDate >= monthStart && userDate <= monthEnd
        })

        const farmers = monthUsers.filter(user => user.userType === "farmer").length
        const drivers = monthUsers.filter(user => user.userType === "driver").length
        const consumers = monthUsers.filter(user => user.userType === "user").length
        const users = monthUsers.length

        // Calculate revenue for the month (you would need to fetch transaction data for this)
        const revenue = Math.floor(users * 1500) // Placeholder calculation

        return {
          month,
          users,
          farmers,
          drivers,
          consumers,
          revenue
        }
      })
    }

    const processWeeklyRevenue = (transactionsData: TransactionData[]): any[] => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const today = new Date()
      
      return days.map((day, index) => {
        const dayDate = new Date(today)
        dayDate.setDate(today.getDate() - (6 - index)) // Get dates for the current week
        
        const dayStart = new Date(dayDate.setHours(0, 0, 0, 0))
        const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999))

        const dayRevenue = transactionsData
          .filter(transaction => 
            transaction.createdAt && 
            transaction.amount &&
            transaction.createdAt.toDate() >= dayStart &&
            transaction.createdAt.toDate() <= dayEnd
          )
          .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

        return {
          day,
          fullDate: dayDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          revenue: dayRevenue || 0
        }
      })
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Downloads",
      value: stats.totalDownloads,
      description: `${stats.downloadGrowth > 0 ? '+' : ''}${stats.downloadGrowth.toFixed(1)}% from last month`,
      icon: Download,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      trend: stats.downloadGrowth >= 0 ? "up" : "down",
      change: `${stats.downloadGrowth >= 0 ? '+' : ''}${stats.downloadGrowth.toFixed(1)}%`,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth.toFixed(1)}% from last month`,
      icon: Users,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      trend: stats.weeklyGrowth >= 0 ? "up" : "down",
      change: `${stats.weeklyGrowth >= 0 ? '+' : ''}${stats.weeklyGrowth.toFixed(1)}%`,
    },
    {
      title: "Active Farmers",
      value: stats.totalFarmers,
      description: `Farmers registered`,
      icon: Tractor,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      trend: "up",
      change: `${stats.totalFarmers}`,
    },
    {
      title: "Active Drivers",
      value: stats.totalDrivers,
      description: `Drivers registered`,
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      trend: "up",
      change: `${stats.totalDrivers}`,
    },
    {
      title: "Active Consumers",
      value: stats.totalConsumers,
      description: `${stats.userGrowth > 0 ? '+' : ''}${stats.userGrowth.toFixed(1)}% from last month`,
      icon: User,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      trend: stats.userGrowth >= 0 ? "up" : "down",
      change: `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth.toFixed(1)}%`,
    },
    {
      title: "Monthly Revenue",
      value: `₦${stats.monthlyRevenue.toLocaleString()}`,
      description: "Last 30 days revenue",
      icon: DollarSign,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      trend: "up",
      change: `₦${stats.monthlyRevenue.toLocaleString()}`,
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

  // Calculate today's signups
  const todaySignups = dailySignups.length > 0 ? dailySignups[dailySignups.length - 1] : { farmers: 0, drivers: 0, consumers: 0, total: 0 }
  const yesterdaySignups = dailySignups.length > 1 ? dailySignups[dailySignups.length - 2] : { farmers: 0, drivers: 0, consumers: 0, total: 0 }

  // Calculate farmer growth percentage
  const farmerGrowth = yesterdaySignups.farmers > 0 
    ? ((todaySignups.farmers - yesterdaySignups.farmers) / yesterdaySignups.farmers) * 100 
    : todaySignups.farmers > 0 ? 100 : 0

  // Calculate driver growth percentage
  const driverGrowth = yesterdaySignups.drivers > 0 
    ? ((todaySignups.drivers - yesterdaySignups.drivers) / yesterdaySignups.drivers) * 100 
    : todaySignups.drivers > 0 ? 100 : 0

  // Calculate consumer growth percentage
  const consumerGrowth = yesterdaySignups.consumers > 0 
    ? ((todaySignups.consumers - yesterdaySignups.consumers) / yesterdaySignups.consumers) * 100 
    : todaySignups.consumers > 0 ? 100 : 0

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

        {/* Downloads Overview Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Downloads Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Download className="h-4 w-4" />
                </div>
                Total Downloads
              </CardTitle>
              <CardDescription>All-time app downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalDownloads.toLocaleString()
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm mt-2">
                  {stats.downloadGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={stats.downloadGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {stats.downloadGrowth >= 0 ? '+' : ''}{stats.downloadGrowth.toFixed(1)}% from last month
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-sm font-medium text-blue-600">Farmers</div>
                  <div className="text-lg font-bold">{stats.totalFarmers.toLocaleString()}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <div className="text-sm font-medium text-orange-600">Drivers</div>
                  <div className="text-lg font-bold">{stats.totalDrivers.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <div className="text-sm font-medium text-purple-600">Consumers</div>
                  <div className="text-lg font-bold">{stats.totalConsumers.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmer Downloads Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <Tractor className="h-4 w-4" />
                </div>
                Farmer Downloads
              </CardTitle>
              <CardDescription>Total farmer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalFarmers.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {((stats.totalFarmers / stats.totalDownloads) * 100).toFixed(1)}% of total downloads
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${(stats.totalFarmers / stats.totalDownloads) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Downloads Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <Truck className="h-4 w-4" />
                </div>
                Driver Downloads
              </CardTitle>
              <CardDescription>Total driver registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalDrivers.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {((stats.totalDrivers / stats.totalDownloads) * 100).toFixed(1)}% of total downloads
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${(stats.totalDrivers / stats.totalDownloads) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Consumer Downloads Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                Consumer Downloads
              </CardTitle>
              <CardDescription>Total consumer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.totalConsumers.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {((stats.totalConsumers / stats.totalDownloads) * 100).toFixed(1)}% of total downloads
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats.totalConsumers / stats.totalDownloads) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Signups Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Farmer Signups Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <Tractor className="h-4 w-4" />
                </div>
                Daily Farmer Downloads
              </CardTitle>
              <CardDescription>Today's farmer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    todaySignups.farmers
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {farmerGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={farmerGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {farmerGrowth >= 0 ? '+' : ''}{farmerGrowth.toFixed(1)}% from yesterday
                  </span>
                </div>
              </div>
              <ChartContainer
                config={{
                  farmers: { label: "Farmers", color: "#10B981" },
                }}
                className="h-[120px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySignups}>
                    <Bar 
                      dataKey="farmers" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <ChartTooltip content={<DailyDownloadsTooltip />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Driver Signups Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <Truck className="h-4 w-4" />
                </div>
                Daily Driver Downloads
              </CardTitle>
              <CardDescription>Today's driver registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    todaySignups.drivers
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {driverGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={driverGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {driverGrowth >= 0 ? '+' : ''}{driverGrowth.toFixed(1)}% from yesterday
                  </span>
                </div>
              </div>
              <ChartContainer
                config={{
                  drivers: { label: "Drivers", color: "#F59E0B" },
                }}
                className="h-[120px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySignups}>
                    <Bar 
                      dataKey="drivers" 
                      fill="#F59E0B" 
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <ChartTooltip content={<DailyDownloadsTooltip />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Consumer Signups Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                Daily Consumer Downloads
              </CardTitle>
              <CardDescription>Today's consumer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    todaySignups.consumers
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {consumerGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={consumerGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {consumerGrowth >= 0 ? '+' : ''}{consumerGrowth.toFixed(1)}% from yesterday
                  </span>
                </div>
              </div>
              <ChartContainer
                config={{
                  consumers: { label: "Consumers", color: "#8B5CF6" },
                }}
                className="h-[120px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySignups}>
                    <Bar 
                      dataKey="consumers" 
                      fill="#8B5CF6" 
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <ChartTooltip content={<DailyDownloadsTooltip />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Total Daily Signups Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Users className="h-4 w-4" />
                </div>
                Total Daily Downloads
              </CardTitle>
              <CardDescription>Today's combined registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    todaySignups.total
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {todaySignups.farmers} farmers + {todaySignups.drivers} drivers + {todaySignups.consumers} consumers
                </div>
              </div>
              <ChartContainer
                config={{
                  total: { label: "Total", color: "#3B82F6" },
                }}
                className="h-[120px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySignups}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                    />
                    <ChartTooltip content={<DailyDownloadsTooltip />} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Growth Chart - Weekly/Monthly */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  User Growth Trends
                </CardTitle>
                <CardDescription>
                  {timeRange === "week" ? "Weekly user acquisition across all categories" : "Monthly user acquisition across all categories"}
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={(value: "week" | "month") => setTimeRange(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: "Users", color: "#3B82F6" },
                  farmers: { label: "Farmers", color: "#10B981" },
                  drivers: { label: "Drivers", color: "#F59E0B" },
                  consumers: { label: "Consumers", color: "#8B5CF6" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeRange === "week" ? weeklyData : monthlyData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConsumers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey={timeRange === "week" ? "week" : "month"} stroke="#6B7280" />
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
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorFarmers)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="drivers"
                      stroke="#F59E0B"
                      fillOpacity={1}
                      fill="url(#colorDrivers)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumers"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorConsumers)"
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
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
                  <ChartTooltip content={<RevenueTooltip />} />
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