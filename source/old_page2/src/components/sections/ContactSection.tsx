import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ContactSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Готовы трансформировать бизнес?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Обсудим, как автоматизация оптимизирует ваши процессы.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="px-8 py-6 text-lg">
              <a href="https://t.me/tvoj_bot" target="_blank" rel="noopener noreferrer">
                Обсудить проект
              </a>
            </Button>
            <Button variant="outline" asChild className="px-8 py-6 text-lg">
              <a href="#services">Смотреть услуги</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
 );
}