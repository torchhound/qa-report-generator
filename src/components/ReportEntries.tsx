import { ReportState, ReportEntry, ContentItem } from '../types';
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
      contentItems: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: '',
          order: 0
        }
      ]
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
  
  const addTextItem = (entryId: string) => {
    // Find the entry
    const entry = reportState.entries.find(entry => entry.id === entryId);
    if (entry) {
      // Create a new text content item
      const newContentItem: ContentItem = {
        id: crypto.randomUUID(),
        type: 'text',
        content: '',
        order: entry.contentItems.length // Add to the end
      };
      
      // Update the entry with the new content item
      updateEntry(entryId, { 
        contentItems: [...entry.contentItems, newContentItem]
      });
    }
  };
  
  const addImageItem = (entryId: string) => {
    // Trigger file input click
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      if (event.target instanceof HTMLInputElement && event.target.files) {
        handleFileUpload(entryId, event.target.files);
      }
    };
    fileInput.click();
  };

  const handleFileUpload = (entryId: string, files: FileList) => {
    if (files && files.length > 0) {
      setIsUploading(entryId); // Set uploading state for the entry
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Find the entry
          const entry = reportState.entries.find(entry => entry.id === entryId);
          if (entry) {
            // Create a new image content item
            const newContentItem: ContentItem = {
              id: crypto.randomUUID(),
              type: 'image',
              content: e.target.result as string,
              order: entry.contentItems.length // Add to the end
            };
            
            // Update the entry with the new content item
            updateEntry(entryId, { 
              contentItems: [...entry.contentItems, newContentItem]
            });
          }
          setIsUploading(null); // Clear uploading state when done
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        setIsUploading(null); // Clear uploading state on error
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Function to update a content item's text
  const updateContentItemText = (entryId: string, contentItemId: string, text: string) => {
    const entry = reportState.entries.find(entry => entry.id === entryId);
    if (entry) {
      const updatedContentItems = entry.contentItems.map(item => 
        item.id === contentItemId ? { ...item, content: text } : item
      );
      
      updateEntry(entryId, { contentItems: updatedContentItems });
    }
  };
  
  // Function to delete a content item
  const deleteContentItem = (entryId: string, contentItemId: string) => {
    const entry = reportState.entries.find(entry => entry.id === entryId);
    if (entry) {
      // Filter out the item to delete
      const updatedContentItems = entry.contentItems
        .filter(item => item.id !== contentItemId)
        // Update order values
        .map((item, index) => ({ ...item, order: index }));
      
      updateEntry(entryId, { contentItems: updatedContentItems });
    }
  };
  
  // Function to reorder content items within an entry
  const reorderContentItems = (entryId: string, startIndex: number, endIndex: number) => {
    const entry = reportState.entries.find(entry => entry.id === entryId);
    if (entry) {
      const result = Array.from(entry.contentItems);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update order values
      const updatedContentItems = result.map((item, index) => ({
        ...item,
        order: index
      }));
      
      updateEntry(entryId, { contentItems: updatedContentItems });
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

                      <div className="content-items-container">
                        <div className="content-items-actions">
                          <button 
                            className="add-content-btn add-text-btn"
                            onClick={() => addTextItem(entry.id)}
                          >
                            Add Text Box
                          </button>
                          <button 
                            className="add-content-btn add-image-btn"
                            onClick={() => addImageItem(entry.id)}
                          >
                            Add Image
                          </button>
                        </div>
                        
                        <DragDropContext
                          onDragEnd={(result) => {
                            if (!result.destination) return;
                            reorderContentItems(
                              entry.id,
                              result.source.index,
                              result.destination.index
                            );
                          }}
                        >
                          <Droppable droppableId={`content-items-${entry.id}`}>
                            {(provided) => (
                              <div
                                className="content-items-list"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {entry.contentItems.sort((a, b) => a.order - b.order).map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        className={`content-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <div className="content-item-header">
                                          <div 
                                            className="drag-handle"
                                            {...provided.dragHandleProps}
                                            title="Drag to reorder"
                                          >
                                            <span className="drag-icon">☰</span>
                                          </div>
                                          <div className="content-item-type">
                                            {item.type === 'text' ? 'Text' : 'Image'}
                                          </div>
                                          <button
                                            className="delete-content-btn"
                                            onClick={() => deleteContentItem(entry.id, item.id)}
                                          >
                                            ×
                                          </button>
                                        </div>
                                        
                                        <div className="content-item-body">
                                          {item.type === 'text' ? (
                                            <textarea
                                              value={item.content}
                                              onChange={(e) => updateContentItemText(entry.id, item.id, e.target.value)}
                                              placeholder="Enter text here..."
                                              className="content-text-area"
                                            />
                                          ) : (
                                            <div className="content-image-container">
                                              <img 
                                                src={item.content} 
                                                alt="Content Image" 
                                                className="content-image"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                        
                        {entry.contentItems.length === 0 && (
                          <div className="no-content-items">
                            <p>No content items yet. Add text or images using the buttons above.</p>
                          </div>
                        )}
                      </div>
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
