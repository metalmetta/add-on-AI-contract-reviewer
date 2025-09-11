# Google Docs Add-on: AI-Powered Contract Reviewer

## Deployment Guide

### Prerequisites

1. **Google Account** with Google Workspace access
2. **Google Apps Script** access
3. **AI API Key** (OpenAI, Anthropic Claude, or custom AI service)
4. **Google Drive** folder for contract templates

### Setup Instructions

#### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the files from this repository
4. Save the project with name: "Contract AI Reviewer"

#### 2. Add Project Files

Upload/create the following files in your Apps Script project:

**Core Files:**
- `Code.gs` - Main application code
- `appsscript.json` - Project manifest and permissions

**Feature Modules:**
- `ai-integration.gs` - AI API integration
- `risk-assessment.gs` - Risk scoring system
- `redlining.gs` - Document markup and highlighting
- `template-comparison.gs` - Template comparison logic
- `version-tracking.gs` - Version control and tracking

**HTML Interface:**
- `sidebar.html` - Main sidebar interface
- `styles.html` - CSS styling
- `scripts.html` - JavaScript functionality
- `settings.html` - Settings dialog

#### 3. Configure API Services

1. In Apps Script, go to **Services** (+ icon in left sidebar)
2. Add the following services:
   - **Google Drive API** (v3)
   - **Google Docs API** (v1)

#### 4. Set Up Permissions

The `appsscript.json` file includes required OAuth scopes:
- `https://www.googleapis.com/auth/documents` - Read/write documents
- `https://www.googleapis.com/auth/drive.readonly` - Read Drive files
- `https://www.googleapis.com/auth/drive.file` - Create/modify files
- `https://www.googleapis.com/auth/script.container.ui` - Show sidebar UI

#### 5. Configure AI API

1. Open the add-on settings in Google Docs
2. Enter your AI API key
3. Select AI provider (OpenAI, Claude, or Custom)
4. Configure analysis preferences

#### 6. Test the Add-on

1. Open a Google Docs document
2. Go to **Extensions → Apps Script**
3. Select your "Contract AI Reviewer" project
4. Click **Run** on the `onOpen` function
5. Return to your document - you should see the "Contract AI Reviewer" menu

### Deployment Options

#### Option 1: Personal Use

For personal or organization use:
1. Follow setup instructions above
2. Share the Apps Script project with team members
3. Each user needs to authorize permissions individually

#### Option 2: Workspace Marketplace (Public)

For public distribution:

1. **Prepare for Review**
   - Complete all testing
   - Add privacy policy
   - Create detailed documentation
   - Prepare store listing assets

2. **Submit to Google Workspace Marketplace**
   - Go to [Google Workspace Marketplace SDK](https://developers.google.com/workspace/marketplace)
   - Complete the verification process
   - Submit for review (can take 2-4 weeks)

3. **Store Listing Requirements**
   - App screenshots (1280x800px)
   - App icon (128x128px)
   - Privacy policy URL
   - Terms of service URL
   - Support contact information

### Configuration

#### Template Setup

1. Create a Google Drive folder named "Contract Templates"
2. Add your standard contract templates as Google Docs
3. The add-on will automatically detect and use these templates

#### AI Integration

Replace placeholder AI integration in `ai-integration.gs`:

```javascript
// Update AI_CONFIG with your settings
const AI_CONFIG = {
  apiUrl: 'YOUR_AI_SERVICE_URL',
  apiKey: PropertiesService.getScriptProperties().getProperty('AI_API_KEY'),
  model: 'YOUR_PREFERRED_MODEL',
  maxTokens: 2000,
  temperature: 0.3
};
```

#### Customization Options

1. **Risk Assessment Weights** - Modify `RISK_WEIGHTS` in `risk-assessment.gs`
2. **Template Categories** - Update `TEMPLATE_CONFIG` in `template-comparison.gs`
3. **UI Styling** - Customize styles in `styles.html`
4. **Language Support** - Add language options in settings

### Security Considerations

1. **API Keys** - Stored securely using PropertiesService
2. **User Data** - Document content sent to AI services (ensure compliance)
3. **Permissions** - Minimal required scopes only
4. **GDPR Compliance** - Add appropriate data handling notices

### Troubleshooting

#### Common Issues

1. **"Authorization Required" Error**
   - Run the `onOpen` function manually first
   - Check OAuth scopes in `appsscript.json`

2. **AI API Not Working**
   - Verify API key in settings
   - Check AI service URL and model name
   - Monitor Apps Script logs for errors

3. **Templates Not Found**
   - Ensure "Contract Templates" folder exists in Drive
   - Check folder permissions
   - Verify folder name matches `TEMPLATE_CONFIG`

4. **Sidebar Not Loading**
   - Check HTML file names match includes
   - Verify all files are saved in project
   - Check browser console for JavaScript errors

#### Debug Mode

Enable debug mode in settings to:
- View detailed logs in Apps Script console
- See AI API request/response details
- Monitor performance metrics

### Performance Optimization

1. **Caching** - Template content cached to reduce Drive API calls
2. **Batch Processing** - Multiple operations combined where possible
3. **Lazy Loading** - UI components loaded on demand
4. **Version Limits** - Old versions automatically cleaned up

### Monitoring and Analytics

Track usage through:
1. Apps Script execution logs
2. Version tracking statistics
3. User acceptance rates for AI suggestions
4. Risk assessment accuracy metrics

### Support and Maintenance

#### Regular Tasks
- Monitor API usage and costs
- Update AI models and prompts
- Refresh contract templates
- Review user feedback and suggestions

#### Version Updates
- Test changes in development environment
- Update version number in manifest
- Communicate changes to users
- Monitor for issues after deployment

### Legal and Compliance

⚠️ **Important Considerations:**

1. **Data Privacy** - Ensure AI service compliance with local laws
2. **Professional Liability** - Add disclaimers about AI assistance
3. **Audit Trail** - Version tracking provides change history
4. **User Training** - Provide guidance on AI suggestion acceptance

### Contact and Support

For deployment assistance:
- Check Google Apps Script documentation
- Review Workspace Marketplace guidelines
- Test thoroughly before public release
- Consider legal review for compliance

---

## Quick Start Checklist

- [ ] Create Apps Script project
- [ ] Upload all code files
- [ ] Configure API services (Drive, Docs)
- [ ] Set up AI API credentials
- [ ] Create template folder in Drive
- [ ] Test basic functionality
- [ ] Configure settings and preferences
- [ ] Train users on features
- [ ] Monitor performance and usage
- [ ] Plan for updates and maintenance