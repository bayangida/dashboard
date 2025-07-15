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
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  farmLocation: string
  farmSize: string
  cropTypes: string[]
  status: "pending" | "approved" | "rejected"
  joinDate: string
  verificationStatus: "pending" | "verified" | "rejected"
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
        const farmersSnapshot = await getDocs(collection(db, "farmers"))
        const farmersData = farmersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Farmer[]

        setFarmers(farmersData)
        setFilteredFarmers(farmersData)
      } catch (error) {
        console.error("Error fetching farmers:", error)
        // Mock data for demonstration
        const mockFarmers: Farmer[] = [
          {
            id: "1",
            name: "Aminu Hassan",
            email: "aminu@example.com",
            phone: "+234 801 234 5678",
            farmLocation: "Kaduna State",
            farmSize: "5 hectares",
            cropTypes: ["Maize", "Rice", "Yam"],
            status: "pending",
            joinDate: "2024-01-15",
            verificationStatus: "pending",
          },
          {
            id: "2",
            name: "Fatima Abdullahi",
            email: "fatima@example.com",
            phone: "+234 802 345 6789",
            farmLocation: "Kano State",
            farmSize: "3 hectares",
            cropTypes: ["Tomatoes", "Onions", "Pepper"],
            status: "approved",
            joinDate: "2024-01-20",
            verificationStatus: "verified",
          },
          {
            id: "3",
            name: "Ibrahim Musa",
            email: "ibrahim@example.com",
            phone: "+234 803 456 7890",
            farmLocation: "Sokoto State",
            farmSize: "8 hectares",
            cropTypes: ["Millet", "Sorghum"],
            status: "pending",
            joinDate: "2024-01-10",
            verificationStatus: "pending",
          },
        ]
        setFarmers(mockFarmers)
        setFilteredFarmers(mockFarmers)
      } finally {
        setLoading(false)
      }
    }

    fetchFarmers()
  }, [])

  useEffect(() => {
    const filtered = farmers.filter(
      (farmer) =>
        (farmer.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (farmer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (farmer.farmLocation?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredFarmers(filtered)
  }, [searchTerm, farmers])

  const updateFarmerStatus = async (farmerId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "farmers", farmerId), {
        status: newStatus,
        verificationStatus: newStatus === "approved" ? "verified" : "rejected",
      })
      setFarmers(
        farmers.map((farmer) =>
          farmer.id === farmerId
            ? {
                ...farmer,
                status: newStatus,
                verificationStatus: newStatus === "approved" ? "verified" : "rejected",
              }
            : farmer,
        ),
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
              <CardDescription>Review and approve farmer registrations on the Bayangida platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search farmers by name, email, or location..."
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Farm Location</TableHead>
                      <TableHead>Farm Size</TableHead>
                      <TableHead>Crop Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredFarmers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No farmers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFarmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="font-medium">{farmer.name}</TableCell>
                          <TableCell>{farmer.email}</TableCell>
                          <TableCell>{farmer.phone}</TableCell>
                          <TableCell>{farmer.farmLocation}</TableCell>
                          <TableCell>{farmer.farmSize}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {farmer.cropTypes.map((crop, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(farmer.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {farmer.status === "pending" && (
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
