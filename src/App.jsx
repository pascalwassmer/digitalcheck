import React, { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, BookOpen, Users, Target, Lightbulb, ChevronDown, ChevronUp, Play, Save, History, Download, HelpCircle, Star, ArrowRight, X, RefreshCw, AlertCircle } from 'lucide-react';

// Configuration et constantes
const USER_NEEDS = [
  { 
    name: "Mettez-moi à jour", 
    motivation: "S'informer", 
    description: "Besoin de contrôle, clarté, efficacité, fiabilité des faits, être au courant, pas d'ambiguïté.", 
    color: "bg-blue-100 text-blue-800" 
  },
  { 
    name: "Donnez-moi de l'analyse", 
    motivation: "Apprendre", 
    description: "Développer son expertise, décryptage d'experts, aller au-delà des faits, développer sa propre vision, s'armer d'arguments.", 
    color: "bg-green-100 text-green-800" 
  },
  { 
    name: "Expliquez-moi", 
    motivation: "Apprendre", 
    description: "Comprendre un sujet, pédagogie de qualité, structure narrative claire, mise en contexte, éléments-clés.", 
    color: "bg-green-100 text-green-800" 
  },
  { 
    name: "Inspirez-moi", 
    motivation: "S'inspirer/Découvrir", 
    description: "Être stimulé, surpris, émerveillé, vitalité, nouveauté, originalité, découvertes, créativité.", 
    color: "bg-purple-100 text-purple-800" 
  },
  { 
    name: "Faites-moi vibrer", 
    motivation: "S'évader/Vibrer", 
    description: "Immersion émotionnelle intense, émotions fortes, se projeter ailleurs, sortir de la routine.", 
    color: "bg-red-100 text-red-800" 
  },
  { 
    name: "Divertissez-moi", 
    motivation: "Se divertir/Rire", 
    description: "Lâcher-prise, légèreté, décontraction, plaisir simple, fun, exutoire.", 
    color: "bg-orange-100 text-orange-800" 
  },
  { 
    name: "Gardez-moi dans l'air du temps", 
    motivation: "Interagir/Échanger", 
    description: "Convivialité, appartenance communautaire, partager/discuter avec autrui, tendances, sujets collectifs.", 
    color: "bg-yellow-100 text-yellow-800" 
  },
  { 
    name: "Réconfortez-moi", 
    motivation: "Se réconforter", 
    description: "Sécurité émotionnelle, cocooning, chaleur humaine, bienveillance, espace rassurant.", 
    color: "bg-indigo-100 text-indigo-800" 
  },
  { 
    name: "Aidez-moi", 
    motivation: "Se réconforter", 
    description: "Guidance pratique, accompagnement, sécurité, conseils personnalisés pour faire face aux difficultés.", 
    color: "bg-teal-100 text-teal-800" 
  }
];

const ONBOARDING_STEPS = [
  {
    title: "Bienvenue dans RTS DigitalCheck",
    content: "Cet outil vous aide à évaluer si vos idées de contenu respectent les principes Digital First de RTS.",
    icon: <Star className="w-8 h-8 text-yellow-500" />
  },
  {
    title: "Digital First : La philosophie", 
    content: "Un contenu Digital First est pensé dès sa conception pour les plateformes numériques.",
    icon: <Target className="w-8 h-8 text-red-500" />
  },
  {
    title: "User Needs : Votre boussole",
    content: "Chaque contenu doit répondre à un besoin utilisateur précis.",
    icon: <Users className="w-8 h-8 text-red-500" />
  }
];

const EXAMPLE_IDEAS = [
  "Stories quotidiennes sur RTS.ch (90s) avec décryptage actualité, visuels animés, pour mobile transport",
  "Podcast interactif sur app RTS avec sondages temps réel et notifications push personnalisées"
];

const ANALYSIS_PROMPT = (ideaText) => `
Tu es un expert en stratégie digitale pour RTS. Analyse cette idée selon les critères Digital First ET User Needs RTS.

CRITÈRES (total 110 points):
1. Conception native digitale (25 points)
2. Adaptation plateforme/public (20 points) 
3. Accroche immédiate (15 points)
4. Contexte d'usage digital (15 points)
5. Approche data/expérimentation (10 points)
6. Réponse aux User Needs (15 points)
BONUS: +10 points si plateforme propre RTS

IDÉE: "${ideaText}"

Réponds UNIQUEMENT avec ce JSON:
{
  "score": [0-110],
  "explanation": "[analyse 3-4 phrases]",
  "userNeeds": ["[1-3 user needs identifiés]"],
  "recommendations": ["[3-4 recommandations concrètes]"]
}`;

// Hooks personnalisés
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') || defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(valueToStore);
    try {
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`);
    }
  };

  return [value, setStoredValue];
};

const useAnalyzer = ({ ideaText, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);

  const analyzeIdea = async () => {
    if (!ideaText.trim()) return;
    
    setLoading(true);
    const steps = ['Analyse Digital First...', 'Identification User Needs...', 'Génération recommandations...'];
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Vérifier si l'API Claude est disponible
      if (!window.claude?.complete) {
        throw new Error('API Claude non disponible. Veuillez vous assurer que l\'outil fonctionne dans l\'environnement Claude.ai');
      }

      const response = await window.claude.complete(ANALYSIS_PROMPT(ideaText));
      const cleanedResponse = response.replace(/```json\s*/, '').replace(/\s*```$/, '');
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        throw new Error('Format de réponse invalide de l\'API Claude');
      }
      
    } catch (error) {
      console.error('Analyse error:', error);
      const errorResult = { 
        score: null, 
        explanation: 'Erreur lors de l\'analyse. Veuillez réessayer.',
        userNeeds: [],
        recommendations: [],
        error: true
      };
      setResult(errorResult);
      onError?.(error);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return { analyzeIdea, loading, loadingStep, result, setResult };
};

// Utilitaires
const generateId = () => {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

const getProgressColor = (score) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreInterpretation = (score) => {
  if (score >= 90) return "🏆 Excellent Digital First !";
  if (score >= 75) return "✅ Bon potentiel Digital First";
  if (score >= 60) return "⚠️ Digital First à améliorer";
  return "❌ Approche traditionnelle - repenser en Digital First";
};

// Composants
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 ${styles[type]} max-w-sm`}>
      <div className="flex items-start space-x-2">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-sm">{message}</p>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const OnboardingModal = ({ step, onNext, onPrev, onComplete, onSkip }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-md w-full p-6" role="dialog" aria-labelledby="onboarding-title">
      <button 
        onClick={onSkip}
        className="float-right text-gray-400 hover:text-gray-600 text-sm"
        aria-label="Passer l'introduction"
      >
        Passer
      </button>
      
      <div className="text-center mb-6">
        {ONBOARDING_STEPS[step].icon}
        <h2 id="onboarding-title" className="text-xl font-bold text-gray-800 mt-4 mb-2">
          {ONBOARDING_STEPS[step].title}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {ONBOARDING_STEPS[step].content}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2" role="progressbar" aria-valuenow={step + 1} aria-valuemax={ONBOARDING_STEPS.length}>
          {ONBOARDING_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => index <= step && (index < step ? onPrev() : onNext())}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === step ? 'bg-red-500' : index < step ? 'bg-red-300' : 'bg-gray-300'
              }`}
              aria-label={`Étape ${index + 1}${index === step ? ' (actuelle)' : index < step ? ' (terminée)' : ''}`}
            />
          ))}
        </div>
        
        <div className="flex space-x-3">
          {step > 0 && (
            <button onClick={onPrev} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Précédent
            </button>
          )}
          {step < ONBOARDING_STEPS.length - 1 ? (
            <button onClick={onNext} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2">
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onComplete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Commencer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Composant principal
export default function App() {
  const [ideaText, setIdeaText] = useLocalStorage('currentIdea', '');
  const [savedAnalyses, setSavedAnalyses] = useLocalStorage('digitalFirstAnalyses', []);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('hasSeenOnboarding', false);
  
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [expertMode, setExpertMode] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showUserNeeds, setShowUserNeeds] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const { analyzeIdea, loading, loadingStep, result, setResult } = useAnalyzer({
    ideaText,
    onSuccess: (analysisResult) => {
      const newAnalysis = {
        id: generateId(),
        date: new Date().toLocaleDateString('fr-FR'),
        idea: ideaText.substring(0, 100) + (ideaText.length > 100 ? '...' : ''),
        score: analysisResult.score
      };
      
      setSavedAnalyses(prev => [newAnalysis, ...prev.slice(0, 4)]);
      showNotification('success', 'Analyse terminée avec succès !');
    },
    onError: (error) => {
      showNotification('error', 'Erreur lors de l\'analyse. Veuillez réessayer.');
    }
  });

  const exportResults = () => {
    if (!result?.score) return;
    
    const data = {
      idea: ideaText,
      ...result,
      date: new Date().toLocaleDateString('fr-FR')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rts-digitalcheck-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'RTS DigitalCheck - Résultats exportés avec succès !');
  };

  const handleRetry = () => {
    setResult(null);
    analyzeIdea();
  };

  if (!hasSeenOnboarding) {
    return (
      <OnboardingModal
        step={onboardingStep}
        onNext={() => setOnboardingStep(s => s + 1)}
        onPrev={() => setOnboardingStep(s => s - 1)}
        onComplete={() => setHasSeenOnboarding(true)}
        onSkip={() => setHasSeenOnboarding(true)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-4 md:mb-6 bg-white rounded-lg p-3 md:p-6 shadow-sm border-l-4 border-red-600">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-2 md:space-x-3">
            {result?.score && (
              <button 
                onClick={exportResults} 
                className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none text-sm md:text-base"
                aria-label="Exporter les résultats de l'analyse"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            )}
            
            <button
              onClick={analyzeIdea}
              disabled={!ideaText.trim() || loading}
              className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors text-sm md:text-base ${
                ideaText.trim() && !loading
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-busy={loading}
              aria-label={loading ? 'Analyse en cours' : 'Lancer l\'analyse'}
            >
              {loading ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span>{loading ? 'Analyse...' : 'Analyser'}</span>
            </button>
          </div>
        </div>
        
        {loading && loadingStep && (
          <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-600 text-white rounded-lg" aria-live="polite">
            <p className="text-xs md:text-sm flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              <span>{loadingStep}</span>
            </p>
          </div>
        )}
      </div>

      {/* Résultats */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <TrendingUp className="w-8 h-8 text-red-600" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">Résultat de l'analyse</h2>
              <p className={`text-2xl md:text-3xl font-bold ${getScoreColor(result.score)} mb-1`}>
                {result.score}/110
              </p>
              <p className="text-base text-gray-600">{getScoreInterpretation(result.score)}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3" role="progressbar" aria-valuenow={result.score} aria-valuemax={110}>
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor(result.score)}`}
                style={{ width: `${Math.min((result.score / 110) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {result.explanation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">📊 Analyse détaillée</h3>
              <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
            </div>
          )}

          {/* User Needs identifiés */}
          {result.userNeeds?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2 text-lg">
                <Users className="w-5 h-5 text-red-600" />
                <span>User Needs identifiés</span>
              </h3>
              <div className="grid gap-3 md:flex md:flex-wrap">
                {result.userNeeds.map((need, index) => {
                  const userNeed = USER_NEEDS.find(un => un.name === need);
                  return (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 flex-1 min-w-0">
                      <h4 className="font-semibold text-red-800 text-sm">{need}</h4>
                      {userNeed && (
                        <p className="text-red-700 text-xs mt-1">{userNeed.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {result.recommendations?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2 text-lg">
                <Lightbulb className="w-5 h-5 text-red-600" />
                <span>Recommandations prioritaires</span>
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-red-800 leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} items-center space-x-3 md:space-x-4">
            <div className="bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded font-bold text-lg md:text-xl shadow-md">RTS</div>
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">RTS DigitalCheck</h1>
              <p className="text-gray-600 text-xs md:text-base">Évaluez vos idées selon les principes Digital First et User Needs</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 text-gray-600 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none rounded text-sm md:text-base"
              aria-label="Afficher l'historique des analyses"
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Historique</span>
              {savedAnalyses.length > 0 && <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>}
            </button>
            
            <button
              onClick={() => setExpertMode(!expertMode)}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors text-sm md:text-base ${
                expertMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={expertMode}
              aria-label={`Basculer en mode ${expertMode ? 'simple' : 'expert'}`}
            >
              <span className="hidden sm:inline">Mode </span>{expertMode ? 'Expert' : 'Simple'}
            </button>
          </div>
        </div>
      </div>

      {/* Reste du composant... */}
      <div className="bg-white rounded-lg p-3 md:p-6 mb-4 md:mb-6 border border-red-200 shadow-lg">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-red-600 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <label htmlFor="idea-textarea" className="text-base md:text-lg font-semibold text-gray-800">
            Décrivez votre idée de contenu
          </label>
        </div>
        
        <textarea
          id="idea-textarea"
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="💡 Décrivez votre idée en précisant la plateforme, le format, la durée et le public cible..."
          className="w-full h-24 md:h-24 p-3 md:p-4 border-2 border-red-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 focus:bg-white transition-colors text-sm md:text-base"
        />
        
        <div className="mt-3 md:mt-4 flex flex-col space-y-3 md:flex-row md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2 md:space-x-4">
            {ideaText && (
              <div className="flex items-center space-x-1 text-xs md:text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                <Save className="w-3 h-3 md:w-4 md:h-4" />
                <span>Sauvegardé</span>
              </div>
            )}
          </div>
          
          <div className="flex
