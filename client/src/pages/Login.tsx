import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login.mutate(values);
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-551e5051d939?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        {/* Farm landscape background */}
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6">Farming made smarter.</h1>
          <p className="text-lg text-emerald-100 leading-relaxed">
            Access advanced soil analysis, real-time disease detection, and live market prices to maximize your yield and profits.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-500">Enter your credentials to access your dashboard</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input placeholder="farmer@example.com" className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-base rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50" onClick={() => login.mutate({ username: "Guest", password: "password" })}>
              Continue as Guest
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
