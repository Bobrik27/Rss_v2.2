import { motion } from "framer-motion";
import { APPROACH } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

export default function ApproachSection() {
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
            Подход
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Принципы, на которых строится работа
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <div className="space-y-6">
              {APPROACH.map((principle, index) => (
                <motion.div
                  key={principle.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "bg-card rounded-xl p-6 border border-border",
                    "hover:border-primary transition-colors duration-300"
                  )}
                >
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {principle.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-primary/20 to-purple-500/10 border-border rounded-2xl p-8 w-full max-w-md h-96 flex items-center justify-center"
            >
              <svg viewBox="0 200 200" className="w-64 h-64">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/50" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70" />
                <circle cx="100" cy="100" r="20" fill="currentColor" className="text-primary/90" />
                
                <text x="100" y="70" textAnchor="middle" className="text-xs fill-foreground">Reliability</text>
                <text x="135" y="100" textAnchor="middle" className="text-xs fill-foreground">Architecture</text>
                <text x="100" y="130" textAnchor="middle" className="text-xs fill-foreground">Business Value</text>
                <text x="65" y="100" textAnchor="middle" className="text-xs fill-foreground">Product Thinking</text>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}