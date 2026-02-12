import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import bgImage from "@/assets/B7-background.jpg";
import logoLight from "@/assets/B7-logo-nobg.png";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If identifier doesn't contain @, try to find email by name
    let email = identifier;
    if (!identifier.includes("@")) {
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .ilike("display_name", identifier)
        .single();
      if (data?.email) {
        email = data.email;
      } else {
        toast.error("User tidak ditemukan");
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Login gagal: " + error.message);
    } else {
      toast.success("Selamat datang!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md border-border relative z-10 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img src={logoLight} alt="Bintang Toedjoe" className="h-16 object-contain" />
          </div>
          <p className="text-muted-foreground text-sm">
            Diversifikasi RM & QC Monitoring System
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-id">Nama / Email</Label>
              <Input
                id="login-id"
                type="text"
                placeholder="nama atau email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
}
