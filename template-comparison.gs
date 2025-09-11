/**
 * Template Comparison and Google Drive Integration
 * Compares contracts against standard templates stored in Google Drive
 */

// Template configuration
const TEMPLATE_CONFIG = {
  driveFolder: 'Contract Templates', // Folder name in Google Drive
  templates: {
    'nda': {
      name: 'Non-Disclosure Agreement',
      filename: 'NDA_Template.docx',
      description: 'Standard confidentiality agreement template'
    },
    'service': {
      name: 'Service Agreement',
      filename: 'Service_Agreement_Template.docx', 
      description: 'Professional services contract template'
    },
    'employment': {
      name: 'Employment Contract',
      filename: 'Employment_Contract_Template.docx',
      description: 'Standard employment agreement template'
    },
    'licensing': {
      name: 'Licensing Agreement',
      filename: 'License_Agreement_Template.docx',
      description: 'Software/IP licensing contract template'
    }
  }
};

function compareWithTemplate(templateType) {
  try {
    if (!templateType || !TEMPLATE_CONFIG.templates[templateType]) {
      return {
        success: false,
        error: 'Invalid template type specified'
      };
    }
    
    const currentDoc = DocumentApp.getActiveDocument();
    const currentText = currentDoc.getBody().getText();
    
    if (!currentText || currentText.trim().length === 0) {
      return {
        success: false,
        error: 'Current document is empty'
      };
    }
    
    // Get template from Google Drive
    const templateData = getTemplateFromDrive(templateType);
    if (!templateData.success) {
      return templateData;
    }
    
    // Perform comparison
    const comparison = performTemplateComparison(currentText, templateData.content, templateType);
    
    return {
      success: true,
      templateName: TEMPLATE_CONFIG.templates[templateType].name,
      templateType: templateType,
      similarityScore: comparison.similarityScore,
      differences: comparison.differences,
      missingClauses: comparison.missingClauses,
      extraClauses: comparison.extraClauses,
      recommendations: comparison.recommendations
    };
    
  } catch (error) {
    console.error('Error comparing with template:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getTemplateFromDrive(templateType) {
  try {
    const template = TEMPLATE_CONFIG.templates[templateType];
    
    // First, try to find the template folder
    const folders = DriveApp.getFoldersByName(TEMPLATE_CONFIG.driveFolder);
    let templateFolder;
    
    if (folders.hasNext()) {
      templateFolder = folders.next();
    } else {
      // Create the folder if it doesn't exist
      templateFolder = DriveApp.createFolder(TEMPLATE_CONFIG.driveFolder);
      
      // Create sample templates
      createSampleTemplates(templateFolder);
    }
    
    // Look for the template file
    const files = templateFolder.getFilesByName(template.filename);
    
    if (files.hasNext()) {
      const templateFile = files.next();
      const templateDoc = DocumentApp.openById(templateFile.getId());
      const templateText = templateDoc.getBody().getText();
      
      return {
        success: true,
        content: templateText,
        fileId: templateFile.getId(),
        fileName: template.filename,
        lastModified: templateFile.getLastUpdated()
      };
    } else {
      // Template file doesn't exist, return sample template
      const sampleTemplate = getSampleTemplate(templateType);
      return {
        success: true,
        content: sampleTemplate,
        fileId: null,
        fileName: `Sample ${template.name}`,
        lastModified: new Date()
      };
    }
    
  } catch (error) {
    console.error('Error getting template from Drive:', error);
    return {
      success: false,
      error: `Failed to retrieve template: ${error.message}`
    };
  }
}

function createSampleTemplates(folder) {
  try {
    Object.keys(TEMPLATE_CONFIG.templates).forEach(templateType => {
      const template = TEMPLATE_CONFIG.templates[templateType];
      const sampleContent = getSampleTemplate(templateType);
      
      // Create a new document for the template
      const doc = DocumentApp.create(template.filename.replace('.docx', ''));
      doc.getBody().setText(sampleContent);
      
      // Move to the templates folder
      const file = DriveApp.getFileById(doc.getId());
      folder.addFile(file);
      DriveApp.removeFile(file); // Remove from root
    });
    
  } catch (error) {
    console.error('Error creating sample templates:', error);
  }
}

function getSampleTemplate(templateType) {
  const templates = {
    'nda': `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between [PARTY A] and [PARTY B].

1. CONFIDENTIAL INFORMATION
Each party acknowledges that it may receive certain confidential and proprietary information.

2. OBLIGATIONS
Each party agrees to:
a) Keep all confidential information strictly confidential
b) Not disclose confidential information to third parties
c) Use confidential information solely for the purpose of [PURPOSE]

3. TERM
This Agreement shall remain in effect for [TERM] years from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of [JURISDICTION].`,

    'service': `PROFESSIONAL SERVICES AGREEMENT

This Professional Services Agreement ("Agreement") is between [CLIENT] and [SERVICE PROVIDER].

1. SERVICES
Service Provider agrees to provide [DESCRIPTION OF SERVICES].

2. COMPENSATION
Client agrees to pay Service Provider [PAYMENT TERMS].

3. TERM AND TERMINATION
This Agreement begins on [START DATE] and continues until [END DATE].

4. INTELLECTUAL PROPERTY
All work products shall be owned by [OWNER].

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

6. LIABILITY
Service Provider's liability is limited to the amount paid under this Agreement.`,

    'employment': `EMPLOYMENT AGREEMENT

This Employment Agreement is between [COMPANY] and [EMPLOYEE].

1. POSITION AND DUTIES
Employee shall serve as [POSITION] and perform duties as assigned.

2. COMPENSATION
Employee shall receive a salary of [AMOUNT] per [PERIOD].

3. BENEFITS
Employee is eligible for benefits as outlined in company policy.

4. CONFIDENTIALITY
Employee agrees to maintain confidentiality of company information.

5. TERMINATION
Either party may terminate employment with [NOTICE PERIOD] notice.

6. NON-COMPETE
Employee agrees not to compete with Company for [PERIOD] after termination.`,

    'licensing': `SOFTWARE LICENSE AGREEMENT

This License Agreement is between [LICENSOR] and [LICENSEE].

1. GRANT OF LICENSE
Licensor grants Licensee a [TYPE] license to use [SOFTWARE].

2. RESTRICTIONS
Licensee may not:
a) Copy or distribute the software
b) Reverse engineer the software
c) Remove copyright notices

3. PAYMENT
Licensee shall pay [LICENSE FEE] for this license.

4. SUPPORT AND MAINTENANCE
Licensor will provide support as outlined in Schedule A.

5. WARRANTIES
Software is provided "AS IS" without warranties.

6. LIMITATION OF LIABILITY
Licensor's liability is limited to the license fee paid.`
  };

  return templates[templateType] || 'Sample template content not available.';
}

function performTemplateComparison(currentText, templateText, templateType) {
  try {
    // Normalize texts for comparison
    const current = normalizeText(currentText);
    const template = normalizeText(templateText);
    
    // Extract sections from both documents
    const currentSections = extractSections(current);
    const templateSections = extractSections(template);
    
    // Calculate similarity score
    const similarityScore = calculateSimilarityScore(current, template);
    
    // Identify differences
    const differences = identifyDifferences(currentSections, templateSections);
    
    // Find missing and extra clauses
    const missingClauses = findMissingClauses(currentSections, templateSections);
    const extraClauses = findExtraClauses(currentSections, templateSections);
    
    // Generate recommendations
    const recommendations = generateTemplateRecommendations(differences, missingClauses, templateType);
    
    return {
      similarityScore: Math.round(similarityScore * 100),
      differences: differences,
      missingClauses: missingClauses,
      extraClauses: extraClauses,
      recommendations: recommendations
    };
    
  } catch (error) {
    console.error('Error performing template comparison:', error);
    throw new Error(`Comparison failed: ${error.message}`);
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function extractSections(text) {
  const sections = [];
  
  // Split by numbered sections or headers
  const sectionPattern = /(\d+\.?\s*[A-Z][A-Z\s]*)/g;
  const parts = text.split(sectionPattern);
  
  for (let i = 1; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      sections.push({
        header: parts[i].trim(),
        content: parts[i + 1].trim()
      });
    }
  }
  
  return sections;
}

function calculateSimilarityScore(text1, text2) {
  const words1 = new Set(text1.split(' '));
  const words2 = new Set(text2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function identifyDifferences(currentSections, templateSections) {
  const differences = [];
  
  templateSections.forEach(templateSection => {
    const matchingSection = currentSections.find(current => 
      current.header.toLowerCase().includes(templateSection.header.toLowerCase().substring(0, 10))
    );
    
    if (matchingSection) {
      const similarity = calculateSimilarityScore(matchingSection.content, templateSection.content);
      
      if (similarity < 0.7) { // 70% similarity threshold
        differences.push({
          section: templateSection.header,
          type: 'content_difference',
          description: `Content differs significantly from template (${Math.round(similarity * 100)}% similarity)`,
          severity: similarity < 0.4 ? 'high' : 'medium'
        });
      }
    }
  });
  
  return differences;
}

function findMissingClauses(currentSections, templateSections) {
  const missing = [];
  
  templateSections.forEach(templateSection => {
    const found = currentSections.some(current =>
      current.header.toLowerCase().includes(templateSection.header.toLowerCase().substring(0, 10))
    );
    
    if (!found) {
      missing.push({
        section: templateSection.header,
        description: `Missing section: ${templateSection.header}`,
        content: templateSection.content.substring(0, 100) + '...',
        importance: getClauseImportance(templateSection.header)
      });
    }
  });
  
  return missing;
}

function findExtraClauses(currentSections, templateSections) {
  const extra = [];
  
  currentSections.forEach(currentSection => {
    const found = templateSections.some(template =>
      template.header.toLowerCase().includes(currentSection.header.toLowerCase().substring(0, 10))
    );
    
    if (!found) {
      extra.push({
        section: currentSection.header,
        description: `Additional section not in template: ${currentSection.header}`,
        content: currentSection.content.substring(0, 100) + '...'
      });
    }
  });
  
  return extra;
}

function getClauseImportance(sectionHeader) {
  const header = sectionHeader.toLowerCase();
  
  if (header.includes('termination') || header.includes('liability') || 
      header.includes('confidential') || header.includes('governing law')) {
    return 'high';
  } else if (header.includes('payment') || header.includes('intellectual property') ||
             header.includes('dispute')) {
    return 'medium';
  }
  
  return 'low';
}

function generateTemplateRecommendations(differences, missingClauses, templateType) {
  const recommendations = [];
  
  // Recommendations for missing high-importance clauses
  missingClauses.filter(clause => clause.importance === 'high').forEach(clause => {
    recommendations.push({
      priority: 'HIGH',
      type: 'missing_clause',
      title: `Add ${clause.section}`,
      description: `This section is critical for ${TEMPLATE_CONFIG.templates[templateType].name}`,
      action: 'Add the missing clause to ensure contract completeness'
    });
  });
  
  // Recommendations for significant content differences
  differences.filter(diff => diff.severity === 'high').forEach(diff => {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'content_difference',
      title: `Review ${diff.section}`,
      description: diff.description,
      action: 'Consider aligning content with template standards'
    });
  });
  
  // Template-specific recommendations
  const templateSpecificRecs = getTemplateSpecificRecommendations(templateType, missingClauses, differences);
  recommendations.push(...templateSpecificRecs);
  
  return recommendations;
}

function getTemplateSpecificRecommendations(templateType, missingClauses, differences) {
  const recommendations = [];
  
  switch (templateType) {
    case 'nda':
      if (missingClauses.some(c => c.section.toLowerCase().includes('term'))) {
        recommendations.push({
          priority: 'HIGH',
          type: 'nda_specific',
          title: 'Define Confidentiality Term',
          description: 'NDAs must specify duration of confidentiality obligations',
          action: 'Add specific term length (e.g., 3-5 years) for confidentiality'
        });
      }
      break;
      
    case 'service':
      if (missingClauses.some(c => c.section.toLowerCase().includes('liability'))) {
        recommendations.push({
          priority: 'HIGH',
          type: 'service_specific',
          title: 'Add Liability Limitations',
          description: 'Service agreements should limit provider liability',
          action: 'Include liability cap and mutual indemnification'
        });
      }
      break;
      
    case 'employment':
      if (missingClauses.some(c => c.section.toLowerCase().includes('confidential'))) {
        recommendations.push({
          priority: 'HIGH',
          type: 'employment_specific',
          title: 'Add Confidentiality Clause',
          description: 'Employment contracts must protect company information',
          action: 'Include comprehensive confidentiality and non-compete terms'
        });
      }
      break;
  }
  
  return recommendations;
}

function getAvailableTemplates() {
  try {
    const folders = DriveApp.getFoldersByName(TEMPLATE_CONFIG.driveFolder);
    const templates = [];
    
    if (folders.hasNext()) {
      const templateFolder = folders.next();
      const files = templateFolder.getFiles();
      
      while (files.hasNext()) {
        const file = files.next();
        templates.push({
          id: file.getId(),
          name: file.getName(),
          lastModified: file.getLastUpdated(),
          size: file.getSize()
        });
      }
    }
    
    // Add built-in templates
    Object.keys(TEMPLATE_CONFIG.templates).forEach(key => {
      const template = TEMPLATE_CONFIG.templates[key];
      templates.push({
        id: key,
        name: template.name,
        description: template.description,
        type: 'built-in'
      });
    });
    
    return {
      success: true,
      templates: templates
    };
    
  } catch (error) {
    console.error('Error getting available templates:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function uploadTemplate(templateData, templateType) {
  try {
    const folders = DriveApp.getFoldersByName(TEMPLATE_CONFIG.driveFolder);
    let templateFolder;
    
    if (folders.hasNext()) {
      templateFolder = folders.next();
    } else {
      templateFolder = DriveApp.createFolder(TEMPLATE_CONFIG.driveFolder);
    }
    
    // Create new template document
    const doc = DocumentApp.create(`Custom_${templateType}_Template`);
    doc.getBody().setText(templateData.content);
    
    // Move to templates folder
    const file = DriveApp.getFileById(doc.getId());
    templateFolder.addFile(file);
    DriveApp.removeFile(file);
    
    return {
      success: true,
      fileId: doc.getId(),
      fileName: file.getName()
    };
    
  } catch (error) {
    console.error('Error uploading template:', error);
    return {
      success: false,
      error: error.message
    };
  }
}