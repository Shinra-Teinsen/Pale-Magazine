import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Sparkles, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  List, 
  Quote, 
  Heading1, 
  Heading2, 
  Upload, 
  Trash2, 
  ImagePlus, 
  Loader2,
  FileCheck
} from 'lucide-react';
import { Category, Article } from '../types';
import { processDeviceImage } from '../lib/imageUtils';

interface RichEditorProps {
  categories: Category[];
  articleToEdit?: Article;
  onSave: (articleData: Partial<Article>) => void;
  onClose: () => void;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  categories,
  articleToEdit,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [categoryId, setCategoryId] = useState(articleToEdit?.category_id || categories[0]?.id || '');
  const [excerpt, setExcerpt] = useState(articleToEdit?.excerpt || '');
  const [quoteAttribution, setQuoteAttribution] = useState(articleToEdit?.quote_attribution || '');
  const [coverImage, setCoverImage] = useState(articleToEdit?.cover_image || '');
  const [coverImageName, setCoverImageName] = useState<string>(articleToEdit ? 'Image existante' : '');
  const [coverImageSizeKb, setCoverImageSizeKb] = useState<number | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [content, setContent] = useState(articleToEdit?.content || '');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(articleToEdit?.status || 'published');
  const [isFeatured, setIsFeatured] = useState(articleToEdit?.is_featured || false);
  const [previewMode, setPreviewMode] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Formatting shortcuts
  const insertFormatting = (tagStart: string, tagEnd: string = '') => {
    setContent(prev => prev + `${tagStart}Texte ici${tagEnd}`);
  };

  // Upload cover image from internal device storage
  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCoverError('Le fichier doit être une image (JPG, PNG, WebP, etc.).');
      return;
    }
    setCoverError(null);
    setIsProcessingCover(true);
    try {
      const processed = await processDeviceImage(file, 1600, 1200, 0.85);
      setCoverImage(processed.dataUrl);
      setCoverImageName(processed.fileName);
      setCoverImageSizeKb(processed.sizeKb);
    } catch (err: any) {
      setCoverError(err.message || 'Échec du chargement de l\'image depuis l\'appareil.');
    } finally {
      setIsProcessingCover(false);
    }
  };

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverFile(file);
    }
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverFile(file);
    }
  };

  // Upload and insert inline image from device storage into article content
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await processDeviceImage(file, 1200, 900, 0.85);
      const imageHtml = `
<figure class="my-6">
  <img src="${processed.dataUrl}" alt="${processed.fileName}" class="w-full rounded-2xl max-h-[500px] object-cover shadow-sm" />
  <figcaption class="text-xs text-center text-neutral-500 mt-2 italic">${processed.fileName}</figcaption>
</figure>
`;
      setContent(prev => prev + '\n' + imageHtml);
    } catch (err: any) {
      alert(err.message || 'Impossible d\'insérer cette image.');
    }
    e.target.value = '';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      setCoverError('Veuillez sélectionner une image de couverture depuis le stockage interne de votre appareil.');
      return;
    }

    onSave({
      title,
      category_id: categoryId,
      excerpt,
      quote_attribution: quoteAttribution,
      cover_image: coverImage,
      content,
      status,
      is_featured: isFeatured
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Éditeur d'articles PALE</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Rédigez et publiez du contenu éditorial avec images importées de l'appareil</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3.5 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Éditer' : 'Aperçu'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {previewMode ? (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-full">
                {categories.find(c => c.id === categoryId)?.name || 'Catégorie'}
              </span>
              <h1 className="font-editorial text-3xl font-black text-neutral-900 dark:text-white">{title || 'Titre de l’article'}</h1>
              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">{excerpt || 'Extrait de l’article...'}</p>
              {coverImage ? (
                <div className="rounded-2xl overflow-hidden h-72 border border-neutral-200 dark:border-neutral-800">
                  <img src={coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-center text-xs text-neutral-400">
                  Aucune image de couverture sélectionnée
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: content || '<p>Contenu de l’article...</p>' }} />
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Titre de l'article</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: La révolution du design organique"
                    className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image Upload (Device Storage Only - No URL) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Image de couverture (Stockage interne de l'appareil)
                  </label>
                  {coverImage && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{coverImageName || 'Image chargée'} {coverImageSizeKb ? `(~${coverImageSizeKb} Ko)` : ''}</span>
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverInputChange}
                  className="hidden"
                />

                {!coverImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800' 
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-850'
                    }`}
                  >
                    {isProcessingCover ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-900 dark:text-white" />
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Optimisation et chargement de l'image...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">
                            Sélectionner une photo depuis votre appareil
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Glissez-déposez un fichier ici ou cliquez pour parcourir votre galerie ou stockage interne
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          Formats : JPG, PNG, WebP, GIF
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 group bg-neutral-900">
                    <img 
                      src={coverImage} 
                      alt="Couverture" 
                      className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 justify-between">
                      <div className="text-white text-xs">
                        <p className="font-bold truncate max-w-xs sm:max-w-md">{coverImageName || 'Image de couverture'}</p>
                        <p className="text-[11px] text-neutral-300">Stockée localement dans l'article</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-900 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center space-x-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Remplacer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCoverImage(''); setCoverImageName(''); setCoverImageSizeKb(null); }}
                          className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl shadow-md transition-colors"
                          title="Supprimer la photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {coverError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
                    {coverError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Extrait (résumé court)</label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Résumé accrocheur pour les cartes d'articles..."
                  className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Attribution / Réflexion / Parole d'une autre personne (Optionnel)</label>
                <input
                  type="text"
                  value={quoteAttribution}
                  onChange={(e) => setQuoteAttribution(e.target.value)}
                  placeholder="ex: Citation de Marc Aurèle ou Réflexion d'un lecteur"
                  className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              {/* Rich Editor Toolbar */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Contenu de l'article (HTML & Markdown)
                  </label>
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                    <button type="button" onClick={() => insertFormatting('<h2 class="text-2xl font-editorial font-bold mt-8 mb-4">', '</h2>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Titre H2"><Heading1 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertFormatting('<h3 class="text-xl font-bold mt-6 mb-3">', '</h3>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Titre H3"><Heading2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertFormatting('<strong>', '</strong>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Gras"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertFormatting('<em>', '</em>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Italique"><Italic className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertFormatting('<p class="mb-4">', '</p>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Paragraphe"><Quote className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertFormatting('<blockquote class="border-l-4 border-neutral-900 dark:border-white pl-4 my-6 italic">', '</blockquote>')} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300" title="Citation"><List className="w-4 h-4" /></button>
                    
                    {/* Add Inline Image From Device */}
                    <button 
                      type="button" 
                      onClick={() => inlineFileInputRef.current?.click()} 
                      className="px-2 py-1 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 flex items-center space-x-1 text-xs font-semibold" 
                      title="Téléverser et insérer une image depuis votre appareil"
                    >
                      <ImagePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Photo interne</span>
                    </button>
                    <input 
                      ref={inlineFileInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleInlineImageUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>

                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez le contenu complet de l'article en HTML (ex: <p>...</p>)... Vous pouvez aussi utiliser le bouton 'Photo interne' pour insérer des illustrations directement depuis votre appareil."
                  className="w-full p-4 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Statut</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    >
                      <option value="published">Publié</option>
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Programmé</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 sm:pt-4">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-neutral-900 dark:text-white rounded border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                    />
                    <label htmlFor="featured" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">Mettre "À la une"</label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-colors text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
