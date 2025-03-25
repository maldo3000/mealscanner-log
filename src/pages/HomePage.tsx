
import React from "react";
import { Link } from "react-router-dom";
import { Camera, BookOpen, ChevronRight, Clock } from "lucide-react";
import { useMealJournal } from "@/context/mealJournal";
import MealCard from "@/components/MealCard";
import LoadingSpinner from "@/components/LoadingSpinner";

const HomePage = () => {
  const { meals, isLoading } = useMealJournal();
  
  // Get the 2 most recent meals
  const recentMeals = meals.slice(0, 2);
  
  return (
    <div className="space-y-8 animate-fade-in px-2 sm:px-4">
      <div className="text-center py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Welcome to MealScanner</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto px-2">
          Track your nutrition with AI-powered meal analysis
        </p>
      </div>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div className="glass-card rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">Capture a Meal</h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
            Take a photo of your food or describe it to get instant nutritional analysis.
          </p>
          <Link 
            to="/capture" 
            className="flex items-center text-primary hover:underline text-sm sm:text-base"
          >
            Get started <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="glass-card rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">View Journal</h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
            Track your meal history and nutrition patterns over time.
          </p>
          <Link 
            to="/journal" 
            className="flex items-center text-primary hover:underline text-sm sm:text-base"
          >
            See your meals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      {/* Recent Meals Section */}
      <div className="mt-6 sm:mt-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-1 sm:mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold">Recent Meals</h2>
          </div>
          <Link 
            to="/journal" 
            className="text-xs sm:text-sm text-primary hover:underline flex items-center"
          >
            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8 sm:py-10">
            <LoadingSpinner size="medium" />
          </div>
        ) : recentMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {recentMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-10 px-4 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground text-sm sm:text-base">No meals recorded yet</p>
            <Link 
              to="/capture" 
              className="mt-2 inline-block text-primary hover:underline text-sm sm:text-base"
            >
              Add your first meal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
