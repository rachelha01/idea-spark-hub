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
 
 const mockSuppliers = [
   { id: "1", name: "PharmaCorp Indonesia", category: "Manufacturer", email: "contact@pharmacorp.id", country: "Indonesia", status: "active" },
   { id: "2", name: "MediSupply Co", category: "Distributor", email: "sales@medisupply.com", country: "Singapore", status: "active" },
   { id: "3", name: "HealthChem Labs", category: "Manufacturer", email: "info@healthchem.id", country: "Indonesia", status: "active" },
   { id: "4", name: "Global Pharma Dist", category: "Distributor", email: "orders@globalpharma.com", country: "Malaysia", status: "active" },
   { id: "5", name: "BioMed Solutions", category: "Manufacturer", email: "contact@biomed.id", country: "Indonesia", status: "active" },
 ];
 
 export default function Suppliers() {
   const [searchQuery, setSearchQuery] = useState("");
 
   const filteredSuppliers = mockSuppliers.filter(
     (supplier) =>
       supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       supplier.country.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleExport = () => {
     const csv = [
       ["Name", "Category", "Email", "Country", "Status"],
       ...filteredSuppliers.map((s) => [s.name, s.category, s.email, s.country, s.status]),
     ]
       .map((row) => row.join(","))
       .join("\n");
 
     const blob = new Blob([csv], { type: "text/csv" });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "suppliers.csv";
     a.click();
   };
 
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
             <p className="text-muted-foreground">Manage your supplier network</p>
           </div>
           <div className="flex items-center gap-2">
             <Button variant="outline" onClick={handleExport}>
               <Download className="h-4 w-4 mr-2" />
               Export CSV
             </Button>
             <Button>
               <Plus className="h-4 w-4 mr-2" />
               Add Supplier
             </Button>
           </div>
         </div>
 
         <Card className="border-border">
           <CardHeader>
             <div className="flex items-center justify-between">
               <CardTitle className="text-foreground">Supplier List</CardTitle>
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search suppliers..."
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
                   <TableHead className="text-muted-foreground">Name</TableHead>
                   <TableHead className="text-muted-foreground">Category</TableHead>
                   <TableHead className="text-muted-foreground">Email</TableHead>
                   <TableHead className="text-muted-foreground">Country</TableHead>
                   <TableHead className="text-muted-foreground">Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredSuppliers.map((supplier) => (
                   <TableRow key={supplier.id} className="border-border">
                     <TableCell className="font-medium text-foreground">{supplier.name}</TableCell>
                     <TableCell className="text-muted-foreground">{supplier.category}</TableCell>
                     <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                     <TableCell className="text-muted-foreground">{supplier.country}</TableCell>
                     <TableCell>
                       <Badge className="bg-success/20 text-success hover:bg-success/30">
                         Active
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