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
import { Search, Eye, CheckCircle, X, Truck, MapPin, Phone, Mail, ArrowUpDown } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Driver {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  vehicleType: string
  vehicleModel: string
  plateNumber: string
  vehicleNumber: string
  location: string
  status: "pending" | "approved" | "rejected" | "active"
  joinDate: string
  createdAt: { seconds: number; nanoseconds: number } | Date
  verificationStatus: "pending" | "verified" | "rejected"
  rating: number
  completedDeliveries: number
  isAvailable: boolean
  photoUrl?: string
  uid: string
  userType: string
}

type SortField = "createdAt" | "name" | "status" | "joinDate"
type SortOrder = "asc" | "desc"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const { toast } = useToast()

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Query users collection where userType is 'driver' without orderBy to avoid index requirements
        const q = query(collection(db, "users"), where("userType", "==", "driver"))
        const driversSnapshot = await getDocs(q)
        
        const driversData = driversSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            licenseNumber: data.licenseNumber || '',
            vehicleType: data.vehicleType || 'Not specified',
            vehicleModel: data.vehicleModel || 'Not specified',
            plateNumber: data.plateNumber || data.vehicleNumber || 'Not specified',
            vehicleNumber: data.vehicleNumber || '',
            location: data.location || 'Not specified',
            status: data.status || 'pending',
            joinDate: data.joinDate || '',
            createdAt: data.createdAt || new Date(),
            verificationStatus: data.verificationStatus || 'pending',
            rating: data.rating || 0,
            completedDeliveries: data.completedDeliveries || 0,
            isAvailable: data.isAvailable || false,
            photoUrl: data.photoUrl || '',
            uid: data.uid || '',
            userType: data.userType || 'driver'
          }
        }) as Driver[]

        // Sort by createdAt on client side initially
        const sortedDrivers = sortDrivers(driversData, "createdAt", "desc")
        setDrivers(sortedDrivers)
        setFilteredDrivers(sortedDrivers)
      } catch (error) {
        console.error("Error fetching drivers:", error)
        // Mock data for demonstration with proper firstName/lastName structure
        const mockDrivers: Driver[] = [
          {
            id: "1",
            firstName: "Musa",
            lastName: "Ibrahim",
            email: "musa@example.com",
            phone: "+234 801 234 5678",
            licenseNumber: "LIC-001-2024",
            vehicleType: "Pickup Truck",
            vehicleModel: "Toyota Hilux 2020",
            plateNumber: "KD-123-ABC",
            vehicleNumber: "KD-123-ABC",
            location: "Kaduna State",
            status: "pending",
            joinDate: "2024-01-15",
            createdAt: new Date("2024-01-15"),
            verificationStatus: "pending",
            rating: 0,
            completedDeliveries: 0,
            isAvailable: false,
            uid: "1",
            userType: "driver"
          },
          {
            id: "2",
            firstName: "Ahmed",
            lastName: "Suleiman",
            email: "ahmed@example.com",
            phone: "+234 802 345 6789",
            licenseNumber: "LIC-002-2024",
            vehicleType: "Van",
            vehicleModel: "Ford Transit 2019",
            plateNumber: "KN-456-DEF",
            vehicleNumber: "KN-456-DEF",
            location: "Kano State",
            status: "approved",
            joinDate: "2024-01-20",
            createdAt: new Date("2024-01-20"),
            verificationStatus: "verified",
            rating: 4.8,
            completedDeliveries: 45,
            isAvailable: true,
            uid: "2",
            userType: "driver"
          },
          {
            id: "3",
            firstName: "Yusuf",
            lastName: "Garba",
            email: "yusuf@example.com",
            phone: "+234 803 456 7890",
            licenseNumber: "LIC-003-2024",
            vehicleType: "Motorcycle",
            vehicleModel: "Bajaj Boxer 2021",
            plateNumber: "SK-789-GHI",
            vehicleNumber: "SK-789-GHI",
            location: "Sokoto State",
            status: "pending",
            joinDate: "2024-01-10",
            createdAt: new Date("2024-01-10"),
            verificationStatus: "pending",
            rating: 0,
            completedDeliveries: 0,
            isAvailable: false,
            uid: "3",
            userType: "driver"
          },
        ]
        // Sort mock data by createdAt
        const sortedMockDrivers = sortDrivers(mockDrivers, "createdAt", "desc")
        setDrivers(sortedMockDrivers)
        setFilteredDrivers(sortedMockDrivers)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  useEffect(() => {
    let filtered = drivers.filter(
      (driver) =>
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (driver.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.plateNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.licenseNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    // Apply sorting
    filtered = sortDrivers(filtered, sortField, sortOrder)
    
    setFilteredDrivers(filtered)
  }, [searchTerm, drivers, sortField, sortOrder])

  const sortDrivers = (driversList: Driver[], field: SortField, order: SortOrder) => {
    return [...driversList].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (field) {
        case "createdAt":
          aValue = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.seconds
          bValue = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.seconds
          break
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case "status":
          // Define status priority for sorting
          const statusPriority = { "approved": 3, "active": 2, "pending": 1, "rejected": 0 }
          aValue = statusPriority[a.status as keyof typeof statusPriority] || 0
          bValue = statusPriority[b.status as keyof typeof statusPriority] || 0
          break
        case "joinDate":
          aValue = new Date(a.joinDate).getTime()
          bValue = new Date(b.joinDate).getTime()
          break
        default:
          return 0
      }

      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const updateDriverStatus = async (driverId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "users", driverId), {
        status: newStatus,
        verificationStatus: newStatus === "approved" ? "verified" : "rejected",
      })
      setDrivers(
        drivers.map((driver) =>
          driver.id === driverId
            ? {
                ...driver,
                status: newStatus,
                verificationStatus: newStatus === "approved" ? "verified" : "rejected",
              }
            : driver,
        ),
      )
      toast({
        title: "Success",
        description: `Driver ${newStatus} successfully`,
      })
    } catch (error) {
      console.error("Error updating driver status:", error)
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: { seconds: number } | Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            {status === "active" ? "Active" : "Approved"}
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-blue-500 text-xs">
        Available
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">
        Unavailable
      </Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === "asc" ? (
      <ArrowUpDown className="h-4 w-4 transform rotate-180" />
    ) : (
      <ArrowUpDown className="h-4 w-4" />
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
              <BreadcrumbPage>Driver Signups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <Truck className="h-5 w-5" />
              </div>
              Driver Management
            </h1>
            <p className="text-muted-foreground">Review and approve driver registrations on the Bayangida platform</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Driver Signups
              </CardTitle>
              <CardDescription>Manage all driver registrations and verifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers by name, email, location, or plate number..."
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
                      <TableHead className="font-semibold w-12 text-center">#</TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer hover:bg-accent"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Driver Info</span>
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Vehicle Details</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Performance</TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer hover:bg-accent"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer hover:bg-accent"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Join Date</span>
                          {getSortIcon("createdAt")}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span>Loading drivers...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Truck className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No drivers found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver, index) => (
                        <TableRow key={driver.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-center font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {driver.photoUrl ? (
                                <img 
                                  src={driver.photoUrl} 
                                  alt={`${driver.firstName} ${driver.lastName}`}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                                  <Truck className="h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{driver.firstName} {driver.lastName}</div>
                                <div className="text-sm text-muted-foreground">License: {driver.licenseNumber || 'Not provided'}</div>
                                <div className="mt-1">
                                  {getAvailabilityBadge(driver.isAvailable)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{driver.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{driver.phone || 'Not provided'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{driver.vehicleType || 'Not specified'}</div>
                              <div className="text-sm text-muted-foreground">{driver.vehicleModel || 'Not specified'}</div>
                              <Badge variant="outline" className="text-xs">
                                {driver.plateNumber || driver.vehicleNumber || 'Not specified'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{driver.location || 'Not specified'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {driver.rating > 0 ? (
                                  <span className="text-yellow-600">
                                    {getRatingStars(driver.rating)} {driver.rating}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">No ratings yet</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {driver.completedDeliveries} deliveries
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(driver.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(driver.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {driver.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateDriverStatus(driver.id, "approved")}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateDriverStatus(driver.id, "rejected")}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
      </div>
    </div>
  )
}