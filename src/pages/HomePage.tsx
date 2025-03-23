
import React from "react";
import { Link } from "react-router-dom";
import { useMealJournal } from "@/context/MealJournalContext";
import MealCard from "@/components/MealCard";
import { Camera, Plus, ChevronRight, Leaf } from "lucide-react";

const HomePage: React.FC = () => {
  const { meals } = useMealJournal();

  // Get today's meals
  const today = new Date();
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.createdAt);
    return (
      mealDate.getDate() === today.getDate() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getFullYear() === today.getFullYear()
    );
  });

  // Get recent meals, excluding today's meals
  const recentMeals = meals
    .filter(meal => {
      const mealDate = new Date(meal.createdAt);
      return !(
        mealDate.getDate() === today.getDate() &&
        mealDate.getMonth() === today.getMonth() &&
        mealDate.getFullYear() === today.getFullYear()
      );
    })
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <section className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary mr-2" />
            MealScanner
          </h1>
          <p className="text-muted-foreground">
            Capture, analyze, and track your meals
          </p>
        </div>

        <Link
          to="/capture"
          className="glass-card glass-card-hover flex flex-col items-center justify-center py-8 px-4 rounded-2xl text-center"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">Add a meal</h2>
          <p className="text-muted-foreground text-sm mb-4 max-w-md">
            Take a photo of your meal and let AI analyze its nutrition content
          </p>
          <button className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Capture meal
          </button>
        </Link>
      </section>

      {/* Today's meals section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Today's meals</h2>
          <Link
            to="/journal"
            className="text-sm text-primary flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {todayMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-8 px-4 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't added any meals today
            </p>
            <Link
              to="/capture"
              className="bg-primary text-white py-2 px-6 rounded-full font-medium inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add your first meal
            </Link>
          </div>
        )}
      </section>

      {/* Recent meals section */}
      {recentMeals.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Recent meals</h2>
            <Link
              to="/journal"
              className="text-sm text-primary flex items-center"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
