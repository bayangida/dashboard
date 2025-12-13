"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Eye, 
  CheckCircle, 
  X, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  User, 
  Download,
  Filter,
  ChevronDown,
  FileText
} from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PayoutRequest {
  id: string
  withdrawalId: string
  userId: string
  userName: string
  userEmail: string
  userType: "farmer" | "driver"
  amount: number
  bankName: string
  accountNumber: string
  accountName: string
  reason?: string
  requestDate: string
  status: "pending" | "approved" | "rejected" | "processed"
  orderIds: string[]
  createdAt: string
  earnings?: {
    totalSales?: number
    totalDeliveries?: number
    commission: number
    period: string
  }
}

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "processed"

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [filteredPayouts, setFilteredPayouts] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "user", "amount", "bankDetails", "date", "status", "actions"
  ])
  const { toast } = useToast()

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true)
        
        // Fetch all withdrawal requests
        const withdrawalsQuery = query(
          collection(db, "withdrawals"), 
          where("status", "in", ["pending", "approved", "rejected", "processed"])
        )
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
        
        const payoutsData: PayoutRequest[] = []
        
        // Process each withdrawal and fetch user details
        for (const withdrawalDoc of withdrawalsSnapshot.docs) {
          const withdrawalData = withdrawalDoc.data()
          
          // Fetch user details to get user type, email, and name
          const userDoc = await getDoc(doc(db, "users", withdrawalData.userId))
          const userData = userDoc.data()
          
          // Determine user type based on user data or document structure
          const userType = userData?.userType || 
                          (userData?.role === "driver" ? "driver" : "farmer")
          
          // Get user name and email
          const userName = userData?.name || userData?.fullName || userData?.username || "Unknown User"
          const userEmail = userData?.email || "No email"
          
          // Get bank details from user document
          const bankDetails = userData?.bankDetails || {}
          
          // Create payout request object
          const payoutRequest: PayoutRequest = {
            id: withdrawalDoc.id,
            withdrawalId: withdrawalData.withdrawalId || withdrawalDoc.id,
            userId: withdrawalData.userId,
            userName,
            userEmail,
            userType,
            amount: withdrawalData.amount || 0,
            bankName: bankDetails.bankName || withdrawalData.bankName || "Not specified",
            accountNumber: bankDetails.accountNumber || withdrawalData.accountNumber || "Not specified",
            accountName: bankDetails.accountName || withdrawalData.accountName || "Not specified",
            reason: `Withdrawal request for earnings`,
            requestDate: withdrawalData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            status: withdrawalData.status || "pending",
            orderIds: withdrawalData.orderIds || [],
            createdAt: withdrawalData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            earnings: {
              commission: withdrawalData.amount || 0,
              period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
          }
          
          payoutsData.push(payoutRequest)
        }
        
        setPayouts(payoutsData)
        
      } catch (error) {
        console.error("Error fetching payouts:", error)
        
        // Mock data for demonstration if Firebase fails
        const mockPayouts: PayoutRequest[] = [
          {
            id: "1",
            withdrawalId: "withdrawal-1",
            userId: "farmer-1",
            userName: "Aminu Hassan",
            userEmail: "aminu@example.com",
            userType: "farmer",
            amount: 150000,
            bankName: "First Bank",
            accountNumber: "1234567890",
            accountName: "Aminu Hassan",
            reason: "Monthly sales earnings withdrawal",
            requestDate: "2024-01-15",
            status: "pending",
            orderIds: ["order-1", "order-2"],
            createdAt: "2024-01-15",
            earnings: {
              totalSales: 200000,
              commission: 150000,
              period: "January 2024"
            }
          },
          {
            id: "2",
            withdrawalId: "withdrawal-2",
            userId: "driver-1",
            userName: "Musa Ibrahim",
            userEmail: "musa@example.com",
            userType: "driver",
            amount: 45000,
            bankName: "GTBank",
            accountNumber: "0987654321",
            accountName: "Musa Ibrahim",
            reason: "Delivery commission withdrawal",
            requestDate: "2024-01-16",
            status: "approved",
            orderIds: ["order-3", "order-4"],
            createdAt: "2024-01-16",
            earnings: {
              totalDeliveries: 30,
              commission: 45000,
              period: "January 2024"
            }
          },
          {
            id: "3",
            withdrawalId: "withdrawal-3",
            userId: "farmer-2",
            userName: "Chinedu Okoro",
            userEmail: "chinedu@example.com",
            userType: "farmer",
            amount: 75000,
            bankName: "Access Bank",
            accountNumber: "2345678901",
            accountName: "Chinedu Okoro",
            reason: "Weekly sales withdrawal",
            requestDate: "2024-01-17",
            status: "rejected",
            orderIds: ["order-5"],
            createdAt: "2024-01-17",
            earnings: {
              totalSales: 100000,
              commission: 75000,
              period: "January 2024"
            }
          },
          {
            id: "4",
            withdrawalId: "withdrawal-4",
            userId: "driver-2",
            userName: "Tunde Lawal",
            userEmail: "tunde@example.com",
            userType: "driver",
            amount: 32000,
            bankName: "Zenith Bank",
            accountNumber: "3456789012",
            accountName: "Tunde Lawal",
            reason: "Delivery commission withdrawal",
            requestDate: "2024-01-18",
            status: "processed",
            orderIds: ["order-6", "order-7", "order-8"],
            createdAt: "2024-01-18",
            earnings: {
              totalDeliveries: 25,
              commission: 32000,
              period: "January 2024"
            }
          }
        ]
        setPayouts(mockPayouts)
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [])

  useEffect(() => {
    let filtered = payouts

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payout) =>
          payout.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payout.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payout.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payout.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payout) => payout.status === statusFilter)
    }

    setFilteredPayouts(filtered)
  }, [searchTerm, statusFilter, payouts])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      total: payouts.length,
      totalAmount: payouts.reduce((sum, payout) => sum + payout.amount, 0),
      pending: payouts.filter(p => p.status === "pending").length,
      approved: payouts.filter(p => p.status === "approved").length,
      processed: payouts.filter(p => p.status === "processed").length,
      rejected: payouts.filter(p => p.status === "rejected").length,
    }
    return stats
  }, [payouts])

  const updatePayoutStatus = async (payoutId: string, newStatus: "approved" | "rejected" | "processed") => {
    try {
      // Update the withdrawal document in Firestore
      await updateDoc(doc(db, "withdrawals", payoutId), {
        status: newStatus,
        processedDate: newStatus === "processed" ? new Date().toISOString() : null,
        processedBy: "admin",
      })

      // If status is processed, update related orders if needed
      if (newStatus === "processed") {
        const payout = payouts.find(p => p.id === payoutId)
        if (payout) {
          console.log(`Marking orders as paid: ${payout.orderIds.join(', ')}`)
        }
      }

      // Update local state
      setPayouts(
        payouts.map((payout) =>
          payout.id === payoutId
            ? {
                ...payout,
                status: newStatus,
              }
            : payout
        )
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

  const viewPayoutDetails = (payout: PayoutRequest) => {
    toast({
      title: "Payout Details",
      description: (
        <div className="space-y-2">
          <div><strong>User:</strong> {payout.userName} ({payout.userEmail})</div>
          <div><strong>Amount:</strong> ₦{payout.amount.toLocaleString()}</div>
          <div><strong>Bank:</strong> {payout.bankName} - {payout.accountNumber}</div>
          <div><strong>Orders:</strong> {payout.orderIds.length} orders</div>
          <div><strong>Request Date:</strong> {new Date(payout.requestDate).toLocaleDateString()}</div>
          <div><strong>Status:</strong> {payout.status.toUpperCase()}</div>
          {payout.reason && <div><strong>Reason:</strong> {payout.reason}</div>}
        </div>
      ),
    })
  }

  // Function to convert data to CSV format
  const convertToCSV = (data: PayoutRequest[], columns: string[] = selectedColumns) => {
    const headersMap: Record<string, string> = {
      "user": "User Name",
      "email": "User Email",
      "userType": "User Type",
      "amount": "Amount (₦)",
      "bankDetails": "Bank Details",
      "accountNumber": "Account Number",
      "accountName": "Account Name",
      "date": "Request Date",
      "status": "Status",
      "orders": "No. of Orders",
      "withdrawalId": "Withdrawal ID",
      "period": "Earnings Period"
    }

    // Default headers for export
    const defaultHeaders = [
      'Withdrawal ID',
      'User Name',
      'User Email',
      'User Type',
      'Amount (₦)',
      'Bank Name',
      'Account Number',
      'Account Name',
      'Status',
      'Request Date',
      'No. of Orders',
      'Earnings Period'
    ]
    
    const rows = data.map(payout => [
      payout.withdrawalId,
      payout.userName,
      payout.userEmail,
      payout.userType.toUpperCase(),
      payout.amount,
      payout.bankName,
      payout.accountNumber,
      payout.accountName,
      payout.status.toUpperCase(),
      new Date(payout.requestDate).toLocaleDateString(),
      payout.orderIds.length,
      payout.earnings?.period || 'N/A'
    ])
    
    return [defaultHeaders, ...rows].map(row => row.join(',')).join('\n')
  }

  // Function to download CSV
  const downloadCSV = (data: PayoutRequest[], filename: string = 'payouts_export') => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No payouts to export",
        variant: "destructive",
      })
      return
    }
    
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: `Downloaded ${data.length} records as CSV`,
    })
  }

  // Function to export all payouts
  const exportAllPayouts = () => {
    downloadCSV(payouts, 'all_payouts')
  }

  // Function to export filtered payouts
  const exportFilteredPayouts = () => {
    if (filteredPayouts.length === 0) {
      toast({
        title: "No Data",
        description: "No payouts to export with current filters",
        variant: "destructive",
      })
      return
    }
    downloadCSV(filteredPayouts, 'filtered_payouts')
  }

  // Export by status
  const exportByStatus = (status: StatusFilter) => {
    if (status === "all") {
      exportAllPayouts()
      return
    }
    
    const statusPayouts = payouts.filter(p => p.status === status)
    if (statusPayouts.length === 0) {
      toast({
        title: "No Data",
        description: `No ${status} payouts to export`,
        variant: "destructive",
      })
      return
    }
    
    downloadCSV(statusPayouts, `${status}_payouts`)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                  <div className="text-2xl font-bold">{summaryStats.total}</div>
                  <div className="text-sm">₦{summaryStats.totalAmount.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold">{summaryStats.pending}</div>
                  <div className="text-sm">Awaiting review</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Approved</div>
                  <div className="text-2xl font-bold text-green-600">{summaryStats.approved}</div>
                  <div className="text-sm">Ready to process</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Processed</div>
                  <div className="text-2xl font-bold text-blue-600">{summaryStats.processed}</div>
                  <div className="text-sm">Completed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Rejected</div>
                  <div className="text-2xl font-bold text-red-600">{summaryStats.rejected}</div>
                  <div className="text-sm">Declined requests</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payout Requests Queue
                  </CardTitle>
                  <CardDescription>Process earnings payouts for farmers and drivers</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    disabled={!searchTerm && statusFilter === "all"}
                  >
                    Reset Filters
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportFilteredPayouts()}
                      >
                        Export Filtered ({filteredPayouts.length})
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportAllPayouts()}
                      >
                        Export All ({payouts.length})
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Export by Status</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportByStatus("pending")}
                      >
                        Pending ({summaryStats.pending})
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportByStatus("approved")}
                      >
                        Approved ({summaryStats.approved})
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportByStatus("processed")}
                      >
                        Processed ({summaryStats.processed})
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => exportByStatus("rejected")}
                      >
                        Rejected ({summaryStats.rejected})
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, bank, or account number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Status:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="w-[180px] h-10">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status ({payouts.length})</SelectItem>
                      <SelectItem value="pending">Pending ({summaryStats.pending})</SelectItem>
                      <SelectItem value="approved">Approved ({summaryStats.approved})</SelectItem>
                      <SelectItem value="processed">Processed ({summaryStats.processed})</SelectItem>
                      <SelectItem value="rejected">Rejected ({summaryStats.rejected})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredPayouts.length} of {payouts.length} requests
                  {statusFilter !== "all" && ` (${statusFilter})`}
                </div>
                <div className="text-sm font-medium">
                  Total: ₦{filteredPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Bank Details</TableHead>
                      <TableHead className="font-semibold">Request Date</TableHead>
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
                            <span>Loading payout requests...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPayouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <span className="text-muted-foreground">No payout requests found</span>
                            {(searchTerm || statusFilter !== "all") && (
                              <Button variant="outline" size="sm" onClick={resetFilters}>
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayouts.map((payout) => (
                        <TableRow key={payout.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${payout.userType === 'farmer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{payout.userName}</div>
                                <div className="text-sm text-muted-foreground">{payout.userEmail}</div>
                                {getRequesterTypeBadge(payout.userType)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-green-600">₦{payout.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {payout.orderIds.length} orders
                              </div>
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
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(payout.requestDate).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => viewPayoutDetails(payout)}
                              >
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