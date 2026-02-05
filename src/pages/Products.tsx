 import { useState } from "react";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";
 import { Search, Download, Plus } from "lucide-react";
 
 const mockProducts = [
   { id: "1", name: "Paracetamol 500mg", category: "OTC", sku: "PCM-500", price: 5.99, stock: 1500, status: "active" },
   { id: "2", name: "Amoxicillin 250mg", category: "Prescription", sku: "AMX-250", price: 12.50, stock: 800, status: "active" },
   { id: "3", name: "Vitamin D3 1000IU", category: "Supplements", sku: "VTD-1000", price: 8.99, stock: 2200, status: "active" },
   { id: "4", name: "Insulin Pen", category: "Medical Device", sku: "INS-PEN", price: 45.00, stock: 150, status: "low_stock" },
   { id: "5", name: "Omeprazole 20mg", category: "Prescription", sku: "OMP-20", price: 15.99, stock: 600, status: "active" },
   { id: "6", name: "Blood Pressure Monitor", category: "Medical Device", sku: "BPM-001", price: 89.99, stock: 50, status: "low_stock" },
   { id: "7", name: "Multivitamin Complex", category: "Supplements", sku: "MVC-001", price: 24.99, stock: 1800, status: "active" },
   { id: "8", name: "Ibuprofen 400mg", category: "OTC", sku: "IBU-400", price: 7.49, stock: 1200, status: "active" },
 ];
 
 export default function Products() {
   const [searchQuery, setSearchQuery] = useState("");
 
   const filteredProducts = mockProducts.filter(
     (product) =>
       product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.category.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleExport = () => {
     const csv = [
       ["Name", "Category", "SKU", "Price", "Stock", "Status"],
       ...filteredProducts.map((p) => [p.name, p.category, p.sku, p.price, p.stock, p.status]),
     ]
       .map((row) => row.join(","))
       .join("\n");
 
     const blob = new Blob([csv], { type: "text/csv" });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "products.csv";
     a.click();
   };
 
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold text-foreground">Products</h1>
             <p className="text-muted-foreground">Manage your product catalog</p>
           </div>
           <div className="flex items-center gap-2">
             <Button variant="outline" onClick={handleExport}>
               <Download className="h-4 w-4 mr-2" />
               Export CSV
             </Button>
             <Button>
               <Plus className="h-4 w-4 mr-2" />
               Add Product
             </Button>
           </div>
         </div>
 
         <Card className="border-border">
           <CardHeader>
             <div className="flex items-center justify-between">
               <CardTitle className="text-foreground">Product List</CardTitle>
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9"
                 />
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow className="border-border hover:bg-transparent">
                   <TableHead className="text-muted-foreground">Product</TableHead>
                   <TableHead className="text-muted-foreground">Category</TableHead>
                   <TableHead className="text-muted-foreground">SKU</TableHead>
                   <TableHead className="text-muted-foreground text-right">Price</TableHead>
                   <TableHead className="text-muted-foreground text-right">Stock</TableHead>
                   <TableHead className="text-muted-foreground">Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredProducts.map((product) => (
                   <TableRow key={product.id} className="border-border">
                     <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                     <TableCell className="text-muted-foreground">{product.category}</TableCell>
                     <TableCell className="text-muted-foreground font-mono text-sm">{product.sku}</TableCell>
                     <TableCell className="text-right text-foreground">${product.price.toFixed(2)}</TableCell>
                     <TableCell className="text-right text-foreground">{product.stock.toLocaleString()}</TableCell>
                     <TableCell>
                       <Badge
                         className={
                           product.status === "active"
                             ? "bg-success/20 text-success hover:bg-success/30"
                             : "bg-warning/20 text-warning hover:bg-warning/30"
                         }
                       >
                         {product.status === "active" ? "Active" : "Low Stock"}
                       </Badge>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }