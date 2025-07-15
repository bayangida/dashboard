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
import { Search, Eye, Phone, Mail, MapPin, Users, Sprout, Plus } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ExtensionOfficer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  specialization: string
  assignedFarmers: number
  activeListings: number
  status: "active" | "inactive"
  joinDate: string
  lastActive: string
}

export default function ExtensionOfficersPage() {
  const [officers, setOfficers] = useState<ExtensionOfficer[]>([])
  const [filteredOfficers, setFilteredOfficers] = useState<ExtensionOfficer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const officersSnapshot = await getDocs(collection(db, "extension_officers"))
        const officersData = officersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExtensionOfficer[]

        setOfficers(officersData)
        setFilteredOfficers(officersData)
      } catch (error) {
        console.error("Error fetching extension officers:", error)
        // Mock data for demonstration
        const mockOfficers: ExtensionOfficer[] = [
          {
            id: "1",
            name: "Dr. Aisha Mohammed",
            email: "aisha.mohammed@bayangida.com",
            phone: "+234 801 234 5678",
            location: "Kaduna State",
            specialization: "Crop Production",
            assignedFarmers: 45,
            activeListings: 12,
            status: "active",
            joinDate: "2024-01-15",
            lastActive: "2024-01-20",
          },
          {
            id: "2",
            name: "Engr. Bello Suleiman",
            email: "bello.suleiman@bayangida.com",
            phone: "+234 802 345 6789",
            location: "Kano State",
            specialization: "Livestock Management",
            assignedFarmers: 32,
            activeListings: 8,
            status: "active",
            joinDate: "2024-01-10",
            lastActive: "2024-01-19",
          },
          {
            id: "3",
            name: "Mrs. Fatima Garba",
            email: "fatima.garba@bayangida.com",
            phone: "+234 803 456 7890",
            location: "Sokoto State",
            specialization: "Vegetable Farming",
            assignedFarmers: 28,
            activeListings: 15,
            status: "active",
            joinDate: "2024-01-05",
            lastActive: "2024-01-18",
          },
        ]
        setOfficers(mockOfficers)
        setFilteredOfficers(mockOfficers)
      } finally {
        setLoading(false)
      }
    }

    fetchOfficers()
  }, [])

  useEffect(() => {
    const filtered = officers.filter(
      (officer) =>
        (officer.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (officer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (officer.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (officer.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredOfficers(filtered)
  }, [searchTerm, officers])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      "Crop Production": "bg-green-100 text-green-800",
      "Livestock Management": "bg-blue-100 text-blue-800",
      "Vegetable Farming": "bg-orange-100 text-orange-800",
      "Fruit Cultivation": "bg-red-100 text-red-800",
      Aquaculture: "bg-cyan-100 text-cyan-800",
    }
    return colors[specialization] || "bg-gray-100 text-gray-800"
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
                <BreadcrumbPage>Extension Officers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Users className="h-5 w-5" />
            </div>
            Extension Officers Management
          </h1>
          <p className="text-muted-foreground">Manage extension officers who help farmers on the platform</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Extension Officers
              </div>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="h-4 w-4 mr-2" />
                Add Officer
              </Button>
            </CardTitle>
            <CardDescription>Monitor and manage extension officers across different regions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, location, or specialization..."
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
                    <TableHead className="font-semibold">Officer Details</TableHead>
                    <TableHead className="font-semibold">Contact Info</TableHead>
                    <TableHead className="font-semibold">Specialization</TableHead>
                    <TableHead className="font-semibold">Performance</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Last Active</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>Loading officers...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOfficers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Users className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">No officers found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <TableRow key={officer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{officer.name}</div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{officer.location}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{officer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{officer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getSpecializationColor(officer.specialization)}`}>
                            {officer.specialization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{officer.assignedFarmers}</span> farmers
                            </div>
                            <div className="text-sm text-green-600">
                              <span className="font-medium">{officer.activeListings}</span> active listings
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(officer.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(officer.lastActive).toLocaleDateString()}
                          </div>
                        </TableCell>
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
