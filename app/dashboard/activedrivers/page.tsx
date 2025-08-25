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
import { Search, Eye, CheckCircle, X, Truck, MapPin, Phone, Mail } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehicleType: string
  vehicleModel: string
  plateNumber: string
  location: string
  status: "pending" | "approved" | "rejected"
  joinDate: string
  verificationStatus: "pending" | "verified" | "rejected"
  rating: number
  completedDeliveries: number
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
          const q = query(collection(db, "drivers"),)
        const driversSnapshot = await getDocs(q)
        const driversData = driversSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Driver[]

        setDrivers(driversData)
        setFilteredDrivers(driversData)
      } catch (error) {
        console.error("Error fetching drivers:", error)
        // Mock data for demonstration
        const mockDrivers: Driver[] = [
          {
            id: "1",
            name: "Musa Ibrahim",
            email: "musa@example.com",
            phone: "+234 801 234 5678",
            licenseNumber: "LIC-001-2024",
            vehicleType: "Pickup Truck",
            vehicleModel: "Toyota Hilux 2020",
            plateNumber: "KD-123-ABC",
            location: "Kaduna State",
            status: "pending",
            joinDate: "2024-01-15",
            verificationStatus: "pending",
            rating: 0,
            completedDeliveries: 0,
          },
          {
            id: "2",
            name: "Ahmed Suleiman",
            email: "ahmed@example.com",
            phone: "+234 802 345 6789",
            licenseNumber: "LIC-002-2024",
            vehicleType: "Van",
            vehicleModel: "Ford Transit 2019",
            plateNumber: "KN-456-DEF",
            location: "Kano State",
            status: "approved",
            joinDate: "2024-01-20",
            verificationStatus: "verified",
            rating: 4.8,
            completedDeliveries: 45,
          },
          {
            id: "3",
            name: "Yusuf Garba",
            email: "yusuf@example.com",
            phone: "+234 803 456 7890",
            licenseNumber: "LIC-003-2024",
            vehicleType: "Motorcycle",
            vehicleModel: "Bajaj Boxer 2021",
            plateNumber: "SK-789-GHI",
            location: "Sokoto State",
            status: "pending",
            joinDate: "2024-01-10",
            verificationStatus: "pending",
            rating: 0,
            completedDeliveries: 0,
          },
        ]
        setDrivers(mockDrivers)
        setFilteredDrivers(mockDrivers)
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
        (driver.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (driver.plateNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredDrivers(filtered)
  }, [searchTerm, drivers])

  const updateDriverStatus = async (driverId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "drivers", driverId), {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            Approved
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

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))
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
                      <TableHead className="font-semibold w-12">S.No</TableHead>
                      <TableHead className="font-semibold">Driver Info</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Vehicle Details</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Performance</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span>Loading drivers...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
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
                              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                                <Truck className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{driver.name}</div>
                                <div className="text-sm text-muted-foreground">License: {driver.licenseNumber}</div>
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
                                <span>{driver.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{driver.vehicleType}</div>
                              <div className="text-sm text-muted-foreground">{driver.vehicleModel}</div>
                              <Badge variant="outline" className="text-xs">
                                {driver.plateNumber}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{driver.location}</span>
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