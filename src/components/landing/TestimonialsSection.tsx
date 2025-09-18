import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--dominio-blue-primary))] mb-4">
            O que nossos clientes dizem
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-[hsl(var(--dominio-blue-cyan))] fill-current" />
            ))}
            <span className="ml-2 text-lg font-semibold text-[hsl(var(--dominio-blue-primary))]">4.9/5</span>
          </div>
          <p className="text-[hsl(var(--dominio-text-secondary))]">Baseado em mais de 500 avaliações verificadas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "O dominio.tech revolucionou nossa gestão. Conseguimos reduzir o tempo de processos em 60% e aumentar nossa produtividade significativamente."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MC</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Maria Clara</p>
                  <p className="text-sm text-gray-600">CEO, TechStart</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-8 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Interface intuitiva e suporte excepcional. Nossa equipe se adaptou rapidamente e os resultados apareceram em poucas semanas."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">RS</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Roberto Silva</p>
                  <p className="text-sm text-gray-600">Diretor, LogisPro</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-8 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "A escalabilidade da plataforma é impressionante. Crescemos 300% no último ano e o sistema acompanhou perfeitamente nossa expansão."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">AF</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Ana Ferreira</p>
                  <p className="text-sm text-gray-600">Fundadora, InnovaCorp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
  );
};