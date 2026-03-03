import { Layout } from "@/components/Layout";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSoilAnalysisSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { motion } from "framer-motion";

// ==========================
// FORM SCHEMA
// ==========================
const formSchema = insertSoilAnalysisSchema.extend({
  nValue: z.coerce.number(),
  pValue: z.coerce.number(),
  kValue: z.coerce.number(),
  phValue: z.coerce.number(),
});

export default function SoilAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ==========================
  // IMAGE DROP
  // ==========================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // ==========================
  // FORM
  // ==========================
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  });

  // ==========================
  // SUBMIT → BACKEND
  // ==========================
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file) {
      alert("Upload soil image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("nitrogen", String(values.nValue));
      formData.append("phosphorus", String(values.pValue));
      formData.append("potassium", String(values.kValue));
      formData.append("ph", String(values.phValue));
      formData.append("location", values.location || "Unknown");

      const response = await fetch(
        "http://localhost:5000/api/soil/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Prediction failed");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    }

    setLoading(false);
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ================= FORM ================= */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Soil Analysis</CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* IMAGE */}
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Upload Soil Image</p>
                </div>

                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      className="rounded-lg max-h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-white p-1 rounded shadow"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* LOCATION */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* NPK */}
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="number"
                    placeholder="N"
                    {...form.register("nValue")}
                  />
                  <Input
                    type="number"
                    placeholder="P"
                    {...form.register("pValue")}
                  />
                  <Input
                    type="number"
                    placeholder="K"
                    {...form.register("kValue")}
                  />
                </div>

                {/* PH */}
                <Input
                  type="number"
                  step="0.1"
                  placeholder="pH"
                  {...form.register("phValue")}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="animate-spin mr-2" />
                  )}
                  Analyze Soil
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ================= RESULT ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-2xl border-0 rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Soil Analysis Result
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!result ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  No analysis yet
                </div>
              ) : (
                <div className="space-y-8">

                  {/* Recommended Crop */}
                  <div className="text-center space-y-2">
                    <p className="text-sm uppercase tracking-wider text-gray-400">
                      Recommended Crop
                    </p>
                    <h2 className="text-4xl font-bold text-green-600">
                      🌱 {result.recommendedCrop?.toUpperCase()}
                    </h2>
                  </div>

                  {/* Soil Type */}
                  <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl">
                    <span className="text-2xl">🧪</span>
                    <div>
                      <p className="text-sm text-gray-500">Soil Type</p>
                      <p className="font-semibold text-gray-800 capitalize">
                        {result.soilType?.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* Alternative Crops */}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      🌾 Alternative Crops
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.alternativeCrops?.map(
                        (crop: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {crop}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Irrigation */}
                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                    <span className="text-2xl">💧</span>
                    <div>
                      <p className="text-sm text-gray-500">Irrigation Method</p>
                      <p className="font-semibold text-gray-800">
                        {result.irrigationMethod || "Not Available"}
                      </p>
                    </div>
                  </div>

                  {/* Fertilizer */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-4">
                      🧂 Fertilizer Recommendation
                    </p>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-lg font-semibold text-gray-800">
                        {result.fertilizerRecommendation || "Not Available"}
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </Layout>
  );
}