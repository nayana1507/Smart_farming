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

// ✅ HANDLE BACKEND ERROR
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

  // ==========================
  // UI
  // ==========================
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ================= FORM ================= */}
        <Card>
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
                <div {...getRootProps()}
                  className="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer">

                  <input {...getInputProps()} />

                  <UploadCloud className="mx-auto mb-2" />

                  <p>Upload Soil Image</p>
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
                      className="absolute top-2 right-2 bg-white p-1 rounded"
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
<Card>
  <CardHeader>
    <CardTitle>Result</CardTitle>
  </CardHeader>

  <CardContent>

    {!result ? (
      <p>No analysis yet</p>
    ) : (
      <div className="space-y-3">

        <p>
          <b>Soil Type:</b> {result.soilType}
        </p>

        <p>
          <b>Recommended Crop:</b> {result.recommendedCrop}
        </p>

        <p>
          <b>Alternative Crops:</b>{" "}
          {result.alternativeCrops?.join(", ")}
        </p>

        {/* ✅ NEW IRRIGATION */}
        <p>
          <b>Irrigation Method:</b>{" "}
          {result.irrigationMethod || "Not Available"}
        </p>

        {/* ✅ NEW FERTILIZER */}
        <p>
          <b>Fertilizer Recommendation:</b>{" "}
          {result.fertilizerRecommendation || "Not Available"}
        </p>

        {/* ✅ DEBUG (REMOVE LATER) */}
        {/* <pre>{JSON.stringify(result, null, 2)}</pre> */}

      </div>
    )}

  </CardContent>
</Card>
      </div>
    </Layout>
  );
}