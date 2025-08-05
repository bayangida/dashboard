"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Upload, ImageIcon, Sprout, X } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { uploadImageToStorage } from "@/lib/storage"

const categories = [
  "Grains and Legumes",
  "Tubers",
  "Fruits and Nuts",
  "Poultry",
  "Vegetables and Melons",
  "Livestock",
  "Fish and aquaculture",
  "Animal product",
  "Oil",
  "Cash crops",
  "Flowers",
  "Spices and Herbs",
  "By products",
  "Seed and seedlings",
  "Processed products",
]

const sizes = ["Small", "Medium", "Large"]
const units = ["kg", "g", "lb", "oz", "piece", "bunch", "bag"]

export default function ListProducePage() {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    price: 0,
    size: "",
    farmerName: "",
    farmerPhone: "",
    farmerLocation: "",
    quantity: 1,
    unit: "kg",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image for the produce",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Upload image using the utility function
      const imageUrl = await uploadImageToStorage(selectedImage, "produce")

      // Generate a unique order ID (similar to Flutter implementation)
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`

      // Save to Firestore - matching the Flutter structure
      await addDoc(collection(db, "produce_listings"), {
        // Product information
        productName: formData.productName,
        productImage: imageUrl,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        size: formData.size,
        quantity: formData.quantity,
        unit: formData.unit,
        status: "active", // Matches Flutter status
        
        // Farmer information
        sellerId: "extension_officer", // Default value since we don't have auth
        sellerName: formData.farmerName,
        sellerPhone: formData.farmerPhone,
        sellerLocation: formData.farmerLocation,
        
        // System fields
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        listedBy: "extension_officer",
      })

      toast({
        title: "Success",
        description: "Produce listed successfully!",
      })

      // Reset form
      setFormData({
        productName: "",
        category: "",
        description: "",
        price: 0,
        size: "",
        farmerName: "",
        farmerPhone: "",
        farmerLocation: "",
        quantity: 1,
        unit: "kg",
      })
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error listing produce:", error)
      toast({
        title: "Error",
        description: "Failed to list produce. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                <BreadcrumbPage>List Produce</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Sprout className="h-5 w-5" />
            </div>
            List Produce for Farmer
          </h1>
          <p className="text-muted-foreground">Help farmers list their produce on the Bayangida platform</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Produce Information
            </CardTitle>
            <CardDescription>Fill in the details for the farmer's produce listing</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Produce Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Produce Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="productName">Produce Name *</Label>
                    <Input
                      id="productName"
                      placeholder="E.g Tomatoes"
                      value={formData.productName}
                      onChange={(e) => handleInputChange("productName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the produce quality, harvest details, etc."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="5000"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size *</Label>
                      <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Farmer Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="farmerName">Farmer Name *</Label>
                    <Input
                      id="farmerName"
                      placeholder="Enter farmer's full name"
                      value={formData.farmerName}
                      onChange={(e) => handleInputChange("farmerName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmerPhone">Phone Number *</Label>
                    <Input
                      id="farmerPhone"
                      placeholder="+234 801 234 5678"
                      value={formData.farmerPhone}
                      onChange={(e) => handleInputChange("farmerPhone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmerLocation">Farm Location *</Label>
                    <Input
                      id="farmerLocation"
                      placeholder="State, LGA, Village"
                      value={formData.farmerLocation}
                      onChange={(e) => handleInputChange("farmerLocation", e.target.value)}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Upload Image *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Produce preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-muted-foreground">
                                Click to upload produce image
                              </span>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {loading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Listing Produce...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      List Produce
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}