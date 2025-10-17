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
import { Search, Eye, CheckCircle, X, Truck, MapPin, Phone, Mail, User } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Driver {
  id: string
  name: string
  phone: string
  licenseNumber: string
  vehicleType: string
  plateNumber: string
  address: string
  isAvailable: boolean
  userId: string
  status: "pending" | "approved" | "rejected"
  joinDate: any
  lastUpdated: any
  updatedAt: any
  email?: string
  rating?: number
  completedDeliveries?: number
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const q = query(collection(db, "drivers"))
        const driversSnapshot = await getDocs(q)
        
        const driversData = driversSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || 'Unknown Driver',
            phone: data.phone || 'No phone provided',
            licenseNumber: data.licenseNumber || 'No license',
            vehicleType: data.vehicleType || 'Vehicle not specified',
            plateNumber: data.plateNumber || 'No plate number',
            address: data.address || 'Location not specified',
            isAvailable: data.isAvailable || false,
            userId: data.userId || '',
            status: data.isAvailable ? "approved" : "pending",
            joinDate: data.updatedAt || data.lastUpdated || new Date(),
            lastUpdated: data.lastUpdated || new Date(),
            updatedAt: data.updatedAt || new Date(),
            email: data.email || '',
            rating: data.rating || 0,
            completedDeliveries: data.completedDeliveries || 0
          }
        }) as Driver[]

        setDrivers(driversData)
        setFilteredDrivers(driversData)
      } catch (error) {
        console.error("Error fetching drivers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch drivers data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  useEffect(() => {
    const filtered = drivers.filter(
      (driver) =>
        (driver.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.address?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.plateNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.licenseNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.vehicleType?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    setFilteredDrivers(filtered)
  }, [searchTerm, drivers])

  const updateDriverStatus = async (driverId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "drivers", driverId), {
        isAvailable: newStatus === "approved",
        lastUpdated: new Date(),
      })
      
      setDrivers(
        drivers.map((driver) =>
          driver.id === driverId
            ? {
                ...driver,
                status: newStatus,
                isAvailable: newStatus === "approved",
                lastUpdated: new Date(),
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

  const formatDate = (date: any) => {
    if (!date) return 'Unknown date'
    
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } else if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } else if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } else {
        return 'Invalid date'
      }
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusBadge = (driver: Driver) => {
    if (driver.isAvailable) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      )
    } else {
      return <Badge variant="secondary">Inactive</Badge>
    }
  }

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="default" className="bg-green-500">
        Available
      </Badge>
    ) : (
      <Badge variant="outline">Unavailable</Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    if (rating === 0) return "No ratings yet"
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating)) + ` ${rating}`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
  }

  const extractCityFromAddress = (address: string) => {
    if (!address) return 'Location not specified'
    
    // Try to extract city from address string
    const parts = address.split(',')
    if (parts.length >= 2) {
      return parts[1]?.trim() || parts[0]?.trim() || address
    }
    return address
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
              <BreadcrumbPage>Driver Management</BreadcrumbPage>
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
            <p className="text-muted-foreground">Manage all driver registrations and availability on the platform</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Registered Drivers
              </CardTitle>
              <CardDescription>View and manage all drivers in the system</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers by name, phone, location, plate number, or license..."
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
                      <TableHead className="font-semibold w-12">S.No</TableHead>
                      <TableHead className="font-semibold">Driver</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Vehicle Details</TableHead>
                      <TableHead className="font-semibold">License</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Availability</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span>Loading drivers...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Truck className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No drivers found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver, index) => (
                        <TableRow key={driver.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-center">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={driver.name} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                  {getInitials(driver.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{driver.name}</div>
                                <div className="text-sm text-muted-foreground">ID: {driver.userId.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{driver.phone || 'No phone'}</span>
                              </div>
                              {driver.email && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span>{driver.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{driver.vehicleType}</div>
                              <Badge variant="outline" className="text-xs">
                                {driver.plateNumber}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                              {driver.licenseNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 max-w-[150px]">
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate" title={driver.address}>
                                {extractCityFromAddress(driver.address)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(driver)}</TableCell>
                          <TableCell>{getAvailabilityBadge(driver.isAvailable)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(driver.joinDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!driver.isAvailable && (
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