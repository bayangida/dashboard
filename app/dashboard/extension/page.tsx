"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Sprout, Package, Users, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ExtensionServicesPage() {
  const stats = [
    {
      title: "Active Listings",
      value: "35",
      description: "Produce listed this month",
      icon: Package,
      color: "from-green-500 to-green-600",
      change: "+12%",
    },
    {
      title: "Farmer Orders",
      value: "18",
      description: "Orders being processed",
      icon: Clock,
      color: "from-blue-500 to-blue-600",
      change: "+8%",
    },
    {
      title: "Extension Officers",
      value: "12",
      description: "Active officers",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      change: "+2",
    },
    {
      title: "Completed Orders",
      value: "127",
      description: "Successfully delivered",
      icon: CheckCircle,
      color: "from-orange-500 to-orange-600",
      change: "+23%",
    },
  ]

  const quickActions = [
    {
      title: "List New Produce",
      description: "Help farmers list their produce",
      icon: Plus,
      href: "/dashboard/extension/list-produce",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Check Orders",
      description: "Monitor farmer orders",
      icon: Package,
      href: "/dashboard/extension/orders",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Manage Officers",
      description: "Extension officer management",
      icon: Users,
      href: "/dashboard/extension/officers",
      color: "bg-purple-100 text-purple-600",
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
                <BreadcrumbPage>Extension Services</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Sprout className="h-6 w-6" />
            </div>
            Extension Services
          </h1>
          <p className="text-muted-foreground">
            Support farmers with produce listings, order management, and extension officer coordination
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-medium text-green-600">{stat.change}</span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common extension service tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest extension service activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New produce listed</p>
                  <p className="text-xs text-muted-foreground">Tomatoes listed for Aminu Hassan - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order processed</p>
                  <p className="text-xs text-muted-foreground">Rice order for Fatima Abdullahi - 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Officer assigned</p>
                  <p className="text-xs text-muted-foreground">
                    Dr. Aisha Mohammed assigned to new farmer - 6 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
