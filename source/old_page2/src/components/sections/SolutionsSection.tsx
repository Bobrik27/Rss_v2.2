import { motion } from "framer-motion";
import { Zap, Bot, Brain, Wrench } from 'lucide-react';
import { SOLUTIONS } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const iconMap = {
  Zap,
  Bot,
  Brain,
  Wrench
};

export default function SolutionsSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Решения
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Решения и услуги для бизнеса
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SOLUTIONS.map((solution, index) => {
            const IconComponent = iconMap[solution.icon as keyof typeof iconMap] || Zap;

            return (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "bg-card rounded-xl p-6 border border-border",
                  "hover:border-primary transition-colors duration-300"
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {solution.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}