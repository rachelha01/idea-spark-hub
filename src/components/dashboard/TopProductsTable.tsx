 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";
 import { TrendingUp, TrendingDown } from "lucide-react";
 
 const products = [
   { name: "Paracetamol 500mg", category: "OTC", revenue: 12500, growth: 8.2, status: "active" },
   { name: "Amoxicillin 250mg", category: "Prescription", revenue: 10800, growth: -2.1, status: "active" },
   { name: "Vitamin D3 1000IU", category: "Supplements", revenue: 9200, growth: 15.4, status: "active" },
   { name: "Insulin Pen", category: "Medical Device", revenue: 8900, growth: 5.7, status: "low_stock" },
   { name: "Omeprazole 20mg", category: "Prescription", revenue: 7600, growth: 3.2, status: "active" },
 ];
 
 export function TopProductsTable() {
   return (
     <Card className="border-border">
       <CardHeader>
         <CardTitle className="text-foreground">Top Performing Products</CardTitle>
       </CardHeader>
       <CardContent>
         <Table>
           <TableHeader>
             <TableRow className="border-border hover:bg-transparent">
               <TableHead className="text-muted-foreground">Product</TableHead>
               <TableHead className="text-muted-foreground">Category</TableHead>
               <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
               <TableHead className="text-muted-foreground text-right">Growth</TableHead>
               <TableHead className="text-muted-foreground">Status</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {products.map((product) => (
               <TableRow key={product.name} className="border-border">
                 <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                 <TableCell className="text-muted-foreground">{product.category}</TableCell>
                 <TableCell className="text-right text-foreground">
                   ${product.revenue.toLocaleString()}
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-1">
                     {product.growth >= 0 ? (
                       <TrendingUp className="h-4 w-4 text-success" />
                     ) : (
                       <TrendingDown className="h-4 w-4 text-destructive" />
                     )}
                     <span className={product.growth >= 0 ? "text-success" : "text-destructive"}>
                       {product.growth >= 0 ? "+" : ""}{product.growth}%
                     </span>
                   </div>
                 </TableCell>
                 <TableCell>
                   <Badge
                     variant={product.status === "active" ? "default" : "secondary"}
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
   );
 }