import { ReportState, ReportEntry } from '../types';
import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ReportEntriesProps {
  reportState: ReportState;
  onUpdate: (updates: Partial<ReportState>) => void;
}

export function ReportEntries({ reportState, onUpdate }: ReportEntriesProps) {
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [latestEntryId, setLatestEntryId] = useState<string | null>(null);
  
  // Create refs for entries
  const entryRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  const addEntry = () => {
    const newEntry: ReportEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      classification: 'bug',
      title: '',
      description: '',
      screenshotPath: ''
    };
    
    // Set this as the latest entry to scroll to
    setLatestEntryId(newEntry.id);
    
    onUpdate({
      entries: [...reportState.entries, newEntry]
    });
  };
  
  // Effect to scroll to the latest entry when it's added
  useEffect(() => {
    if (latestEntryId && entryRefs.current[latestEntryId]) {
      // Scroll the entry into view with smooth behavior
      entryRefs.current[latestEntryId]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Clear the latest entry ID after scrolling
      setTimeout(() => setLatestEntryId(null), 100);
    }
  }, [latestEntryId, reportState.entries]);
  
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
                      ref={(el) => {
                        // Set both the Draggable ref and our custom ref
                        provided.innerRef(el);
                        if (entry.id === latestEntryId) {
                          entryRefs.current[entry.id] = el;
                        }
                      }}
                      {...provided.draggableProps}
                    >
                      <div className="entry-content">
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
