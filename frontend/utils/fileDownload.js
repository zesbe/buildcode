// File download utilities

export function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function downloadAllFiles(files) {
  const zip = {};
  
  // Simple zip-like structure (for small projects)
  Object.entries(files).forEach(([filename, content]) => {
    zip[filename] = content;
  });
  
  const zipContent = JSON.stringify(zip, null, 2);
  downloadFile('project-export.json', zipContent);
}

export function downloadProjectAsZip(files, folders, projectName = 'claude-project') {
  // Create a simple text-based project export
  const projectData = {
    name: projectName,
    created: new Date().toISOString(),
    files: files,
    folders: folders,
    metadata: {
      version: '1.0.0',
      generator: 'Claude Codespace'
    }
  };
  
  const exportContent = JSON.stringify(projectData, null, 2);
  downloadFile(`${projectName}-export.json`, exportContent);
}