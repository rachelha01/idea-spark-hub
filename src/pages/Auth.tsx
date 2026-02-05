 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Activity, Loader2 } from "lucide-react";
 import { toast } from "sonner";
 
 export default function Auth() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [displayName, setDisplayName] = useState("");
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
 
     if (error) {
       toast.error(error.message);
     } else {
       toast.success("Welcome back!");
       navigate("/dashboard");
     }
     setLoading(false);
   };
 
   const handleSignUp = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
 
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: window.location.origin,
         data: {
           display_name: displayName,
         },
       },
     });
 
     if (error) {
       toast.error(error.message);
     } else {
       toast.success("Check your email for the confirmation link!");
     }
     setLoading(false);
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-background p-4">
       <Card className="w-full max-w-md border-border">
         <CardHeader className="text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
             <Activity className="h-8 w-8 text-primary" />
             <span className="text-2xl font-bold text-foreground">DiverMon</span>
           </div>
           <CardTitle className="text-foreground">Welcome</CardTitle>
           <CardDescription>
             Healthcare & Pharmacy Diversification Monitoring
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Tabs defaultValue="login" className="w-full">
             <TabsList className="grid w-full grid-cols-2 mb-6">
               <TabsTrigger value="login">Login</TabsTrigger>
               <TabsTrigger value="signup">Sign Up</TabsTrigger>
             </TabsList>
             
             <TabsContent value="login">
               <form onSubmit={handleLogin} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="login-email">Email</Label>
                   <Input
                     id="login-email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="login-password">Password</Label>
                   <Input
                     id="login-password"
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                   />
                 </div>
                 <Button type="submit" className="w-full" disabled={loading}>
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Login
                 </Button>
               </form>
             </TabsContent>
             
             <TabsContent value="signup">
               <form onSubmit={handleSignUp} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signup-name">Display Name</Label>
                   <Input
                     id="signup-name"
                     type="text"
                     placeholder="John Doe"
                     value={displayName}
                     onChange={(e) => setDisplayName(e.target.value)}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="signup-email">Email</Label>
                   <Input
                     id="signup-email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="signup-password">Password</Label>
                   <Input
                     id="signup-password"
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     minLength={6}
                   />
                 </div>
                 <Button type="submit" className="w-full" disabled={loading}>
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Create Account
                 </Button>
               </form>
             </TabsContent>
           </Tabs>
         </CardContent>
       </Card>
     </div>
   );
 }