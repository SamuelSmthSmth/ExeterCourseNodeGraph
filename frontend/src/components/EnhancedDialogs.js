import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useKeyboardShortcuts, useCommandPalette, useAnalytics } from '../contexts/EnhancedContexts';
import { ModernButton } from './EnhancedComponents';

// Command Palette Component
const CommandPalette = () => {
  const { isOpen, commands, executeCommand, setIsOpen } = useCommandPalette();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { track } = useAnalytics();

  // Filter commands based on search term
  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex].id);
            track('command_executed', { 
              commandId: filteredCommands[selectedIndex].id,
              source: 'palette_keyboard' 
            });
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, setIsOpen, track]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        animation: 'fade-in 0.2s ease-out'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 var(--space-4)',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--neutral-200)',
          overflow: 'hidden',
          animation: 'scale-in 0.2s ease-out'
        }}
      >
        {/* Search Input */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--neutral-200)',
          background: 'var(--neutral-50)'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a command or search..."
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                paddingLeft: 'var(--space-12)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '1.125rem',
                background: 'white',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--neutral-400)'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Commands List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                onClick={() => {
                  executeCommand(command.id);
                  track('command_executed', { 
                    commandId: command.id,
                    source: 'palette_click' 
                  });
                }}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  cursor: 'pointer',
                  background: index === selectedIndex ? 'var(--primary-50)' : 'transparent',
                  borderLeft: index === selectedIndex ? '4px solid var(--primary-500)' : '4px solid transparent',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Icon */}
                {command.icon && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: index === selectedIndex ? 'var(--primary-100)' : 'var(--neutral-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    transition: 'var(--transition-fast)'
                  }}>
                    {command.icon}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--neutral-900)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {command.name}
                  </div>
                  {command.description && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--neutral-600)'
                    }}>
                      {command.description}
                    </div>
                  )}
                </div>

                {/* Shortcut */}
                {command.shortcut && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--neutral-500)',
                    background: 'var(--neutral-100)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace'
                  }}>
                    {command.shortcut}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              color: 'var(--neutral-500)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🔍</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                No commands found
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                Try searching for something else
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-3) var(--space-6)',
          background: 'var(--neutral-50)',
          borderTop: '1px solid var(--neutral-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--neutral-500)'
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <div>
            {filteredCommands.length} of {commands.length} commands
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Panel Component
const SettingsPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const { track } = useAnalytics();

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'graph', label: 'Graph', icon: '🌐' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    track('settings_tab_changed', { tab: tabId });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fade-in 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '80vh',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--neutral-200)',
          display: 'flex',
          overflow: 'hidden',
          animation: 'scale-in 0.2s ease-out'
        }}
      >
        {/* Sidebar */}
        <div style={{
          width: '240px',
          background: 'var(--neutral-50)',
          borderRight: '1px solid var(--neutral-200)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{
            margin: '0 0 var(--space-6) 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--neutral-900)'
          }}>
            Settings
          </h2>
          
          <nav style={{ flex: 1 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  margin: '0 0 var(--space-2) 0',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  background: activeTab === tab.id ? 'var(--primary-100)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--neutral-700)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  textAlign: 'left'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <ModernButton
            variant="ghost"
            onClick={onClose}
            fullWidth
          >
            Close Settings
          </ModernButton>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: 'var(--space-6)',
          overflowY: 'auto'
        }}>
          <SettingsContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

// Settings Content Component
const SettingsContent = ({ activeTab }) => {
  const { track } = useAnalytics();

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              General Settings
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              <SettingItem
                title="Auto-save"
                description="Automatically save your progress"
                type="toggle"
                defaultValue={true}
              />
              
              <SettingItem
                title="Notifications"
                description="Show desktop notifications"
                type="toggle"
                defaultValue={true}
              />
              
              <SettingItem
                title="Sound Effects"
                description="Play sound effects for interactions"
                type="toggle"
                defaultValue={false}
              />
              
              <SettingItem
                title="Language"
                description="Choose your preferred language"
                type="select"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' }
                ]}
                defaultValue="en"
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              Appearance Settings
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              <SettingItem
                title="Theme"
                description="Choose between light and dark theme"
                type="select"
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' }
                ]}
                defaultValue="light"
              />
              
              <SettingItem
                title="Animations"
                description="Enable smooth animations and transitions"
                type="toggle"
                defaultValue={true}
              />
              
              <SettingItem
                title="Reduce Motion"
                description="Reduce animations for accessibility"
                type="toggle"
                defaultValue={false}
              />
              
              <SettingItem
                title="Font Size"
                description="Adjust the application font size"
                type="select"
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ]}
                defaultValue="medium"
              />
            </div>
          </div>
        );

      case 'graph':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              Graph Settings
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              <SettingItem
                title="Physics Simulation"
                description="Enable realistic physics for node movement"
                type="toggle"
                defaultValue={true}
              />
              
              <SettingItem
                title="Node Size"
                description="Default size for graph nodes"
                type="select"
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ]}
                defaultValue="medium"
              />
              
              <SettingItem
                title="Edge Style"
                description="Visual style for connections"
                type="select"
                options={[
                  { value: 'straight', label: 'Straight' },
                  { value: 'curved', label: 'Curved' },
                  { value: 'bezier', label: 'Bezier' }
                ]}
                defaultValue="curved"
              />
              
              <SettingItem
                title="Show Minimap"
                description="Display a minimap for navigation"
                type="toggle"
                defaultValue={true}
              />
            </div>
          </div>
        );

      case 'performance':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              Performance Settings
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              <SettingItem
                title="Performance Mode"
                description="Balance between quality and performance"
                type="select"
                options={[
                  { value: 'quality', label: 'Quality' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'performance', label: 'Performance' }
                ]}
                defaultValue="balanced"
              />
              
              <SettingItem
                title="Max Nodes"
                description="Maximum number of nodes to render"
                type="number"
                defaultValue={1000}
                min={100}
                max={5000}
                step={100}
              />
              
              <SettingItem
                title="Render Optimization"
                description="Enable GPU acceleration when available"
                type="toggle"
                defaultValue={true}
              />
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              Keyboard Shortcuts
            </h3>
            
            <div style={{
              background: 'var(--neutral-50)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid var(--neutral-200)'
            }}>
              <ShortcutsList />
            </div>
          </div>
        );

      case 'about':
        return (
          <div>
            <h3 style={{
              margin: '0 0 var(--space-6) 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--neutral-900)'
            }}>
              About Course Node Graph
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                background: 'var(--neutral-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--neutral-200)'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: 'var(--space-4)'
                }}>
                  📚
                </div>
                <h4 style={{
                  margin: '0 0 var(--space-2) 0',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'var(--neutral-900)'
                }}>
                  Course Node Graph
                </h4>
                <p style={{
                  margin: '0 0 var(--space-4) 0',
                  color: 'var(--neutral-600)',
                  fontSize: '1rem'
                }}>
                  Version 2.0.0
                </p>
                <p style={{
                  margin: 0,
                  color: 'var(--neutral-600)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6
                }}>
                  An interactive visualization tool for exploring course relationships and academic pathways.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--neutral-200)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🚀</div>
                  <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>Built with</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>React & D3.js</div>
                </div>
                
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--neutral-200)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🎓</div>
                  <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>For</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>University of Exeter</div>
                </div>
                
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--neutral-200)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>💝</div>
                  <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>Open Source</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>MIT License</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Settings content</div>;
    }
  };

  return renderContent();
};

// Setting Item Component
const SettingItem = ({ title, description, type, defaultValue, options, min, max, step }) => {
  const [value, setValue] = useState(defaultValue);

  const renderControl = () => {
    switch (type) {
      case 'toggle':
        return (
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px'
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setValue(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: value ? 'var(--primary-500)' : 'var(--neutral-300)',
              transition: 'var(--transition-fast)',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '20px',
                width: '20px',
                left: value ? '26px' : '2px',
                bottom: '2px',
                backgroundColor: 'white',
                transition: 'var(--transition-fast)',
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }} />
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--neutral-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              minWidth: '120px'
            }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            min={min}
            max={max}
            step={step}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--neutral-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              width: '100px'
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--space-4)',
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--neutral-200)'
    }}>
      <div>
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--neutral-900)',
          marginBottom: 'var(--space-1)'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--neutral-600)'
        }}>
          {description}
        </div>
      </div>
      {renderControl()}
    </div>
  );
};

// Shortcuts List Component
const ShortcutsList = () => {
  const shortcuts = [
    { key: 'Ctrl+K', description: 'Open command palette' },
    { key: 'Ctrl+,', description: 'Open settings' },
    { key: 'Space', description: 'Pause/resume physics' },
    { key: 'R', description: 'Random course' },
    { key: 'F', description: 'Zoom to fit' },
    { key: 'Escape', description: 'Close panels' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Y', description: 'Redo' },
    { key: 'Delete', description: 'Clear graph' },
    { key: '?', description: 'Show help' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'var(--space-3)'
    }}>
      {shortcuts.map(shortcut => (
        <div
          key={shortcut.key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--neutral-200)'
          }}
        >
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--neutral-700)'
          }}>
            {shortcut.description}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: 'var(--neutral-100)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--neutral-200)'
          }}>
            {shortcut.key}
          </span>
        </div>
      ))}
    </div>
  );
};

export { CommandPalette, SettingsPanel };
