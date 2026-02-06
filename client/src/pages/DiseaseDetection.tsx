import { Layout } from "@/components/Layout";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDiseaseDetection } from "@/hooks/use-disease";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, X, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DiseaseDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const mutation = useDiseaseDetection();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      mutation.reset();
    }
  }, [mutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const handleAnalyze = () => {
    if (file) mutation.mutate(file);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    mutation.reset();
  };

  const result = mutation.data;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-gray-900">Crop Health Doctor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your crop leaf to detect diseases instantly using our AI model. 
            Early detection saves harvest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Upload Area */}
          <div className="space-y-4">
            {!preview ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-3 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out bg-gray-50",
                  isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-gray-200 hover:border-primary/50 hover:bg-gray-100"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <UploadCloud className={cn("w-8 h-8", isDragActive ? "text-primary" : "text-gray-400")} />
                </div>
                <p className="text-lg font-medium text-gray-700">Drop your image here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden h-80 bg-black group shadow-lg">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover opacity-90" />
                <button 
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                {/* Scanning Animation Overlay */}
                {mutation.isPending && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <motion.div 
                      className="absolute inset-x-0 h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="bg-black/70 px-6 py-3 rounded-full text-white font-medium flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Scanning Leaf Structure...
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {file && !mutation.isPending && !result && (
              <Button onClick={handleAnalyze} className="w-full btn-primary h-12 text-lg">
                <ImageIcon className="mr-2 w-5 h-5" /> Analyze Image
              </Button>
            )}
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className={cn("border-l-4 shadow-lg overflow-hidden", result.severity === 'High' ? 'border-l-red-500' : 'border-l-yellow-500')}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-400">Diagnosis</p>
                        <h2 className="text-3xl font-display font-bold text-gray-900">{result.disease}</h2>
                      </div>
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-bold",
                        result.severity === 'High' 
                          ? "bg-red-100 text-red-700" 
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {result.severity} Severity
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <ShieldCheck className="w-5 h-5" />
                          <h3 className="font-semibold">Recommended Treatment</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {result.treatment}
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                          Always confirm this diagnosis with a local agronomist before applying chemical treatments.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-80 flex items-center justify-center text-center p-8 text-gray-400 border border-dashed border-gray-200 rounded-3xl bg-gray-50/30">
                <div>
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-gray-500">Waiting for analysis</h3>
                  <p className="text-sm mt-2">Upload an image and click analyze to see results here.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
