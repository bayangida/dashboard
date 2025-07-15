"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Search, Eye, Phone, MapPin, Package, Calendar, Sprout } from "lucide-react"
import { collection, getDocs, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface FarmerOrder {
  id: string
  orderId: string
  farmerName: string
  farmerPhone: string
  farmerLocation: string
  customerName: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered"
  orderDate: string
  deliveryDate?: string
  notes?: string
}

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<FarmerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(collection(db, "farmer_orders"))
        const ordersSnapshot = await getDocs(ordersQuery)
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FarmerOrder[]

        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } catch (error) {
        console.error("Error fetching farmer orders:", error)
        // Mock data for demonstration
        const mockOrders: FarmerOrder[] = [
          {
            id: "1",
            orderId: "FO-001",
            farmerName: "Aminu Hassan",
            farmerPhone: "+234 801 234 5678",
            farmerLocation: "Kaduna State",
            customerName: "John Doe",
            customerPhone: "+234 802 345 6789",
            items: [
              { name: "Fresh Tomatoes", quantity: 10, price: 2000 },
              { name: "Onions", quantity: 5, price: 1500 },
            ],
            totalAmount: 3500,
            status: "pending",
            orderDate: "2024-01-15",
            notes: "Customer prefers organic produce",
          },
          {
            id: "2",
            orderId: "FO-002",
            farmerName: "Fatima Abdullahi",
            farmerPhone: "+234 803 456 7890",
            farmerLocation: "Kano State",
            customerName: "Jane Smith",
            customerPhone: "+234 804 567 8901",
            items: [{ name: "Premium Rice", quantity: 20, price: 5000 }],
            totalAmount: 5000,
            status: "confirmed",
            orderDate: "2024-01-16",
            deliveryDate: "2024-01-20",
          },
          {
            id: "3",
            orderId: "FO-003",
            farmerName: "Ibrahim Musa",
            farmerPhone: "+234 805 678 9012",
            farmerLocation: "Sokoto State",
            customerName: "Mike Johnson",
            customerPhone: "+234 806 789 0123",
            items: [{ name: "Sweet Potatoes", quantity: 15, price: 1800 }],
            totalAmount: 1800,
            status: "ready",
            orderDate: "2024-01-17",
            deliveryDate: "2024-01-19",
          },
        ]
        setOrders(mockOrders)
        setFilteredOrders(mockOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        (order.orderId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.farmerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.farmerLocation?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredOrders(filtered)
  }, [searchTerm, orders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-blue-500">Confirmed</Badge>
      case "preparing":
        return <Badge className="bg-yellow-500">Preparing</Badge>
      case "ready":
        return <Badge className="bg-green-500">Ready</Badge>
      case "delivered":
        return <Badge className="bg-purple-500">Delivered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/extension">Extension Services</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Farmer Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Sprout className="h-5 w-5" />
            </div>
            Farmer Orders Management
          </h1>
          <p className="text-muted-foreground">Help farmers track and manage their customer orders</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Farmer Orders
            </CardTitle>
            <CardDescription>Monitor and assist farmers with their customer orders</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, farmer, customer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Order Details</TableHead>
                    <TableHead className="font-semibold">Farmer Info</TableHead>
                    <TableHead className="font-semibold">Customer Info</TableHead>
                    <TableHead className="font-semibold">Items</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">No orders found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{order.orderId}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>
                            {order.deliveryDate && (
                              <div className="text-xs text-green-600">
                                Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{order.farmerName}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{order.farmerPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{order.farmerLocation}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{order.customerName}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{order.customerPhone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">₦{order.totalAmount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
