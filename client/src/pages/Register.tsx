import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    register.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-551e5051d939?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-display font-bold mb-6">
            Grow with SmartFarm.
          </h1>

          <p className="text-lg text-emerald-100 leading-relaxed">
            Create your account to unlock intelligent soil insights,
            AI-powered crop protection, and live agricultural market trends —
            all in one place.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50/50 relative">

        {/* Soft green glow (Option 3 style) */}
        <div className="absolute w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-10"></div>

        <div className="relative w-full max-w-md bg-white p-8 rounded-3xl 
          shadow-xl 
          border border-emerald-200/70 
          shadow-[0_0_35px_rgba(16,185,129,0.25)]">

          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-6">
            Create Account
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11" />
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
                      <Input type="password" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}