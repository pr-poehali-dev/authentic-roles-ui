import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const questions = [
  "Вы легко находите общий язык с новыми людьми",
  "Вам комфортно быть в центре внимания",
  "Вы стремитесь мотивировать команду к достижению целей",
  "Вы предпочитаете действовать, а не планировать",
  "Вы легко принимаете решения в критических ситуациях",
  "Вам важно, чтобы окружающие признавали ваши достижения",
  "Вы часто берете инициативу в свои руки",
  "Вы любите анализировать данные перед принятием решений",
  "Вам нравится помогать другим развиваться",
  "Вы стремитесь к инновациям и новым подходам",
  "Вы предпочитаете работать в команде, а не в одиночку",
  "Вам важно создавать гармоничную атмосферу в коллективе",
  "Вы легко адаптируетесь к изменениям",
  "Вам нравится планировать на долгосрочную перспективу",
  "Вы стремитесь к совершенству в своей работе",
  "Вы легко делегируете задачи другим",
  "Вам важно соблюдать установленные правила и процедуры",
  "Вы предпочитаете творческий подход к решению задач",
  "Вам нравится конкурировать с другими",
  "Вы легко справляетесь с конфликтными ситуациями",
  "Вам важно развивать эмоциональный интеллект команды",
  "Вы стремитесь к постоянному обучению и развитию",
  "Вам нравится структурировать рабочие процессы",
  "Вы легко вдохновляете окружающих своими идеями",
  "Вам важно получать обратную связь от коллег",
  "Вы предпочитаете контролировать все аспекты работы",
  "Вам нравится работать над несколькими проектами одновременно",
  "Вы легко находите компромиссы в споре",
  "Вам важно достигать измеримых результатов",
  "Вы стремитесь к созданию сильной корпоративной культуры",
  "Вам нравится экспериментировать с новыми методами работы",
  "Вы легко выстраиваете долгосрочные отношения с партнерами",
  "Вам важно защищать интересы своей команды",
  "Вы предпочитаете четкие инструкции и понятные цели",
  "Вам нравится наставничество и развитие других",
  "Вы легко берете на себя ответственность за результаты",
  "Вам важно создавать ценность для клиентов и партнеров",
  "Вы стремитесь к автономии в принятии решений",
  "Вам нравится создавать системы и процессы",
  "Вы легко проявляете эмпатию к окружающим",
  "Вам важно быть примером для других",
  "Вы предпочитаете действовать интуитивно в сложных ситуациях"
];

type Stage = 'welcome' | 'test' | 'results';

interface AuthenticRole {
  name: string;
  percentage: number;
}

interface Competency {
  name: string;
  percentage: number;
}

interface TestResults {
  authentic_roles: AuthenticRole[];
  top_10_competencies: Competency[];
  bottom_10_competencies: Competency[];
  recommendations: string[];
}

const Index = () => {
  const [stage, setStage] = useState<Stage>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(42).fill(6));
  const [results, setResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswerChange = (value: number[]) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value[0];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitTest();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://roles-backend-production.up.railway.app/api/v1/roles/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setStage('results');
    } catch (error) {
      console.error('Ошибка при отправке теста:', error);
      alert('Произошла ошибка при обработке результатов. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!results) return;

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('ru-RU');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Аутентичные роли', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Дата теста: ${currentDate}`, 105, 30, { align: 'center' });

    let yPos = 45;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Основные аутентичные роли', 14, yPos);
    yPos += 10;

    const rolesData = results.authentic_roles.slice(0, 3).map(role => [
      role.name,
      `${role.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Роль', 'Процент']],
      body: rolesData,
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 107] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ТОП-10 компетенций', 14, yPos);
    yPos += 10;

    const topCompData = results.top_10_competencies.map(comp => [
      comp.name,
      `${comp.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Компетенция', 'Процент']],
      body: topCompData,
      theme: 'grid',
      headStyles: { fillColor: [52, 211, 153] },
    });

    doc.addPage();
    yPos = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Зоны роста (ДНО-10)', 14, yPos);
    yPos += 10;

    const bottomCompData = results.bottom_10_competencies.map(comp => [
      comp.name,
      `${comp.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Компетенция', 'Процент']],
      body: bottomCompData,
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 107] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Рекомендации', 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    results.recommendations.forEach((rec, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 180);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 7 + 3;
    });

    doc.save(`Аутентичные_роли_${currentDate.replace(/\./g, '_')}.pdf`);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 md:p-12 shadow-2xl border-0 bg-white/80 backdrop-blur">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Icon name="Users" size={40} className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Аутентичные роли
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Пройдите тест из 42 вопросов и узнайте свой тип лидерства. 
              Откройте свои сильные стороны и получите персональные рекомендации для развития.
            </p>
            <div className="pt-6">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => setStage('test')}
              >
                Начать тест
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">42</div>
                <div className="text-sm text-muted-foreground">вопроса</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">15</div>
                <div className="text-sm text-muted-foreground">минут</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">∞</div>
                <div className="text-sm text-muted-foreground">инсайтов</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-6 md:p-10 shadow-2xl border-0 bg-white/80 backdrop-blur">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Вопрос {currentQuestion + 1} из {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                {questions[currentQuestion]}
              </h2>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>Совершенно не согласен</span>
                  <span>Полностью согласен</span>
                </div>
                <Slider
                  value={[answers[currentQuestion]]}
                  onValueChange={handleAnswerChange}
                  min={1}
                  max={12}
                  step={1}
                  className="py-4"
                />
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {answers[currentQuestion]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="rounded-full"
              >
                <Icon name="ChevronLeft" size={20} />
                Назад
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {currentQuestion === questions.length - 1 ? (
                  isLoading ? 'Обработка...' : 'Завершить тест'
                ) : (
                  <>
                    Далее
                    <Icon name="ChevronRight" size={20} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2">
                <Icon name="Award" size={32} className="text-accent" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Ваши результаты</h1>
              <p className="text-muted-foreground text-lg">
                Анализ завершен! Вот что мы узнали о вашем стиле лидерства
              </p>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {results.authentic_roles.slice(0, 3).map((role, idx) => (
              <Card 
                key={idx} 
                className="p-6 shadow-xl border-0 hover:scale-105 transition-transform bg-white/80 backdrop-blur"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">{role.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {role.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${role.percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} className="text-accent" />
                  <h2 className="text-2xl font-semibold">ТОП-10 компетенций</h2>
                </div>
                <div className="space-y-2">
                  {results.top_10_competencies.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                      <span className="text-sm font-medium">{comp.name}</span>
                      <span className="font-bold text-accent">{comp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="TrendingDown" size={24} className="text-primary" />
                  <h2 className="text-2xl font-semibold">Зоны роста (ДНО-10)</h2>
                </div>
                <div className="space-y-2">
                  {results.bottom_10_competencies.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <span className="text-sm font-medium">{comp.name}</span>
                      <span className="font-bold text-primary">{comp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="Lightbulb" size={24} className="text-secondary" />
                <h2 className="text-2xl font-semibold">Рекомендации</h2>
              </div>
              <ul className="space-y-3">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors">
                    <Icon name="CheckCircle" size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={downloadPDF}
              className="rounded-full shadow-lg hover:shadow-xl transition-all px-8"
            >
              <Icon name="Download" size={20} className="mr-2" />
              Скачать PDF
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                setStage('welcome');
                setCurrentQuestion(0);
                setAnswers(Array(42).fill(6));
                setResults(null);
              }}
              className="rounded-full px-8"
            >
              Пройти заново
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;