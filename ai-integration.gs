/**
 * AI API Integration for Contract Analysis
 * This file contains placeholder functions for AI integration
 * Replace with your actual AI service (OpenAI, Claude, custom API, etc.)
 */

// Configuration - OpenAI setup
const AI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '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',
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.3
};

function analyzeContractAI() {
  try {
    const docText = getDocumentText();
    
    if (!docText || docText.trim().length === 0) {
      return {
        success: false,
        error: 'Document appears to be empty'
      };
    }
    
    console.log('Document text length:', docText.length);
    console.log('Document preview:', docText.substring(0, 200) + '...');
    
    try {
      // Try real AI analysis first
      console.log('Attempting OpenAI API call...');
      const realAnalysis = callAIService(docText, 'analyze');
      
      return {
        success: true,
        riskScore: realAnalysis.riskScore,
        clauses: realAnalysis.clauses,
        analysis: realAnalysis.analysis
      };
      
    } catch (apiError) {
      console.error('AI API call failed, falling back to mock analysis:', apiError);
      
      // Fallback to mock analysis so you see results
      const mockAnalysis = generateMockAnalysis(docText);
      
      return {
        success: true,
        riskScore: mockAnalysis.riskScore,
        clauses: mockAnalysis.clauses,
        analysis: mockAnalysis.analysis,
        warning: 'Using mock analysis - AI API call failed: ' + apiError.message
      };
    }
    
  } catch (error) {
    console.error('Error in analyzeContractAI:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateAIRedlines() {
  try {
    const docText = getDocumentText();
    
    if (!docText || docText.trim().length === 0) {
      return {
        success: false,
        error: 'Document appears to be empty'
      };
    }
    
    // Real AI redlines using OpenAI GPT-5 Nano
    const realRedlines = callAIService(docText, 'redline');
    
    return {
      success: true,
      suggestions: realRedlines
    };
    
  } catch (error) {
    console.error('Error in generateAIRedlines:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function applySuggestion(suggestionId) {
  try {
    // This would implement the actual suggestion application
    // For now, we'll just add a comment to demonstrate
    
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    
    // Mock suggestion application
    const mockSuggestions = [
      "Consider adding termination clause with 30-day notice",
      "Liability limitation should be mutual",
      "Add force majeure clause for compliance",
      "Specify governing law jurisdiction"
    ];
    
    if (suggestionId < mockSuggestions.length) {
      // Find first paragraph and add comment
      const paragraph = body.getParagraphs()[0];
      if (paragraph) {
        const range = doc.newRange();
        range.addElement(paragraph);
        doc.addComment(range.build(), `AI Suggestion Applied: ${mockSuggestions[suggestionId]}`);
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error applying suggestion:', error);
    return { success: false, error: error.message };
  }
}

function callAIService(text, operation) {
  // OpenAI API call implementation
  
  if (!AI_CONFIG.apiKey) {
    throw new Error('OpenAI API key not configured.');
  }
  
  const prompt = buildPrompt(text, operation);
  
  const payload = {
    model: AI_CONFIG.model,
    messages: [
      {
        role: 'system',
        content: getSystemPrompt(operation)
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    console.log('Making API call to:', AI_CONFIG.apiUrl);
    console.log('Using model:', AI_CONFIG.model);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = UrlFetchApp.fetch(AI_CONFIG.apiUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('Response code:', responseCode);
    console.log('Response text:', responseText);
    
    if (responseCode !== 200) {
      const errorData = JSON.parse(responseText);
      throw new Error(`AI API Error (${responseCode}): ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const responseData = JSON.parse(responseText);
    return parseAIResponse(responseData, operation);
    
  } catch (error) {
    console.error('AI API call failed:', error);
    console.error('Error details:', error.toString());
    throw new Error(`AI service unavailable: ${error.message}`);
  }
}

function getSystemPrompt(operation) {
  const basePrompt = `You are an expert legal contract reviewer specializing in Italian/EU contract law. 
  You analyze contracts for compliance, risk assessment, and provide professional redlining suggestions.`;
  
  switch (operation) {
    case 'analyze':
      return `${basePrompt}
      
      Analyze the provided contract and return a JSON response with:
      - riskScore: {overall: number(0-100), compliance: number(0-100), financial: number(0-100), legal: number(0-100)}
      - clauses: array of {text: string, riskLevel: "High"|"Medium"|"Low", type: string, analysis: string}
      - analysis: {summary: string, findings: string[]}
      
      Focus on Italian/EU legal compliance and common contract risks.`;
      
    case 'redline':
      return `${basePrompt}
      
      Generate redline suggestions for the contract and return a JSON array of:
      {type: string, text: string, rationale: string}
      
      Focus on improvements, risk mitigation, and compliance with Italian/EU law.`;
      
    default:
      return basePrompt;
  }
}

function buildPrompt(text, operation) {
  const truncatedText = text.length > 8000 ? text.substring(0, 8000) + '...' : text;
  
  switch (operation) {
    case 'analyze':
      return `Please analyze this contract for risks and compliance:\n\n${truncatedText}`;
    case 'redline':
      return `Please provide redline suggestions for this contract:\n\n${truncatedText}`;
    default:
      return truncatedText;
  }
}

function parseAIResponse(responseData, operation) {
  try {
    const content = responseData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }
    
    // Try to parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to text parsing
    return parseTextResponse(content, operation);
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI response');
  }
}

function parseTextResponse(content, operation) {
  // Fallback parsing if JSON parsing fails
  switch (operation) {
    case 'analyze':
      return {
        riskScore: { overall: 65, compliance: 70, financial: 60, legal: 65 },
        clauses: [{
          text: "Sample clause from AI analysis",
          riskLevel: "Medium",
          type: "General",
          analysis: content.substring(0, 200) + "..."
        }],
        analysis: {
          summary: content.substring(0, 300) + "...",
          findings: ["AI analysis result", "Parsed from text response"]
        }
      };
    case 'redline':
      return [{
        type: "Improvement",
        text: "AI suggested improvement",
        rationale: content.substring(0, 200) + "..."
      }];
    default:
      return { content };
  }
}

// Mock functions for demonstration (remove when implementing real AI)
function generateMockAnalysis(docText) {
  const wordCount = docText.split(' ').length;
  
  return {
    riskScore: {
      overall: Math.min(85, 30 + Math.floor(wordCount / 100)),
      compliance: Math.min(90, 40 + Math.floor(wordCount / 80)),
      financial: Math.min(80, 25 + Math.floor(wordCount / 120)),
      legal: Math.min(75, 35 + Math.floor(wordCount / 90))
    },
    clauses: [
      {
        text: "The party agrees to indemnify and hold harmless...",
        riskLevel: "High",
        type: "Indemnification",
        analysis: "Broad indemnification clause may expose client to unlimited liability"
      },
      {
        text: "This agreement shall be governed by the laws of...",
        riskLevel: "Medium", 
        type: "Governing Law",
        analysis: "Consider specifying Italian/EU jurisdiction for better enforceability"
      },
      {
        text: "Either party may terminate this agreement...",
        riskLevel: "Low",
        type: "Termination",
        analysis: "Reasonable termination clause with adequate notice period"
      }
    ],
    analysis: {
      summary: "This contract contains standard commercial terms with some areas requiring attention for risk mitigation and Italian/EU compliance.",
      findings: [
        "High-risk indemnification clause needs revision",
        "Governing law clause should specify EU jurisdiction", 
        "Consider adding force majeure provision",
        "Privacy clauses should reference GDPR compliance"
      ]
    }
  };
}

function generateMockRedlines(docText) {
  return [
    {
      type: "Risk Mitigation",
      text: "Add mutual limitation of liability clause capping damages at contract value",
      rationale: "Current unlimited liability exposes both parties to excessive risk"
    },
    {
      type: "Compliance",
      text: "Insert GDPR compliance clause for data processing activities",
      rationale: "Required for EU operations involving personal data"
    },
    {
      type: "Clarity",
      text: "Define 'confidential information' more specifically",
      rationale: "Vague definitions can lead to disputes and enforcement issues"
    },
    {
      type: "Protection",
      text: "Add force majeure clause including pandemic/government restrictions",
      rationale: "Recent events show importance of comprehensive force majeure coverage"
    }
  ];
}