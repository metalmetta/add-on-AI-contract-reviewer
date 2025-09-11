

// Version tracking configuration
const VERSION_CONFIG = {
  maxVersions: 50,
  storageKey: 'contract_versions',
  trackingEnabled: true
};

function initializeVersionTracking() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    
    const versionData = {
      documentId: docId,
      documentName: doc.getName(),
      createdDate: new Date().toISOString(),
      versions: [],
      aiSuggestions: [],
      userActions: []
    };
    
    PropertiesService.getDocumentProperties()
      .setProperty(`${VERSION_CONFIG.storageKey}_${docId}`, JSON.stringify(versionData));
    
    return { success: true, message: 'Version tracking initialized' };
    
  } catch (error) {
    console.error('Error initializing version tracking:', error);
    return { success: false, error: error.message };
  }
}

function createDocumentSnapshot(reason, aiSuggestions = []) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    const body = doc.getBody();
    
    const snapshot = {
      id: generateVersionId(),
      timestamp: new Date().toISOString(),
      reason: reason,
      content: body.getText(),
      wordCount: body.getText().split(' ').length,
      aiSuggestions: aiSuggestions,
      metadata: {
        userEmail: Session.getActiveUser().getEmail(),
        documentRevisionId: doc.getRevisionId()
      }
    };
    
    const versionData = getVersionData(docId);
    if (versionData) {
      versionData.versions.push(snapshot);
      
      // Keep only the last N versions to avoid storage limits
      if (versionData.versions.length > VERSION_CONFIG.maxVersions) {
        versionData.versions = versionData.versions.slice(-VERSION_CONFIG.maxVersions);
      }
      
      saveVersionData(docId, versionData);
      
      return { success: true, versionId: snapshot.id };
    }
    
    return { success: false, error: 'Version data not found' };
    
  } catch (error) {
    console.error('Error creating document snapshot:', error);
    return { success: false, error: error.message };
  }
}

function trackAISuggestion(suggestion) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    
    const aiSuggestion = {
      id: generateSuggestionId(),
      timestamp: new Date().toISOString(),
      type: suggestion.type,
      text: suggestion.text,
      rationale: suggestion.rationale,
      targetLocation: suggestion.targetLocation || null,
      confidence: suggestion.confidence || 'medium',
      status: 'pending', // pending, accepted, rejected, modified
      appliedAt: null,
      userDecision: null
    };
    
    const versionData = getVersionData(docId);
    if (versionData) {
      versionData.aiSuggestions.push(aiSuggestion);
      saveVersionData(docId, versionData);
      
      return { success: true, suggestionId: aiSuggestion.id };
    }
    
    return { success: false, error: 'Version data not found' };
    
  } catch (error) {
    console.error('Error tracking AI suggestion:', error);
    return { success: false, error: error.message };
  }
}

function recordUserAction(action) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    
    const userAction = {
      id: generateActionId(),
      timestamp: new Date().toISOString(),
      type: action.type, // 'accept_suggestion', 'reject_suggestion', 'manual_edit', 'template_compare'
      suggestionId: action.suggestionId || null,
      description: action.description,
      details: action.details || {},
      userEmail: Session.getActiveUser().getEmail()
    };
    
    const versionData = getVersionData(docId);
    if (versionData) {
      versionData.userActions.push(userAction);
      
      // Update suggestion status if applicable
      if (action.suggestionId) {
        const suggestion = versionData.aiSuggestions.find(s => s.id === action.suggestionId);
        if (suggestion) {
          suggestion.status = action.type === 'accept_suggestion' ? 'accepted' : 'rejected';
          suggestion.appliedAt = new Date().toISOString();
          suggestion.userDecision = action.description;
        }
      }
      
      saveVersionData(docId, versionData);
      
      return { success: true, actionId: userAction.id };
    }
    
    return { success: false, error: 'Version data not found' };
    
  } catch (error) {
    console.error('Error recording user action:', error);
    return { success: false, error: error.message };
  }
}

function getDocumentHistory() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    
    const versionData = getVersionData(docId);
    if (!versionData) {
      return { success: false, error: 'No version history found' };
    }
    
    // Calculate statistics
    const stats = calculateHistoryStatistics(versionData);
    
    return {
      success: true,
      history: {
        documentInfo: {
          id: docId,
          name: versionData.documentName,
          createdDate: versionData.createdDate
        },
        versions: versionData.versions.slice(-10), // Last 10 versions
        aiSuggestions: versionData.aiSuggestions,
        userActions: versionData.userActions.slice(-20), // Last 20 actions
        statistics: stats
      }
    };
    
  } catch (error) {
    console.error('Error getting document history:', error);
    return { success: false, error: error.message };
  }
}

function calculateHistoryStatistics(versionData) {
  const stats = {
    totalVersions: versionData.versions.length,
    totalSuggestions: versionData.aiSuggestions.length,
    acceptedSuggestions: versionData.aiSuggestions.filter(s => s.status === 'accepted').length,
    rejectedSuggestions: versionData.aiSuggestions.filter(s => s.status === 'rejected').length,
    pendingSuggestions: versionData.aiSuggestions.filter(s => s.status === 'pending').length,
    totalUserActions: versionData.userActions.length,
    acceptanceRate: 0,
    mostCommonSuggestionType: '',
    timeSpan: {
      firstActivity: null,
      lastActivity: null
    }
  };
  
  // Calculate acceptance rate
  if (stats.totalSuggestions > 0) {
    stats.acceptanceRate = Math.round((stats.acceptedSuggestions / stats.totalSuggestions) * 100);
  }
  
  // Find most common suggestion type
  const suggestionTypes = {};
  versionData.aiSuggestions.forEach(suggestion => {
    suggestionTypes[suggestion.type] = (suggestionTypes[suggestion.type] || 0) + 1;
  });
  
  stats.mostCommonSuggestionType = Object.keys(suggestionTypes).reduce((a, b) => 
    suggestionTypes[a] > suggestionTypes[b] ? a : b, '');
  
  // Calculate time span
  if (versionData.versions.length > 0) {
    stats.timeSpan.firstActivity = versionData.versions[0].timestamp;
    stats.timeSpan.lastActivity = versionData.versions[versionData.versions.length - 1].timestamp;
  }
  
  return stats;
}

function exportVersionReport() {
  try {
    const history = getDocumentHistory();
    if (!history.success) {
      return history;
    }
    
    const doc = DocumentApp.getActiveDocument();
    const reportDoc = DocumentApp.create(`${doc.getName()} - Version Report`);
    const body = reportDoc.getBody();
    
    // Report header
    body.appendParagraph('DOCUMENT VERSION REPORT')
      .setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    body.appendParagraph(`Generated: ${new Date().toLocaleDateString()}`)
      .editAsText().setItalic(true);
    
    // Document info
    body.appendParagraph('DOCUMENT INFORMATION')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph(`Document: ${history.history.documentInfo.name}`);
    body.appendParagraph(`Document ID: ${history.history.documentInfo.id}`);
    body.appendParagraph(`Created: ${new Date(history.history.documentInfo.createdDate).toLocaleDateString()}`);
    
    // Statistics
    body.appendParagraph('STATISTICS')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    const stats = history.history.statistics;
    body.appendParagraph(`Total Versions: ${stats.totalVersions}`);
    body.appendParagraph(`AI Suggestions: ${stats.totalSuggestions} (${stats.acceptedSuggestions} accepted, ${stats.rejectedSuggestions} rejected)`);
    body.appendParagraph(`Acceptance Rate: ${stats.acceptanceRate}%`);
    body.appendParagraph(`Most Common Suggestion Type: ${stats.mostCommonSuggestionType}`);
    
    // AI Suggestions Summary
    body.appendParagraph('AI SUGGESTIONS SUMMARY')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    history.history.aiSuggestions.forEach((suggestion, index) => {
      body.appendParagraph(`${index + 1}. [${suggestion.status.toUpperCase()}] ${suggestion.type}`)
        .editAsText().setBold(true);
      body.appendParagraph(`   ${suggestion.text}`);
      body.appendParagraph(`   Rationale: ${suggestion.rationale}`);
      body.appendParagraph(`   Date: ${new Date(suggestion.timestamp).toLocaleDateString()}`);
      body.appendParagraph('');
    });
    
    // Version History
    body.appendParagraph('RECENT VERSION HISTORY')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    history.history.versions.forEach((version, index) => {
      body.appendParagraph(`Version ${version.id} - ${version.reason}`)
        .editAsText().setBold(true);
      body.appendParagraph(`   Date: ${new Date(version.timestamp).toLocaleDateString()}`);
      body.appendParagraph(`   Word Count: ${version.wordCount}`);
      body.appendParagraph(`   AI Suggestions: ${version.aiSuggestions.length}`);
      body.appendParagraph('');
    });
    
    return {
      success: true,
      reportId: reportDoc.getId(),
      reportUrl: reportDoc.getUrl()
    };
    
  } catch (error) {
    console.error('Error exporting version report:', error);
    return { success: false, error: error.message };
  }
}

function compareVersions(version1Id, version2Id) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    const versionData = getVersionData(docId);
    
    if (!versionData) {
      return { success: false, error: 'No version data found' };
    }
    
    const v1 = versionData.versions.find(v => v.id === version1Id);
    const v2 = versionData.versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) {
      return { success: false, error: 'Version not found' };
    }
    
    const comparison = {
      version1: { id: v1.id, timestamp: v1.timestamp, reason: v1.reason },
      version2: { id: v2.id, timestamp: v2.timestamp, reason: v2.reason },
      wordCountDiff: v2.wordCount - v1.wordCount,
      timeDiff: new Date(v2.timestamp) - new Date(v1.timestamp),
      suggestionsDiff: v2.aiSuggestions.length - v1.aiSuggestions.length,
      changes: calculateTextDifferences(v1.content, v2.content)
    };
    
    return { success: true, comparison: comparison };
    
  } catch (error) {
    console.error('Error comparing versions:', error);
    return { success: false, error: error.message };
  }
}

function calculateTextDifferences(text1, text2) {
  // Simple text difference calculation
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  
  const added = words2.filter(word => !words1.includes(word));
  const removed = words1.filter(word => !words2.includes(word));
  
  return {
    addedWords: added.length,
    removedWords: removed.length,
    totalChanges: added.length + removed.length,
    sampleAdditions: added.slice(0, 10).join(' '),
    sampleDeletions: removed.slice(0, 10).join(' ')
  };
}

// Utility functions
function getVersionData(docId) {
  try {
    const properties = PropertiesService.getDocumentProperties();
    const data = properties.getProperty(`${VERSION_CONFIG.storageKey}_${docId}`);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize if not found
    return initializeVersionTracking().success ? getVersionData(docId) : null;
    
  } catch (error) {
    console.error('Error getting version data:', error);
    return null;
  }
}

function saveVersionData(docId, versionData) {
  try {
    const properties = PropertiesService.getDocumentProperties();
    properties.setProperty(`${VERSION_CONFIG.storageKey}_${docId}`, JSON.stringify(versionData));
    return true;
    
  } catch (error) {
    console.error('Error saving version data:', error);
    return false;
  }
}

function generateVersionId() {
  return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSuggestionId() {
  return 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateActionId() {
  return 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function cleanupOldVersions() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();
    const versionData = getVersionData(docId);
    
    if (versionData && versionData.versions.length > VERSION_CONFIG.maxVersions) {
      versionData.versions = versionData.versions.slice(-VERSION_CONFIG.maxVersions);
      versionData.userActions = versionData.userActions.slice(-100); // Keep last 100 actions
      
      saveVersionData(docId, versionData);
      
      return { success: true, message: 'Old versions cleaned up' };
    }
    
    return { success: true, message: 'No cleanup needed' };
    
  } catch (error) {
    console.error('Error cleaning up versions:', error);
    return { success: false, error: error.message };
  }
}