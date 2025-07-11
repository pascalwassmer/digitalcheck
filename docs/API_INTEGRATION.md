# 🔌 Intégration API Claude - RTS DigitalCheck

## 🎯 Contextes d'utilisation

### **Dans Claude.ai (Recommandé)**
✅ **API automatiquement disponible**
- L'outil fonctionne directement via `window.claude.complete`
- Aucune configuration requise
- Analyses en temps réel

### **En local/production (Développement)**
⚙️ **Configuration API requise**
- Nécessite clé API Claude
- Configuration environnement
- Gestion des limitations de rate

## 🔧 Configuration API

### **Pour Claude.ai (Production)**
```javascript
// L'API est automatiquement disponible
const response = await window.claude.complete(prompt);
```

### **Pour développement local**
```javascript
// Fallback pour développement sans API
const analyzeWithFallback = async (prompt) => {
  if (window.claude?.complete) {
    // Utiliser l'API Claude si disponible
    return await window.claude.complete(prompt);
  } else {
    // Mode développement avec simulation
    console.warn('API Claude non disponible - Mode démo activé');
    return simulateAnalysis(prompt);
  }
};
```

## 📋 Prompt d'analyse

Le prompt envoyé à Claude est optimisé pour RTS :

```javascript
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
```

## 🔒 Sécurité & Limitations

### **Rate Limiting**
- Claude.ai : Géré automatiquement
- API directe : Implémenter backoff/retry

### **Validation des réponses**
```javascript
try {
  const response = await window.claude.complete(prompt);
  const cleanedResponse = response.replace(/```json\s*/, '').replace(/\s*```$/, '');
  const result = JSON.parse(cleanedResponse);
  
  // Validation du format
  if (!result.score || !result.explanation) {
    throw new Error('Format de réponse invalide');
  }
  
  return result;
} catch (error) {
  console.error('Erreur API Claude:', error);
  // Gestion d'erreur gracieuse
}
```

## 🚀 Déploiement

### **Sur Claude.ai**
1. Uploader l'outil comme artifact
2. L'API est automatiquement fonctionnelle
3. Prêt à l'utilisation immédiate

### **Sur GitHub Pages**
1. Mode démo sans API (interface seulement)
2. Instructions pour activer l'API en local
3. Redirection vers Claude.ai pour utilisation complète

## 🛠 Mode Développement

Pour tester sans API :

```javascript
const simulateAnalysis = (ideaText) => {
  // Analyse simple basée sur mots-clés
  let score = 60; // Score de base
  
  // Bonus plateforme RTS
  if (ideaText.toLowerCase().includes('rts.ch') || 
      ideaText.toLowerCase().includes('app rts')) {
    score += 10;
  }
  
  // Bonus format digital
  if (ideaText.includes('mobile') || ideaText.includes('digital')) {
    score += 15;
  }
  
  return {
    score: Math.min(score, 110),
    explanation: "Analyse simulée - Utilisez Claude.ai pour l'analyse complète",
    userNeeds: ["Mettez-moi à jour"],
    recommendations: ["Utiliser l'outil dans Claude.ai pour une analyse complète"]
  };
};
```

## 📊 Monitoring & Analytics

### **Métriques recommandées**
- Nombre d'analyses par jour
- Scores moyens par équipe
- User Needs les plus identifiés
- Temps de réponse API

### **Logs d'erreur**
```javascript
const logAnalysisError = (error, ideaText) => {
  console.error('Erreur analyse Digital First:', {
    error: error.message,
    ideaLength: ideaText.length,
    timestamp: new Date().toISOString()
  });
};
```

## 🔄 Mise à jour du Prompt

Pour ajuster l'analyse, modifiez `ANALYSIS_PROMPT` :

1. **Critères de scoring** : Ajuster les points par catégorie
2. **User Needs** : Ajouter/modifier les besoins RTS
3. **Format de réponse** : Enrichir les recommandations

---

**💡 Recommandation : Utilisez RTS DigitalCheck directement dans Claude.ai pour une expérience optimale avec API intégrée.**
