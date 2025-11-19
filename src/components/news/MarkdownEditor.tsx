import React, { useState, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onImageUpload
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      insertMarkdown(`![${file.name}](${imageUrl})`);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="ftn-markdown-editor">
      <div className="ftn-markdown-toolbar">
        <button
          type="button"
          onClick={() => insertMarkdown('# ', '')}
          className="ftn-toolbar-btn"
          title="Heading"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('## ', '')}
          className="ftn-toolbar-btn"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="ftn-toolbar-btn"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="ftn-toolbar-btn"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          className="ftn-toolbar-btn"
          title="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('```\n', '\n```')}
          className="ftn-toolbar-btn"
          title="Code Block"
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('- ', '')}
          className="ftn-toolbar-btn"
          title="List"
        >
          List
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          className="ftn-toolbar-btn"
          title="Upload Image"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Image'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ftn-markdown-textarea"
        placeholder="Write your article in Markdown..."
        rows={20}
      />
      
      <div className="ftn-markdown-help">
        <p>
          <strong>Markdown Tips:</strong> Use # for headings, ** for bold, * for italic, 
          [text](url) for links, and ![alt](url) for images.
        </p>
      </div>
    </div>
  );
};
