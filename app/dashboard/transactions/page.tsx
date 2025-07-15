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
import { Search, Eye, Truck } from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "paid" | "processing" | "shipped" | "delivered"
  paymentDate: string
  farmerName: string
  assignedDriver?: string
  waybillNumber?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsQuery = query(collection(db, "transactions"), where("status", "in", ["paid", "processing"]))
        const transactionsSnapshot = await getDocs(transactionsQuery)
        const transactionsData = transactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]

        setTransactions(transactionsData)
        setFilteredTransactions(transactionsData)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        // Mock data for demonstration
        const mockTransactions: Transaction[] = [
          {
            id: "1",
            orderId: "ORD-001",
            customerName: "John Doe",
            customerEmail: "john@example.com",
            items: [
              { name: "Fresh Tomatoes", quantity: 10, price: 2000 },
              { name: "Onions", quantity: 5, price: 1500 },
            ],
            totalAmount: 3500,
            status: "paid",
            paymentDate: "2024-01-15",
            farmerName: "Aminu Hassan",
          },
          {
            id: "2",
            orderId: "ORD-002",
            customerName: "Jane Smith",
            customerEmail: "jane@example.com",
            items: [{ name: "Rice", quantity: 20, price: 5000 }],
            totalAmount: 5000,
            status: "processing",
            paymentDate: "2024-01-16",
            farmerName: "Fatima Abdullahi",
            assignedDriver: "Musa Ibrahim",
            waybillNumber: "WB-001",
          },
        ]
        setTransactions(mockTransactions)
        setFilteredTransactions(mockTransactions)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    const filtered = transactions.filter(
      (transaction) =>
        (transaction.orderId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (transaction.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (transaction.farmerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredTransactions(filtered)
  }, [searchTerm, transactions])

  const assignDriver = async (transactionId: string) => {
    try {
      const waybillNumber = `WB-${Date.now()}`
      await updateDoc(doc(db, "transactions", transactionId), {
        status: "processing",
        waybillNumber: waybillNumber,
        assignedDriver: "Available Driver", // In real app, you'd select from available drivers
      })

      setTransactions(
        transactions.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                status: "processing",
                waybillNumber: waybillNumber,
                assignedDriver: "Available Driver",
              }
            : transaction,
        ),
      )

      toast({
        title: "Success",
        description: `Driver assigned and waybill ${waybillNumber} generated`,
      })
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="secondary">Paid</Badge>
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-500">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="default" className="bg-orange-500">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-500">
            Delivered
          </Badge>
        )
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
              <BreadcrumbPage>Transactions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Manage paid orders awaiting waybill processing and driver assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer, or farmer..."
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
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waybill</TableHead>
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
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.customerName}</div>
                              <div className="text-sm text-muted-foreground">{transaction.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.farmerName}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {transaction.items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  {item.name} x{item.quantity}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>₦{transaction.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {transaction.waybillNumber ? (
                              <Badge variant="outline">{transaction.waybillNumber}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {transaction.status === "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => assignDriver(transaction.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Truck className="h-4 w-4" />
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
