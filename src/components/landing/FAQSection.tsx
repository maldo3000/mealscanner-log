
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const AnimatedFAQ: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How accurate is Meal Scanner?",
      answer: "Meal Scanner uses AI-powered vision analysis to identify and estimate your meals. While it's not perfectly accurate—especially without exact measurements—it does a great job when the photo is clear and includes helpful context. Think of it as a smart guess, not a precise scale."
    },
    {
      question: "Is there a Meal Scanner mobile app?",
      answer: "Not at the moment—and you don't need one! Meal Scanner runs directly in your browser, so there's no need to download or install anything. That means less clutter on your phone. A mobile app may come in the future if there's enough demand!"
    },
    {
      question: "Can I export my data?",
      answer: "Absolutely. You can download your meal journal data anytime, for free. It's your info—take it wherever you like!"
    }
  ];

  return (
    <section className="py-10 sm:py-16 px-4 bg-secondary/30">
      <div className="container max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AnimatedFAQ key={index} delay={index * 100}>
              <AccordionItem value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pb-2">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            </AnimatedFAQ>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
