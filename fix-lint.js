const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'client/src'), (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove unused React imports
  if (content.includes("import React from 'react'")) {
    content = content.replace(/import React from 'react';?\n/, '');
    changed = true;
  }
  if (content.includes("import React, {")) {
    content = content.replace(/import React, \{/g, 'import {');
    changed = true;
  }

  // Remove other specific unused variables based on the log
  if (filePath.includes('AdminPanel.jsx')) {
    content = content.replace(/, Edit3 /g, ' ');
    changed = true;
  }
  if (filePath.includes('Sidebar.jsx')) {
    content = content.replace(/, User, Settings, Menu, X /g, ' ');
    content = content.replace(/import \{ Leaf \} from 'lucide-react'\n/g, '');
    content = content.replace(/import \{ useTheme \} from '\.\.\/\.\.\/contexts\/ThemeContext'\n/g, '');
    changed = true;
  }
  if (filePath.includes('Topbar.jsx')) {
    content = content.replace(/, Search /g, ' ');
    changed = true;
  }
  
  // AuthContext / ThemeContext react-refresh
  if (filePath.includes('AuthContext.jsx') || filePath.includes('ThemeContext.jsx')) {
    if (!content.includes('eslint-disable react-refresh/only-export-components')) {
      content = '/* eslint-disable react-refresh/only-export-components */\n' + content;
      changed = true;
    }
  }

  // Orb.jsx useEffect
  if (filePath.includes('Orb.jsx')) {
    if (content.includes("}, [])")) {
      content = content.replace(/\}, \[\]\)/g, '}, [frag, vert])');
      changed = true;
    }
  }

  // useEmissions.js
  if (filePath.includes('useEmissions.js')) {
    content = content.replace(
      /useEffect\(\(\) => \{[\s\S]*?\}, \[user, fetchEmissions\]\)/,
      "const fetchEmissions = useCallback(async () => {\n    try {\n      setLoading(true)\n      const data = await getMonthlyEmissions(user.uid)\n      setEmissions(data)\n    } catch (err) {\n      setError(err.message)\n    } finally {\n      setLoading(false)\n    }\n  }, [user])\n\n  useEffect(() => {\n    if (!user) {\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setLoading(false)\n      return\n    }\n    fetchEmissions()\n  }, [user, fetchEmissions])"
    );
    // Remove the old fetchEmissions definition
    content = content.replace(/const fetchEmissions = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\]\)/, '');
    changed = true;
  }

  // useGoals.js
  if (filePath.includes('useGoals.js')) {
    content = content.replace(
      /useEffect\(\(\) => \{[\s\S]*?\}, \[user, fetchGoals\]\)/,
      "const fetchGoals = useCallback(async () => {\n    try {\n      setLoading(true)\n      const data = await getUserGoals(user.uid)\n      setGoals(data)\n    } catch (err) {\n      setError(err.message)\n    } finally {\n      setLoading(false)\n    }\n  }, [user])\n\n  useEffect(() => {\n    if (!user) {\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setLoading(false)\n      return\n    }\n    fetchGoals()\n  }, [user, fetchGoals])"
    );
    // Remove the old fetchGoals definition
    content = content.replace(/const fetchGoals = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\]\)/, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
