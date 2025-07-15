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
import { Search, Eye, CheckCircle, X, DollarSign, Calendar, CreditCard, User } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface PayoutRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterType: "farmer" | "driver"
  requesterEmail: string
  amount: number
  bankName: string
  accountNumber: string
  accountName: string
  reason: string
  requestDate: string
  status: "pending" | "approved" | "rejected" | "processed"
  earnings: {
    totalSales?: number
    totalDeliveries?: number
    commission: number
    period: string
  }
  documents: string[]
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [filteredPayouts, setFilteredPayouts] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const payoutsQuery = query(collection(db, "payouts"), where("status", "in", ["pending", "approved"]))
        const payoutsSnapshot = await getDocs(payoutsQuery)
        const payoutsData = payoutsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PayoutRequest[]

        setPayouts(payoutsData)
        setFilteredPayouts(payoutsData)
      } catch (error) {
        console.error("Error fetching payouts:", error)
        // Mock data for demonstration
        const mockPayouts: PayoutRequest[] = [
          {
            id: "1",
            requesterId: "farmer-1",
            requesterName: "Aminu Hassan",
            requesterType: "farmer",
            requesterEmail: "aminu@example.com",
            amount: 150000,
            bankName: "First Bank",
            accountNumber: "1234567890",
            accountName: "Aminu Hassan",
            reason: "Monthly sales earnings",
            requestDate: "2024-01-15",
            status: "pending",
            earnings: {
              totalSales: 200000,
              commission: 150000,
              period: "January 2024",
            },
            documents: ["/placeholder.svg?height=100&width=100"],
          },
          {
            id: "2",
            requesterId: "driver-1",
            requesterName: "Musa Ibrahim",
            requesterType: "driver",
            requesterEmail: "musa@example.com",
            amount: 45000,
            bankName: "GTBank",
            accountNumber: "0987654321",
            accountName: "Musa Ibrahim",
            reason: "Delivery commission for January",
            requestDate: "2024-01-16",
            status: "pending",
            earnings: {
              totalDeliveries: 30,
              commission: 45000,
              period: "January 2024",
            },
            documents: ["/placeholder.svg?height=100&width=100"],
          },
          {
            id: "3",
            requesterId: "farmer-2",
            requesterName: "Fatima Abdullahi",
            requesterType: "farmer",
            requesterEmail: "fatima@example.com",
            amount: 89000,
            bankName: "UBA",
            accountNumber: "1122334455",
            accountName: "Fatima Abdullahi",
            reason: "Rice sales earnings",
            requestDate: "2024-01-17",
            status: "approved",
            earnings: {
              totalSales: 120000,
              commission: 89000,
              period: "January 2024",
            },
            documents: ["/placeholder.svg?height=100&width=100"],
          },
        ]
        setPayouts(mockPayouts)
        setFilteredPayouts(mockPayouts)
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [])

  useEffect(() => {
    const filtered = payouts.filter(
      (payout) =>
        (payout.requesterName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (payout.requesterEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (payout.bankName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (payout.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredPayouts(filtered)
  }, [searchTerm, payouts])

  const updatePayoutStatus = async (payoutId: string, newStatus: "approved" | "rejected" | "processed") => {
    try {
      await updateDoc(doc(db, "payouts", payoutId), {
        status: newStatus,
        processedDate: newStatus === "processed" ? new Date().toISOString() : null,
      })
      setPayouts(
        payouts.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: newStatus,
              }
            : payout,
        ),
      )
      toast({
        title: "Success",
        description: `Payout request ${newStatus} successfully`,
      })
    } catch (error) {
      console.error("Error updating payout status:", error)
      toast({
        title: "Error",
        description: "Failed to update payout status",
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
      case "processed":
        return (
          <Badge variant="default" className="bg-blue-500">
            Processed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRequesterTypeBadge = (type: string) => {
    switch (type) {
      case "farmer":
        return <Badge className="bg-green-100 text-green-800">Farmer</Badge>
      case "driver":
        return <Badge className="bg-blue-100 text-blue-800">Driver</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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
              <BreadcrumbPage>Payout Requests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <DollarSign className="h-5 w-5" />
              </div>
              Payout Management
            </h1>
            <p className="text-muted-foreground">Review and process payout requests from farmers and drivers</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout Requests Queue
              </CardTitle>
              <CardDescription>Process earnings payouts for farmers and drivers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, bank, or reason..."
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
                      <TableHead className="font-semibold">Requester</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Bank Details</TableHead>
                      <TableHead className="font-semibold">Earnings Period</TableHead>
                      <TableHead className="font-semibold">Request Date</TableHead>
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
                            <span>Loading payout requests...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPayouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No payout requests found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayouts.map((payout) => (
                        <TableRow key={payout.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{payout.requesterName}</div>
                                <div className="text-sm text-muted-foreground">{payout.requesterEmail}</div>
                                {getRequesterTypeBadge(payout.requesterType)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-green-600">₦{payout.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{payout.reason}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <CreditCard className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{payout.bankName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{payout.accountNumber}</div>
                              <div className="text-xs">{payout.accountName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{payout.earnings.period}</div>
                              {payout.requesterType === "farmer" ? (
                                <div className="text-xs text-muted-foreground">
                                  Sales: ₦{payout.earnings.totalSales?.toLocaleString()}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  Deliveries: {payout.earnings.totalDeliveries}
                                </div>
                              )}
                              <div className="text-xs text-green-600">
                                Commission: ₦{payout.earnings.commission.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(payout.requestDate).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payout.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePayoutStatus(payout.id, "approved")}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePayoutStatus(payout.id, "rejected")}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {payout.status === "approved" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePayoutStatus(payout.id, "processed")}
                                  className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  Process
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
