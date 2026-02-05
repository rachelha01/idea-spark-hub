 import { useAuth } from "@/contexts/AuthContext";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Separator } from "@/components/ui/separator";
 import { User, Bell, Shield, Palette } from "lucide-react";
 
 export default function Settings() {
   const { user } = useAuth();
 
   return (
     <DashboardLayout>
       <div className="p-6 space-y-6">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Settings</h1>
           <p className="text-muted-foreground">Manage your account and preferences</p>
         </div>
 
         <div className="grid gap-6">
           {/* Profile Settings */}
           <Card className="border-border">
             <CardHeader>
               <div className="flex items-center gap-2">
                 <User className="h-5 w-5 text-primary" />
                 <CardTitle className="text-foreground">Profile</CardTitle>
               </div>
               <CardDescription>Update your personal information</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid gap-4 sm:grid-cols-2">
                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input id="email" value={user?.email || ""} disabled />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="name">Display Name</Label>
                   <Input id="name" placeholder="Your name" />
                 </div>
               </div>
               <Button>Save Changes</Button>
             </CardContent>
           </Card>
 
           {/* Notifications */}
           <Card className="border-border">
             <CardHeader>
               <div className="flex items-center gap-2">
                 <Bell className="h-5 w-5 text-primary" />
                 <CardTitle className="text-foreground">Notifications</CardTitle>
               </div>
               <CardDescription>Configure how you receive notifications</CardDescription>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground text-sm">
                 Notification settings coming soon.
               </p>
             </CardContent>
           </Card>
 
           {/* Security */}
           <Card className="border-border">
             <CardHeader>
               <div className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-primary" />
                 <CardTitle className="text-foreground">Security</CardTitle>
               </div>
               <CardDescription>Manage your account security</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label>Password</Label>
                 <p className="text-sm text-muted-foreground">
                   Change your password to keep your account secure.
                 </p>
               </div>
               <Button variant="outline">Change Password</Button>
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 }