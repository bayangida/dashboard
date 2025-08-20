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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, CheckCircle, X, Package, Calendar, MapPin, DollarSign, User, Tag, Ruler } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Produce {
  id: string
  userId: string
  farmerName: string
  produceName: string
  category: string
  description: string
  price: number
  originalPrice: number
  size: string
  availableQuantity: number
  tag: string
  imageUrl: string
  createdAt: any
  updatedAt: any
  status: "active" | "inactive" | "pending" | "approved" | "rejected"
  level?: "approved" | "not approved"
  rejectionReason?: string
}

export default function ProducePage() {
  const [produce, setProduce] = useState<Produce[]>([])
  const [filteredProduce, setFilteredProduce] = useState<Produce[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduce = async () => {
      try {
        const produceQuery = query(collection(db, "produce_listings"), where("status", "==", "active"))
        const produceSnapshot = await getDocs(produceQuery)
        const produceData = produceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Produce[]

        setProduce(produceData)
        setFilteredProduce(produceData)
      } catch (error) {
        console.error("Error fetching produce:", error)
        toast({
          title: "Error",
          description: "Failed to fetch produce listings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduce()
  }, [])

  useEffect(() => {
    const filtered = produce.filter(
      (item) =>
        (item.produceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.farmerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.tag?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredProduce(filtered)
  }, [searchTerm, produce])

  const updateProduceStatus = async (
    produceId: string,
    newStatus: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      const updateData: any = { 
        status: newStatus,
        level: newStatus === "approved" ? "approved" : "not approved"
      }
      
      if (reason) {
        updateData.rejectionReason = reason
      }

      await updateDoc(doc(db, "produce_listings", produceId), updateData)
      setProduce(
        produce.map((item) =>
          item.id === produceId
            ? {
                ...item,
                status: newStatus,
                level: newStatus === "approved" ? "approved" : "not approved",
                rejectionReason: reason || item.rejectionReason,
              }
            : item,
        ),
      )
      
      toast({
        title: "Success",
        description: `Produce ${newStatus} successfully`,
      })
      
      // Close rejection dialog if open
      if (newStatus === "rejected") {
        setIsRejectDialogOpen(false)
        setRejectionReason("")
      }
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
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Grains and Legumes": "bg-yellow-100 text-yellow-800",
      "Tubers": "bg-orange-100 text-orange-800",
      "Fruits and Nuts": "bg-red-100 text-red-800",
      "Vegetables and Melons": "bg-green-100 text-green-800",
      "Livestock": "bg-brown-100 text-brown-800",
      "Poultry": "bg-purple-100 text-purple-800",
      "Fish and Aquaculture": "bg-blue-100 text-blue-800",
      "Animal Products": "bg-pink-100 text-pink-800",
      "Oils": "bg-amber-100 text-amber-800",
      "Cash Crops": "bg-teal-100 text-teal-800",
      "Flowers": "bg-fuchsia-100 text-fuchsia-800",
      "Spices and Herbs": "bg-lime-100 text-lime-800",
      "By-Products": "bg-cyan-100 text-cyan-800",
      "Seeds and Seedlings": "bg-emerald-100 text-emerald-800",
      "Processed Products": "bg-indigo-100 text-indigo-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString()
      }
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  const openRejectDialog = (item: Produce) => {
    setSelectedProduce(item)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
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
                    placeholder="Search produce by name, category, farmer, or tag..."
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
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span>Loading produce...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProduce.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
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
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.produceName}
                                className="h-12 w-12 rounded-lg object-cover border"
                              />
                              <div>
                                <div className="font-medium">{item.produceName}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                                    {item.category}
                                  </Badge>
                                  {item.tag && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.tag}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center font-medium text-sm">
                                <User className="h-3 w-3 mr-1" />
                                {item.farmerName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {item.userId}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium flex items-center">
                                <Ruler className="h-3 w-3 mr-1" />
                                {item.availableQuantity} {item.size}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>₦{item.price.toFixed(2)}/{item.size}</span>
                              </div>
                              {item.originalPrice > item.price && (
                                <div className="text-xs line-through text-muted-foreground">
                                  ₦{item.originalPrice.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span>Created: {formatDate(item.createdAt)}</span>
                              </div>
                              <div className="text-muted-foreground">
                                Updated: {formatDate(item.updatedAt)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => setSelectedProduce(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateProduceStatus(item.id, "approved")}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openRejectDialog(item)}
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

      {/* View Produce Details Dialog */}
      <Dialog open={!!selectedProduce} onOpenChange={(open) => !open && setSelectedProduce(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProduce && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedProduce.produceName}
                </DialogTitle>
                <DialogDescription>
                  Produce details from {selectedProduce.farmerName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <img
                    src={selectedProduce.imageUrl || "/placeholder.svg"}
                    alt={selectedProduce.produceName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <div className="mt-1">
                      <Badge className={getCategoryColor(selectedProduce.category)}>
                        {selectedProduce.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tag/Nickname</Label>
                    <p className="mt-1">{selectedProduce.tag || "No tag provided"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Size & Quantity</Label>
                    <p className="mt-1">
                      {selectedProduce.availableQuantity} {selectedProduce.size} available
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Price</Label>
                    <p className="mt-1">
                      ₦{selectedProduce.price.toFixed(2)} per {selectedProduce.size}
                      {selectedProduce.originalPrice > selectedProduce.price && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          ₦{selectedProduce.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="py-4">
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm">{selectedProduce.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium">Farmer</Label>
                  <p className="mt-1 text-sm">{selectedProduce.farmerName}</p>
                  <p className="text-xs text-muted-foreground">ID: {selectedProduce.userId}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Dates</Label>
                  <p className="mt-1 text-sm">Created: {formatDate(selectedProduce.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">Updated: {formatDate(selectedProduce.updatedAt)}</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProduce(null)}
                >
                  Close
                </Button>
                {selectedProduce.status === "active" && (
                  <>
                    <Button
                      onClick={() => updateProduceStatus(selectedProduce.id, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(selectedProduce)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Produce Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedProduce?.produceName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="text-sm font-medium">
              Reason for rejection
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProduce) {
                  updateProduceStatus(selectedProduce.id, "rejected", rejectionReason)
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}