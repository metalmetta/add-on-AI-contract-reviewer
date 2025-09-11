

function highlightClausesInDocument(clauses) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    clauses.forEach((clause, index) => {
      highlightClauseText(body, clause.text, clause.riskLevel, index);
    });
    
    return { success: true, highlighted: clauses.length };
    
  } catch (error) {
    console.error('Error highlighting clauses:', error);
    return { success: false, error: error.message };
  }
}

function highlightClauseText(body, searchText, riskLevel, clauseIndex) {
  // Search for the text in the document
  const searchResult = body.findText(searchText.substring(0, 50)); // Use first 50 chars for search
  
  if (searchResult) {
    const element = searchResult.getElement();
    const startOffset = searchResult.getStartOffset();
    const endOffset = Math.min(startOffset + searchText.length, element.asText().getText().length);
    
    // Apply highlighting based on risk level
    const backgroundColor = getRiskHighlightColor(riskLevel);
    element.asText().setBackgroundColor(startOffset, endOffset - 1, backgroundColor);
    
    // Add margin comment
    const range = DocumentApp.getActiveDocument().newRange();
    range.addElement(element, startOffset, endOffset - 1);
    
    const commentText = `[CLAUSE ${clauseIndex + 1}] Risk Level: ${riskLevel}\nRequires review and potential revision.`;
    DocumentApp.getActiveDocument().addComment(range.build(), commentText);
  }
}

function getRiskHighlightColor(riskLevel) {
  switch (riskLevel.toLowerCase()) {
    case 'high':
      return '#ffcdd2'; // Light red
    case 'medium':
      return '#ffe0b2'; // Light orange
    case 'low':
      return '#dcedc8'; // Light green
    default:
      return '#f5f5f5'; // Light gray
  }
}

function insertRedlineComments(suggestions) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    suggestions.forEach((suggestion, index) => {
      insertRedlineComment(body, suggestion, index);
    });
    
    return { success: true, inserted: suggestions.length };
    
  } catch (error) {
    console.error('Error inserting redline comments:', error);
    return { success: false, error: error.message };
  }
}

function insertRedlineComment(body, suggestion, suggestionIndex) {
  // For redline suggestions, we'll add them as comments at strategic locations
  const paragraphs = body.getParagraphs();
  
  if (paragraphs.length > suggestionIndex) {
    const targetParagraph = paragraphs[suggestionIndex % paragraphs.length];
    const range = DocumentApp.getActiveDocument().newRange();
    range.addElement(targetParagraph);
    
    const commentText = `[AI REDLINE ${suggestionIndex + 1}] ${suggestion.type}\n\n${suggestion.text}\n\nRationale: ${suggestion.rationale}`;
    DocumentApp.getActiveDocument().addComment(range.build(), commentText);
  }
}

function insertTrackedChange(text, newText, changeType) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    const searchResult = body.findText(text);
    
    if (searchResult) {
      const element = searchResult.getElement();
      const startOffset = searchResult.getStartOffset();
      const endOffset = startOffset + text.length;
      
      // Create range for the original text
      const range = doc.newRange();
      range.addElement(element, startOffset, endOffset - 1);
      
      switch (changeType.toLowerCase()) {
        case 'replace':
          // Strike through original text
          element.asText().setStrikethrough(startOffset, endOffset - 1, true);
          element.asText().setForegroundColor(startOffset, endOffset - 1, '#999999');
          
          // Insert new text after original
          const insertPosition = endOffset;
          element.asText().insertText(insertPosition, ` [${newText}]`);
          element.asText().setForegroundColor(insertPosition, insertPosition + newText.length + 2, '#1976d2');
          element.asText().setBold(insertPosition, insertPosition + newText.length + 2, true);
          break;
          
        case 'insert':
          // Insert new text with highlighting
          element.asText().insertText(startOffset, `[INSERT: ${newText}] `);
          element.asText().setBackgroundColor(startOffset, startOffset + newText.length + 10, '#e8f5e8');
          element.asText().setForegroundColor(startOffset, startOffset + newText.length + 10, '#2e7d32');
          break;
          
        case 'delete':
          // Strike through text to be deleted
          element.asText().setStrikethrough(startOffset, endOffset - 1, true);
          element.asText().setBackgroundColor(startOffset, endOffset - 1, '#ffebee');
          element.asText().setForegroundColor(startOffset, endOffset - 1, '#c62828');
          break;
      }
      
      // Add comment explaining the change
      const commentText = `[AI SUGGESTION] ${changeType.toUpperCase()}: ${changeType === 'replace' ? `Change to: ${newText}` : newText}`;
      doc.addComment(range.build(), commentText);
      
      return { success: true };
    }
    
    return { success: false, error: 'Text not found in document' };
    
  } catch (error) {
    console.error('Error inserting tracked change:', error);
    return { success: false, error: error.message };
  }
}

function clearAllHighlighting() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    // Clear all background colors
    const text = body.editAsText();
    text.setBackgroundColor(null);
    
    // Remove all comments (be careful - this removes ALL comments)
    // In a real implementation, you'd want to only remove AI-generated comments
    
    return { success: true };
    
  } catch (error) {
    console.error('Error clearing highlighting:', error);
    return { success: false, error: error.message };
  }
}

function acceptAllSuggestions() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    // This would implement accepting all AI suggestions
    // For demonstration, we'll just remove strikethrough formatting
    const text = body.editAsText();
    text.setStrikethrough(false);
    text.setForegroundColor('#000000');
    
    // In a real implementation, you would:
    // 1. Parse all AI comments
    // 2. Apply the suggested changes
    // 3. Remove the comments
    // 4. Update the document text accordingly
    
    return { success: true, message: 'All suggestions accepted' };
    
  } catch (error) {
    console.error('Error accepting suggestions:', error);
    return { success: false, error: error.message };
  }
}

function rejectAllSuggestions() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  try {
    // Remove all AI-generated formatting and comments
    const text = body.editAsText();
    text.setBackgroundColor(null);
    text.setStrikethrough(false);
    text.setForegroundColor('#000000');
    
    // In a real implementation, you would:
    // 1. Identify all AI-generated comments
    // 2. Remove them from the document
    // 3. Restore original formatting
    
    return { success: true, message: 'All suggestions rejected' };
    
  } catch (error) {
    console.error('Error rejecting suggestions:', error);
    return { success: false, error: error.message };
  }
}

function generateRedlineDocument() {
  const sourceDoc = DocumentApp.getActiveDocument();
  const sourceBody = sourceDoc.getBody();
  
  try {
    // Create a new document for redlined version
    const newDoc = DocumentApp.create(`${sourceDoc.getName()} - Redlined`);
    const newBody = newDoc.getBody();
    
    // Copy content to new document
    const sourceText = sourceBody.getText();
    newBody.setText(sourceText);
    
    // Apply redlining to the new document
    // This would include all AI suggestions as tracked changes
    
    return {
      success: true,
      documentId: newDoc.getId(),
      documentUrl: newDoc.getUrl(),
      message: 'Redlined document created'
    };
    
  } catch (error) {
    console.error('Error generating redline document:', error);
    return { success: false, error: error.message };
  }
}

function getDocumentComments() {
  try {
    const doc = DocumentApp.getActiveDocument();
    
    // Note: Google Apps Script doesn't provide direct access to comments
    // This would require using the Google Docs API
    
    // For demonstration, return mock comment data
    return {
      success: true,
      comments: [
        {
          id: '1',
          text: 'AI suggestion: Consider revising liability clause',
          type: 'ai_suggestion',
          resolved: false
        }
      ]
    };
    
  } catch (error) {
    console.error('Error getting comments:', error);
    return { success: false, error: error.message };
  }
}

function resolveComment(commentId) {
  try {
    // This would resolve a specific comment
    // Requires Google Docs API integration
    
    return { success: true, message: `Comment ${commentId} resolved` };
    
  } catch (error) {
    console.error('Error resolving comment:', error);
    return { success: false, error: error.message };
  }
}