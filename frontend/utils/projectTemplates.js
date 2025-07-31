// Project templates for quick start

export const templates = {
  'react-basic': {
    name: 'React Basic App',
    description: 'Simple React application with components',
    files: {
      'package.json': `{
  "name": "react-basic-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`,
      'src/App.jsx': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Basic App</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
        <button onClick={() => setCount(count - 1)}>
          Decrement
        </button>
      </header>
    </div>
  );
}

export default App;`,
      'src/App.css': `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #61dafb;
  color: #282c34;
  cursor: pointer;
}

button:hover {
  background-color: #21a9c7;
}`,
      'README.md': `# React Basic App

A simple React application created with Claude Codespace.

## Features
- Counter functionality
- Clean React components
- Modern CSS styling

## Getting Started
1. Install dependencies: \`npm install\`
2. Start development server: \`npm start\`
3. Open http://localhost:3000

## Built with Claude AI 🤖`
    },
    folders: ['src']
  },

  'html-landing': {
    name: 'HTML Landing Page',
    description: 'Modern landing page with HTML, CSS, and JavaScript',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">YourBrand</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="hero">
            <h1>Welcome to the Future</h1>
            <p>Build amazing things with modern web technologies</p>
            <button onclick="showAlert()">Get Started</button>
        </section>

        <section id="features">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature">
                    <h3>Fast</h3>
                    <p>Lightning fast performance</p>
                </div>
                <div class="feature">
                    <h3>Responsive</h3>
                    <p>Works on all devices</p>
                </div>
                <div class="feature">
                    <h3>Modern</h3>
                    <p>Built with latest technologies</p>
                </div>
            </div>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>`,
      'styles.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

nav a:hover {
    opacity: 0.8;
}

main {
    padding-top: 80px;
}

#hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 8rem 2rem;
}

#hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

#hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

button {
    background: white;
    color: #667eea;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.3s;
}

button:hover {
    transform: translateY(-2px);
}

#features {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

#features h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature {
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.feature:hover {
    transform: translateY(-5px);
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #667eea;
}`,
      'script.js': `// Modern Landing Page JavaScript

function showAlert() {
    alert('Welcome! This landing page was created with Claude Codespace 🚀');
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(102, 126, 234, 0.9)';
    } else {
        header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
});

console.log('Landing page loaded! Built with Claude AI 🤖');`,
      'README.md': `# Modern Landing Page

A beautiful, responsive landing page built with HTML, CSS, and JavaScript.

## Features
- Responsive design
- Smooth scrolling navigation
- Modern gradient backgrounds
- Interactive elements
- Mobile-friendly

## Usage
Open \`index.html\` in your browser to view the landing page.

## Built with Claude AI 🤖`
    },
    folders: []
  },

  'python-basic': {
    name: 'Python Basic Script',
    description: 'Simple Python application with utilities',
    files: {
      'main.py': `#!/usr/bin/env python3
"""
Basic Python Application
Created with Claude Codespace
"""

import json
import datetime
from utils import helper_functions

def main():
    print("🐍 Python Basic Application")
    print("=" * 30)
    
    # Demo functionality
    current_time = datetime.datetime.now()
    print(f"Current time: {current_time}")
    
    # Use helper function
    result = helper_functions.calculate_fibonacci(10)
    print(f"Fibonacci sequence (10 numbers): {result}")
    
    # Data processing example
    data = {
        "name": "Claude Codespace Project",
        "version": "1.0.0",
        "created": current_time.isoformat(),
        "features": ["File management", "AI assistance", "Code execution"]
    }
    
    print("\\nProject data:")
    print(json.dumps(data, indent=2))
    
    print("\\n✅ Application completed successfully!")

if __name__ == "__main__":
    main()`,
      'utils/helper_functions.py': `"""
Helper functions for the Python application
"""

def calculate_fibonacci(n):
    """Calculate Fibonacci sequence up to n numbers"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

def format_text(text, style='upper'):
    """Format text with different styles"""
    styles = {
        'upper': text.upper(),
        'lower': text.lower(),
        'title': text.title(),
        'reverse': text[::-1]
    }
    
    return styles.get(style, text)

def calculate_average(numbers):
    """Calculate average of a list of numbers"""
    if not numbers:
        return 0
    
    return sum(numbers) / len(numbers)`,
      'utils/__init__.py': `# Utils package initialization`,
      'requirements.txt': `# Python dependencies
# Add your required packages here
requests>=2.25.0
python-dateutil>=2.8.0`,
      'README.md': `# Python Basic Application

A simple Python application with utility functions.

## Features
- Fibonacci calculation
- Text formatting utilities
- Data processing examples
- Modular code structure

## Setup
1. Install dependencies: \`pip install -r requirements.txt\`
2. Run the application: \`python main.py\`

## Structure
- \`main.py\` - Main application entry point
- \`utils/\` - Helper functions and utilities
- \`requirements.txt\` - Python dependencies

## Built with Claude AI 🤖`
    },
    folders: ['utils']
  }
};

export function createProjectFromTemplate(templateKey) {
  const template = templates[templateKey];
  if (!template) {
    throw new Error(`Template "${templateKey}" not found`);
  }
  
  return {
    files: { ...template.files },
    folders: [...template.folders],
    name: template.name,
    description: template.description
  };
}