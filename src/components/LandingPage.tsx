import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  Sparkles,
  Target,
  BarChart3,
  Globe,
  Rocket,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Quote,
  Building,
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatCurrency } from '../lib/utils';

interface LandingPageProps {
  onGetStarted: () => void;
  onContactSales: () => void;
}

export function LandingPage({ onGetStarted, onContactSales }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const features = [
    {
      icon: Sparkles,
      title: 'Generación Asistida de Prompts',
      description: 'IA que te ayuda a crear prompts perfectos con sugerencias contextuales y plantillas optimizadas.',
      benefit: 'Reduce el tiempo de creación en 80%'
    },
    {
      icon: Target,
      title: 'Testing Multi-Modelo',
      description: 'Prueba tus prompts en ChatGPT, Claude, Gemini, DeepSeek y más modelos simultáneamente.',
      benefit: 'Encuentra el modelo perfecto para cada tarea'
    },
    {
      icon: TrendingUp,
      title: 'Análisis Avanzado de Rendimiento',
      description: 'Métricas detalladas de robustez, seguridad, exactitud y creatividad de tus prompts.',
      benefit: 'Mejora la calidad de resultados en 65%'
    },
    {
      icon: Rocket,
      title: 'Motor de Mejora Automática',
      description: 'Sistema de IA que optimiza automáticamente tus prompts existentes.',
      benefit: 'Prompts 3x más efectivos automáticamente'
    },
    {
      icon: Globe,
      title: 'Traducción Automática ES/EN',
      description: 'Traduce y sincroniza tus prompts entre español e inglés manteniendo la efectividad.',
      benefit: 'Expande tu alcance global sin esfuerzo'
    },
    {
      icon: Shield,
      title: 'Biblioteca Inteligente',
      description: 'Organiza, busca y gestiona miles de prompts con etiquetas, favoritos e histórico.',
      benefit: 'Encuentra cualquier prompt en segundos'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analytics Avanzado',
      description: 'Estadísticas en tiempo real, series temporales y métricas de ROI de tus prompts.',
      benefit: 'Decisiones basadas en datos reales'
    },
    {
      icon: Users,
      title: 'Colaboración en Equipo',
      description: 'Comparte prompts, gestiona permisos y colabora con tu equipo en tiempo real.',
      benefit: 'Productividad del equipo +200%'
    }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      tokens: '500K',
      description: 'Perfecto para freelancers y pequeños proyectos',
      features: [
        '500,000 tokens/mes',
        'Acceso a todos los modelos de IA',
        'Biblioteca de prompts básica',
        'Análisis de rendimiento',
        'Soporte por email'
      ],
      cta: 'Empezar Gratis',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      tokens: '2M',
      description: 'Ideal para profesionales y equipos pequeños',
      features: [
        '2,000,000 tokens/mes',
        'Testing multi-modelo avanzado',
        'Motor de mejora automática',
        'Traducción automática',
        'Dashboard analytics completo',
        'Colaboración en equipo (5 usuarios)',
        'Soporte prioritario'
      ],
      cta: 'Empezar Prueba',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      tokens: '10M',
      description: 'Para empresas que necesitan máximo rendimiento',
      features: [
        '10,000,000 tokens/mes',
        'Usuarios ilimitados',
        'API dedicada',
        'Integraciones personalizadas',
        'SSO y gestión avanzada',
        'Soporte 24/7 + Account Manager',
        'SLA garantizado',
        'Onboarding personalizado'
      ],
      cta: 'Contactar Ventas',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Head of AI en TechCorp',
      company: 'TechCorp',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'PromptHub transformó completamente nuestro flujo de trabajo con IA. Hemos reducido el tiempo de desarrollo de prompts en un 80% y mejorado la calidad de resultados significativamente.',
      rating: 5,
      results: 'ROI del 340% en 3 meses'
    },
    {
      name: 'Carlos Ruiz',
      role: 'CTO',
      company: 'InnovateLab',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'La capacidad de testing multi-modelo nos permitió encontrar la combinación perfecta para cada caso de uso. Los analytics nos dieron insights que nunca habríamos descubierto solos.',
      rating: 5,
      results: '+150% en efectividad de prompts'
    },
    {
      name: 'Ana Martín',
      role: 'AI Product Manager',
      company: 'DataFlow',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'El motor de mejora automática es increíble. Nuestros prompts mejoran constantemente sin intervención manual. Es como tener un experto en prompt engineering 24/7.',
      rating: 5,
      results: 'Ahorro de 40 horas/semana'
    }
  ];

  const faqs = [
    {
      question: '¿Qué hace exactamente PromptHub?',
      answer: 'PromptHub es una plataforma integral para optimizar, gestionar y escalar el uso de IA en tu empresa. Te ayudamos a crear prompts más efectivos, probar múltiples modelos, analizar rendimiento y colaborar en equipo, todo desde una sola plataforma.'
    },
    {
      question: '¿Cómo funciona el sistema de tokens?',
      answer: 'Los tokens son unidades de procesamiento que se consumen al usar modelos de IA. Cada plan incluye una cantidad mensual de tokens. Si necesitas más, puedes comprar tokens adicionales o actualizar tu plan. 1 millón de tokens equivale aproximadamente a 750,000 palabras procesadas.'
    },
    {
      question: '¿Puedo usar mis propias API keys?',
      answer: 'Sí, PromptHub te permite usar tus propias API keys de OpenAI, Anthropic, Google y otros proveedores. También ofrecemos acceso directo a través de nuestra infraestructura con precios competitivos.'
    },
    {
      question: '¿Qué modelos de IA soportan?',
      answer: 'Soportamos todos los modelos principales: GPT-4, GPT-5, Claude 3.5, Gemini Pro, DeepSeek, Llama 2/3, y muchos más. Añadimos nuevos modelos constantemente sin costo adicional.'
    },
    {
      question: '¿Cómo funciona la colaboración en equipo?',
      answer: 'Los planes Pro y Enterprise incluyen funciones de equipo: compartir prompts, gestión de permisos, bibliotecas compartidas, analytics consolidados y facturación centralizada. Perfecto para equipos de cualquier tamaño.'
    },
    {
      question: '¿Ofrecen soporte técnico?',
      answer: 'Sí, todos los planes incluyen soporte. Starter tiene soporte por email, Pro incluye soporte prioritario, y Enterprise tiene soporte 24/7 con account manager dedicado y SLA garantizado.'
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Absolutamente. No hay contratos de permanencia. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. Los tokens no utilizados se mantienen hasta el final del período facturado.'
    },
    {
      question: '¿Cómo garantizan la seguridad de mis datos?',
      answer: 'Usamos encriptación de extremo a extremo, cumplimos con GDPR, tenemos certificaciones SOC 2, y tus prompts nunca se usan para entrenar modelos. Tus datos son 100% privados y seguros.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Prompts Optimizados', icon: Sparkles },
    { number: '1,200+', label: 'Empresas Confían', icon: Building },
    { number: '85%', label: 'Mejora Promedio', icon: TrendingUp },
    { number: '24/7', label: 'Soporte Enterprise', icon: Shield }
  ];

  const useCases = [
    {
      title: 'Marketing & Ventas',
      description: 'Crea copy persuasivo, emails de ventas, contenido para redes sociales y campañas publicitarias que conviertan.',
      icon: Target,
      examples: ['Copy de landing pages', 'Emails de nurturing', 'Posts virales', 'Anuncios PPC']
    },
    {
      title: 'Desarrollo de Software',
      description: 'Genera código, documentación técnica, tests automatizados y optimiza procesos de desarrollo.',
      icon: Rocket,
      examples: ['Generación de código', 'Documentación API', 'Code reviews', 'Tests unitarios']
    },
    {
      title: 'Atención al Cliente',
      description: 'Automatiza respuestas, crea chatbots inteligentes y mejora la experiencia del cliente.',
      icon: Users,
      examples: ['Chatbots avanzados', 'Respuestas automáticas', 'Análisis de sentimientos', 'Escalado inteligente']
    },
    {
      title: 'Análisis de Datos',
      description: 'Procesa grandes volúmenes de texto, extrae insights y genera reportes automáticos.',
      icon: BarChart3,
      examples: ['Análisis de feedback', 'Reportes automáticos', 'Extracción de datos', 'Insights de mercado']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <Badge variant="success" className="px-4 py-2 text-sm">
                🚀 Nuevo: Motor de Mejora con IA
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              La Plataforma de IA
              <br />
              que tu Empresa Necesita
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Optimiza, gestiona y escala el uso de IA en tu empresa con la plataforma más avanzada del mercado. 
              <span className="text-blue-400 font-semibold"> Aumenta la efectividad de tus prompts en un 85%</span> y 
              <span className="text-green-400 font-semibold"> reduce costos en un 60%</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Empezar Gratis - 14 Días
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                onClick={onContactSales}
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 h-auto border-gray-600 hover:border-blue-500"
              >
                <Users className="h-5 w-5 mr-2" />
                Demo Personalizada
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>SOC 2 Certificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Todo lo que Necesitas para
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Dominar la IA</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Una plataforma completa que revoluciona cómo tu empresa usa la inteligencia artificial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:scale-105 transition-all duration-300 border-gray-700 hover:border-blue-500/50">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4 leading-relaxed">{feature.description}</p>
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                      <div className="text-sm text-green-300 font-medium">{feature.benefit}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Casos de Uso
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Reales</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre cómo empresas líderes usan PromptHub para transformar sus operaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{useCase.title}</CardTitle>
                        <p className="text-gray-400">{useCase.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {useCase.examples.map((example, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {example}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Lo que Dicen Nuestros
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Clientes</span>
            </h2>
            <p className="text-xl text-gray-300">
              Resultados reales de empresas que ya transformaron su uso de IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <Quote className="h-8 w-8 text-gray-600 mb-4" />
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="text-sm text-green-300 font-medium">📈 {testimonial.results}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                      <div className="text-sm text-blue-400">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Precios
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Transparentes</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sin sorpresas, sin costos ocultos. Paga solo por lo que usas y escala según crezcas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-500 bg-blue-900/10' 
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                      ⭐ Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="text-5xl font-bold text-white mb-2">
                    {formatCurrency(plan.price)}
                    <span className="text-lg font-normal text-gray-400">/mes</span>
                  </div>
                  <div className="text-blue-400 font-medium">{plan.tokens} tokens incluidos</div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={plan.id === 'enterprise' ? onContactSales : onGetStarted}
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              ¿Necesitas más tokens? Compra adicionales desde <span className="text-green-400 font-medium">€8/millón</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>✓ Sin contratos de permanencia</span>
              <span>✓ Cancela cuando quieras</span>
              <span>✓ Soporte incluido</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ve PromptHub en
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Acción</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre cómo PromptHub puede transformar tu flujo de trabajo con IA
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl">
              <div className="bg-gray-900 rounded-xl p-8 text-center">
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Play className="h-8 w-8 text-blue-400" />
                    <span className="text-xl font-semibold">Demo Interactiva</span>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Ve cómo crear, optimizar y gestionar prompts en menos de 5 minutos
                  </p>
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Ver Demo Ahora
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Sin registro requerido</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Demo completa en 5 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Datos reales incluidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Preguntas
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Frecuentes</span>
            </h2>
            <p className="text-xl text-gray-300">
              Resolvemos todas tus dudas sobre PromptHub
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-700">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="font-medium text-white text-lg">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl">
            <div className="bg-gray-900 rounded-xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para Revolucionar
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  tu Uso de IA?
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Únete a más de 1,200 empresas que ya optimizaron sus prompts y 
                <span className="text-green-400 font-semibold"> aumentaron su productividad en un 200%</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  onClick={onGetStarted}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Empezar Gratis Ahora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  onClick={onContactSales}
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 h-auto border-gray-600 hover:border-blue-500"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Hablar con Ventas
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>14 días gratis, sin tarjeta</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Setup en menos de 5 minutos</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Soporte dedicado incluido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">PromptHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                La plataforma más avanzada para optimizar y gestionar prompts de IA en tu empresa.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contacto
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Soporte
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PromptHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}