
import React from 'react';
import { Check, DollarSign, CheckCheck } from 'lucide-react';

const WhyChooseSection: React.FC = () => {
  return (
    <section className="py-10 sm:py-16">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8">Why Choose MealScanner?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-4 sm:p-6 bg-card/30 rounded-lg">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Achieve Your Health Goals</h3>
            <p className="text-muted-foreground mb-4">
              Whether you're aiming to lose weight, build muscle, or simply eat healthier, MealScanner provides the insights you need to succeed.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>Effortlessly log your meals</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>Track your calories and your macros</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>Easily monitor your eating habits</span>
              </li>
            </ul>
          </div>
          <div className="p-4 sm:p-6 bg-card/30 rounded-lg">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Simple and Cost Effective</h3>
            <p className="text-muted-foreground mb-4">
              We believe nutrition tracking should be straightforward and affordable without compromising on quality.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>Fair and transparent pricing</span>
              </li>
              <li className="flex items-center">
                <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>Designed for everyday use</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span>No fluff, just function</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
