 import { useState } from "react";
 import { subDays } from "date-fns";
 import { DateRange } from "react-day-picker";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { KPICard } from "@/components/dashboard/KPICard";
 import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
 import { RevenueChart } from "@/components/dashboard/RevenueChart";
 import { CategoryDistributionChart } from "@/components/dashboard/CategoryDistributionChart";
 import { RegionalPerformanceChart } from "@/components/dashboard/RegionalPerformanceChart";
 import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
 import {
   DollarSign,
   Package,
   TrendingUp,
   Users,
 } from "lucide-react";
 
 export default function Dashboard() {
   const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: subDays(new Date(), 30),
     to: new Date(),
   });
 
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
             <p className="text-muted-foreground">
               Healthcare & Pharmacy Diversification Overview
             </p>
           </div>
           <DateRangeFilter
             dateRange={dateRange}
             onDateRangeChange={setDateRange}
           />
         </div>
 
         {/* KPI Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <KPICard
             title="Total Revenue"
             value="$2.4M"
             change={12.5}
             icon={DollarSign}
           />
           <KPICard
             title="Active Products"
             value="1,284"
             change={8.2}
             icon={Package}
           />
           <KPICard
             title="Market Share"
             value="23.5%"
             change={2.1}
             icon={TrendingUp}
           />
           <KPICard
             title="Active Suppliers"
             value="156"
             change={-3.2}
             icon={Users}
           />
         </div>
 
         {/* Charts Row 1 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <RevenueChart />
           <CategoryDistributionChart />
         </div>
 
         {/* Charts Row 2 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <RegionalPerformanceChart />
           <TopProductsTable />
         </div>
       </div>
     </DashboardLayout>
   );
 }