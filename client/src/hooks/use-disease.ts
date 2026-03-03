import { useMutation } from "@tanstack/react-query";

export interface DiseaseResponse {
  plant: string;
  status: string;
  disease: string | null;
}

export function useDiseaseDetection() {
  return useMutation<DiseaseResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/plant/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      return response.json();
    },
  });
}