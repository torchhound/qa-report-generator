import { ReportState, ReportEntry } from '../types';
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ReportEntriesProps {
  reportState: ReportState;
  onUpdate: (updates: Partial<ReportState>) => void;
}

export function ReportEntries({ reportState, onUpdate }: ReportEntriesProps) {
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [clipboardProcessing, setClipboardProcessing] = useState<string | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  
  // Setup paste event handler for the hidden paste area
  useEffect(() => {
    const pasteArea = pasteAreaRef.current;
    if (!pasteArea) return;
    
    const handlePaste = (e: ClipboardEvent) => {
      if (!clipboardProcessing) return;
      
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (!blob) continue;
            
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target && event.target.result) {
                updateEntry(clipboardProcessing, { 
                  screenshotPath: event.target.result as string 
                });
              }
              setClipboardProcessing(null);
            };
            
            reader.onerror = () => {
              console.error('Error reading clipboard image');
              setClipboardProcessing(null);
            };
            
            reader.readAsDataURL(blob);
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        
        // If we get here, no image was found
        alert('No image found in clipboard. Please copy an image first.');
        setClipboardProcessing(null);
      }
    };
    
    pasteArea.addEventListener('paste', handlePaste);
    
    return () => {
      pasteArea.removeEventListener('paste', handlePaste);
    };
  }, [clipboardProcessing]);
  
  const addEntry = () => {
    const newEntry: ReportEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      classification: 'bug',
      title: '',
      description: '',
      screenshotPath: ''
    };
    
    onUpdate({
      entries: [...reportState.entries, newEntry]
    });
  };
  
  const handleDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // If the item was dropped in the same position, do nothing
    if (sourceIndex === destinationIndex) {
      return;
    }
    
    // Create a new array with the reordered entries
    const reorderedEntries = Array.from(reportState.entries);
    const [removed] = reorderedEntries.splice(sourceIndex, 1);
    reorderedEntries.splice(destinationIndex, 0, removed);
    
    // Update the state with the reordered entries
    onUpdate({
      entries: reorderedEntries
    });
  };
  
  const handleFileUpload = (entryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(entryId);
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Update the entry with the data URL of the image
          updateEntry(entryId, { screenshotPath: e.target.result as string });
          setIsUploading(null);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleClipboardPaste = (entryId: string) => {
    // Set the active entry ID for clipboard processing
    setClipboardProcessing(entryId);
    
    // Focus the hidden paste area to receive the paste event
    if (pasteAreaRef.current) {
      pasteAreaRef.current.focus();
      
      // Show instructions to the user
      alert('Press Ctrl+V to paste your image');
      
      // Set a timeout to clear the processing state if no paste happens
      setTimeout(() => {
        if (clipboardProcessing === entryId) {
          setClipboardProcessing(null);
        }
      }, 30000); // 30 seconds timeout
    } else {
      alert('Clipboard paste area not available');
      setClipboardProcessing(null);
    }
  };

  const updateEntry = (id: string, updates: Partial<ReportEntry>) => {
    const updatedEntries = reportState.entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    onUpdate({ entries: updatedEntries });
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = reportState.entries.filter(entry => entry.id !== id);
    onUpdate({ entries: updatedEntries });
  };

  return (
    <div className="report-entries">
      {/* Hidden div for paste events */}
      <div 
        ref={pasteAreaRef}
        tabIndex={0}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: clipboardProcessing ? 'auto' : 'none',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      />
      
      <div className="sticky-button-container">
        <button onClick={addEntry} className="add-entry-btn">
          Add New Entry
        </button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="entries-list">
          {(provided) => (
            <div 
              className="entries-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {reportState.entries.map((entry, index) => (
                <Draggable key={entry.id} draggableId={entry.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      className={`entry-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="entry-header">
                        <div 
                          className="drag-handle"
                          {...provided.dragHandleProps}
                          title="Drag to reorder"
                        >
                          <span className="drag-icon">☰</span>
                        </div>
                        
                        <select
                          value={entry.classification}
                          onChange={(e) => updateEntry(entry.id, { 
                            classification: e.target.value as 'bug' | 'papercut' | 'feature' 
                          })}
                          className={`classification-${entry.classification}`}
                        >
                          <option value="bug">Bug</option>
                          <option value="papercut">Papercut</option>
                          <option value="feature">Feature</option>
                        </select>
                        
                        <input
                          type="text"
                          value={entry.title}
                          onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                          placeholder="Entry Title"
                          className="entry-title"
                        />
                        
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="delete-entry-btn"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="entry-screenshot">
                        {entry.screenshotPath ? (
                          <div className="screenshot-container">
                            <img 
                              src={entry.screenshotPath} 
                              alt="Screenshot" 
                              className="screenshot-preview"
                            />
                            <div className="screenshot-actions">
                              <label className="replace-screenshot-btn">
                                Replace
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleFileUpload(entry.id, e)}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="screenshot-upload-options">
                            <label className="upload-screenshot-btn">
                              {isUploading === entry.id ? 'Uploading...' : 'Upload Screenshot'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(entry.id, e)}
                                disabled={isUploading === entry.id}
                              />
                            </label>
                            <button 
                              className="clipboard-paste-btn"
                              onClick={() => handleClipboardPaste(entry.id)}
                              disabled={clipboardProcessing === entry.id}
                            >
                              {clipboardProcessing === entry.id ? 'Waiting for paste...' : 'Paste from Clipboard'}
                            </button>
                          </div>
                        )}
                      </div>

                      <textarea
                        value={entry.description}
                        onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                        placeholder="Description..."
                        className="entry-description"
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
