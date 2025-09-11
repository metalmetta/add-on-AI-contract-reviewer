

// Risk assessment configuration
const RISK_WEIGHTS = {
  compliance: 0.3,
  financial: 0.25,
  legal: 0.25,
  operational: 0.2
};

const RISK_CATEGORIES = {
  compliance: {
    name: 'Compliance Risk',
    description: 'GDPR, regulatory, and industry compliance issues',
    keywords: ['gdpr', 'privacy', 'data protection', 'regulatory', 'compliance', 'audit']
  },
  financial: {
    name: 'Financial Risk',
    description: 'Payment terms, liability, indemnification, and financial exposure',
    keywords: ['liability', 'indemnif', 'payment', 'penalty', 'damages', 'financial', 'cost']
  },
  legal: {
    name: 'Legal Risk',
    description: 'Enforceability, jurisdiction, and legal framework issues',
    keywords: ['jurisdiction', 'governing law', 'dispute', 'arbitration', 'court', 'enforce']
  },
  operational: {
    name: 'Operational Risk',
    description: 'Service delivery, performance, and operational continuity risks',
    keywords: ['termination', 'performance', 'sla', 'service level', 'delivery', 'timeline']
  }
};

function performRiskAssessment(contractText) {
  try {
    if (!contractText || contractText.trim().length === 0) {
      return {
        success: false,
        error: 'No contract text provided for analysis'
      };
    }
    
    const riskAnalysis = analyzeRiskFactors(contractText);
    const riskScores = calculateRiskScores(riskAnalysis);
    const riskRecommendations = generateRiskRecommendations(riskAnalysis);
    
    return {
      success: true,
      scores: riskScores,
      analysis: riskAnalysis,
      recommendations: riskRecommendations,
      metadata: {
        analysisDate: new Date().toISOString(),
        contractLength: contractText.length,
        wordCount: contractText.split(' ').length
      }
    };
    
  } catch (error) {
    console.error('Error in risk assessment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function analyzeRiskFactors(contractText) {
  const text = contractText.toLowerCase();
  const analysis = {
    compliance: analyzeComplianceRisk(text),
    financial: analyzeFinancialRisk(text),
    legal: analyzeLegalRisk(text),
    operational: analyzeOperationalRisk(text)
  };
  
  return analysis;
}

function analyzeComplianceRisk(text) {
  const issues = [];
  let score = 20; // Base score
  
  // Check for GDPR compliance
  if (text.includes('personal data') || text.includes('data processing')) {
    if (!text.includes('gdpr') && !text.includes('data protection')) {
      issues.push('Contract involves data processing but lacks GDPR compliance clauses');
      score += 25;
    }
  }
  
  // Check for privacy policy references
  if (!text.includes('privacy policy') && (text.includes('data') || text.includes('information'))) {
    issues.push('Consider adding privacy policy references for data handling');
    score += 15;
  }
  
  // Check for regulatory compliance
  if (text.includes('financial') || text.includes('investment')) {
    if (!text.includes('regulatory') && !text.includes('compliance')) {
      issues.push('Financial services may require regulatory compliance clauses');
      score += 20;
    }
  }
  
  // Check for audit rights
  if (!text.includes('audit') && !text.includes('inspection')) {
    issues.push('Consider adding audit rights for compliance monitoring');
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    issues: issues,
    recommendations: generateComplianceRecommendations(issues)
  };
}

function analyzeFinancialRisk(text) {
  const issues = [];
  let score = 15; // Base score
  
  // Check for unlimited liability
  if (text.includes('unlimited liability') || 
      (text.includes('liable') && !text.includes('limited'))) {
    issues.push('Unlimited liability exposure detected');
    score += 30;
  }
  
  // Check for indemnification clauses
  if (text.includes('indemnify') || text.includes('indemnification')) {
    if (!text.includes('mutual') && !text.includes('reciprocal')) {
      issues.push('One-sided indemnification may create unfair financial exposure');
      score += 25;
    }
  }
  
  // Check for payment terms
  if (!text.includes('payment terms') && !text.includes('payment schedule')) {
    issues.push('Payment terms not clearly defined');
    score += 15;
  }
  
  // Check for penalty clauses
  if (text.includes('penalty') || text.includes('liquidated damages')) {
    issues.push('Penalty clauses may create significant financial risk');
    score += 20;
  }
  
  // Check for currency and exchange rate provisions
  if (text.includes('currency') && !text.includes('exchange rate')) {
    issues.push('Currency provisions without exchange rate protection');
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    issues: issues,
    recommendations: generateFinancialRecommendations(issues)
  };
}

function analyzeLegalRisk(text) {
  const issues = [];
  let score = 10; // Base score
  
  // Check for governing law
  if (!text.includes('governing law') && !text.includes('governed by')) {
    issues.push('Governing law not specified');
    score += 25;
  }
  
  // Check for dispute resolution
  if (!text.includes('dispute') && !text.includes('arbitration')) {
    issues.push('Dispute resolution mechanism not defined');
    score += 20;
  }
  
  // Check for jurisdiction clauses
  if (!text.includes('jurisdiction') && !text.includes('court')) {
    issues.push('Jurisdiction for legal proceedings not specified');
    score += 20;
  }
  
  // Check for force majeure
  if (!text.includes('force majeure') && !text.includes('act of god')) {
    issues.push('Force majeure clause missing');
    score += 15;
  }
  
  // Check for assignment restrictions
  if (!text.includes('assignment') && !text.includes('transfer')) {
    issues.push('Assignment and transfer rights not addressed');
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    issues: issues,
    recommendations: generateLegalRecommendations(issues)
  };
}

function analyzeOperationalRisk(text) {
  const issues = [];
  let score = 5; // Base score
  
  // Check for termination clauses
  if (!text.includes('termination') && !text.includes('terminate')) {
    issues.push('Termination procedures not defined');
    score += 25;
  }
  
  // Check for SLA or performance standards
  if (!text.includes('service level') && !text.includes('performance standard')) {
    issues.push('Service level agreements or performance standards not specified');
    score += 20;
  }
  
  // Check for intellectual property rights
  if (text.includes('intellectual property') || text.includes('copyright')) {
    if (!text.includes('ownership') && !text.includes('license')) {
      issues.push('IP ownership and licensing terms unclear');
      score += 20;
    }
  }
  
  // Check for confidentiality
  if (!text.includes('confidential') && !text.includes('non-disclosure')) {
    issues.push('Confidentiality provisions not present');
    score += 15;
  }
  
  // Check for change management
  if (!text.includes('amendment') && !text.includes('modification')) {
    issues.push('Contract amendment procedures not defined');
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    issues: issues,
    recommendations: generateOperationalRecommendations(issues)
  };
}

function calculateRiskScores(analysis) {
  const scores = {
    compliance: analysis.compliance.score,
    financial: analysis.financial.score,
    legal: analysis.legal.score,
    operational: analysis.operational.score
  };
  
  // Calculate weighted overall score
  const overall = Math.round(
    scores.compliance * RISK_WEIGHTS.compliance +
    scores.financial * RISK_WEIGHTS.financial +
    scores.legal * RISK_WEIGHTS.legal +
    scores.operational * RISK_WEIGHTS.operational
  );
  
  return {
    overall: overall,
    compliance: scores.compliance,
    financial: scores.financial,
    legal: scores.legal,
    operational: scores.operational,
    breakdown: {
      compliance: { score: scores.compliance, weight: RISK_WEIGHTS.compliance },
      financial: { score: scores.financial, weight: RISK_WEIGHTS.financial },
      legal: { score: scores.legal, weight: RISK_WEIGHTS.legal },
      operational: { score: scores.operational, weight: RISK_WEIGHTS.operational }
    }
  };
}

function generateRiskRecommendations(analysis) {
  const recommendations = [];
  
  // Prioritize recommendations based on risk scores
  const riskAreas = [
    { category: 'compliance', data: analysis.compliance },
    { category: 'financial', data: analysis.financial },
    { category: 'legal', data: analysis.legal },
    { category: 'operational', data: analysis.operational }
  ].sort((a, b) => b.data.score - a.data.score);
  
  riskAreas.forEach(area => {
    if (area.data.score > 50) {
      recommendations.push({
        priority: area.data.score > 75 ? 'HIGH' : 'MEDIUM',
        category: area.category,
        title: `Address ${RISK_CATEGORIES[area.category].name}`,
        description: RISK_CATEGORIES[area.category].description,
        issues: area.data.issues,
        recommendations: area.data.recommendations
      });
    }
  });
  
  return recommendations;
}

function generateComplianceRecommendations(issues) {
  const recommendations = [];
  
  issues.forEach(issue => {
    if (issue.includes('GDPR')) {
      recommendations.push('Add GDPR compliance clause with data processing terms');
    } else if (issue.includes('privacy policy')) {
      recommendations.push('Include privacy policy references and data handling procedures');
    } else if (issue.includes('regulatory')) {
      recommendations.push('Add regulatory compliance requirements specific to your industry');
    } else if (issue.includes('audit')) {
      recommendations.push('Include audit rights and compliance monitoring provisions');
    }
  });
  
  return recommendations;
}

function generateFinancialRecommendations(issues) {
  const recommendations = [];
  
  issues.forEach(issue => {
    if (issue.includes('unlimited liability')) {
      recommendations.push('Add mutual liability caps to limit financial exposure');
    } else if (issue.includes('indemnification')) {
      recommendations.push('Make indemnification mutual and reasonable in scope');
    } else if (issue.includes('payment terms')) {
      recommendations.push('Clearly define payment schedules and terms');
    } else if (issue.includes('penalty')) {
      recommendations.push('Review penalty clauses for reasonableness and reciprocity');
    }
  });
  
  return recommendations;
}

function generateLegalRecommendations(issues) {
  const recommendations = [];
  
  issues.forEach(issue => {
    if (issue.includes('governing law')) {
      recommendations.push('Specify governing law preferably in your jurisdiction');
    } else if (issue.includes('dispute resolution')) {
      recommendations.push('Add clear dispute resolution procedures (mediation/arbitration)');
    } else if (issue.includes('jurisdiction')) {
      recommendations.push('Specify jurisdiction for legal proceedings');
    } else if (issue.includes('force majeure')) {
      recommendations.push('Include comprehensive force majeure clause');
    }
  });
  
  return recommendations;
}

function generateOperationalRecommendations(issues) {
  const recommendations = [];
  
  issues.forEach(issue => {
    if (issue.includes('termination')) {
      recommendations.push('Add clear termination procedures with appropriate notice');
    } else if (issue.includes('service level')) {
      recommendations.push('Define service level agreements and performance metrics');
    } else if (issue.includes('IP ownership')) {
      recommendations.push('Clarify intellectual property ownership and licensing');
    } else if (issue.includes('confidentiality')) {
      recommendations.push('Add confidentiality and non-disclosure provisions');
    }
  });
  
  return recommendations;
}

function getRiskLevel(score) {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 25) return 'LOW';
  return 'MINIMAL';
}

function exportRiskReport(riskData) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const reportDoc = DocumentApp.create(`${doc.getName()} - Risk Assessment Report`);
    const body = reportDoc.getBody();
    
    // Add report header
    body.appendParagraph('CONTRACT RISK ASSESSMENT REPORT')
      .setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    body.appendParagraph(`Generated: ${new Date().toLocaleDateString()}`)
      .editAsText().setItalic(true);
    
    // Add overall risk score
    body.appendParagraph('OVERALL RISK SCORE')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph(`${riskData.scores.overall}/100 (${getRiskLevel(riskData.scores.overall)} RISK)`)
      .editAsText().setBold(true).setFontSize(14);
    
    // Add category breakdown
    body.appendParagraph('RISK BREAKDOWN BY CATEGORY')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    Object.keys(riskData.scores.breakdown).forEach(category => {
      const categoryData = riskData.scores.breakdown[category];
      body.appendParagraph(`${category.toUpperCase()}: ${categoryData.score}/100`)
        .editAsText().setBold(true);
    });
    
    // Add recommendations
    if (riskData.recommendations && riskData.recommendations.length > 0) {
      body.appendParagraph('RECOMMENDATIONS')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      
      riskData.recommendations.forEach((rec, index) => {
        body.appendParagraph(`${index + 1}. [${rec.priority}] ${rec.title}`)
          .editAsText().setBold(true);
        body.appendParagraph(rec.description);
        
        if (rec.recommendations && rec.recommendations.length > 0) {
          rec.recommendations.forEach(recommendation => {
            body.appendParagraph(`• ${recommendation}`);
          });
        }
        
        body.appendParagraph(''); // Add space
      });
    }
    
    return {
      success: true,
      reportId: reportDoc.getId(),
      reportUrl: reportDoc.getUrl()
    };
    
  } catch (error) {
    console.error('Error exporting risk report:', error);
    return {
      success: false,
      error: error.message
    };
  }
}