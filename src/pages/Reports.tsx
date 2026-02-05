 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { FileText, Download, Calendar, TrendingUp, Package, MapPin } from "lucide-react";
 
 const reportTypes = [
   {
     title: "Revenue Report",
     description: "Comprehensive revenue analysis by product, region, and time period",
     icon: TrendingUp,
   },
   {
     title: "Product Performance",
     description: "Detailed breakdown of product sales, margins, and stock levels",
     icon: Package,
   },
   {
     title: "Regional Analysis",
     description: "Market performance across different regions and demographics",
     icon: MapPin,
   },
   {
     title: "Monthly Summary",
     description: "Month-over-month comparison of key business metrics",
     icon: Calendar,
   },
 ];
 
 export default function Reports() {
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Reports</h1>
           <p className="text-muted-foreground">Generate and download business reports</p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {reportTypes.map((report) => (
             <Card key={report.title} className="border-border">
               <CardHeader>
                 <div className="flex items-start justify-between">
                   <div className="p-2 rounded-lg bg-primary/10">
                     <report.icon className="h-5 w-5 text-primary" />
                   </div>
                   <Button variant="outline" size="sm">
                     <Download className="h-4 w-4 mr-2" />
                     Generate
                   </Button>
                 </div>
                 <CardTitle className="text-foreground">{report.title}</CardTitle>
                 <CardDescription>{report.description}</CardDescription>
               </CardHeader>
             </Card>
           ))}
         </div>
 
         <Card className="border-border">
           <CardHeader>
             <CardTitle className="text-foreground flex items-center gap-2">
               <FileText className="h-5 w-5" />
               Recent Reports
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground text-center py-8">
               No reports generated yet. Click "Generate" on any report type above to create your first report.
             </p>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }