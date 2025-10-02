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
import { Search, Eye, Phone, Mail, MapPin, Users, Sprout, Plus, UserPlus, MoreVertical, Trash2, Ban, CheckCircle } from "lucide-react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore"
import { createUserWithEmailAndPassword, updatePassword, deleteUser } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExtensionOfficer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  specialization: string
  assignedFarmers: number
  activeListings: number
  status: "active" | "suspended"
  joinDate: string
  lastActive: string
  userId?: string
}

export default function ExtensionOfficersPage() {
  const [officers, setOfficers] = useState<ExtensionOfficer[]>([])
  const [filteredOfficers, setFilteredOfficers] = useState<ExtensionOfficer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOfficerDialogOpen, setIsAddOfficerDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState<ExtensionOfficer | null>(null)
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    specialization: "",
    password: ""
  })
  const { toast } = useToast()

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

  const handleAddOfficer = async () => {
    try {
      // Create Firebase authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, newOfficer.email, newOfficer.password)
      const userId = userCredential.user.uid

      // Create officer document in Firestore
      const officerData = {
        name: newOfficer.name,
        email: newOfficer.email,
        phone: newOfficer.phone,
        location: newOfficer.location,
        specialization: newOfficer.specialization,
        assignedFarmers: 0,
        activeListings: 0,
        status: "active",
        joinDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        userId: userId,
        role: "extension_officer"
      }

      await addDoc(collection(db, "extension_officers"), officerData)

      // Add to local state
      const newOfficerWithId = {
        id: userId,
        ...officerData,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      } as ExtensionOfficer

      setOfficers([...officers, newOfficerWithId])
      setFilteredOfficers([...filteredOfficers, newOfficerWithId])

      toast({
        title: "Success",
        description: "Extension officer added successfully!",
      })

      // Reset form and close dialog
      setNewOfficer({
        name: "",
        email: "",
        phone: "",
        location: "",
        specialization: "",
        password: ""
      })
      setIsAddOfficerDialogOpen(false)
    } catch (error: any) {
      console.error("Error adding extension officer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add extension officer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSuspendOfficer = async (officer: ExtensionOfficer) => {
  try {
    const newStatus: "active" | "suspended" = officer.status === "active" ? "suspended" : "active"
    
    // Update in Firestore
    const officerRef = doc(db, "extension_officers", officer.id)
    await updateDoc(officerRef, {
      status: newStatus,
      lastActive: serverTimestamp()
    })

    // Update local state - properly type the updated officer
    const updatedOfficers = officers.map(o => 
      o.id === officer.id ? { ...o, status: newStatus } : o
    ) as ExtensionOfficer[]
    
    setOfficers(updatedOfficers)
    setFilteredOfficers(updatedOfficers.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    toast({
      title: "Success",
      description: `Officer ${newStatus === "suspended" ? "suspended" : "reactivated"} successfully!`,
    })

    setIsSuspendDialogOpen(false)
    setSelectedOfficer(null)
  } catch (error) {
    console.error("Error updating officer status:", error)
    toast({
      title: "Error",
      description: "Failed to update officer status. Please try again.",
      variant: "destructive",
    })
  }
}

const handleDeleteOfficer = async (officer: ExtensionOfficer) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "extension_officers", officer.id))

    // If there's a Firebase Auth user, delete it too
    if (officer.userId) {
      try {
        // Note: In a real app, you might want to use a Cloud Function to delete the auth user
        // since this requires admin privileges on the client side
        console.log("Auth user deletion would happen here with admin privileges")
      } catch (authError) {
        console.error("Error deleting auth user:", authError)
        // Continue with Firestore deletion even if auth deletion fails
      }
    }

    // Update local state
    const updatedOfficers = officers.filter(o => o.id !== officer.id)
    setOfficers(updatedOfficers)
    setFilteredOfficers(updatedOfficers.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    toast({
      title: "Success",
      description: "Officer deleted successfully!",
    })

    setIsDeleteDialogOpen(false)
    setSelectedOfficer(null)
  } catch (error) {
    console.error("Error deleting officer:", error)
    toast({
      title: "Error",
      description: "Failed to delete officer. Please try again.",
      variant: "destructive",
    })
  }
}

  

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
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
              <Dialog open={isAddOfficerDialogOpen} onOpenChange={setIsAddOfficerDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Officer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Extension Officer</DialogTitle>
                    <DialogDescription>
                      Add a new extension officer to the platform. They will receive login credentials.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter officer's full name"
                        value={newOfficer.name}
                        onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter officer's email"
                        value={newOfficer.email}
                        onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter officer's phone number"
                        value={newOfficer.phone}
                        onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Enter officer's location"
                        value={newOfficer.location}
                        onChange={(e) => setNewOfficer({ ...newOfficer, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        placeholder="Enter officer's specialization"
                        value={newOfficer.specialization}
                        onChange={(e) => setNewOfficer({ ...newOfficer, specialization: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Set a password for the officer"
                        value={newOfficer.password}
                        onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOfficerDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddOfficer}>Add Officer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <TableHead className="font-semibold w-12">#</TableHead>
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
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>Loading officers...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOfficers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Users className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">No officers found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOfficers.map((officer, index) => (
                      <TableRow key={officer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="text-sm text-muted-foreground font-medium">
                            {index + 1}
                          </div>
                        </TableCell>
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
                            <Link href={`/dashboard/extension/officers/${officer.id}`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOfficer(officer)
                                  setIsSuspendDialogOpen(true)
                                }}>
                                  {officer.status === "active" ? (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend Account
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Reactivate Account
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOfficer(officer)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Suspend/Reactivate Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOfficer?.status === "active" ? "Suspend Officer" : "Reactivate Officer"}
            </DialogTitle>
            <DialogDescription>
              {selectedOfficer?.status === "active" 
                ? `Are you sure you want to suspend ${selectedOfficer?.name}? They will not be able to login until reactivated.`
                : `Are you sure you want to reactivate ${selectedOfficer?.name}? They will be able to login again.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSuspendDialogOpen(false)
              setSelectedOfficer(null)
            }}>
              Cancel
            </Button>
            <Button 
              variant={selectedOfficer?.status === "active" ? "destructive" : "default"}
              onClick={() => selectedOfficer && handleSuspendOfficer(selectedOfficer)}
            >
              {selectedOfficer?.status === "active" ? "Suspend Officer" : "Reactivate Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Officer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOfficer?.name}? This action cannot be undone and all their data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setSelectedOfficer(null)
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedOfficer && handleDeleteOfficer(selectedOfficer)}
            >
              Delete Officer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}