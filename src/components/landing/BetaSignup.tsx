
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const betaEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const BetaSignup: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof betaEmailSchema>>({
    resolver: zodResolver(betaEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmitEmail = async (values: z.infer<typeof betaEmailSchema>) => {
    setIsSubmitting(true);
    try {
      // Insert the email into the beta_testers table
      const { error } = await supabase
        .from('beta_testers')
        .insert([{ email: values.email }]);
      
      if (error) {
        if (error.code === '23505') { // Unique violation error code
          toast.info('This email is already registered for beta testing. Thank you for your interest!');
        } else {
          throw error;
        }
      } else {
        toast.success('Thank you for your interest! We\'ll be in touch soon.');
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      toast.error('Failed to submit your email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 bg-primary/5">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">MealScanner is now in Beta!</h2>
          <p className="text-muted-foreground mt-2 mb-4">Submit your email below if you'd like to start testing for free!</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEmail)} className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Enter your email" 
                          className="pl-10" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Join Beta"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default BetaSignup;
