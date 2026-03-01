import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useSoilAnalysis() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {

      const formData = new FormData();

      formData.append("image", data.file);
      formData.append("nitrogen", data.nValue);
      formData.append("phosphorus", data.pValue);
      formData.append("potassium", data.kValue);
      formData.append("ph", data.phValue);
      formData.append("location", data.location);

      const response = await fetch(
        "http://localhost:5000/api/soil/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();

      console.log("✅ BACKEND RESPONSE:", result);

      // ✅ CONVERT PYTHON OUTPUT → FRONTEND FORMAT
      return {
        soilType: result.soilType,
        crops: [
          {
            name: result.recommendedCrop,
            score: 95,
          },
          ...(result.alternativeCrops || []).map((c: string) => ({
            name: c,
            score: 75,
          })),
        ],
      };
    },

    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Prediction successful",
      });
    },

    onError: () => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Check backend or Python logs",
      });
    },
  });
}