import { motion } from "framer-motion";
import { Server, Workflow, Database, BrainCircuit, MessageCircle, ShieldCheck } from 'lucide-react';
import { COMPETENCIES } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const iconMap = {
 Server,
  Workflow,
  Database,
  BrainCircuit,
  MessageCircle,
  ShieldCheck
};

export default function CompetenciesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Компетенции
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ключевые технологии и области экспертизы
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMPETENCIES.map((competency, index) => {
            const IconComponent = iconMap[competency.icon as keyof typeof iconMap] || Server;

            return (
              <motion.div
                key={competency.id}
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
                      {competency.title}
                    </h3>
                    <ul className="space-y-2">
                      {competency.items.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
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