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
import { Search, Eye, CheckCircle, X, Package, Calendar, MapPin, DollarSign } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Produce {
  id: string
  name: string
  category: string
  farmerName: string
  farmerEmail: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalValue: number
  harvestDate: string
  expiryDate: string
  location: string
  description: string
  images: string[]
  status: "pending" | "approved" | "rejected"
  qualityGrade: "A" | "B" | "C" | "Not Graded"
  submissionDate: string
}

export default function ProducePage() {
  const [produce, setProduce] = useState<Produce[]>([])
  const [filteredProduce, setFilteredProduce] = useState<Produce[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduce = async () => {
      try {
        const produceQuery = query(collection(db, "produce"), where("status", "==", "pending"))
        const produceSnapshot = await getDocs(produceQuery)
        const produceData = produceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Produce[]

        setProduce(produceData)
        setFilteredProduce(produceData)
      } catch (error) {
        console.error("Error fetching produce:", error)
        // Mock data for demonstration
        const mockProduce: Produce[] = [
          {
            id: "1",
            name: "Fresh Tomatoes",
            category: "Vegetables",
            farmerName: "Aminu Hassan",
            farmerEmail: "aminu@example.com",
            quantity: 500,
            unit: "kg",
            pricePerUnit: 200,
            totalValue: 100000,
            harvestDate: "2024-01-10",
            expiryDate: "2024-01-25",
            location: "Kaduna State",
            description: "Fresh, organic tomatoes harvested this morning. Grade A quality.",
            images: ["/placeholder.svg?height=100&width=100"],
            status: "pending",
            qualityGrade: "Not Graded",
            submissionDate: "2024-01-15",
          },
          {
            id: "2",
            name: "Premium Rice",
            category: "Grains",
            farmerName: "Fatima Abdullahi",
            farmerEmail: "fatima@example.com",
            quantity: 1000,
            unit: "kg",
            pricePerUnit: 300,
            totalValue: 300000,
            harvestDate: "2024-01-05",
            expiryDate: "2024-12-31",
            location: "Kano State",
            description: "High-quality local rice, properly dried and cleaned.",
            images: ["/placeholder.svg?height=100&width=100"],
            status: "pending",
            qualityGrade: "Not Graded",
            submissionDate: "2024-01-16",
          },
          {
            id: "3",
            name: "Sweet Potatoes",
            category: "Tubers",
            farmerName: "Ibrahim Musa",
            farmerEmail: "ibrahim@example.com",
            quantity: 300,
            unit: "kg",
            pricePerUnit: 150,
            totalValue: 45000,
            harvestDate: "2024-01-12",
            expiryDate: "2024-02-12",
            location: "Sokoto State",
            description: "Fresh sweet potatoes, perfect for both local and export markets.",
            images: ["/placeholder.svg?height=100&width=100"],
            status: "pending",
            qualityGrade: "Not Graded",
            submissionDate: "2024-01-17",
          },
        ]
        setProduce(mockProduce)
        setFilteredProduce(mockProduce)
      } finally {
        setLoading(false)
      }
    }

    fetchProduce()
  }, [])

  useEffect(() => {
    const filtered = produce.filter(
      (item) =>
        (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.farmerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredProduce(filtered)
  }, [searchTerm, produce])

  const updateProduceStatus = async (
    produceId: string,
    newStatus: "approved" | "rejected",
    qualityGrade?: "A" | "B" | "C",
  ) => {
    try {
      const updateData: any = { status: newStatus }
      if (qualityGrade) {
        updateData.qualityGrade = qualityGrade
      }

      await updateDoc(doc(db, "produce", produceId), updateData)
      setProduce(
        produce.map((item) =>
          item.id === produceId
            ? {
                ...item,
                status: newStatus,
                qualityGrade: qualityGrade || item.qualityGrade,
              }
            : item,
        ),
      )
      toast({
        title: "Success",
        description: `Produce ${newStatus} successfully`,
      })
    } catch (error) {
      console.error("Error updating produce status:", error)
      toast({
        title: "Error",
        description: "Failed to update produce status",
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
        return <Badge variant="secondary">Pending Review</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getQualityBadge = (grade: string) => {
    switch (grade) {
      case "A":
        return <Badge className="bg-green-500">Grade A</Badge>
      case "B":
        return <Badge className="bg-yellow-500">Grade B</Badge>
      case "C":
        return <Badge className="bg-orange-500">Grade C</Badge>
      default:
        return <Badge variant="outline">Not Graded</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Vegetables: "bg-green-100 text-green-800",
      Fruits: "bg-red-100 text-red-800",
      Grains: "bg-yellow-100 text-yellow-800",
      Tubers: "bg-purple-100 text-purple-800",
      Legumes: "bg-blue-100 text-blue-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
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
              <BreadcrumbPage>Produce Approval</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Package className="h-5 w-5" />
              </div>
              Produce Management
            </h1>
            <p className="text-muted-foreground">
              Review and approve farmer produce listings on the Bayangida platform
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produce Approval Queue
              </CardTitle>
              <CardDescription>Review quality and approve produce listings from farmers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search produce by name, category, farmer, or location..."
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
                      <TableHead className="font-semibold">Produce Details</TableHead>
                      <TableHead className="font-semibold">Farmer</TableHead>
                      <TableHead className="font-semibold">Quantity & Price</TableHead>
                      <TableHead className="font-semibold">Dates</TableHead>
                      <TableHead className="font-semibold">Quality</TableHead>
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
                            <span>Loading produce...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProduce.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Package className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No produce found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProduce.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.images[0] || "/placeholder.svg"}
                                alt={item.name}
                                className="h-12 w-12 rounded-lg object-cover border"
                              />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <Badge className={`text-xs ${getCategoryColor(item.category)}`}>{item.category}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{item.farmerName}</div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{item.location}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {item.quantity} {item.unit}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>
                                  ₦{item.pricePerUnit}/{item.unit}
                                </span>
                              </div>
                              <div className="text-xs font-medium text-green-600">
                                Total: ₦{item.totalValue.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>Harvested: {new Date(item.harvestDate).toLocaleDateString()}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getQualityBadge(item.qualityGrade)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateProduceStatus(item.id, "approved", "A")}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateProduceStatus(item.id, "rejected")}
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
