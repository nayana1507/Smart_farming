import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSoilAnalysisSchema } from "@shared/schema";
import { useSoilAnalysis } from "@/hooks/use-soil";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Beaker, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Extend schema for form validation
const formSchema = insertSoilAnalysisSchema.extend({
  nValue: z.coerce.number().min(0),
  pValue: z.coerce.number().min(0),
  kValue: z.coerce.number().min(0),
});

export default function SoilAnalysis() {
  const mutation = useSoilAnalysis();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      nValue: 0,
      pValue: 0,
      kValue: 0,
      phValue: "7.0",
      timeOfYear: "Spring"
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  const result = mutation.data;

  // Chart data for crop suitability
  const chartData = result?.crops.map(c => ({ name: c.name, score: c.score })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Soil Analysis</h1>
          <p className="text-muted-foreground mt-1">Enter your soil sample data to get crop recommendations and fertilizer plans.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary" />
                  New Sample
                </CardTitle>
                <CardDescription>Enter N-P-K values from your test kit</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Location / ID</FormLabel>
                          <FormControl>
                            <Input placeholder="North Field - Plot A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="nValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nitrogen (N)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Phosphorus (P)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="kValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Potassium (K)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>pH Level</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" max="14" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full btn-primary mt-4" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                      Analyze Sample
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8 space-y-6">
            {!result ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Beaker className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No analysis generated yet</h3>
                <p className="text-gray-500 max-w-sm mt-2">Fill out the form on the left with your soil test results to generate a comprehensive report.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-6">
                      <p className="text-sm font-medium text-emerald-600 mb-1">Soil Fertility</p>
                      <h3 className="text-2xl font-bold text-emerald-900">{result.fertility}</h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6">
                      <p className="text-sm font-medium text-blue-600 mb-1">Soil Type</p>
                      <h3 className="text-2xl font-bold text-blue-900">{result.soilType}</h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-100">
                    <CardContent className="p-6">
                      <p className="text-sm font-medium text-amber-600 mb-1">Condition</p>
                      <h3 className="text-lg font-bold text-amber-900 leading-tight">{result.condition}</h3>
                    </CardContent>
                  </Card>
                </div>

                {/* Crop Recommendations Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Crop Suitability</CardTitle>
                    <CardDescription>Based on current nutrient profile</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fill: '#4b5563'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : entry.score > 60 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Action Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Irrigation Recommendation</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Recommended: <span className="font-medium text-gray-900">{result.irrigation.type}</span>. 
                            Apply {result.irrigation.requirement} water {result.irrigation.frequency}.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="shrink-0">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Fertilizer Adjustment</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Based on your {form.getValues('phValue')} pH, add lime to neutralize acidity before planting sensitive crops like soybeans.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
