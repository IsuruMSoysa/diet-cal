"use client";

import { useState, useEffect } from "react";
import { analyzeImageAction, saveMealAction, getUserLabelsAction } from "@/actions/meal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Save, Utensils, X } from "lucide-react";
import Image from "next/image";


export function AddMeal() {
  // Component for adding new meals
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Labels state
  const [userLabels, setUserLabels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [showLabelSuggestions, setShowLabelSuggestions] = useState(false);

  useEffect(() => {
    // Dynamically import auth to avoid SSR issues if any, though client side is fine
    import("@/lib/firebase/client").then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged(async (u) => {
        setUser(u);
        setAuthLoading(false);
        
        // Fetch user labels when authenticated
        if (u) {
          const result = await getUserLabelsAction(u.uid);
          if (result.success && result.data) {
            setUserLabels(result.data);
          }
        }
      });
      return () => unsubscribe();
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setDescription("");
      setSelectedLabels([]);
      setLabelInput("");
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    const result = await analyzeImageAction(formData);
    setIsAnalyzing(false);

    if (result.success) {
      setAnalysisResult(result.data);
    } else {
      alert("Failed to analyze image");
    }
  };

  const handleSave = async () => {
    if (!imageFile || !analysisResult) return;
    
    if (authLoading) {
      alert("Please wait, checking authentication...");
      return;
    }

    if (!user) {
      alert("You must be logged in to save meals.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    
    const mealData = {
      userId: user.uid,
      ...analysisResult,
      labels: selectedLabels
    };

    const result = await saveMealAction(mealData, formData);
    setIsSaving(false);

    if (result.success) {
      alert("Meal saved successfully!");
      setImageFile(null);
      setPreviewUrl(null);
      setAnalysisResult(null);
      setDescription("");
      setSelectedLabels([]);
      setLabelInput("");
      
      // Refresh user labels
      if (user) {
        const labelsResult = await getUserLabelsAction(user.uid);
        if (labelsResult.success && labelsResult.data) {
          setUserLabels(labelsResult.data);
        }
      }
    } else {
      alert(`Failed to save meal: ${result.error}`);
    }
  };

  const addLabel = (label: string) => {
    const trimmedLabel = label.trim().toLowerCase();
    if (trimmedLabel && !selectedLabels.includes(trimmedLabel)) {
      setSelectedLabels([...selectedLabels, trimmedLabel]);
    }
    setLabelInput("");
    setShowLabelSuggestions(false);
  };

  const removeLabel = (label: string) => {
    setSelectedLabels(selectedLabels.filter(l => l !== label));
  };

  const handleLabelInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (labelInput.trim()) {
        addLabel(labelInput);
      }
    }
  };

  const filteredSuggestions = userLabels.filter(
    label => 
      label.toLowerCase().includes(labelInput.toLowerCase()) &&
      !selectedLabels.includes(label)
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Add New Meal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="meal-image">Meal Image</Label>
          <Input id="meal-image" type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {previewUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image src={previewUrl} alt="Meal preview" fill className="object-cover" />
          </div>
        )}

        {imageFile && !analysisResult && (
          <>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                placeholder="Add details for better accuracy (e.g., '2 cups of rice', 'large portion')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This helps improve analysis accuracy but won't be saved.
              </p>
            </div>

            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Meal
                </>
              )}
            </Button>
          </>
        )}

        {analysisResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">Analysis Result</h3>
              <p className="text-sm text-muted-foreground mb-2">{analysisResult.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Total Calories:</div>
                <div>{analysisResult.totalCalories} kcal</div>
                <div className="font-medium">Protein:</div>
                <div>{analysisResult.macros.protein}</div>
                <div className="font-medium">Carbs:</div>
                <div>{analysisResult.macros.carbs}</div>
                <div className="font-medium">Fat:</div>
                <div>{analysisResult.macros.fat}</div>
              </div>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="labels">Labels (Optional)</Label>
              <div className="relative">
                <Input 
                  id="labels"
                  placeholder="Type to add labels (press Enter or comma)"
                  value={labelInput}
                  onChange={(e) => {
                    setLabelInput(e.target.value);
                    setShowLabelSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={handleLabelInputKeyDown}
                  onFocus={() => setShowLabelSuggestions(labelInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowLabelSuggestions(false), 200)}
                />
                
                {showLabelSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((label) => (
                      <div
                        key={label}
                        className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => addLabel(label)}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="gap-1">
                      {label}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeLabel(label)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full" variant="default">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Meal
                </>
              )}
            </Button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs text-muted-foreground"
            onClick={async () => {
              const { debugGemini } = await import("@/actions/meal-actions");
              const result = await debugGemini();
              if (result.success) {
                const modelList = result.geminiModels ? result.geminiModels.join("\n") : "No Gemini models found";
                alert(`Connection OK!\nFound ${result.geminiModels?.length || 0} Gemini models:\n${modelList}`);
                console.log("Available Gemini Models:", result.geminiModels);
              } else {
                alert(`Connection Failed:\n${result.error}\nCheck console for details.`);
                console.error("Debug Result:", result);
              }
            }}
          >
            Troubleshoot Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
