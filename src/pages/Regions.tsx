 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from "recharts";
 
 const regions = [
   { name: "Jakarta", code: "JKT", country: "Indonesia", population: 10560000, revenue: 45000 },
   { name: "Surabaya", code: "SBY", country: "Indonesia", population: 2870000, revenue: 32000 },
   { name: "Bandung", code: "BDG", country: "Indonesia", population: 2500000, revenue: 28000 },
   { name: "Medan", code: "MDN", country: "Indonesia", population: 2200000, revenue: 22000 },
   { name: "Semarang", code: "SMG", country: "Indonesia", population: 1700000, revenue: 18000 },
 ];
 
 export default function Regions() {
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Regions</h1>
           <p className="text-muted-foreground">Regional market performance analysis</p>
         </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="border-border">
             <CardHeader>
               <CardTitle className="text-foreground">Revenue by Region</CardTitle>
             </CardHeader>
             <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={regions}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                   <YAxis
                     stroke="hsl(var(--muted-foreground))"
                     fontSize={12}
                     tickFormatter={(v) => `$${v / 1000}k`}
                   />
                   <Tooltip
                     contentStyle={{
                       backgroundColor: "hsl(var(--card))",
                       border: "1px solid hsl(var(--border))",
                       borderRadius: "8px",
                       color: "hsl(var(--foreground))",
                     }}
                     formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                   />
                   <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </CardContent>
           </Card>
 
           <Card className="border-border">
             <CardHeader>
               <CardTitle className="text-foreground">Region Details</CardTitle>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow className="border-border hover:bg-transparent">
                     <TableHead className="text-muted-foreground">Region</TableHead>
                     <TableHead className="text-muted-foreground">Code</TableHead>
                     <TableHead className="text-muted-foreground text-right">Population</TableHead>
                     <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {regions.map((region) => (
                     <TableRow key={region.code} className="border-border">
                       <TableCell className="font-medium text-foreground">{region.name}</TableCell>
                       <TableCell className="text-muted-foreground font-mono">{region.code}</TableCell>
                       <TableCell className="text-right text-foreground">
                         {(region.population / 1000000).toFixed(1)}M
                       </TableCell>
                       <TableCell className="text-right text-foreground">
                         ${region.revenue.toLocaleString()}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 }