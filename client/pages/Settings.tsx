import { useEffect, useState, useRef } from "react";
import Notebook from "@/components/Notebook";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategories, setCategories, loadData, saveData, type AppData } from "@/lib/storage";
import { Download, Upload, FileText } from "lucide-react";

export default function Settings() {
  const [categories, setLocalCategories] = useState<string[]>(getCategories());
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalCategories(getCategories());
  }, []);

  const addCat = () => {
    const v = newCategory.trim();
    if (!v) return;
    const next = Array.from(new Set([...categories, v]));
    setLocalCategories(next);
    setCategories(next);
    setNewCategory("");
  };

  // Drag & Drop reordering
  const dragIndex = useRef<number | null>(null);
  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null || from === idx) return;
    const next = categories.slice();
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    setLocalCategories(next);
    setCategories(next);
  };

  const removeCat = (c: string) => {
    const next = categories.filter((x) => x !== c);
    setLocalCategories(next);
    setCategories(next);
  };

  const exportData = () => {
    try {
      const data = loadData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notebook-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        // Validate data structure
        if (!data.months || !data.settings) {
          throw new Error('Invalid data format');
        }
        saveData(data);
        setLocalCategories(data.settings.categories);
        setMessage({ type: 'success', text: 'Data imported successfully! Please refresh the page.' });
        setTimeout(() => setMessage(null), 5000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      setLocalCategories([]);
      setMessage({ type: 'success', text: 'All data cleared successfully! Please refresh the page.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
            <AlertDescription className="font-hand">
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Notebook>
          <h2 className="font-hand text-2xl mb-4">Categories</h2>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Add category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} className="bg-transparent border-none shadow-none focus:ring-0 font-hand" />
            <Button onClick={addCat} variant="link" className="font-hand text-blue-600 underline">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2" onDragOver={onDragOver}>
            {categories.map((c, idx) => (
              <Badge
                key={c}
                variant="secondary"
                className="font-hand text-base py-1 cursor-move"
                draggable
                onDragStart={onDragStart(idx)}
                onDrop={onDrop(idx)}
              >
                {c}
                <button className="ml-2 opacity-70 hover:opacity-100" onClick={() => removeCat(c)} aria-label={`Remove ${c}`}>
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </Notebook>

        <Notebook>
          <h2 className="font-hand text-2xl mb-6">Data Management</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-hand text-lg font-semibold mb-5">Export Data</h3>
                <p className="text-sm text-muted-foreground font-hand">
                  Download all your data as a JSON file for backup or transfer.
                </p>
                <Button onClick={exportData} className="w-full font-hand text-blue-600 justify-start underline" variant="link">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-hand text-lg font-semibold mb-5">Import Data</h3>
                <p className="text-sm text-muted-foreground font-hand">
                  Upload a previously exported JSON file to restore your data.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full font-hand text-blue-600 justify-start underline"
                  variant="link"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <h3 className="font-hand text-lg font-semibold text-red-600 mb-5">Danger Zone</h3>
                <p className="text-sm text-muted-foreground font-hand">
                  Clear all data permanently. This action cannot be undone.
                </p>
                <Button
                  onClick={clearAllData}
                  variant="link"
                  className="font-hand text-red-600 underline justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </Notebook>
      </div>
    </Layout>
  );
}
