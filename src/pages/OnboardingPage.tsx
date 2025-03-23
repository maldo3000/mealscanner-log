
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, ChevronRight, ChevronLeft, BarChart4, FileExport } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const handleNext = () => {
    if (currentStep === 2) {
      // Redirect to dashboard or home after completing onboarding
      navigate('/capture');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const steps = [
    {
      title: "Log Meals Your Way",
      subtitle: "Snap, Upload, or Type. It's That Simple.",
      icon: <Camera className="h-16 w-16 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <p className="font-medium">Take a photo</p>
            </div>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <p className="font-medium">Upload a past pic</p>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="font-medium">Write what you ate</p>
            </div>
          </div>
          
          <p className="text-foreground/80">
            MealScanner's AI instantly analyzes your meal and logs:
          </p>
          
          <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
            <li>Meal title</li>
            <li>Meal type (breakfast, lunch, etc.)</li>
            <li>Nutritional score</li>
            <li>Calories, protein, fat, and carbs</li>
          </ul>
          
          <p className="font-medium text-foreground/80">
            No more guesswork. No more manual tracking.
          </p>
        </div>
      ),
    },
    {
      title: "Smart Estimates, Not Perfect Science",
      subtitle: "AI Analysis = Best Guess, Not Exact Science",
      icon: <BarChart4 className="h-16 w-16 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            MealScanner gives fast, structured estimates — but remember:
          </p>
          
          <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
            <li>Calorie and macro counts are approximations</li>
            <li>Weighing and measuring will always be more accurate</li>
            <li>Clear photos and extra notes = better results</li>
          </ul>
          
          <p className="font-medium text-foreground/80">
            Think of it as better-than-nothing tracking without the hassle.
          </p>
        </div>
      ),
    },
    {
      title: "Export Your Logs Anytime",
      subtitle: "Own Your Data. No Lock-In.",
      icon: <FileExport className="h-16 w-16 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            Track your meals over time and export your full journal to CSV whenever you want.
          </p>
          
          <p className="text-foreground/80">
            Perfect for nutritionists, personal review, or syncing with other tools.
          </p>
        </div>
      ),
    },
  ];
  
  const currentCardData = steps[currentStep];
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border/30 bg-card/60 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {currentCardData.icon}
            </div>
            <CardTitle className="text-2xl font-bold">{currentCardData.title}</CardTitle>
            <CardDescription className="text-foreground/70 text-lg">
              {currentCardData.subtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 pb-6">
            {currentCardData.content}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            
            <div className="flex gap-1 items-center">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-primary/30'}`}
                />
              ))}
            </div>
            
            <Button onClick={handleNext}>
              {currentStep === 2 ? 'Get Started' : 'Next'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
