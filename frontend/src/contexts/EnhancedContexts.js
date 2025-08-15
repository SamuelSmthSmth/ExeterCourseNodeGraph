import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Theme Context for Dark/Light Mode
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved || 'light';
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Settings Context
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : {
      animations: true,
      physics: true,
      autoSave: true,
      showMinimap: true,
      soundEffects: false,
      notifications: true,
      graphLayout: 'force',
      nodeSize: 'medium',
      edgeStyle: 'curved',
      backgroundColor: 'default',
      performance: 'balanced'
    };
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('app-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings = {
      animations: true,
      physics: true,
      autoSave: true,
      showMinimap: true,
      soundEffects: false,
      notifications: true,
      graphLayout: 'force',
      nodeSize: 'medium',
      edgeStyle: 'curved',
      backgroundColor: 'default',
      performance: 'balanced'
    };
    setSettings(defaultSettings);
    localStorage.setItem('app-settings', JSON.stringify(defaultSettings));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Keyboard Shortcuts Context
const KeyboardShortcutsContext = createContext();

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const shortcuts = useRef(new Map());
  const [isEnabled, setIsEnabled] = useState(true);

  const registerShortcut = useCallback((key, callback, description = '') => {
    shortcuts.current.set(key.toLowerCase(), { callback, description });
  }, []);

  const unregisterShortcut = useCallback((key) => {
    shortcuts.current.delete(key.toLowerCase());
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcuts.current.entries()).map(([key, { description }]) => ({
      key,
      description
    }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isEnabled) return;

      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();
      let shortcutKey = '';

      if (event.ctrlKey) shortcutKey += 'ctrl+';
      if (event.altKey) shortcutKey += 'alt+';
      if (event.shiftKey) shortcutKey += 'shift+';
      shortcutKey += key;

      const shortcut = shortcuts.current.get(shortcutKey);
      if (shortcut) {
        event.preventDefault();
        shortcut.callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);

  return (
    <KeyboardShortcutsContext.Provider value={{
      registerShortcut,
      unregisterShortcut,
      getShortcuts,
      isEnabled,
      setIsEnabled
    }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

// Performance Monitor Context
const PerformanceContext = createContext();

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const metricsRef = useRef({ frameCount: 0, lastTime: performance.now() });

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    metricsRef.current.lastTime = performance.now();
    metricsRef.current.frameCount = 0;
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const updateMetrics = useCallback((newMetrics) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  // FPS monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    let animationId;
    
    const measureFPS = () => {
      const now = performance.now();
      metricsRef.current.frameCount++;
      
      if (now - metricsRef.current.lastTime >= 1000) {
        const fps = Math.round((metricsRef.current.frameCount * 1000) / (now - metricsRef.current.lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        
        metricsRef.current.frameCount = 0;
        metricsRef.current.lastTime = now;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMonitoring]);

  // Memory monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      if (performance.memory) {
        const memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memory }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <PerformanceContext.Provider value={{
      metrics,
      isMonitoring,
      startMonitoring,
      stopMonitoring,
      updateMetrics
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Command Palette Context
const CommandPaletteContext = createContext();

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
};

export const CommandPaletteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState([]);
  
  const registerCommand = useCallback((id, command) => {
    setCommands(prev => {
      const filtered = prev.filter(cmd => cmd.id !== id);
      return [...filtered, { id, ...command }];
    });
  }, []);

  const unregisterCommand = useCallback((id) => {
    setCommands(prev => prev.filter(cmd => cmd.id !== id));
  }, []);

  const executeCommand = useCallback((id) => {
    const command = commands.find(cmd => cmd.id === id);
    if (command && command.action) {
      command.action();
      setIsOpen(false);
    }
  }, [commands]);

  const togglePalette = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{
      isOpen,
      commands,
      registerCommand,
      unregisterCommand,
      executeCommand,
      togglePalette,
      setIsOpen
    }}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

// Analytics Context
const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);

  const track = useCallback((eventName, properties = {}) => {
    if (!isEnabled) return;

    const event = {
      id: Date.now() + Math.random(),
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('session-id') || 'unknown'
    };

    setEvents(prev => {
      const newEvents = [...prev, event];
      // Keep only last 1000 events
      return newEvents.slice(-1000);
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }, [isEnabled]);

  const getEvents = useCallback((filter = {}) => {
    let filtered = events;

    if (filter.name) {
      filtered = filtered.filter(event => event.name === filter.name);
    }

    if (filter.since) {
      const since = new Date(filter.since);
      filtered = filtered.filter(event => new Date(event.timestamp) >= since);
    }

    return filtered;
  }, [events]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const getStats = useCallback(() => {
    const totalEvents = events.length;
    const uniqueEvents = new Set(events.map(e => e.name)).size;
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    const recentEvents = events.filter(e => new Date(e.timestamp) >= lastHour).length;

    return {
      totalEvents,
      uniqueEvents,
      recentEvents,
      topEvents: Object.entries(
        events.reduce((acc, event) => {
          acc[event.name] = (acc[event.name] || 0) + 1;
          return acc;
        }, {})
      ).sort(([,a], [,b]) => b - a).slice(0, 5)
    };
  }, [events]);

  return (
    <AnalyticsContext.Provider value={{
      track,
      getEvents,
      clearEvents,
      getStats,
      isEnabled,
      setIsEnabled
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Combined Provider
export const EnhancedProviders = ({ children }) => {
  // Initialize session ID
  useEffect(() => {
    if (!sessionStorage.getItem('session-id')) {
      sessionStorage.setItem('session-id', Date.now().toString());
    }
  }, []);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <KeyboardShortcutsProvider>
          <PerformanceProvider>
            <CommandPaletteProvider>
              <AnalyticsProvider>
                {children}
              </AnalyticsProvider>
            </CommandPaletteProvider>
          </PerformanceProvider>
        </KeyboardShortcutsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};
