

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi()
    .createMenu('Contract AI Reviewer')
    .addItem('Open Contract Analysis Panel', 'openSidebar')
    .addSeparator()
    .addItem('Quick Risk Assessment', 'quickRiskAssessment')
    .addItem('Compare with Templates', 'compareWithTemplates')
    .addSeparator()
    .addItem('Settings', 'openSettings')
    .addToUi();
}

function openSidebar() {
  const html = HtmlService.createTemplateFromFile('sidebar');
  html.docId = DocumentApp.getActiveDocument().getId();
  
  const htmlOutput = html.evaluate()
    .setWidth(350)
    .setTitle('Contract AI Reviewer');
  
  DocumentApp.getUi().showSidebar(htmlOutput);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getDocumentText() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  return body.getText();
}

function getDocumentStructure() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const structure = [];
  
  const numChildren = body.getNumChildren();
  
  for (let i = 0; i < numChildren; i++) {
    const element = body.getChild(i);
    const elementType = element.getType();
    
    if (elementType === DocumentApp.ElementType.PARAGRAPH) {
      const paragraph = element.asParagraph();
      const text = paragraph.getText();
      
      if (text.trim()) {
        structure.push({
          type: 'paragraph',
          text: text,
          index: i,
          heading: paragraph.getHeading()
        });
      }
    }
  }
  
  return structure;
}

function highlightText(startIndex, endIndex, riskLevel) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  const range = doc.newRange();
  
  try {
    const element = body.findText('.*');
    if (element) {
      const textElement = element.getElement();
      range.addElement(textElement, startIndex, endIndex - 1);
      
      const rangeBuilder = doc.setSelection(range.build());
      
      const color = getRiskColor(riskLevel);
      textElement.asText().setBackgroundColor(startIndex, endIndex - 1, color);
    }
  } catch (error) {
    console.error('Error highlighting text:', error);
  }
}

function getRiskColor(riskLevel) {
  switch (riskLevel.toLowerCase()) {
    case 'high':
      return '#ffebee'; // Light red
    case 'medium':
      return '#fff3e0'; // Light orange
    case 'low':
      return '#e8f5e8'; // Light green
    default:
      return '#f5f5f5'; // Light gray
  }
}

function insertComment(text, comment, riskLevel) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  const searchResult = body.findText(text);
  if (searchResult) {
    const element = searchResult.getElement();
    const startOffset = searchResult.getStartOffset();
    
    const range = doc.newRange();
    range.addElement(element, startOffset, startOffset + text.length - 1);
    
    doc.addComment(range.build(), `[AI ${riskLevel.toUpperCase()} RISK] ${comment}`);
  }
}

function quickRiskAssessment() {
  const ui = DocumentApp.getUi();
  
  ui.alert('Quick Risk Assessment', 
    'Analyzing document for potential risks...\n\nThis feature will be implemented with AI integration.', 
    ui.ButtonSet.OK);
  
  // TODO: Implement actual AI analysis
  const docText = getDocumentText();
  console.log('Document length:', docText.length);
}

function compareWithTemplates() {
  const ui = DocumentApp.getUi();
  
  ui.alert('Template Comparison', 
    'Comparing document with standard templates...\n\nThis feature will integrate with Google Drive templates.', 
    ui.ButtonSet.OK);
  
  // TODO: Implement template comparison
}

function openSettings() {
  const html = HtmlService.createHtmlOutputFromFile('settings')
    .setWidth(500)
    .setHeight(600)
    .setTitle('Contract AI Settings');
  
  DocumentApp.getUi().showModalDialog(html, 'Contract AI Settings');
}

// Settings management functions
function getSettings() {
  const properties = PropertiesService.getUserProperties();
  const settings = {};
  
  const keys = [
    'aiProvider', 'aiModel', 'riskThreshold', 'defaultLanguage',
    'templateFolder', 'autoHighlight', 'gdprFocus', 'autoCompare',
    'emailNotifications', 'suggestionNotifications', 'versionTracking',
    'debugMode', 'maxVersions'
  ];
  
  keys.forEach(key => {
    const value = properties.getProperty(key);
    if (value !== null) {
      settings[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  });
  
  return settings;
}

function saveSettings(settings, apiKey) {
  try {
    const properties = PropertiesService.getUserProperties();
    
    Object.keys(settings).forEach(key => {
      if (key !== 'hasApiKey') {
        properties.setProperty(key, String(settings[key]));
      }
    });
    
    // Store API key securely in script properties
    if (apiKey && apiKey.trim()) {
      PropertiesService.getScriptProperties().setProperty('AI_API_KEY', apiKey.trim());
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
}

function resetSettings() {
  try {
    PropertiesService.getUserProperties().deleteAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}