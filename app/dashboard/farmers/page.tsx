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
import { Search, Eye, CheckCircle, X } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Farmer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  farmLocation?: string
  farmSize?: string
  cropTypes?: string[]
  status: "pending" | "approved" | "rejected"
  createdAt: { seconds: number; nanoseconds: number } | Date
  verified: boolean
  userType: string
  photoUrl?: string
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        // Query users collection where userType is 'farmer'
        const q = query(collection(db, "users"), where("userType", "==", "farmer"))
        const farmersSnapshot = await getDocs(q)
        
        const farmersData = farmersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            farmLocation: data.farmLocation || 'Not specified',
            farmSize: data.farmSize || 'Not specified',
            cropTypes: data.cropTypes || [],
            status: data.verified ? "approved" : "pending",
            createdAt: data.createdAt || new Date(),
            verified: data.verified || false,
            userType: data.userType || 'farmer'
          }
        }) as Farmer[]

        setFarmers(farmersData)
        setFilteredFarmers(farmersData)
      } catch (error) {
        console.error("Error fetching farmers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch farmers data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFarmers()
  }, [])

  useEffect(() => {
    const filtered = farmers.filter(
      (farmer) =>
        `${farmer.firstName} ${farmer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farmer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (farmer.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (farmer.farmLocation?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    setFilteredFarmers(filtered)
  }, [searchTerm, farmers])

  const updateFarmerStatus = async (farmerId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "users", farmerId), {
        verified: newStatus === "approved",
      })
      
      setFarmers(
        farmers.map((farmer) =>
          farmer.id === farmerId
            ? {
                ...farmer,
                status: newStatus,
                verified: newStatus === "approved",
              }
            : farmer
        )
      )
      
      toast({
        title: "Success",
        description: `Farmer ${newStatus} successfully`,
      })
    } catch (error) {
      console.error("Error updating farmer status:", error)
      toast({
        title: "Error",
        description: "Failed to update farmer status",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: { seconds: number } | Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString()
    } else {
      return new Date(date.seconds * 1000).toLocaleDateString()
    }
  }

  const getStatusBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default" className="bg-green-500">
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary">Pending Verification</Badge>
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
              <BreadcrumbPage>Farmer Signups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Signups</CardTitle>
              <CardDescription>Review and verify farmer registrations on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search farmers by name, email, phone, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">S.No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Farm Location</TableHead>
                      <TableHead>Farm Size</TableHead>
                      <TableHead>Crops</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          Loading farmers...
                        </TableCell>
                      </TableRow>
                    ) : filteredFarmers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          No farmers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFarmers.map((farmer, index) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="text-center font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {farmer.firstName} {farmer.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{farmer.phone}</span>
                              {farmer.email && <span className="text-sm text-muted-foreground">{farmer.email}</span>}
                            </div>
                          </TableCell>
                          <TableCell>{farmer.farmLocation}</TableCell>
                          <TableCell>{farmer.farmSize}</TableCell>
                          <TableCell>
                            {farmer.cropTypes && farmer.cropTypes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {farmer.cropTypes.map((crop, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {crop}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(farmer.createdAt)}</TableCell>
                          <TableCell>{getStatusBadge(farmer.verified)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!farmer.verified && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateFarmerStatus(farmer.id, "approved")}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateFarmerStatus(farmer.id, "rejected")}
                                    className="text-red-600 hover:text-red-700"
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