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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  FileText,
  ShoppingCart,
  Home,
  Star,
  MessageSquare,
  Hash,
  DollarSign,
  Weight,
  Users,
  Navigation,
  AlertCircle,
  Check,
  Shield,
  Car,
  Star as StarIcon,
} from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where, orderBy, Timestamp, addDoc, getDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  unit: string
}

interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  landmark: string
  fullAddress: string
  phoneNumber: string
}

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  vehicleType: string
  isAvailable: boolean
  address: string
  licenseNumber: string
  plateNumber: string
  userId: string
  rating?: number
  completedDeliveries?: number
  status?: string
}

interface Order {
  id: string
  orderId: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  sellerId: string
  sellerName: string
  items: OrderItem[]
  itemsTotal: number
  deliveryFee: number
  totalAmount: number
  address: Address
  receiverAddress: string
  paymentStatus: "paid" | "pending" | "failed"
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled"
  deliveryStatus: "pending" | "processing" | "shipped" | "delivered"
  orderType: "cart_checkout" | "direct_purchase"
  paymentReference: string
  driverId?: string
  driverName?: string
  assignedAt?: Timestamp
  deliveredAt?: Timestamp
  completedAt?: Timestamp
  estimatedDelivery?: Timestamp
  productRating?: number
  productFeedback?: string
  logisticsRating?: number
  logisticsFeedback?: string
  reviewed?: boolean
  reviewedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled"

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      )
      const ordersSnapshot = await getDocs(ordersQuery)
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      setOrders(ordersData)
      setFilteredOrders(ordersData.filter(order => order.status === "pending"))
    } catch (error) {
      console.error("Error fetching orders:", error)
      const mockOrders: Order[] = [
        {
          id: "1",
          orderId: "10pG3qew1LlDgEg5WE6M",
          buyerId: "KeDmvTD1FvP6wvjAlhpzAmbMWpK2",
          buyerName: "Faith",
          buyerEmail: "faith@example.com",
          sellerId: "DaFlUDf5QVdMKDQceAtQm9baxDs2",
          sellerName: "Esla anzaki",
          items: [
            { productId: "zwi76cG2CcaJehjrPdVs", productName: "Bone meal", productImage: "", quantity: 2, price: 3, unit: "kg" },
            { productId: "GWYpSciJfERfO1RX5PcW", productName: "Garri", productImage: "", quantity: 2, price: 2, unit: "kg" },
            { productId: "WFEI5G7qJXybag4QOgFO", productName: "Maize Offal", productImage: "", quantity: 1, price: 1, unit: "kg" },
            { productId: "Ek5LapTbdyMVIhe5rwmb", productName: "Noilers", productImage: "", quantity: 2, price: 1, unit: "kg" },
            { productId: "HVzx2tQt9Xm842LFRy1I", productName: "Water lily", productImage: "", quantity: 3, price: 2, unit: "kg" },
            { productId: "URRUQvEOPk7kl0PF01SZ", productName: "Cocoyam", productImage: "", quantity: 1, price: 1, unit: "kg" }
          ],
          itemsTotal: 20,
          deliveryFee: 600,
          totalAmount: 620,
          address: {
            street: "Biltmore Estate Lokogoma",
            city: "Lokogoma",
            state: "Abuja",
            country: "Nigeria",
            zipCode: "900107",
            landmark: "",
            fullAddress: "Biltmore Estate Lokogoma, Lokogoma, Abuja, 900107, Nigeria",
            phoneNumber: "08012345678"
          },
          receiverAddress: "Biltmore Homes Estate, Lokogoma, Abuja, 900107, Nigeria",
          paymentStatus: "paid",
          status: "completed",
          deliveryStatus: "delivered",
          orderType: "cart_checkout",
          paymentReference: "4b51ff87-bacf-40ae-a2fe-4bfe67aa2e97",
          driverId: "DRV-001",
          driverName: "Musa Ibrahim",
          assignedAt: Timestamp.fromDate(new Date("2025-11-28T10:56:20Z")),
          deliveredAt: Timestamp.fromDate(new Date("2025-11-29T15:00:02Z")),
          completedAt: Timestamp.fromDate(new Date("2025-11-29T15:01:24Z")),
          estimatedDelivery: Timestamp.fromDate(new Date("2025-12-02T10:54:28Z")),
          productRating: 5,
          productFeedback: "Great service and quality products!",
          logisticsRating: 5,
          logisticsFeedback: "Driver was very punctual and professional",
          reviewed: true,
          reviewedAt: Timestamp.fromDate(new Date("2025-11-29T15:01:24Z")),
          createdAt: Timestamp.fromDate(new Date("2025-11-28T10:54:29Z")),
          updatedAt: Timestamp.fromDate(new Date("2025-11-29T15:01:24Z"))
        },
        {
          id: "2",
          orderId: "ORD-002",
          buyerId: "buyer2",
          buyerName: "John Doe",
          buyerEmail: "john@example.com",
          sellerId: "seller1",
          sellerName: "Aminu Hassan",
          items: [
            { productId: "1", productName: "Fresh Tomatoes", productImage: "https://example.com/tomato.jpg", quantity: 10, price: 200, unit: "kg" },
            { productId: "2", productName: "Onions", productImage: "https://example.com/onions.jpg", quantity: 5, price: 300, unit: "kg" }
          ],
          itemsTotal: 3500,
          deliveryFee: 500,
          totalAmount: 4000,
          address: {
            street: "123 Main St",
            city: "Abuja",
            state: "Abuja",
            country: "Nigeria",
            zipCode: "900001",
            landmark: "Near Mosque",
            fullAddress: "123 Main St, Abuja, Nigeria",
            phoneNumber: "08012345678"
          },
          receiverAddress: "123 Main St, Abuja, Nigeria",
          paymentStatus: "paid",
          status: "processing",
          deliveryStatus: "processing",
          orderType: "cart_checkout",
          paymentReference: "ref-002",
          driverId: "DRV-001",
          driverName: "Musa Ibrahim",
          assignedAt: Timestamp.now(),
          estimatedDelivery: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: "3",
          orderId: "ORD-003",
          buyerId: "buyer3",
          buyerName: "Jane Smith",
          buyerEmail: "jane@example.com",
          sellerId: "seller2",
          sellerName: "Fatima Abdullahi",
          items: [
            { productId: "3", productName: "Rice", productImage: "https://example.com/rice.jpg", quantity: 20, price: 250, unit: "kg" }
          ],
          itemsTotal: 5000,
          deliveryFee: 1000,
          totalAmount: 6000,
          address: {
            street: "456 Market Rd",
            city: "Lagos",
            state: "Lagos",
            country: "Nigeria",
            zipCode: "100001",
            landmark: "Opposite Mall",
            fullAddress: "456 Market Rd, Lagos, Nigeria",
            phoneNumber: "08087654321"
          },
          receiverAddress: "456 Market Rd, Lagos, Nigeria",
          paymentStatus: "paid",
          status: "pending",
          deliveryStatus: "pending",
          orderType: "direct_purchase",
          paymentReference: "ref-003",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ]
      setOrders(mockOrders)
      setFilteredOrders(mockOrders.filter(order => order.status === "pending"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = orders.filter(order => order.status === activeTab)
    
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredOrders(filtered)
  }, [searchTerm, orders, activeTab])

  const fetchAvailableDrivers = async () => {
    try {
      setLoadingDrivers(true)
      setAvailableDrivers([])
      
      // Query for available drivers from the drivers collection
      const driversQuery = query(
        collection(db, "drivers"),
        where("isAvailable", "==", true)
      )
      
      const driversSnapshot = await getDocs(driversQuery)
      const driversData: Driver[] = []
      
      for (const driverDoc of driversSnapshot.docs) {
        const driverData = driverDoc.data()
        
        // Check if driver already has active orders (processing or shipped)
        const activeOrdersQuery = query(
          collection(db, "orders"),
          where("driverId", "==", driverDoc.id),
          where("status", "in", ["processing", "shipped"])
        )
        
        const activeOrders = await getDocs(activeOrdersQuery)
        
        // Only include drivers with no active orders
        if (activeOrders.empty) {
          driversData.push({
            id: driverDoc.id,
            name: driverData.name || "Driver",
            email: driverData.email || "",
            phone: driverData.phone || "",
            vehicleType: driverData.vehicleType || "Vehicle",
            isAvailable: driverData.isAvailable || false,
            address: driverData.address || "Location not specified",
            licenseNumber: driverData.licenseNumber || "No license",
            plateNumber: driverData.plateNumber || "No plate number",
            userId: driverData.userId || driverDoc.id,
            rating: driverData.rating || 0,
            completedDeliveries: driverData.completedDeliveries || 0,
            status: driverData.status || "active"
          })
        }
      }
      
      setAvailableDrivers(driversData)
      
      if (driversData.length === 0) {
        toast({
          title: "No Drivers Available",
          description: "No drivers are currently available. Try again later.",
          variant: "destructive",
        })
      }
      
    } catch (error) {
      console.error("Error fetching drivers:", error)
      
      // Mock drivers for demonstration
      const mockDrivers: Driver[] = [
        {
          id: "DRV-001",
          name: "Musa Ibrahim",
          email: "musa@example.com",
          phone: "08012345678",
          vehicleType: "Pickup Truck",
          isAvailable: true,
          rating: 4.8,
          completedDeliveries: 156,
          status: "active",
          address: "123 Driver St, Abuja, Nigeria",
          licenseNumber: "DL1234567890",
          plateNumber: "ABJ123XYZ",
          userId: "DRV-001"
        },
        {
          id: "DRV-002",
          name: "Tunde Lawal",
          email: "tunde@example.com",
          phone: "08087654321",
          vehicleType: "Delivery Van",
          isAvailable: true,
          rating: 4.5,
          completedDeliveries: 89,
          status: "active",
          address: "456 Transport Ave, Lagos, Nigeria",
          licenseNumber: "DL0987654321",
          plateNumber: "LAG456ABC",
          userId: "DRV-002"
        },
        {
          id: "DRV-003",
          name: "Chinedu Okoro",
          email: "chinedu@example.com",
          phone: "08055556666",
          vehicleType: "Motorcycle",
          isAvailable: true,
          rating: 4.9,
          completedDeliveries: 203,
          status: "active",
          address: "789 Rider Rd, Port Harcourt, Nigeria",
          licenseNumber: "DL2468135790",
          plateNumber: "PHC789DEF",
          userId: "DRV-003"
        }
      ]
      
      setAvailableDrivers(mockDrivers)
      
    } finally {
      setLoadingDrivers(false)
    }
  }

  const sendDriverNotification = async (driverId: string, orderId: string, order: Order) => {
    try {
      await addDoc(collection(db, "notifications"), {
        driverId: driverId,
        orderId: orderId,
        farmerId: order.sellerId,
        type: "new_assignment",
        title: "New Delivery Assignment",
        message: `You have been assigned order #${order.orderId.substring(0, 8)}`,
        isRead: false,
        createdAt: Timestamp.now(),
        data: {
          orderId: order.orderId,
          orderAmount: order.totalAmount,
          deliveryAddress: order.receiverAddress || order.address.fullAddress,
          farmerName: order.sellerName,
          itemsCount: order.items.length,
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0)
        }
      })
      
      return true
    } catch (error) {
      console.error("Error sending notification:", error)
      return false
    }
  }

  const assignDriverToOrder = async (orderId: string, driverId: string) => {
    try {
      setAssigningOrderId(orderId)
      
      const order = orders.find(o => o.id === orderId)
      if (!order) {
        throw new Error("Order not found")
      }
      
      // Get driver details
      const driverDoc = await getDoc(doc(db, "drivers", driverId))
      const driverData = driverDoc.data()
      
      if (!driverData) {
        throw new Error("Driver not found")
      }
      
      // Update order with driver assignment
      const updateData: any = {
        driverId: driverId,
        driverName: driverData.name || "Driver",
        status: "processing",
        deliveryStatus: "processing",
        assignedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      await updateDoc(doc(db, "orders", orderId), updateData)

      // Update driver status to unavailable
      await updateDoc(doc(db, "drivers", driverId), {
        isAvailable: false,
        lastUpdated: Timestamp.now()
      })

      // Send notification to driver
      const notificationSent = await sendDriverNotification(driverId, orderId, order)
      
      if (!notificationSent) {
        toast({
          title: "Warning",
          description: "Driver assigned but notification failed to send",
          variant: "destructive",
        })
      }

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              ...updateData
            }
          : order
      ))

      toast({
        title: "Success",
        description: `Driver ${driverData.name} assigned to order #${order.orderId}`,
      })
      
      setIsDriverDialogOpen(false)
      setSelectedDriver("")
      
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      })
    } finally {
      setAssigningOrderId(null)
    }
  }

  const openDriverAssignmentDialog = async (orderId: string) => {
    try {
      setSelectedOrder(orders.find(o => o.id === orderId) || null)
      setIsDriverDialogOpen(true)
      
      // Fetch all available drivers
      await fetchAvailableDrivers()
      
    } catch (error) {
      console.error("Error opening driver dialog:", error)
      toast({
        title: "Error",
        description: "Failed to load available drivers",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      
      const order = orders.find(o => o.id === orderId)
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now()
      }
      
      if (newStatus === "shipped") {
        updateData.deliveryStatus = "shipped"
      } else if (newStatus === "completed") {
        updateData.deliveryStatus = "delivered"
        updateData.deliveredAt = Timestamp.now()
        updateData.completedAt = Timestamp.now()
        
        // If there's a driver, mark them as available again and increment their deliveries
        if (order?.driverId) {
          await updateDoc(doc(db, "drivers", order.driverId), {
            isAvailable: true,
            completedDeliveries: increment(1),
            lastUpdated: Timestamp.now()
          })
        }
      } else if (newStatus === "cancelled") {
        // If there's a driver, mark them as available again
        if (order?.driverId) {
          await updateDoc(doc(db, "drivers", order.driverId), {
            isAvailable: true,
            lastUpdated: Timestamp.now()
          })
        }
      }
      
      await updateDoc(doc(db, "orders", orderId), updateData)

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      ))

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <Loader2 className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        )
      case "delivered":
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === "delivered" ? "Delivered" : "Completed"}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "N/A"
    return format(timestamp.toDate(), "MMM dd, yyyy HH:mm")
  }

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <Button
            size="sm"
            onClick={() => openDriverAssignmentDialog(order.id)}
            disabled={updatingOrderId === order.id || assigningOrderId === order.id}
          >
            {(updatingOrderId === order.id || assigningOrderId === order.id) ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Truck className="h-3 w-3 mr-1" />
                Assign Driver
              </>
            )}
          </Button>
        )
      case "processing":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateOrderStatus(order.id, "shipped")}
            disabled={updatingOrderId === order.id}
          >
            {updatingOrderId === order.id ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Package className="h-3 w-3 mr-1" />
                Mark as Shipped
              </>
            )}
          </Button>
        )
      case "shipped":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateOrderStatus(order.id, "completed")}
            disabled={updatingOrderId === order.id}
          >
            {updatingOrderId === order.id ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark as Delivered
              </>
            )}
          </Button>
        )
      default:
        return null
    }
  }

  const getItemsCount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const calculateItemTotal = (item: OrderItem) => {
    return item.quantity * item.price
  }

  const formatRating = (rating?: number) => {
    if (!rating || rating === 0) return "No rating"
    return `${rating.toFixed(1)}/5.0`
  }

  const getRatingStars = (rating: number) => {
    if (rating === 0) return "No ratings yet"
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ))}
        {halfStar && <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500/50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>Manage and track all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer, seller, or driver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending
                    <Badge variant="secondary" className="ml-1">
                      {orders.filter(o => o.status === "pending").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4" />
                    Processing
                    <Badge variant="secondary" className="ml-1">
                      {orders.filter(o => o.status === "processing").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="shipped" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipped
                    <Badge variant="secondary" className="ml-1">
                      {orders.filter(o => o.status === "shipped").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                    <Badge variant="secondary" className="ml-1">
                      {orders.filter(o => o.status === "completed").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Cancelled
                    <Badge variant="secondary" className="ml-1">
                      {orders.filter(o => o.status === "cancelled").length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="m-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Loading orders...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No {activeTab} orders found</p>
                                {searchTerm && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try adjusting your search term
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{order.orderId}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {order.orderType === "cart_checkout" ? "Cart Checkout" : "Direct Purchase"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{order.buyerName}</div>
                                  <div className="text-sm text-muted-foreground">{order.buyerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.sellerName}</div>
                              </TableCell>
                              <TableCell>
                                {order.driverName ? (
                                  <div>
                                    <div className="font-medium">{order.driverName}</div>
                                    <div className="text-xs text-muted-foreground">{order.driverId?.substring(0, 8)}...</div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">Not assigned</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {order.items.length} items ({getItemsCount(order.items)} units)
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">₦{order.totalAmount.toLocaleString()}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                                  {order.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(order.status)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(order.createdAt)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Dialog open={isViewDialogOpen && selectedOrder?.id === order.id} onOpenChange={setIsViewDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openViewDialog(order)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <FileText className="h-5 w-5" />
                                          Order Details: {order.orderId}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Complete information for order #{order.orderId}
                                        </DialogDescription>
                                      </DialogHeader>
                                      
                                      {selectedOrder && (
                                        <div className="grid gap-6 py-4">
                                          {/* Order Summary Card */}
                                          <Card>
                                            <CardHeader className="pb-3">
                                              <CardTitle className="text-lg flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                  <ShoppingCart className="h-5 w-5" />
                                                  Order Summary
                                                </span>
                                                <div className="flex items-center gap-2">
                                                  {getStatusBadge(selectedOrder.status)}
                                                  <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "outline"}>
                                                    {selectedOrder.paymentStatus}
                                                  </Badge>
                                                </div>
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    Order ID
                                                  </div>
                                                  <div className="font-medium">{selectedOrder.orderId}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Created
                                                  </div>
                                                  <div className="font-medium">{formatDate(selectedOrder.createdAt)}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Order Type
                                                  </div>
                                                  <div className="font-medium">
                                                    {selectedOrder.orderType === "cart_checkout" ? "Cart Checkout" : "Direct Purchase"}
                                                  </div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    Total Amount
                                                  </div>
                                                  <div className="font-medium">₦{selectedOrder.totalAmount.toLocaleString()}</div>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Customer & Seller Information */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <User className="h-5 w-5" />
                                                  Customer Information
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Name
                                                  </div>
                                                  <div className="font-medium">{selectedOrder.buyerName}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    Email
                                                  </div>
                                                  <div className="font-medium">{selectedOrder.buyerEmail}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    Buyer ID
                                                  </div>
                                                  <div className="font-medium text-xs font-mono">{selectedOrder.buyerId}</div>
                                                </div>
                                              </CardContent>
                                            </Card>

                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <User className="h-5 w-5" />
                                                  Seller Information
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Name
                                                  </div>
                                                  <div className="font-medium">{selectedOrder.sellerName}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    Seller ID
                                                  </div>
                                                  <div className="font-medium text-xs font-mono">{selectedOrder.sellerId}</div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          </div>

                                          {/* Driver Information (if assigned) */}
                                          {selectedOrder.driverId && (
                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <Truck className="h-5 w-5" />
                                                  Assigned Driver
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                      <User className="h-3 w-3" />
                                                      Driver Name
                                                    </div>
                                                    <div className="font-medium">{selectedOrder.driverName}</div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                      <Shield className="h-3 w-3" />
                                                      Driver ID
                                                    </div>
                                                    <div className="font-medium text-xs font-mono">{selectedOrder.driverId}</div>
                                                  </div>
                                                </div>
                                                {selectedOrder.assignedAt && (
                                                  <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                      <Calendar className="h-3 w-3" />
                                                      Assigned At
                                                    </div>
                                                    <div className="font-medium">{formatDate(selectedOrder.assignedAt)}</div>
                                                  </div>
                                                )}
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* Delivery Address */}
                                          <Card>
                                            <CardHeader className="pb-3">
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-5 w-5" />
                                                Delivery Address
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                  <Home className="h-3 w-3" />
                                                  Full Address
                                                </div>
                                                <div className="font-medium">{selectedOrder.receiverAddress || selectedOrder.address.fullAddress}</div>
                                              </div>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">Street</div>
                                                  <div className="font-medium">{selectedOrder.address.street}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">City</div>
                                                  <div className="font-medium">{selectedOrder.address.city}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">State</div>
                                                  <div className="font-medium">{selectedOrder.address.state}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">Zip Code</div>
                                                  <div className="font-medium">{selectedOrder.address.zipCode}</div>
                                                </div>
                                              </div>
                                              <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                  <Phone className="h-3 w-3" />
                                                  Phone Number
                                                </div>
                                                <div className="font-medium">{selectedOrder.address.phoneNumber || "N/A"}</div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Order Items */}
                                          <Card>
                                            <CardHeader className="pb-3">
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Order Items ({selectedOrder.items.length})
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-4">
                                                {selectedOrder.items.map((item, index) => (
                                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                                        {item.productImage ? (
                                                          <img 
                                                            src={item.productImage} 
                                                            alt={item.productName} 
                                                            className="w-full h-full object-cover rounded-md"
                                                          />
                                                        ) : (
                                                          <Package className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                      </div>
                                                      <div>
                                                        <div className="font-medium">{item.productName}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                          <span>ID: {item.productId.substring(0, 8)}...</span>
                                                          <span className="flex items-center gap-1">
                                                            <Weight className="h-3 w-3" />
                                                            {item.quantity} {item.unit}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="font-medium">₦{calculateItemTotal(item).toLocaleString()}</div>
                                                      <div className="text-sm text-muted-foreground">₦{item.price} per {item.unit}</div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                              
                                              {/* Order Totals */}
                                              <div className="mt-6 space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">Items Total:</span>
                                                  <span className="font-medium">₦{selectedOrder.itemsTotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">Delivery Fee:</span>
                                                  <span className="font-medium">₦{selectedOrder.deliveryFee.toLocaleString()}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between text-lg font-bold">
                                                  <span>Total Amount:</span>
                                                  <span>₦{selectedOrder.totalAmount.toLocaleString()}</span>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Payment & Delivery Details */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <CreditCard className="h-5 w-5" />
                                                  Payment Details
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">Payment Reference</div>
                                                  <div className="font-medium font-mono text-sm">{selectedOrder.paymentReference}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">Payment Status</div>
                                                  <div>
                                                    <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "outline"}>
                                                      {selectedOrder.paymentStatus}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>

                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <Truck className="h-5 w-5" />
                                                  Delivery Details
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                  <div className="text-sm text-muted-foreground">Delivery Status</div>
                                                  <div>{getStatusBadge(selectedOrder.deliveryStatus)}</div>
                                                </div>
                                                {selectedOrder.estimatedDelivery && (
                                                  <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                                                    <div className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</div>
                                                  </div>
                                                )}
                                                {selectedOrder.deliveredAt && (
                                                  <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Delivered At</div>
                                                    <div className="font-medium">{formatDate(selectedOrder.deliveredAt)}</div>
                                                  </div>
                                                )}
                                              </CardContent>
                                            </Card>
                                          </div>

                                          {/* Reviews & Feedback */}
                                          {selectedOrder.reviewed && (
                                            <Card>
                                              <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <Star className="h-5 w-5" />
                                                  Customer Reviews
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                  <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span className="font-medium">Product Rating</span>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                          <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                              star <= (selectedOrder.productRating || 0)
                                                                ? "text-yellow-500 fill-yellow-500"
                                                                : "text-gray-300"
                                                            }`}
                                                          />
                                                        ))}
                                                        <span className="ml-2 font-bold">{selectedOrder.productRating}/5</span>
                                                      </div>
                                                    </div>
                                                    {selectedOrder.productFeedback && (
                                                      <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                          <MessageSquare className="h-3 w-3" />
                                                          Product Feedback
                                                        </div>
                                                        <div className="p-3 bg-muted rounded-md">
                                                          {selectedOrder.productFeedback}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>

                                                  <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4" />
                                                        <span className="font-medium">Logistics Rating</span>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                          <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                              star <= (selectedOrder.logisticsRating || 0)
                                                                ? "text-yellow-500 fill-yellow-500"
                                                                : "text-gray-300"
                                                            }`}
                                                          />
                                                        ))}
                                                        <span className="ml-2 font-bold">{selectedOrder.logisticsRating}/5</span>
                                                      </div>
                                                    </div>
                                                    {selectedOrder.logisticsFeedback && (
                                                      <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                          <MessageSquare className="h-3 w-3" />
                                                          Logistics Feedback
                                                        </div>
                                                        <div className="p-3 bg-muted rounded-md">
                                                          {selectedOrder.logisticsFeedback}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                                {selectedOrder.reviewedAt && (
                                                  <div className="mt-4 text-sm text-muted-foreground">
                                                    Reviewed on {formatDate(selectedOrder.reviewedAt)}
                                                  </div>
                                                )}
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* Timeline */}
                                          <Card>
                                            <CardHeader className="pb-3">
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Order Timeline
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                  <div>
                                                    <div className="font-medium">Order Created</div>
                                                    <div className="text-sm text-muted-foreground">{formatDate(selectedOrder.createdAt)}</div>
                                                  </div>
                                                </div>
                                                {selectedOrder.assignedAt && (
                                                  <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    <div>
                                                      <div className="font-medium">Driver Assigned</div>
                                                      <div className="text-sm text-muted-foreground">{formatDate(selectedOrder.assignedAt)}</div>
                                                    </div>
                                                  </div>
                                                )}
                                                {selectedOrder.deliveredAt && (
                                                  <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                                    <div>
                                                      <div className="font-medium">Order Delivered</div>
                                                      <div className="text-sm text-muted-foreground">{formatDate(selectedOrder.deliveredAt)}</div>
                                                    </div>
                                                  </div>
                                                )}
                                                {selectedOrder.completedAt && (
                                                  <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                                    <div>
                                                      <div className="font-medium">Order Completed</div>
                                                      <div className="text-sm text-muted-foreground">{formatDate(selectedOrder.completedAt)}</div>
                                                    </div>
                                                  </div>
                                                )}
                                                {selectedOrder.reviewedAt && (
                                                  <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                                    <div>
                                                      <div className="font-medium">Review Submitted</div>
                                                      <div className="text-sm text-muted-foreground">{formatDate(selectedOrder.reviewedAt)}</div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  {getStatusActions(order)}
                                  {order.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                                      disabled={updatingOrderId === order.id}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      {updatingOrderId === order.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <XCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Driver Assignment Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assign Driver to Order #{selectedOrder?.orderId}
            </DialogTitle>
            <DialogDescription>
              Select a driver from the list of all available drivers
            </DialogDescription>
          </DialogHeader>
          
          {loadingDrivers ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading available drivers...</p>
            </div>
          ) : availableDrivers.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center mb-2">No available drivers found</p>
              <p className="text-sm text-muted-foreground text-center">
                All drivers are currently busy or unavailable. Try again later.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Driver ({availableDrivers.length} available)</label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2 py-1">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <Truck className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{driver.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {driver.vehicleType}
                              </div>
                            </div>
                            <div className="ml-auto">
                              {getRatingStars(driver.rating || 0)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDriver && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Selected Driver Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {availableDrivers
                        .filter(driver => driver.id === selectedDriver)
                        .map((driver) => (
                          <div key={driver.id} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Name
                                </div>
                                <div className="font-medium">{driver.name}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Car className="h-3 w-3" />
                                  Vehicle
                                </div>
                                <div className="font-medium">{driver.vehicleType}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  Phone
                                </div>
                                <div className="font-medium">{driver.phone}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Rating
                                </div>
                                <div className="font-medium">{formatRating(driver.rating)}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Address
                              </div>
                              <div className="text-sm">{driver.address}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">License Number</div>
                                <div className="font-medium text-sm font-mono">{driver.licenseNumber}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Plate Number</div>
                                <div className="font-medium text-sm">{driver.plateNumber}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Completed Deliveries</div>
                              <div className="font-medium text-sm">{driver.completedDeliveries || 0} deliveries</div>
                            </div>
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDriverDialogOpen(false)
                      setSelectedDriver("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedOrder && selectedDriver && assignDriverToOrder(selectedOrder.id, selectedDriver)}
                    disabled={!selectedDriver || assigningOrderId === selectedOrder?.id}
                    className="gap-2"
                  >
                    {assigningOrderId === selectedOrder?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Assign Driver
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}