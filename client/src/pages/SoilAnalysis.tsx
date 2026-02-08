import { Layout } from "@/components/Layout";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2, Beaker, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSoilAnalysisSchema } from "@shared/schema";
import { useSoilAnalysis } from "@/hooks/use-soil";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Extend schema
const formSchema = insertSoilAnalysisSchema.extend({
  nValue: z.coerce.number().min(0),
  pValue: z.coerce.number().min(0),
  kValue: z.coerce.number().min(0),
  phValue: z.coerce.number().min(0).max(14),
});

export default function SoilAnalysis() {
  const mutation = useSoilAnalysis();

  // Image state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      nValue: undefined,
      pValue: undefined,
      kValue: undefined,
      phValue: undefined,
      timeOfYear: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
  if (!file) {
    alert("Please upload a soil image before analyzing.");
    return;
  }

  mutation.mutate(values);  // ✅ Removed image
}


  const result = mutation.data;
  const chartData = result?.crops.map((c: any) => ({
    name: c.name,
    score: c.score,
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Soil Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Upload soil image and enter nutrient values for analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5" />
                  New Sample
                </CardTitle>
                <CardDescription>
                  Soil image upload is required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* IMAGE UPLOAD (REQUIRED) */}
                    <div>
                      <FormLabel className="text-red-600">
                        Upload Soil Image *
                      </FormLabel>

                      <div
                        {...getRootProps()}
                        className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                          isDragActive
                            ? "border-green-500 bg-green-50"
                            : file
                            ? "border-green-400"
                            : "border-red-300"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {isDragActive
                            ? "Drop the image here..."
                            : "Drag & drop soil image, or click to select"}
                        </p>
                      </div>

                      {!file && (
                        <p className="text-sm text-red-500 mt-2">
                          Soil image is required for analysis.
                        </p>
                      )}

                      {preview && (
                        <div className="mt-4 relative">
                          <img
                            src={preview}
                            alt="Preview"
                            className="rounded-lg max-h-48 object-cover w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* LOCATION */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Location</FormLabel>
                          <FormControl>
                            <Input placeholder="North Field - Plot A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NPK */}
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="nValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>N</FormLabel>
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
                            <FormLabel>P</FormLabel>
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
                            <FormLabel>K</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* PH */}
                    <FormField
                      control={form.control}
                      name="phValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>pH Level</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="14" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={mutation.isPending || !file}
                    >
                      {mutation.isPending && (
                        <Loader2 className="animate-spin mr-2" />
                      )}
                      Analyze Sample
                    </Button>

                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-8 space-y-6">
            {!result ? (
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">
                  Upload soil image and submit form to see analysis.
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Crop Suitability</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Bar dataKey="score">
                        {chartData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.score > 80
                                ? "#10b981"
                                : entry.score > 60
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
