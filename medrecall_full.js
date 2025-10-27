



//05/10/2025
//Aqui consegui colocar para que somente o user com assinatura ativada acesse as ferramentas.
//07/10/2025 
//fiz separação de pastas em alguns arquivos na pasta frontend
//21/10/2025
//O usuario carrega e salva seus arquivos no banco de dados



        const { useState, useEffect, useCallback, useMemo, useRef } = React;
        
        const apiBase = window.ENV.API_URL;



        // --- FUNÇÃO AUXILIAR DE DATA ---
        const formatDateToYYYYMMDD = (dateObj) => {
            if (!(dateObj instanceof Date) || isNaN(dateObj)) {
                // Tenta converter se for uma string válida
                const d = new Date(dateObj);
                if (isNaN(d)) return '';
                dateObj = d;
            }
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // --- LÓGICA DE REPETIÇÃO ESPAÇADA ---
        const calculateNextReviewDate = (srsLevel, result) => {
            const now = new Date();
            let newSrsLevel = srsLevel;
            let daysToAdd = 0;

            // Níveis de SRS (exemplo): 1 dia, 3 dias, 7 dias, 14 dias, 30 dias, 60 dias, etc.
            const intervals = [1, 3, 7, 14, 30, 60, 120, 240, 365];

            switch(result) {
                case 'again':
                    newSrsLevel = 0;
                    daysToAdd = 1; // Revisar amanhã
                    break;
                case 'hard':
                    newSrsLevel = Math.max(0, srsLevel - 1);
                    daysToAdd = intervals[newSrsLevel] ? Math.ceil(intervals[newSrsLevel] * 0.8) : 1;
                    break;
                case 'good':
                    newSrsLevel = srsLevel + 1;
                    daysToAdd = intervals[newSrsLevel] || intervals[intervals.length - 1] * 2;
                    break;
                case 'easy':
                    newSrsLevel = srsLevel + 2;
                    daysToAdd = intervals[newSrsLevel] || intervals[intervals.length - 1] * 2.5;
                    break;
                default:
                    daysToAdd = 1;
            }
            
            const nextReview = new Date(now.setDate(now.getDate() + daysToAdd));
            return {
                nextReviewDate: formatDateToYYYYMMDD(nextReview),
                srsLevel: newSrsLevel
            };
        };


        // --- Ícones (Componentes SVG) ---
        const Sun = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
        const Moon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
        const X = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
        const PlusCircle = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
        const Edit = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
        const Trash2 = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
        const FileText = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-12 h-12 mx-auto mb-4 text-blue-500"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
        const Layers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4 text-purple-500"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
        const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4 text-green-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
        const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-green-500 mx-auto mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
        const Maximize = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>;
        const Minimize = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>;
        const BarChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
        const ChevronLeft = ({className="w-6 h-6"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>;
        const ChevronRight = ({className="w-6 h-6"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
        const Bell = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-yellow-500 mx-auto mb-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
        const Download = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
        const Search = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
        const SparkleIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"/></svg>;
        const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
        const FolderIcon = ({className="w-5 h-5"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
        const FolderPlusIcon = ({className="w-5 h-5"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
        const InfoIcon = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
        const SortAscIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>;
        const HandIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.3"/></svg>;
        const ClipboardIcon = ({className="w-5 h-5"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
        const BrainIcon = ({className="w-20 h-20 mx-auto text-blue-400"}) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.97-3.44 2.5 2.5 0 0 1-2.02-4.5 2.5 2.5 0 0 1 2.02-4.5 2.5 2.5 0 0 1 2.97-3.44A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.97-3.44 2.5 2.5 0 0 0 2.02-4.5 2.5 2.5 0 0 0-2.02-4.5 2.5 2.5 0 0 0-2.97-3.44A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
        );
        const Loader = () => <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

        // --- HOOKS CUSTOMIZADOS ---
        function useLocalStorage(key, initialValue) {
            const [storedValue, setStoredValue] = useState(() => {
                try {
                    const item = window.localStorage.getItem(key);
                    return item ? JSON.parse(item) : initialValue;
                } catch (error) {
                    console.error(error);
                    return initialValue;
                }
            });

            const setValue = (value) => {
                try {
                    const valueToStore = value instanceof Function ? value(storedValue) : value;
                    setStoredValue(valueToStore);
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                } catch (error) {
                    console.error(error);
                }
            };
            return [storedValue, setValue];
        }
        
        function useDarkMode() {
            const [isDarkMode, setIsDarkMode] = useLocalStorage('medrecall-darkmode', true);
            useEffect(() => {
                document.documentElement.classList.toggle('dark', isDarkMode);
            }, [isDarkMode]);
            return [isDarkMode, setIsDarkMode];
        }
        
        // --- COMPONENTES ---
        const Modal = ({ children, onClose, size = 'lg' }) => {
            useEffect(() => {
                const handleKeyDown = (event) => {
                    if (event.key === 'Escape') {
                        onClose();
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [onClose]);

            const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl' };
            return (<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 modal-enter-active" onClick={onClose}>
                <div onClick={(e) => e.stopPropagation()} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} relative text-gray-800 dark:text-gray-200`}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10"><X /></button>
                    {children}
                </div>
            </div>);
        }
        const ImageZoomModal = ({ imageUrl, onClose }) => {
             useEffect(() => {
                const handleKeyDown = (event) => {
                    if (event.key === 'Escape') {
                        onClose();
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [onClose]);

            return (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] modal-enter-active" onClick={onClose}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X /></button>
                    <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            );
        };
        const ConfirmModal = ({ message, onConfirm, onCancel }) => (<div className="p-8 text-center"><h3 className="text-xl font-bold mb-4">Confirmação</h3><p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p><div className="flex justify-center gap-4"><button onClick={onCancel} className="py-2 px-6 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button><button onClick={onConfirm} className="py-2 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold">Confirmar</button></div></div>);
        const AlertModal = ({ title, message, onClose }) => (<div className="p-8 text-center"><Bell /><h3 className="text-2xl font-bold mb-4">{title}</h3><p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p><button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">Ok</button></div>);
        const Toast = ({ message, type, onDismiss }) => {
            const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white font-semibold toast-enter-active z-[100]";
            const typeClasses = { success: "bg-green-500", error: "bg-red-500", info: "bg-blue-500" };
            useEffect(() => {
                const timer = setTimeout(onDismiss, 3000);
                return () => clearTimeout(timer);
            }, [onDismiss]);
            return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>;
        };

        const SrsExplanationModal = ({ onClose }) => (
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Como Funcionam os Níveis de Revisão?</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>O MedRecall usa um sistema de Repetição Espaçada (SRS) para otimizar seus estudos, mostrando os cartões no momento exato em que você estaria prestes a esquecê-los. Funciona assim:</p>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Nível 0 (Aprendizagem)</h4>
                        <p>São os cartões novos ou aqueles que você marcou como <span className="font-semibold text-red-500">"Errei"</span>. Eles serão mostrados novamente em 1 dia para reforçar o aprendizado inicial.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Níveis 1-8 (Crescimento)</h4>
                        <p>Cada vez que você acerta um cartão (<span className="font-semibold text-green-500">"Bom"</span> ou <span className="font-semibold text-blue-500">"Fácil"</span>), ele sobe de nível e o tempo até a próxima revisão aumenta exponencialmente (ex: 3 dias, 7 dias, 15 dias...). Marcar como <span className="font-semibold text-orange-500">"Difícil"</span> pode diminuir um nível, trazendo o cartão de volta mais cedo.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Nível 9+ (Dominado)</h4>
                        <p>Parabéns! Estes são os cartões que você já domina. Eles aparecerão com muito menos frequência (meses ou até anos), apenas para garantir que a informação permaneça na sua memória de longo prazo.</p>
                    </div>
                    <p className="pt-2 border-t border-gray-200 dark:border-gray-600"><strong>O segredo é ser honesto na sua avaliação.</strong> Isso garante que o algoritmo funcione a seu favor, economizando seu tempo e focando nos cartões que mais precisam da sua atenção.</p>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold">Entendi</button>
                </div>
            </div>
        );

        const TutorialModal = ({ onClose }) => {
            const [step, setStep] = useState(0);
            const tutorialSteps = [
                {
                    title: "Bem-vindo ao MedRecall!",
                    text: "Esta é sua central de estudos. A partir daqui, você pode acessar seus Flashcards, Questões e o Planejador para organizar sua rotina.",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Dashboard+Principal"
                },
                {
                    title: "Crie e Gerencie Baralhos",
                    text: "Nas seções de Flashcards e Questões, clique em 'Gerenciar' para criar, editar, importar ou exportar seus baralhos e pastas.",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Gerenciador+de+Baralhos"
                },
                {
                    title: "Estudo Inteligente com Repetição Espaçada",
                    text: "Durante o estudo, avalie sua dificuldade. O MedRecall calcula o momento perfeito para a próxima revisão, otimizando sua memória de longo prazo.",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Sessão+de+Estudo+com+SRS"
                },
                {
                    title: "Revise o que Importa",
                    text: "Use os botões 'Revisar Agendados' e 'Repassar Atrasados' para focar nos cards que o algoritmo separou para você. É a forma mais eficiente de estudar!",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Botões+de+Revisão"
                },
                {
                    title: "Organize sua Rotina no Planejador",
                    text: "Crie eventos e vincule seus baralhos para planejar quando e o que estudar. O aplicativo pode até te lembrar com um alarme!",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Planejador+de+Estudos"
                },
                {
                    title: "Explore as Estatísticas",
                    text: "Acompanhe seu progresso! Veja a distribuição dos seus cards por nível de aprendizado e sua atividade de estudos ao longo do tempo. Bom estudo!",
                    imageUrl: "https://placehold.co/600x300/1f2937/FFFFFF?text=Gráfico+de+Estatísticas"
                }
            ];

            const currentStep = tutorialSteps[step];
            const isLastStep = step === tutorialSteps.length - 1;

            return (
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
                    <img src={currentStep.imageUrl} alt={currentStep.title} className="w-full h-48 object-cover rounded-lg mx-auto mb-4 bg-gray-700" />
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{currentStep.text}</p>
                    <div className="flex items-center justify-between">
                        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="py-2 px-6 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold disabled:opacity-50">Anterior</button>
                        <div className="flex gap-2">
                            {tutorialSteps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>)}
                        </div>
                        {isLastStep ? (
                            <button onClick={onClose} className="py-2 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold">Concluir</button>
                        ) : (
                            <button onClick={() => setStep(s => Math.min(tutorialSteps.length - 1, s + 1))} className="py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold">Próximo</button>
                        )}
                    </div>
                </div>
            )
        };

        const PomodoroTimer = ({ onSessionEnd, onBreakEnd, settings, setSettings }) => {
            const STUDY_TIME = settings.study * 60;
            const SHORT_BREAK_TIME = settings.short * 60;
            const LONG_BREAK_TIME = 15 * 60;

            const [time, setTime] = useState(STUDY_TIME);
            const [isActive, setIsActive] = useState(false);
            const [mode, setMode] = useState('study'); // study, shortBreak, longBreak
            const [cycle, setCycle] = useState(0);

            useEffect(() => {
                if (!isActive && mode === 'study') {
                    setTime(settings.study * 60);
                }
            }, [settings.study, isActive, mode]);

            const playSound = (note) => {
                try {
                    Tone.start().then(() => {
                        const synth = new Tone.Synth().toDestination();
                        synth.triggerAttackRelease(note, "8n");
                    });
                } catch (e) {
                    console.error("Could not play sound:", e);
                }
            };

            useEffect(() => {
                let interval = null;
                if (isActive && time > 0) {
                    interval = setInterval(() => {
                        setTime(prevTime => prevTime - 1);
                    }, 1000);
                } else if (isActive && time === 0) {
                    setIsActive(false);
                    if (mode === 'study') {
                        playSound("C5");
                        onSessionEnd();
                        const newCycle = cycle + 1;
                        setCycle(newCycle);
                        if (newCycle % 4 === 0) {
                            setMode('longBreak');
                            setTime(LONG_BREAK_TIME);
                        } else {
                            setMode('shortBreak');
                            setTime(SHORT_BREAK_TIME);
                        }
                    } else { // break ended
                        playSound("G5");
                        onBreakEnd();
                        setMode('study');
                        setTime(STUDY_TIME);
                    }
                }
                return () => clearInterval(interval);
            }, [isActive, time]);

            const toggleTimer = () => setIsActive(!isActive);

            const resetTimer = () => {
                setIsActive(false);
                setMode('study');
                setTime(STUDY_TIME);
                setCycle(0);
            };

             const handleTimeChange = (amount) => {
                if (isActive) return;
                const newStudyTime = Math.max(5, settings.study + amount); // Min 5 minutes
                setSettings(prev => ({ ...prev, study: newStudyTime }));
            };

            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };
            
            const getModeText = () => {
                if (mode === 'study') return 'Foco';
                if (mode === 'shortBreak') return 'Pausa Curta';
                if (mode === 'longBreak') return 'Pausa Longa';
            };

            return (
                <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <span className="font-semibold text-sm">{getModeText()}</span>
                     <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full">
                        <button onClick={() => handleTimeChange(-5)} disabled={isActive || mode !== 'study'} className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600">
                            <ChevronLeft className="w-4 h-4"/>
                        </button>
                        <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 w-20 text-center">{formatTime(time)}</span>
                        <button onClick={() => handleTimeChange(5)} disabled={isActive || mode !== 'study'} className="p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600">
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                    <button onClick={toggleTimer} className={`px-3 py-2 text-xs font-bold text-white rounded-lg ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {isActive ? 'Pausar' : 'Iniciar'}
                    </button>
                    <button onClick={resetTimer} className="px-3 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">
                        Resetar
                    </button>
                </div>
            );
        };

        const LoginScreen = ({ onLogin }) => {
            const [name, setName] = useState('');
            const [password, setPassword] = useState(''); // Senha simulada, não utilizada para validação
            const [error, setError] = useState('');
            
            const handleLogin = (e) => {
                e.preventDefault();
                if (name.trim() === '') {
                    setError('O nome é obrigatório.');
                    return;
                }
                onLogin(name);
            };

            return (<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
                    <div className="text-center">
                        <BrainIcon className="w-16 h-16 mx-auto text-blue-400" />
                        <h2 className="mt-4 text-3xl font-bold text-white">MedRecall</h2>
                    </div>
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block">Nome</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block">Senha (opcional)</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-lg font-semibold">Entrar</button>
                    </form>
                    <p className="text-center text-xs text-gray-500">© 2025 Jailson Medeiros</p>
                </div>
            </div>);
        };
        
        const DashboardChoice = ({ user, onSelectView, onLogout, allDecks, onShowTutorial, onStartStudy, recentDecks }) => {
            const today = formatDateToYYYYMMDD(new Date());
            const dueCardsCount = useMemo(() => {
                return allDecks.flatMap(deck => deck.cards || [])
                               .filter(card => card.nextReviewDate && card.nextReviewDate <= today)
                               .length;
            }, [allDecks]);

            const recentDeckObjects = useMemo(() => {
                return recentDecks
                    .map(deckId => allDecks.find(d => d.id === deckId))
                    .filter(Boolean); // Remove any decks that might have been deleted
            }, [recentDecks, allDecks]);

            return (<div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4"><div className="container mx-auto">
                <div className="text-center my-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Bem-vindo(a), {user.name}!</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-300 mt-2">O que você gostaria de fazer hoje?</p>
                    {dueCardsCount > 0 && 
                        <p className="mt-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
                            Você tem {dueCardsCount} {dueCardsCount === 1 ? 'card' : 'cards'} para revisar hoje!
                        </p>
                    }
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mb-12">
                <div onClick={() => onSelectView('flashcards')} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center cursor-pointer transition-transform transform hover:scale-105"><Layers /><h2 className="text-2xl font-bold mt-4 dark:text-white">Flashcards</h2><p className="text-gray-500 dark:text-gray-400 mt-2">Crie e revise seus baralhos.</p></div>
                <div onClick={() => onSelectView('questions')} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center cursor-pointer transition-transform transform hover:scale-105"><FileText /><h2 className="text-2xl font-bold mt-4 dark:text-white">Questões</h2><p className="text-gray-500 dark:text-gray-400 mt-2">Crie e resolva bancos de questões.</p></div>
                <div onClick={() => onSelectView('planner')} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center cursor-pointer transition-transform transform hover:scale-105"><CalendarIcon /><h2 className="text-2xl font-bold mt-4 dark:text-white">Planejador</h2><p className="text-gray-500 dark:text-gray-400 mt-2">Organize sua agenda de estudos.</p></div>
            </div>

            {recentDeckObjects.length > 0 && (
                    <div className="w-full max-w-6xl mx-auto mt-12">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Acesso Rápido</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentDeckObjects.map(deck => (
                                <div key={deck.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg flex flex-col justify-between">
                                    <div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${deck.type === 'flashcards' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                            {deck.type === 'flashcards' ? 'Flashcard' : 'Questões'}
                                        </span>
                                        <h4 className="font-bold mt-2 text-sm">{deck.title}</h4>
                                        <p className="text-xs text-gray-500">{deck.cards.length} itens</p>
                                    </div>
                                    <button onClick={() => onStartStudy(deck.type, deck.id)} className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm">Estudar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            <div className="text-center mt-12 flex items-center justify-center gap-4">
                <button onClick={onShowTutorial} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2">
                    <InfoIcon className="w-5 h-5"/> Ver Tutorial
                </button>
                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md">Sair</button>
            </div>
            </div></div>);
        };
        
       // --- COMPONENTE DE SESSÃO DE ESTUDO (Flashcards e Questões) ---
const StudySessionModal = ({
  cards,
  deckId,
  onUpdateDecks,
  onClose,
  isFlashcardView,
  startIndex,
  onProgressUpdate,
  isPomodoroEnabled,
  showToast,
  updateRecentDecks,
  pomodoroSettings,
  setPomodoroSettings
}) => {
  // --- ESTADOS PRINCIPAIS ---
  const [currentIndex, setCurrentIndex] = useState(startIndex || 0);
  const [sessionCards, setSessionCards] = useState(cards || []);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionComplete, setSessionComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  const [pomodoroAlert, setPomodoroAlert] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  // --- Atualiza lista de decks recentes (executa só 1x ao abrir o modal) ---
  useEffect(() => {
    if (deckId && updateRecentDecks) updateRecentDecks(deckId);
  }, [deckId]);

  // --- Atualiza progresso de estudo (envia o índice atual) ---
  useEffect(() => {
    if (onProgressUpdate && deckId) {
      onProgressUpdate(deckId, currentIndex);
    }
  }, [currentIndex, deckId, onProgressUpdate]);

  // --- Segurança: impede erro se não houver cartões ---
  if (!sessionCards || sessionCards.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ops!</h2>
        <p className="mb-6">Não há cartões para esta sessão.</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
        >
          Fechar
        </button>
      </div>
    );
  }

  // --- Configurações básicas ---
  const totalItems = sessionCards.length;
  const currentCard = sessionCards[currentIndex];

  // 🔁 Reseta o estado de cada cartão ao trocar
  const resetCardState = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setShowResult(false);
  };

  // 🔙 Vai para o anterior
  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetCardState();
    }
  };

  // 🔜 Vai para o próximo
  const goToNextCard = () => {
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCardState();
    }
  };

  // 👉 Avança automaticamente após resposta
  const advanceAfterGrading = () => {
    if (currentIndex < sessionCards.length - 1) {
      goToNextCard();
    } else {
      setSessionComplete(true);
    }
  };

  // --- Atualiza um card editado e salva no servidor ---
  const handleSaveEditedCard = async (updatedCard) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // 🧩 Se o card já existir, atualiza no backend
      if (updatedCard?.id && !String(updatedCard.id).startsWith('c')) {
        const response = await fetch(
          `http://localhost:3000/api/flashcards/${updatedCard.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              front: updatedCard.question || "",
              back: updatedCard.answer || "",
              srs_level: updatedCard.srsLevel ?? 0,
              next_review_date: updatedCard.nextReviewDate || null,
              commentary: updatedCard.commentary || ""
            })
          }
        );

        if (!response.ok) throw new Error(await response.text());
        console.log("✅ Flashcard atualizado:", await response.json());
      }

      // Atualiza o estado global (UX)
      onUpdateDecks(prevDecks =>
        prevDecks.map(deck =>
          deck.id === deckId
            ? {
                ...deck,
                cards: deck.cards.map(c =>
                  c.id === updatedCard.id ? updatedCard : c
                )
              }
            : deck
        )
      );

      // Atualiza sessão corrente
      setSessionCards(prev =>
        prev.map(c => (c.id === updatedCard.id ? updatedCard : c))
      );

      showToast("Cartão atualizado com sucesso!", "success");
      setEditingCard(null);
    } catch (err) {
      console.error("❌ Erro ao salvar flashcard:", err);
      showToast("Erro ao salvar no servidor.", "error");
    }
  };

  // --- Avaliação de desempenho (SRS) ---
  const handleGrade = (result) => {
    const { nextReviewDate, srsLevel } = calculateNextReviewDate(
      currentCard.srsLevel || 0,
      result
    );

    const newHistory = {
      date: formatDateToYYYYMMDD(new Date()),
      result
    };

    onUpdateDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? {
              ...deck,
              cards: deck.cards.map(c =>
                c.id === currentCard.id
                  ? {
                      ...c,
                      srsLevel,
                      nextReviewDate,
                      reviewHistory: [...(c.reviewHistory || []), newHistory]
                    }
                  : c
              )
            }
          : deck
      )
    );

    setTimeout(() => advanceAfterGrading(), 300);
  };

  // --- Pesquisa de IA no Google ---
  const handleAiSearch = () => {
    if (!currentCard) return;
    let searchText = currentCard.question;

    if (currentCard.type === "text") {
      searchText += `\nResposta: ${currentCard.answer}`;
    } else if (currentCard.type === "multiple-choice" && currentCard.options) {
      searchText += "\nAlternativas:\n";
      currentCard.options.forEach((opt, i) => {
        searchText += `${String.fromCharCode(65 + i)}) ${opt}\n`;
      });
    }

    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(searchText)}`,
      "_blank"
    );
  };

  // --- Lógica Pomodoro ---
  const handleSessionEnd = () =>
    setPomodoroAlert({
      title: "Fim do Foco!",
      message:
        "Sessão concluída! Faça uma pausa curta para recarregar as energias."
    });

  const handleBreakEnd = () =>
    setPomodoroAlert({
      title: "Fim da Pausa!",
      message: "A pausa terminou. Pronto para mais uma sessão?"
    });

  // --- Fim da sessão ---
  if (isSessionComplete) {
    return (
      <div className="p-8 text-center">
        <CheckCircle />
        <h2 className="text-2xl font-bold mb-4">Sessão Concluída!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Você avaliou {totalItems} itens.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
        >
          Fechar
        </button>
      </div>
    );
  }

  // --- RENDERIZA FLASHCARD NORMAL ---
  const renderFlashcard = () => (
    <div
      className="perspective w-full h-full cursor-pointer"
      onClick={() => setIsFlipped(prev => !prev)}
    >
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Frente */}
        <div className="absolute w-full h-full backface-hidden flex flex-col p-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <p className="text-xl text-center font-semibold">
            {currentCard.question}
          </p>
        </div>

        {/* Verso */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col p-6 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
          <p className="text-lg text-center whitespace-pre-wrap">
            {currentCard.answer}
          </p>
        </div>
      </div>
    </div>
  );

  // --- RENDERIZA MÚLTIPLA ESCOLHA (seguro contra undefined) ---
  const renderMultipleChoice = () => {
    const options = Array.isArray(currentCard.options)
      ? currentCard.options
      : currentCard.options
      ? JSON.parse(currentCard.options)
      : [];

    const getButtonClass = (option) => {
      if (!showResult && selectedOption === option)
        return "bg-blue-500 text-white ring-2 ring-blue-300";
      if (!showResult)
        return "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600";
      if (option === currentCard.answer) return "bg-green-500 text-white";
      if (option === selectedOption && option !== currentCard.answer)
        return "bg-red-500 text-white";
      return "bg-gray-200 dark:bg-gray-700 opacity-50";
    };

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
          <p className="text-lg text-center font-semibold">
            {currentCard.question}
          </p>
        </div>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(opt)}
              disabled={showResult}
              className={`w-full text-left p-3 text-sm rounded-lg font-semibold transition-all duration-200 ${getButtonClass(
                opt
              )}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // --- CONTROLES INFERIORES ---
  const renderBottomControls = () => {
    if (!isFlipped && !showResult) {
      if (isFlashcardView || currentCard.type === "text") {
        return (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold"
          >
            Mostrar Resposta
          </button>
        );
      }
      return (
        <button
          onClick={() => selectedOption && setShowResult(true)}
          disabled={!selectedOption}
          className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Confirmar Resposta
        </button>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-center text-sm font-semibold">Como se saiu?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleGrade("again")}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm"
          >
            Errei
          </button>
          <button
            onClick={() => handleGrade("hard")}
            className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm"
          >
            Difícil
          </button>
          <button
            onClick={() => handleGrade("good")}
            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm"
          >
            Bom
          </button>
          <button
            onClick={() => handleGrade("easy")}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
          >
            Fácil
          </button>
        </div>
      </div>
    );
  };

  // --- RETORNO FINAL (UI COMPLETA) ---
  return (
    <div className="p-6 h-[90vh] flex flex-col">
      {/* 🔧 Modal de Edição */}
      {editingCard && (
        <Modal onClose={() => setEditingCard(null)} size="4xl">
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold mb-4">Editar Item</h3>
            <CardForm
              initialData={editingCard}
              onSave={handleSaveEditedCard}
              onCancel={() => setEditingCard(null)}
              isQuestionView={!isFlashcardView}
            />
          </div>
        </Modal>
      )}

      {/* 🔍 Zoom de Imagem */}
      {zoomedImageUrl && (
        <ImageZoomModal
          imageUrl={zoomedImageUrl}
          onClose={() => setZoomedImageUrl(null)}
        />
      )}

      {/* 🕐 Alerta Pomodoro */}
      {pomodoroAlert && (
        <Modal onClose={() => setPomodoroAlert(null)} size="sm">
          <AlertModal
            title={pomodoroAlert.title}
            message={pomodoroAlert.message}
            onClose={() => setPomodoroAlert(null)}
          />
        </Modal>
      )}

      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Sessão de Estudo</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Item {currentIndex + 1} de {totalItems}
            </p>
          </div>
          {isPomodoroEnabled && (
            <PomodoroTimer
              onSessionEnd={handleSessionEnd}
              onBreakEnd={handleBreakEnd}
              settings={pomodoroSettings}
              setSettings={setPomodoroSettings}
            />
          )}
        </div>
      </div>

      {/* Corpo Principal */}
      <div className="flex-grow flex gap-6 overflow-hidden">
        {/* Painel esquerdo: Card */}
        <div className="w-2/3 h-full flex flex-col relative">
          <button
            onClick={() => setEditingCard(currentCard)}
            className="absolute top-1 right-1 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Editar Cartão"
          >
            <Edit className="w-4 h-4" />
          </button>
          {(isFlashcardView || currentCard.type === "text")
            ? renderFlashcard()
            : renderMultipleChoice()}
        </div>

        {/* Painel direito: Comentário + Controles */}
        <div className="w-1/3 h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-2">
            {(isFlipped || showResult) && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">
                  Comentário/Resolução:
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 whitespace-pre-wrap">
                  {currentCard.commentary || "Nenhum comentário disponível."}
                </p>
                <button
                  onClick={handleAiSearch}
                  title="Pesquisar com IA do Google"
                  className="mt-2 flex-shrink-0 p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                >
                  <SparkleIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Controles inferiores */}
          <div className="flex-shrink-0 pt-2">
            {renderBottomControls()}
            <div className="pt-3 mt-3 border-t dark:border-gray-600 flex justify-between items-center">
              <button
                onClick={goToPreviousCard}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 py-2 px-3 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold disabled:opacity-50 text-sm"
              >
                <ChevronLeft /> Ant
              </button>
              <button
                onClick={goToNextCard}
                disabled={currentIndex === sessionCards.length - 1}
                className="flex items-center gap-1 py-2 px-3 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold disabled:opacity-50 text-sm"
              >
                Próx <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

        //feito o de cima
        const CardManager = ({ deck, onUpdateDeck, onBack, isFlashcardView, startWithNew = false }) => {
            const [editingCard, setEditingCard] = useState(null);
            const [searchTerm, setSearchTerm] = useState('');

            const openNewCardForm = (type) => {
                const baseData = { 
                    question: '', 
                    answer: '', 
                    type, 
                    commentary: '', 
                    imageUrl: '', 
                    answerImageUrl: '',
                    srsLevel: 0,
                    nextReviewDate: formatDateToYYYYMMDD(new Date()),
                    reviewHistory: [] 
                };
                if (type === 'multiple-choice') { baseData.options = ['', '']; }
                setEditingCard(baseData);
            };
            
            useEffect(() => {
                if (startWithNew) { openNewCardForm(isFlashcardView ? 'text' : 'text'); }
            }, [startWithNew, isFlashcardView]);
const handleSaveCard = async (cardData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Erro: usuário não autenticado.');
      return;
    }

    // 🔹 Se o card já existe, apenas atualiza localmente (edição)
    if (cardData.id && String(cardData.id).startsWith('c')) {
      const updatedCards = deck.cards.map(c => c.id === cardData.id ? cardData : c);
      onUpdateDeck({ ...deck, cards: updatedCards });
      setEditingCard(null);
      return;
    }

    // 🔹 Novo flashcard — enviar para o backend
    const response = await fetch('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        deck_id: deck.id,
        front: cardData.question,
        back: cardData.answer,
        srs_level: cardData.srsLevel || 0,
        next_review_date: cardData.nextReviewDate || formatDateToYYYYMMDD(new Date())
      })
    });

    if (!response.ok) throw new Error('Erro ao salvar flashcard no servidor.');

    const created = await response.json();

    const newCard = {
      id: created.id,
      question: created.front,
      answer: created.back,
      type: cardData.type,
      commentary: cardData.commentary,
      imageUrl: cardData.imageUrl,
      answerImageUrl: cardData.answerImageUrl,
      srsLevel: created.srs_level,
      nextReviewDate: created.next_review_date,
      reviewHistory: []
    };

    const updatedCards = [...deck.cards, newCard];
    onUpdateDeck({ ...deck, cards: updatedCards });
    setEditingCard(null);
    console.log('✅ Flashcard criado no banco:', newCard);
  } catch (error) {
    console.error('❌ Erro ao criar flashcard:', error);
    alert('Erro ao salvar flashcard. Tente novamente.');
  }
};

            const handleDeleteCard = (cardId) => { onUpdateDeck({ ...deck, cards: deck.cards.filter(c => c.id !== cardId) }); };

const filteredCards = useMemo(() => {
  const cards = Array.isArray(deck.cards) ? deck.cards : [];
  return cards.filter(card =>
    (card.question || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.answer || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [deck.cards, searchTerm]);


            if (editingCard) { return (<div className="p-6 md:p-8"><button onClick={() => setEditingCard(null)} className="text-sm text-blue-500 mb-4">&larr; Voltar para a lista</button><h3 className="text-xl font-bold mb-4">{editingCard.id ? 'Editar Item' : 'Novo Item'}</h3><CardForm initialData={editingCard} onSave={handleSaveCard} onCancel={() => setEditingCard(null)} isQuestionView={!isFlashcardView} /></div>); }
            
            return (<div className="p-6 md:p-8 max-h-[80vh] flex flex-col"><div className="flex-shrink-0">
                    <button onClick={onBack} className="text-sm text-blue-500 mb-4">&larr; Voltar para baralhos</button>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{deck.title}</h2>
                            <p className="text-gray-500">Gerenciar Itens</p>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search />
                            <input 
                                type="text" 
                                placeholder="Buscar nos cards..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div><div className="flex-grow overflow-y-auto pr-2 space-y-3">{filteredCards.map(card => (<div key={card.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"><p className="text-sm truncate pr-4">{card.question}</p><div className="flex gap-2"><button onClick={() => setEditingCard(card)} className="text-blue-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Edit /></button><button onClick={() => handleDeleteCard(card.id)} className="text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Trash2 /></button></div></div>))}{filteredCards.length === 0 && <p className="text-center text-gray-500 py-8">{searchTerm ? 'Nenhum card encontrado.' : 'Nenhum item.'}</p>}</div>
            <div className="flex-shrink-0 pt-6">
                {isFlashcardView ? (<button onClick={() => openNewCardForm('text')} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"><PlusCircle className="w-5 h-5"/> Adicionar Novo Flashcard</button>) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={() => openNewCardForm('text')} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"><PlusCircle className="w-5 h-5"/> Nova Questão Dissertativa</button>
                        <button onClick={() => openNewCardForm('multiple-choice')} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"><PlusCircle className="w-5 h-5"/> Nova Múltipla Escolha</button>
                    </div>)}
            </div></div>);
        };
        const CardForm = ({ initialData, onSave, onCancel, isQuestionView }) => {
  const [question, setQuestion] = useState(initialData.question || "");
  const [options, setOptions] = useState(initialData.options || ["", ""]);
  const [answer, setAnswer] = useState(initialData.answer || "");
  const [commentary, setCommentary] = useState(initialData.commentary || "");
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const [answerImageUrl, setAnswerImageUrl] = useState(initialData.answerImageUrl || "");
  const [type, setType] = useState(initialData.type || (isQuestionView ? "multiple-choice" : "text"));

  // ✅ Função para colar imagens (permite colar print direto no campo)
  const handlePaste = (e, targetField) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          if (targetField === "answer") {
            setAnswerImageUrl(event.target.result);
          } else {
            setImageUrl(event.target.result);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  // ✅ Controles das alternativas
  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ✅ Quando o usuário clica em "Salvar"
  const handleSubmit = (e) => {
    e.preventDefault();

    // remove alternativas vazias
    const cleanedOptions = Array.isArray(options)
      ? options.filter((opt) => opt.trim() !== "")
      : [];

    // monta o objeto final
    const payload = {
      ...initialData,
      question,
      type,
      options: cleanedOptions,
      answer,
      commentary,
      imageUrl,
      answerImageUrl,
      reviewHistory: initialData.reviewHistory || [],
    };

    console.log("💾 Salvando Card:", payload);
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Enunciado */}
      <div>
        <label className="block text-sm font-medium">Enunciado / Pergunta</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onPaste={(e) => handlePaste(e, "question")}
          required
          className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500 focus:border-blue-500"
          rows="5"
        />
      </div>

      {/* Questão discursiva */}
      {type === "text" ? (
        <>
          <div>
            <label className="block text-sm font-medium">Resposta</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onPaste={(e) => handlePaste(e, "answer")}
              required
              className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500 focus:border-blue-500"
              rows="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              URL da Imagem (Verso - Opcional)
            </label>
            <input
              type="text"
              value={answerImageUrl}
              onChange={(e) => setAnswerImageUrl(e.target.value)}
              onPaste={(e) => handlePaste(e, "answer")}
              placeholder="Cole uma imagem aqui ou insira uma URL"
              className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500"
            />
            {answerImageUrl && (
              <div className="mt-2">
                <img
                  src={answerImageUrl}
                  alt="Pré-visualização do Verso"
                  className="max-w-xs max-h-40 rounded-md object-contain border dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </>
      ) : (
        // ✅ Questão múltipla escolha
        <div>
          <label className="block text-sm font-medium mb-2">
            Alternativas (Marque a correta)
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={answer === option}
                  onChange={() => setAnswer(option)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Alternativa ${index + 1}`}
                  required
                  className="flex-grow block w-full rounded-md bg-gray-100 dark:bg-gray-700 p-2 border-transparent focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  disabled={options.length <= 2}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-3 text-sm text-blue-600 font-semibold"
          >
            + Adicionar Alternativa
          </button>
        </div>
      )}

      {/* Imagem da frente */}
      <div>
        <label className="block text-sm font-medium">
          URL da Imagem (Frente / Enunciado - Opcional)
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onPaste={(e) => handlePaste(e, "question")}
          placeholder="Cole uma imagem aqui ou insira uma URL"
          className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500"
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Pré-visualização"
              className="max-w-xs max-h-40 rounded-md object-contain border dark:border-gray-600"
            />
          </div>
        )}
      </div>

      {/* Comentário */}
      <div>
        <label className="block text-sm font-medium">
          Comentário / Resolução (Opcional)
        </label>
        <textarea
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500"
          rows="5"
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

        const DeckManager = ({ decks, folders, onManageDeck, onAddDeck, onDeleteDeck, onJsonFileImport, onTextImport, onExportDeck, onExportAllDecks, onAddFolder, onUpdateFolder, onDeleteFolder, onMoveDeck, managerTitle, onEditDeck }) => {
            const [newFolderName, setNewFolderName] = useState('');
            const [editingFolder, setEditingFolder] = useState(null);

            const handleAddFolder = (e) => {
                e.preventDefault();
                if (newFolderName.trim()) {
                    onAddFolder(newFolderName.trim());
                    setNewFolderName('');
                }
            };
            
            const handleUpdateFolder = () => {
                 if (editingFolder && editingFolder.name.trim()) {
                    onUpdateFolder(editingFolder.id, editingFolder.name.trim());
                    setEditingFolder(null);
                }
            };
            
            const handleMoveDeck = (deckId, folderId) => {
                onMoveDeck(deckId, folderId === 'null' ? null : parseInt(folderId));
            };

            return (
            <div className="p-6 md:p-8 h-[80vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4 flex-shrink-0">{managerTitle}</h2>
                
                <div className="flex flex-col md:flex-row flex-grow gap-6 overflow-hidden">
                    {/* Coluna da Esquerda: Pastas */}
                    <div className="md:w-1/3 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r md:pb-0 pb-4 md:pr-6 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-3 flex-shrink-0">Pastas</h3>
                         <form onSubmit={handleAddFolder} className="flex gap-2 mb-4 flex-shrink-0">
                             <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nova pasta..." className="flex-grow block w-full rounded-md bg-gray-100 dark:bg-gray-700 p-2 border-transparent focus:ring-blue-500"/>
                             <button type="submit" className="p-2 rounded-lg bg-green-600 text-white font-bold"><PlusCircle className="w-5 h-5"/></button>
                        </form>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                            {folders.map(folder => (
                                <div key={folder.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex justify-between items-center">
                                    {editingFolder?.id === folder.id ? (
                                        <input type="text" value={editingFolder.name} onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})} onBlur={handleUpdateFolder} onKeyDown={e => e.key === 'Enter' && handleUpdateFolder()} autoFocus className="flex-grow bg-white dark:bg-gray-800 rounded px-2 py-1"/>
                                    ) : (
                                        <span className="font-semibold text-sm">{folder.name}</span>
                                    )}
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingFolder(folder)} className="text-blue-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => onDeleteFolder(folder.id)} className="text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coluna da Direita: Baralhos */}
                    <div className="md:w-2/3 flex flex-col overflow-hidden">
                        <h3 className="text-lg font-bold mb-3 flex-shrink-0">Baralhos</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                            {decks.map(deck => (
                                <div key={deck.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h4 className="font-bold">{deck.title}</h4>
                                        <p className="text-sm text-gray-500">{deck.cards.length} itens</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <select value={deck.folderId || 'null'} onChange={(e) => handleMoveDeck(deck.id, e.target.value)} className="bg-white dark:bg-gray-600 text-xs rounded-md p-1 border-transparent focus:ring-2 focus:ring-blue-500">
                                            <option value="null">Mover...</option>
                                            <option value="null">-- Sem Pasta --</option>
                                            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                                        </select>
                                        <button onClick={() => onManageDeck(deck)} className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white" title="Gerenciar Itens"><FileText className="w-4 h-4"/></button>
                                        <button onClick={() => onEditDeck(deck)} className="p-1.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white" title="Editar Baralho"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => onExportDeck(deck)} className="p-1.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white" title="Exportar JSON"><Download className="w-4 h-4"/></button>
                                        <button onClick={() => onDeleteDeck(deck.id)} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white" title="Eliminar"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                        <h4 className="text-md font-bold mb-2 text-gray-500 dark:text-gray-400">Criação</h4>
                        <button onClick={onAddDeck} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"><PlusCircle className="w-5 h-5" /> Novo Baralho</button>
                    </div>
                    <div className="md:w-2/3">
                        <h4 className="text-md font-bold mb-2 text-gray-500 dark:text-gray-400">Importar / Exportar</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={onJsonFileImport} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"><Download className="w-5 h-5"/> de Arquivo</button>
                            <button onClick={onTextImport} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><FileText className="w-5 h-5"/> de Texto</button>
                            <button onClick={onExportAllDecks} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-bold"><Layers className="w-5 h-5"/> Exportar Todos</button>
                        </div>
                    </div>
                </div>
            </div>
        )};
        const NewDeckForm = ({ onSave, onCancel, folders, initialData = {} }) => {
            const [title, setTitle] = useState(initialData.title || ''); 
            const [subject, setSubject] = useState(initialData.subject || '');
            const [folderId, setFolderId] = useState(initialData.folderId ?? 'null');

            const handleSubmit = (e) => { 
                e.preventDefault(); 
                if (title) onSave(title, subject, folderId === 'null' ? null : parseInt(folderId));
            };
            return (
            <div className="p-8">
                <h3 className="text-xl font-bold mb-4">{initialData.id ? 'Editar Baralho' : 'Novo Baralho'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium">Título</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium">Matéria (Opcional)</label><input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" /></div>
                     <div>
                        <label className="block text-sm font-medium">Pasta</label>
                        <select value={folderId} onChange={e => setFolderId(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500 p-2">
                            <option value="null">Sem Pasta</option>
                            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold">{initialData.id ? 'Salvar' : 'Criar'}</button>
                    </div>
                </form>
            </div>);
        };
        const JsonImportModal = ({ onImport, onCancel }) => {
            const [error, setError] = useState('');
            const [fileContent, setFileContent] = useState(null); // Will now store an array of decks
            const [fileName, setFileName] = useState('');

            const handleImportClick = useCallback(() => {
                if (fileContent && fileContent.length > 0) {
                    onImport(fileContent);
                }
            }, [fileContent, onImport]);

            useEffect(() => {
                const handleKeyDown = (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault(); // Previne o envio de algum formulário por trás do modal
                        handleImportClick();
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [handleImportClick]);


            const handleFileChange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    setFileName('');
                    setFileContent(null);
                    setError('');
                    return;
                }

                setFileName(file.name);
                setError('');
                setFileContent(null);

                if (file.type !== 'application/json') {
                    setError('Por favor, selecione um arquivo .json válido.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = JSON.parse(e.target.result);
                        let decksToImport = [];

                        if (Array.isArray(content)) {
                            // Multiple decks file
                            if (content.every(d => d.title && Array.isArray(d.cards))) {
                                decksToImport = content;
                            } else {
                                throw new Error('O arquivo contém um array, mas alguns itens não parecem ser baralhos válidos.');
                            }
                        } else if (content.title && Array.isArray(content.cards)) {
                            // Single deck file
                            decksToImport = [content];
                        } else {
                            throw new Error('O arquivo JSON não parece ser um baralho válido. Faltam as chaves "title" ou "cards".');
                        }

                        if (decksToImport.length > 0) {
                            setFileContent(decksToImport);
                        } else {
                             throw new Error('Nenhum baralho válido encontrado no arquivo.');
                        }
                    } catch (err) {
                        setError(`Erro ao ler o arquivo: ${err.message}`);
                        setFileContent(null);
                    }
                };
                reader.onerror = () => {
                    setError('Não foi possível ler o arquivo.');
                    setFileContent(null);
                };
                reader.readAsText(file);
            };

            return (
                <div className="p-8">
                    <h3 className="text-xl font-bold mb-4">Importar Baralho(s) de Arquivo JSON</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecione um arquivo JSON contendo um ou múltiplos baralhos para adicioná-los à sua coleção.</p>
                    <div>
                        <label htmlFor="file-upload" className="w-full cursor-pointer inline-flex items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="text-center">
                                <FolderIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <span>Selecione um arquivo</span>
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">{fileName || 'JSON até 10MB'}</p>
                            </div>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".json,application/json" onChange={handleFileChange} />
                        </label>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    
                    {fileContent && (
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                            <h4 className="font-bold mb-2">Baralhos a serem importados:</h4>
                            <div className="max-h-40 overflow-y-auto pr-2">
                                {fileContent.length === 1 ? (
                                    <>
                                        <p><strong>Título:</strong> {fileContent[0].title}</p>
                                        <p><strong>Matéria:</strong> {fileContent[0].subject || 'N/A'}</p>
                                        <p><strong>Itens:</strong> {fileContent[0].cards.length}</p>
                                    </>
                                ) : (
                                    <ul className="list-disc pl-5">
                                        {fileContent.map((deck, i) => (
                                            <li key={i}>{deck.title} ({deck.cards.length} itens)</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t dark:border-gray-600">
                        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button>
                        <button onClick={handleImportClick} disabled={!fileContent} className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Importar Baralho(s)
                        </button>
                    </div>
                </div>
            );
        };
        const TextImportModal = ({ decks, onImport, onCancel, isFlashcardView }) => {
            const [text, setText] = useState('');
            const [selectedDeckId, setSelectedDeckId] = useState('');
            const [error, setError] = useState('');
            const [showFormatInfo, setShowFormatInfo] = useState(false);

            const flashcardFormatExample = `[
 {
  "frente": "Qual a capital do Japão?",
  "verso": "Tóquio",
  "comentario": "É a maior cidade do mundo.",
  "imagemUrl": "https://exemplo.com/imagem.png"
 }
]`;
            const questionFormatExample = `[
 {
  "enunciado": "Qual animal está na imagem?",
  "imagemUrl": "https://exemplo.com/animal.png",
  "alternativas": [
   { "texto": "Gato", "correta": false },
   { "texto": "Cachorro", "correta": true, "comentario": "É um cachorro." }
  ]
 }
]`;

            const handleImport = () => {
                if (!selectedDeckId) {
                    setError("Por favor, selecione um baralho de destino.");
                    return;
                }
                if (!text.trim()) {
                    setError("Por favor, cole o conteúdo JSON na área de texto.");
                    return;
                }
                setError('');
                let data;
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    setError(`Erro de formatação JSON: ${err.message}`);
                    return;
                }

                try {
                    const items = Array.isArray(data) ? data : [data];
                    const newCards = [];

                    if (isFlashcardView) {
                        items.forEach((item, index) => {
                            if (typeof item.frente !== 'string' || typeof item.verso !== 'string') throw new Error(`Item #${index + 1} inválido. Flashcards devem ter as chaves "frente" e "verso".`);
                            newCards.push({
                                id: `c${selectedDeckId}-${Date.now()}-${newCards.length}`,
                                question: item.frente,
                                answer: item.verso,
                                commentary: item.comentario || '',
                                type: 'text',
                                srsLevel: 0,
                                nextReviewDate: formatDateToYYYYMMDD(new Date()),
                                imageUrl: item.imagemUrl || '',
                                reviewHistory: []
                            });
                        });
                    } else { // Question View
                        items.forEach((item, index) => {
                            if (typeof item.enunciado !== 'string' || !Array.isArray(item.alternativas) || item.alternativas.length < 2) throw new Error(`Item #${index + 1} inválido. Questões devem ter "enunciado" e um array "alternativas" com pelo menos 2 opções.`);
                            const correctAnswer = item.alternativas.find(alt => alt.correta === true);
                            if (!correctAnswer) throw new Error(`Item #${index + 1} não tem uma alternativa marcada como "correta": true.`);
                            item.alternativas.forEach(alt => { if (typeof alt.texto !== 'string') throw new Error(`Item #${index + 1} tem uma alternativa sem a chave "texto".`); });
                            newCards.push({
                                id: `c${selectedDeckId}-${Date.now()}-${newCards.length}`,
                                question: item.enunciado,
                                answer: correctAnswer.texto,
                                options: item.alternativas.map(alt => alt.texto),
                                commentary: correctAnswer.comentario || '',
                                type: 'multiple-choice',
                                srsLevel: 0,
                                nextReviewDate: formatDateToYYYYMMDD(new Date()),
                                imageUrl: item.imagemUrl || '',
                                reviewHistory: []
                            });
                        });
                    }

                    if (newCards.length > 0) {
                        onImport(selectedDeckId, newCards);
                    } else {
                        setError("Nenhum item válido encontrado no JSON fornecido.");
                    }
                } catch (err) {
                    setError(`Erro ao processar os dados: ${err.message}`);
                }
            };

            return (
                <div className="p-8">
                    <h3 className="text-xl font-bold mb-4">Importar Itens por Texto (JSON)</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Baralho de Destino</label>
                        <select value={selectedDeckId} onChange={e => setSelectedDeckId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">-- Selecione um baralho --</option>
                            {decks.map(deck => <option key={deck.id} value={deck.id}>{deck.title}</option>)}
                        </select>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Cole o conteúdo JSON abaixo</h4>
                            <button type="button" onClick={() => setShowFormatInfo(prev => !prev)} className="text-blue-500 hover:text-blue-700" title="Ver/Ocultar formato esperado">
                                <InfoIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {showFormatInfo && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md modal-enter-active">
                                <p className="font-bold">Formato JSON esperado:</p>
                                <p className="mt-2">Cole um array de objetos no formato abaixo.</p>
                                <pre className="mt-2 text-xs bg-gray-200 dark:bg-gray-900/50 p-2 rounded overflow-x-auto">
                                    <code>{isFlashcardView ? flashcardFormatExample : questionFormatExample}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Cole o seu JSON aqui..." className="w-full h-48 p-2 rounded-md bg-gray-100 dark:bg-gray-700 font-mono text-sm"></textarea>
                    
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    
                    <div className="flex justify-end gap-3 pt-4 mt-4 border-t dark:border-gray-600">
                        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button>
                        <button onClick={handleImport} className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold">Importar Itens</button>
                    </div>
                </div>
            );
        };
        
        const StatisticsModal = ({ decks }) => {
            const [showExplanation, setShowExplanation] = useState(false);
            const allCards = useMemo(() => decks.flatMap(deck => deck.cards || []), [decks]);
            const totalCards = allCards.length;

            const srsLevelDistribution = useMemo(() => {
                const distribution = {};
                for (let i = 0; i < 10; i++) {
                    distribution[`Nível ${i}`] = 0;
                }
                allCards.forEach(card => {
                    const level = card.srsLevel || 0;
                    if(level < 10) {
                        distribution[`Nível ${level}`]++;
                    } else {
                        distribution[`Nível 10+`] = (distribution[`Nível 10+`] || 0) + 1;
                    }
                });
                return distribution;
            }, [allCards]);

            return (<div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
                {showExplanation && <Modal onClose={() => setShowExplanation(false)} size="lg"><SrsExplanationModal onClose={() => setShowExplanation(false)} /></Modal>}
                <h2 className="text-2xl font-bold mb-6 text-center">Estatísticas Gerais</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"><span className="font-semibold">Total de Baralhos</span><span className="text-xl font-bold text-blue-500">{decks.length}</span></div>
                    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"><span className="font-semibold">Total de Itens</span><span className="text-xl font-bold text-purple-500">{totalCards}</span></div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <h3 className="text-lg font-bold text-center">Distribuição por Nível de Revisão</h3>
                        <button onClick={() => setShowExplanation(true)} className="text-blue-500 hover:text-blue-700" title="Como funcionam os níveis?">
                            <InfoIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {Object.entries(srsLevelDistribution).map(([level, count]) => (
                            <div key={level} className="flex items-center gap-4 mb-2">
                                <span className="font-semibold text-sm w-24">{level}</span>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                    <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(count / totalCards) * 100}%`}}></div>
                                </div>
                                <span className="font-bold text-sm w-12 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>);
        }
        
        const StudyConfigModal = ({ onCancel, onStart, cardCount, hasProgress }) => {
            const [order, setOrder] = useState('original');
            return (
                <div className="p-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Opções de Estudo</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{cardCount} {cardCount === 1 ? 'item' : 'itens'} nesta sessão.</p>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Ordem dos cartões</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="order" value="original" checked={order === 'original'} onChange={e => setOrder(e.target.value)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                                <span>Original</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="order" value="random" checked={order === 'random'} onChange={e => setOrder(e.target.value)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                                <span>Aleatória</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-8">
                        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button>
                        {hasProgress && (
                           <button onClick={() => onStart(order, true)} className="py-2 px-4 rounded-lg bg-orange-500 text-white font-bold">Recomeçar</button>
                        )}
                        <button onClick={() => onStart(order, false)} className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold">{hasProgress ? 'Continuar' : 'Iniciar Sessão'}</button>
                    </div>
                </div>
            );
        };
        
const DecksApp = ({
  user,
  view,
  onBackToDashboard,
  isDarkMode,
  setIsDarkMode,
  isFullscreen,
  toggleFullscreen,
  decks,
  setDecks,
  showToast,
  deckProgress,
  setDeckProgress,
  folders,
  setFolders,
  allDecks,
  studyTrigger,
  updateRecentDecks,
  pomodoroSettings,
  setPomodoroSettings
}) => {

  // 🔹 ADICIONADO AQUI — deve vir logo após o início da função:
  const handleAddDeck = async (title, subject, folderId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Erro: usuário não autenticado.');
        return;
      }

      // Cria deck no backend
      const response = await fetch('http://localhost:3000/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: title,
          type: view === 'questions' ? 'questions' : 'flashcards',

          folder_id: folderId || null
        })
      });

      if (!response.ok) throw new Error('Erro ao criar deck no servidor.');

      const createdDeck = await response.json();

      // Atualiza o estado local com o novo deck
      const newDeck = {
        id: createdDeck.id,
        title: createdDeck.name,
        subject: createdDeck.type,
        cards: [],
        authorName: user.name,
        folderId: createdDeck.folder_id
      };

      setDecks(prev => [...prev, newDeck]);
      updateRecentDecks(newDeck.id);

      console.log('✅ Deck criado e salvo no banco:', newDeck);
      showToast('Baralho criado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao criar deck:', error);
      alert('Erro ao criar baralho. Tente novamente.');
    }
  };
  // 🔹 FIM da parte adicionada

  const [modal, setModal] = useState({ type: null, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [studyOptions, setStudyOptions] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isPomodoroEnabled, setIsPomodoroEnabled] = useLocalStorage(
    `medrecall-pomodoroEnabled-${view}`,
    false
  );
  const [sortOrder, setSortOrder] = useState('manual');
  
  const dragDeck = useRef(null);
  const dragOverDeck = useRef(null);

  const viewConfig = {
    title: view === 'flashcards' ? "Flashcards" : "Questões",
    item_singular: view === 'flashcards' ? "flashcard" : "questão",
    item_plural: view === 'flashcards' ? "flashcards" : "questões"
  };

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

            
            
            useEffect(() => {
                if (studyTrigger) {
                    const deckToStudy = decks.find(d => String(d.id) === studyTrigger.deckId);
                    if (deckToStudy) {
                        openStudyConfig(deckToStudy.cards, deckToStudy.id);
                    }
                    studyTrigger.onComplete(); 
                }
            }, [studyTrigger, decks]);

            const handleSortChange = () => {
                setSortOrder(current => {
                    if (current === 'manual') return 'name-asc';
                    if (current === 'name-asc') return 'name-desc';
                    return 'manual';
                });
            };

            const handleDragSort = () => {
                if (sortOrder !== 'manual') return;

                const draggedItem = sortedAndFilteredDecks[dragDeck.current];
                const targetItem = sortedAndFilteredDecks[dragOverDeck.current];
                
                const fromIndex = decks.findIndex(d => d.id === draggedItem.id);
                const toIndex = decks.findIndex(d => d.id === targetItem.id);

                if (fromIndex === -1 || toIndex === -1) return;

                const newDecksOrder = [...decks];
                const [removed] = newDecksOrder.splice(fromIndex, 1);
                newDecksOrder.splice(toIndex, 0, removed);
                
                setDecks(newDecksOrder);
                
                dragDeck.current = null;
                dragOverDeck.current = null;
            };




            const handleUpdateDeck = (updatedDeck) => {
                setDecks(prev => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
                updateRecentDecks(updatedDeck.id);
            };

            const handleDeleteDeck = (deckId) => openModal('confirm', { message: 'Tem certeza que deseja excluir este baralho?', onConfirm: () => { 
                setDecks(prev => prev.filter(d => d.id !== deckId));
                setDeckProgress(prev => {
                    const newProgress = {...prev};
                    delete newProgress[deckId];
                    return newProgress;
                });
                closeModal(); 
                showToast('Baralho eliminado com sucesso!', 'success');
            }});
            
             const handleAddFolder = (name) => {
                const newFolder = { id: Date.now(), name };
                setFolders(prev => [...prev, newFolder]);
            };

            const handleUpdateFolder = (id, name) => {
                setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
            };

            const handleDeleteFolder = (folderId) => {
                openModal('confirm', { 
                    message: 'Isto irá mover todos os baralhos desta pasta para "Sem Pasta". Deseja continuar?', 
                    onConfirm: () => {
                        setDecks(prevDecks => prevDecks.map(deck => {
                            if (deck.folderId === folderId) {
                                return { ...deck, folderId: null };
                            }
                            return deck;
                        }));
                        setFolders(prev => prev.filter(f => f.id !== folderId));
                        closeModal();
                        showToast('Pasta eliminada.', 'success');
                    }
                });
            };

            const handleMoveDeck = (deckId, folderId) => {
                setDecks(prev => prev.map(d => d.id === deckId ? { ...d, folderId } : d));
            };

            const handleDeckImport = (importedDecks) => { // Now accepts an array
                const newDecks = importedDecks.map(importedDeck => {
                    const newDeckId = Date.now() + Math.random(); // Add random to avoid collision in fast loops
                    const newCards = importedDeck.cards.map((card, index) => ({
                        ...card,
                        id: `c${newDeckId}-${index}-${Math.random()}`,
                        srsLevel: 0,
                        nextReviewDate: formatDateToYYYYMMDD(new Date()),
                        reviewHistory: []
                    }));

                    return {
                        title: importedDeck.title,
                        subject: importedDeck.subject,
                        cards: newCards,
                        id: newDeckId,
                        authorName: user.name,
                        folderId: selectedFolderId || null
                    };
                });
                
                setDecks(prev => [...prev, ...newDecks]);
                closeModal();
                showToast(`${newDecks.length} ${newDecks.length === 1 ? 'baralho importado' : 'baralhos importados'} com sucesso!`, 'success');
            };

            const handleTextItemsImported = (deckId, newCards) => {
                setDecks(prev => prev.map(deck => {
                    // Use string comparison for robustness, as value from select is always a string.
                    if(String(deck.id) === deckId) {
                        return { ...deck, cards: [...deck.cards, ...newCards] };
                    }
                    return deck;
                }));
                closeModal();
                showToast(`${newCards.length} itens importados com sucesso!`, 'success');
            };
            
            const handleExportDeck = (deck) => {
                const deckForExport = {
                    title: deck.title,
                    subject: deck.subject,
                    cards: deck.cards.map(card => {
                        const { question, answer, commentary, type, imageUrl, answerImageUrl, options } = card;
                        return { question, answer, commentary, type, imageUrl, answerImageUrl, options: options || [] };
                    })
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deckForExport, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `${deck.title.replace(/ /g, "_")}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                showToast('Baralho exportado com sucesso!', 'success');
            };
            
            const handleExportAllDecks = () => {
                if (decks.length === 0) {
                    showToast('Não há baralhos para exportar.', 'info');
                    return;
                }
                const decksForExport = decks.map(deck => ({
                    title: deck.title,
                    subject: deck.subject,
                    cards: deck.cards.map(card => {
                        const { question, answer, commentary, type, imageUrl, answerImageUrl, options } = card;
                        return { question, answer, commentary, type, imageUrl, answerImageUrl, options: options || [] };
                    })
                }));

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decksForExport, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                const date = formatDateToYYYYMMDD(new Date());
                downloadAnchorNode.setAttribute("download", `medrecall_${view}_backup_${date}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                showToast(`${decks.length} baralhos exportados!`, 'success');
            };

            const openStudyConfig = (cards, deckId) => {
                if (cards.length > 0) {
                    updateRecentDecks(deckId);
                    const progress = deckProgress[deckId];
                    const hasProgress = progress !== undefined && progress > 0 && progress < cards.length -1;
                    setStudyOptions({ cards, deckId, hasProgress });
                } else {
                    showToast('Não há itens nesta sessão de estudo.', 'info');
                }
            };
            
            const handleProgressUpdate = useCallback((deckId, index) => {
                setDeckProgress(prev => ({ ...prev, [deckId]: index }));
            }, [setDeckProgress]);

            const handleStartSession = (order, restart = false) => {
                let cardsToStudy = studyOptions.cards;
                if (order === 'random') {
                    cardsToStudy = [...cardsToStudy].sort(() => Math.random() - 0.5);
                }
                const startIndex = restart ? 0 : (deckProgress[studyOptions.deckId] || 0);
                if (restart) {
                    handleProgressUpdate(studyOptions.deckId, 0);
                }
                openModal('study', { cards: cardsToStudy, deckId: studyOptions.deckId, startIndex });
                setStudyOptions(null);
            };

            const getModalSize = (type) => {
                switch(type) {
                    case 'study': return '5xl'; case 'deckManager': return '4xl'; case 'cardManager': return '4xl';
                    case 'jsonImport': return 'lg'; case 'textImporter': return '2xl'; case 'newDeck': return 'md'; case 'editDeck': return 'md';
                    case 'confirm': return 'sm'; case 'statistics': return '2xl'; default: return 'lg';
                }
            };

            const renderModalContent = () => {
                const { type, data } = modal;
                if (!type) return null;
                switch(type) {
                    case 'study': return <StudySessionModal cards={data.cards} deckId={data.deckId} onUpdateDecks={setDecks} onClose={closeModal} isFlashcardView={view === 'flashcards'} startIndex={data.startIndex} onProgressUpdate={handleProgressUpdate} isPomodoroEnabled={isPomodoroEnabled} showToast={showToast} updateRecentDecks={updateRecentDecks} pomodoroSettings={pomodoroSettings} setPomodoroSettings={setPomodoroSettings} />;
                    case 'deckManager':
  if (!Array.isArray(decks)) {
    console.warn("⚠️ Decks ainda não carregados:", decks);
    return <div className="p-4 text-center text-gray-500">Carregando baralhos...</div>;
  }

  return (
    <DeckManager
      decks={decks}
      folders={folders || []}
      onManageDeck={(deck) => {
        updateRecentDecks(deck.id);
        openModal('cardManager', { deck });
      }}
      onAddDeck={() => openModal('newDeck')}
      onDeleteDeck={handleDeleteDeck}
      onJsonFileImport={() => openModal('jsonImport')}
      onTextImport={() => openModal('textImporter')}
      onExportDeck={handleExportDeck}
      onExportAllDecks={handleExportAllDecks}
      onAddFolder={handleAddFolder}
      onUpdateFolder={handleUpdateFolder}
      onDeleteFolder={handleDeleteFolder}
      onMoveDeck={handleMoveDeck}
      managerTitle={`Gerenciar ${viewConfig.title}`}
      onEditDeck={(deck) => openModal('editDeck', { deck })}
    />
  );

                    case 'cardManager': return <CardManager deck={data.deck} onUpdateDeck={handleUpdateDeck} onBack={() => openModal('deckManager')} isFlashcardView={view === 'flashcards'} startWithNew={data.startWithNew} />;
                    case 'newDeck': return <NewDeckForm onSave={(title, subject, folderId) => { handleAddDeck(title, subject, folderId); closeModal(); }} onCancel={closeModal} folders={folders} />;
                    case 'editDeck': return <NewDeckForm 
                        initialData={data.deck}
                        onSave={(title, subject, folderId) => { 
                            handleUpdateDeck({ ...data.deck, title, subject, folderId }); 
                            closeModal(); 
                            showToast('Baralho atualizado com sucesso!', 'success');
                        }} 
                        onCancel={closeModal} 
                        folders={folders} 
                    />;
                    case 'jsonImport': return <JsonImportModal onImport={handleDeckImport} onCancel={closeModal} />;
                    case 'textImporter': return <TextImportModal decks={decks} onImport={handleTextItemsImported} onCancel={closeModal} isFlashcardView={view === 'flashcards'} />;
                    case 'confirm': return <ConfirmModal message={data.message} onConfirm={data.onConfirm} onCancel={closeModal} />;
                    case 'statistics': return <StatisticsModal decks={allDecks} />;
                    default: return null;
                }
            }
            
const filteredDecks = decks.filter(deck => {
  const title = (deck.title || '').toLowerCase();
  return (
    title.includes(searchTerm.toLowerCase()) &&
    (selectedFolderId === null ? !deck.folderId : deck.folderId === selectedFolderId)
  );
});



            const sortedAndFilteredDecks = useMemo(() => {
                if (sortOrder === 'manual') {
                    return filteredDecks;
                }
                const sortable = [...filteredDecks];
                if (sortOrder === 'name-asc') {
                    sortable.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { numeric: true, sensitivity: 'base' }));
                } else if (sortOrder === 'name-desc') {
                    sortable.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR', { numeric: true, sensitivity: 'base' }));
                }
                return sortable;
            }, [filteredDecks, sortOrder]);

            return (
                <div className="bg-slate-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
                    <div className="container mx-auto p-4 md:p-8">
                        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                            <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciador de {viewConfig.title}</h1><p className="text-gray-500 dark:text-gray-400">Olá, {user.name}!</p></div>
                            <div className="flex items-center gap-4">
                                <button onClick={onBackToDashboard} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">&larr; Voltar</button>
                                <button onClick={() => openModal('statistics')} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow" title="Estatísticas"><BarChart /></button>
                                <button onClick={toggleFullscreen} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow" title="Tela Cheia">{isFullscreen ? <Minimize/> : <Maximize />}</button>
                                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow" title="Mudar Tema">{isDarkMode ? <Sun /> : <Moon />}</button>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow rounded-full p-1">
                                    <label className="pl-2 text-sm font-medium select-none cursor-pointer" onClick={() => setIsPomodoroEnabled(p => !p)}>Pomodoro</label>
                                    <div onClick={() => setIsPomodoroEnabled(p => !p)} className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${isPomodoroEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPomodoroEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </div>
                                </div>
                                <button
  onClick={() => {
    if (!Array.isArray(decks)) {
      console.error("❌ Decks ainda não carregados corretamente:", decks);
      alert("Os baralhos ainda estão carregando. Tente novamente em instantes.");
      return;
    }
    openModal('deckManager');
  }}
  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
>
  Gerenciar
</button>

                            </div>
                        </header>
                         <div className="flex flex-col md:flex-row gap-8">
                            {/* Folder Sidebar */}
                            <aside className="w-full md:w-1/4">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                                    <h3 className="text-lg font-bold mb-4 px-2">Pastas</h3>
                                    <ul className="space-y-1">
                                        <li>
                                            <button onClick={() => setSelectedFolderId(null)} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors ${selectedFolderId === null ? 'bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                <FolderIcon /> Sem Pasta
                                            </button>
                                        </li>
                                        {folders.map(folder => (
                                            <li key={folder.id}>
                                                <button onClick={() => setSelectedFolderId(folder.id)} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors ${selectedFolderId === folder.id ? 'bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                    <FolderIcon /> {folder.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </aside>

                            {/* Decks Main Area */}
                            <main className="w-full md:w-3/4">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">Seus Baralhos</h2>
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleSortChange} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 text-sm font-semibold" title={`Ordenar por: ${sortOrder === 'manual' ? 'Manual' : sortOrder === 'name-asc' ? 'Nome (A-Z)' : 'Nome (Z-A)'}`}>
                                                {sortOrder === 'manual' && <HandIcon className="w-5 h-5"/>}
                                                {sortOrder === 'name-asc' && <SortAscIcon className="w-5 h-5"/>}
                                                {sortOrder === 'name-desc' && <SortAscIcon className="w-5 h-5 transform rotate-180"/>}
                                            </button>
                                            <div className="relative w-full max-w-xs">
                                                <Search />
                                                <input type="text" placeholder="Buscar baralho..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pr-4" style={{maxHeight: 'calc(100vh - 280px)'}}>
                                        {sortedAndFilteredDecks.map((deck, index) => {
  if (!deck) return null; // segurança extra

  const today = formatDateToYYYYMMDD(new Date());

  // Protege o array de cards
  const cards = Array.isArray(deck.cards) ? deck.cards : [];

  const dueCards = cards.filter(
    (c) => c.nextReviewDate && c.nextReviewDate <= today
  );
  const overdueCards = cards.filter(
    (c) => c.nextReviewDate && c.nextReviewDate < today
  );

  return (
    <div
      key={deck.id}
      className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${
        sortOrder === "manual" ? "cursor-grab" : "cursor-default"
      }`}
      draggable={sortOrder === "manual"}
      onDragStart={(e) => {
        if (sortOrder !== "manual") return;
        dragDeck.current = index;
        e.currentTarget.style.opacity = "0.5";
      }}
      onDragEnter={(e) => {
        if (sortOrder !== "manual") return;
        dragOverDeck.current = index;
      }}
      onDragEnd={(e) => {
        if (sortOrder !== "manual") return;
        e.currentTarget.style.opacity = "1";
        handleDragSort();
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-md">{deck.title || "Sem título"}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
            {deck.subject || "Sem assunto"}
          </span>
          <button
            onClick={() =>
              openModal("cardManager", { deck, startWithNew: true })
            }
            className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            title="Adicionar Novo Item"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {(deck.cards ? deck.cards.length : 0)}{" "}
        {(deck.cards && deck.cards.length === 1)
          ? viewConfig.item_singular
          : viewConfig.item_plural}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => openStudyConfig(cards, deck.id)}
          disabled={cards.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Estudar Tudo
        </button>

        <button
          onClick={() => openStudyConfig(dueCards, deck.id)}
          disabled={dueCards.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Revisar Agendados ({dueCards.length})
        </button>

        <button
          onClick={() => openStudyConfig(overdueCards, deck.id)}
          disabled={overdueCards.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Repassar Atrasados ({overdueCards.length})
        </button>
      </div>
    </div>
  );
})}
</div>
                                         {filteredDecks.length === 0 && <div className="text-center py-12"><h3 className="text-lg font-semibold">Nenhum baralho encontrado</h3><p className="text-gray-500 mt-2">{searchTerm ? 'Tente um termo de busca diferente.' : 'Crie um novo baralho ou selecione outra pasta.'}</p></div>}
                                </div>
                            </main>
                        </div>
                    </div>
                    {modal.type && <Modal onClose={closeModal} size={getModalSize(modal.type)}>{renderModalContent()}</Modal>}
                    {studyOptions && <Modal onClose={() => setStudyOptions(null)} size="sm"><StudyConfigModal onCancel={() => setStudyOptions(null)} onStart={handleStartSession} cardCount={studyOptions.cards.length} hasProgress={studyOptions.hasProgress} /></Modal>}
                </div>);
        }
        
        const PlannerApp = ({ user, onBackToDashboard, isDarkMode, setIsDarkMode, isFullscreen, toggleFullscreen, decks, events, setEvents, onStartStudySession }) => {
            const [currentDate, setCurrentDate] = useState(new Date());
            const [selectedDate, setSelectedDate] = useState(new Date());
            const [modal, setModal] = useState({ type: null, data: null });
            const [view, setView] = useState('month'); // 'month', 'week'
            const [alarm, setAlarm] = useState(null);
            
            useEffect(() => {
                const playAlarmSound = async () => {
                    await Tone.start();
                    const synth = new Tone.Synth().toDestination();
                    synth.triggerAttackRelease("C5", "8n", Tone.now());
                    synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.2);
                };

                const checkAlarms = () => {
                    const now = new Date();
                    const updatedEvents = events.map(event => {
                         if (event.hasAlarm && event.date && event.time) {
                             const [evtY, evtM, evtD] = event.date.split('-').map(Number);
                             const [evtH, evtMin] = event.time.split(':').map(Number);
                             const eventDateTime = new Date(evtY, evtM - 1, evtD, evtH, evtMin);

                             if (now >= eventDateTime && !event.alarmTriggered) {
                                 setAlarm(event);
                                 playAlarmSound();
                                 return { ...event, alarmTriggered: true };
                             }
                         }
                         return event;
                    });
                    if (JSON.stringify(events) !== JSON.stringify(updatedEvents)) {
                        setEvents(updatedEvents);
                    }
                };
                const interval = setInterval(checkAlarms, 10000); // Checa a cada 10 segundos
                return () => clearInterval(interval);
            }, [events, setEvents]);

            const openModal = (type, data = null) => setModal({ type, data });
            const closeModal = () => setModal({ type: null, data: null });

            const handleSaveEvent = (eventData) => {
                setEvents(prev => {
                    const existing = prev.find(e => e.id === eventData.id);
                    if (existing) {
                        return prev.map(e => e.id === eventData.id ? eventData : e);
                    }
                    return [...prev, eventData];
                });
                closeModal();
            };
            const handleDeleteEvent = (eventToDelete) => {
                const message = eventToDelete.recurrence && eventToDelete.recurrence !== 'none'
                    ? 'Este é um evento recorrente. A exclusão removerá todas as futuras ocorrências. Deseja continuar?'
                    : 'Tem certeza que deseja excluir este evento?';

                openModal('confirm', {
                    message,
                    onConfirm: () => {
                        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
                        closeModal();
                    }
                });
            };
            
            const eventsByDate = useMemo(() => {
                const eventsMap = {};
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0);

                for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
                    const currentDay = new Date(d);
                    const dateString = formatDateToYYYYMMDD(currentDay);

                    events.forEach(event => {
                        const [startY, startM, startD] = event.date.split('-').map(Number);
                        const startDate = new Date(startY, startM - 1, startD);
                        
                        if (isNaN(startDate.getTime()) || startDate > currentDay) {
                            return; 
                        }

                        let shouldAdd = false;
                        if (event.recurrence === 'none') {
                            if (event.date === dateString) {
                                shouldAdd = true;
                            }
                        } else if (event.recurrence === 'weekly') {
                            if (startDate.getDay() === currentDay.getDay()) {
                                shouldAdd = true;
                            }
                        } else if (event.recurrence === 'monthly') {
                            const startDayOfMonth = startDate.getDate();
                            const currentDayOfMonth = currentDay.getDate();
                            const lastDayOfCurrentMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0).getDate();

                            if (startDayOfMonth === currentDayOfMonth) {
                                shouldAdd = true;
                            } 
                            else if (startDayOfMonth > lastDayOfCurrentMonth && currentDayOfMonth === lastDayOfCurrentMonth) {
                                shouldAdd = true;
                            }
                        }
                        
                        if (shouldAdd) {
                            const isOccurrence = event.date !== dateString;
                            const eventToAdd = isOccurrence ? { ...event, isOccurrence: true } : event;

                            if (!eventsMap[dateString]) {
                                eventsMap[dateString] = [];
                            }
                            if (!eventsMap[dateString].find(e => e.id === event.id)) {
                                 eventsMap[dateString].push(eventToAdd);
                            }
                        }
                    });
                }
                return eventsMap;
            }, [events, currentDate]);

            const navigateDate = (amount) => {
                setCurrentDate(prev => {
                    const newDate = new Date(prev);
                    if (view === 'month') newDate.setMonth(newDate.getMonth() + amount);
                    else if (view === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
                    return newDate;
                });
            };
            
            const getWeekDays = (date) => {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay()); // Inicia no Domingo
                return Array.from({length: 7}, (_, i) => {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    return day;
                });
            };

            const EventFormModal = ({ onSave, onClose, initialData, decks }) => {
                const [title, setTitle] = useState(initialData?.title || '');
                const [date, setDate] = useState(initialData?.date || formatDateToYYYYMMDD(new Date()));
                const [time, setTime] = useState(initialData?.time || '');
                const [description, setDescription] = useState(initialData?.description || '');
                const [linkedDeck, setLinkedDeck] = useState(initialData?.linkedDeck || '');
                const [recurrence, setRecurrence] = useState(initialData?.recurrence || 'none');
                const [hasAlarm, setHasAlarm] = useState(initialData?.hasAlarm || false);

                const allDecks = [
                    ...(decks.flashcards || []).map(d => ({ value: `flashcards-${d.id}`, label: `(F) ${d.title}` })),
                    ...(decks.questions || []).map(d => ({ value: `questions-${d.id}`, label: `(Q) ${d.title}` })),
                ];

                const handleSubmit = (e) => {
                    e.preventDefault();
                    onSave({
                        ...initialData,
                        id: initialData?.id || `evt-${Date.now()}`,
                        title, date, time, description, linkedDeck, recurrence, hasAlarm,
                        alarmTriggered: initialData?.alarmTriggered || false
                    });
                };

                return (
                    <div className="p-8">
                        <h3 className="text-xl font-bold mb-6">{initialData?.id ? 'Editar Evento' : 'Novo Evento'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Título</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Data</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Descrição (Opcional)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" rows="3"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Horário (Opcional)</label>
                                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Baralho Vinculado (Opcional)</label>
                                    <select value={linkedDeck} onChange={e => setLinkedDeck(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500 p-2">
                                        <option value="">Nenhum</option>
                                        {allDecks.map(deck => <option key={deck.value} value={deck.value}>{deck.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium">Recorrência</label>
                                    <select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-blue-500 p-2">
                                        <option value="none">Nunca</option>
                                        <option value="weekly">Semanalmente</option>
                                        <option value="monthly">Mensalmente</option>
                                    </select>
                                </div>
                                <div className="pt-6">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={hasAlarm} onChange={e => setHasAlarm(e.target.checked)} disabled={!time} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                        <span>Ativar alarme (requer horário)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-bold">Cancelar</button>
                                <button type="submit" className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                );
            };

            const getDeckTitle = (linkedDeck, decks) => {
                if (!linkedDeck) return 'N/A';
                const [type, id] = linkedDeck.split('-');
                const deckList = type === 'flashcards' ? decks.flashcards : decks.questions;
                const deck = deckList.find(d => d.id == id);
                return deck ? deck.title : 'Baralho não encontrado';
            };

            const ScheduledTasksPanel = ({ date, events, onEdit, onDelete, onAdd, decks, onStartStudySession }) => {
                const sortedEvents = [...events].sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
                
                return (
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg h-full flex flex-col min-h-[50vh] lg:min-h-0">
                        <h3 className="text-xl font-bold mb-1">{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
                            {sortedEvents.length > 0 ? sortedEvents.map(event => (
                                <div key={event.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{event.title}</p>
                                            {event.time && <p className="text-sm text-blue-500 dark:text-blue-400">{event.time}</p>}
                                            {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
                                            {event.linkedDeck && (
                                                <div className="mt-2 text-xs">
                                                    <p className="font-semibold">Estudo Vinculado:</p>
                                                    <p className="flex items-center gap-2"><LinkIcon/> {getDeckTitle(event.linkedDeck, decks)}</p>
                                                    <button onClick={() => onStartStudySession(event.linkedDeck)} className="mt-1 text-sm font-bold text-green-600 hover:underline">Iniciar Estudo</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!event.isOccurrence && <button onClick={() => onEdit(event)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Edit className="w-4 h-4 text-blue-500" /></button>}
                                            <button onClick={() => onDelete(event)} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-8">Nenhum evento agendado para este dia.</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onAdd} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                <PlusCircle className="w-5 h-5"/> Adicionar Evento
                            </button>
                        </div>
                    </div>
                );
            };

            const renderMonthView = () => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];
                for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
                for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
                return (<>
                     <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400 mb-2">
                         {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                     </div>
                     <div className="grid grid-cols-7 gap-1">
                         {days.map((day, index) => {
                             if (!day) return <div key={`empty-${index}`}></div>;
                             const dateString = formatDateToYYYYMMDD(day);
                             const dayEvents = eventsByDate[dateString] || [];
                             const isToday = formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date());
                             const isSelected = formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(selectedDate);
                             const hasEvents = dayEvents.length > 0;
                             
                             let dayClasses = `p-2 h-24 rounded-lg flex flex-col cursor-pointer transition-colors relative overflow-hidden`;
                             if (isSelected) {
                                 dayClasses += ' bg-blue-200 dark:bg-blue-800/60 ring-2 ring-blue-500';
                             } else if (isToday) {
                                 dayClasses += ' bg-blue-100 dark:bg-blue-900/50';
                             } else if (hasEvents) {
                                 dayClasses += ' bg-teal-50 dark:bg-teal-900/40 hover:bg-gray-100 dark:hover:bg-gray-700/50';
                             } else {
                                 dayClasses += ' hover:bg-gray-100 dark:hover:bg-gray-700/50';
                             }

                             return (<div key={index} onClick={() => setSelectedDate(day)} className={dayClasses}>
                                 <span className={`font-bold text-sm ${isToday ? 'text-blue-600 dark:text-blue-300' : ''}`}>{day.getDate()}</span>
                                 {hasEvents && 
                                     <div className="mt-1 space-y-1 overflow-hidden">
                                         {dayEvents.slice(0, 2).map(e => 
                                             <div key={e.id} className="text-xs truncate bg-green-200 dark:bg-green-800 rounded px-1 flex items-center gap-1">
                                                 {e.linkedDeck && <LinkIcon/>} {e.title}
                                             </div>
                                         )}
                                         {dayEvents.length > 2 && <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">+ {dayEvents.length - 2} mais</div>}
                                     </div>
                                 }
                             </div>);
                         })}
                     </div>
                </>);
            };
            
            const renderWeekView = () => {
                const weekDays = getWeekDays(currentDate);
                return (<>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        {weekDays.map(day => <div key={day.toISOString()}>{day.toLocaleDateString('pt-BR', {weekday: 'short'})} <span className="font-bold">{day.getDate()}</span></div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 h-[60vh]">
                        {weekDays.map(day => {
                            const dateString = formatDateToYYYYMMDD(day);
                            const dayEvents = eventsByDate[dateString] || [];
                            const isToday = formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date());
                            const isSelected = formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(selectedDate);
                            const hasEvents = dayEvents.length > 0;
                            
                             let dayClasses = `p-2 rounded-lg flex flex-col cursor-pointer transition-colors`;
                             if (isSelected) {
                                 dayClasses += ' bg-blue-200 dark:bg-blue-800/60 ring-2 ring-blue-500';
                             } else if (isToday) {
                                 dayClasses += ' bg-blue-100 dark:bg-blue-900/50';
                              } else if (hasEvents) {
                                 dayClasses += ' bg-teal-50 dark:bg-teal-900/40 hover:bg-gray-100 dark:hover:bg-gray-700/50';
                             } else {
                                 dayClasses += ' bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/50';
                             }

                            return (
                                <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={dayClasses}>
                                    <div className="flex-grow overflow-y-auto space-y-1">
                                        {dayEvents.map(e => <div key={e.id} className="text-xs truncate bg-green-200 dark:bg-green-800 rounded px-1 py-0.5 flex items-center gap-1">{e.linkedDeck && <LinkIcon/>} {e.title}</div>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>);
            };
            
            const renderModalContent = () => {
                const { type, data } = modal;
                if (!type) return null;
                switch (type) {
                    case 'eventForm': return <EventFormModal onSave={handleSaveEvent} onClose={closeModal} initialData={data} decks={decks} />;
                    case 'confirm': return <ConfirmModal message={data.message} onConfirm={data.onConfirm} onCancel={closeModal} />;
                    default: return null;
                }
            };
            
            const viewTitles = {
                month: currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()),
                week: `Semana de ${getWeekDays(currentDate)[0].toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})} a ${getWeekDays(currentDate)[6].toLocaleDateString('pt-BR', {day: 'numeric', month: 'short', year: 'numeric'})}`,
            };

            const selectedDateEvents = eventsByDate[formatDateToYYYYMMDD(selectedDate)] || [];

            return (
                 <div className="bg-slate-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
                      <div className="container mx-auto p-4 md:p-8">
                           <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                               <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planejador de Estudos</h1><p className="text-gray-500 dark:text-gray-400">Olá, {user.name}!</p></div>
                                <div className="flex items-center gap-4">
                                   <button onClick={onBackToDashboard} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">&larr; Voltar</button>
                                   <button onClick={toggleFullscreen} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow" title="Tela Cheia">{isFullscreen ? <Minimize/> : <Maximize />}</button>
                                   <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow" title="Mudar Tema">{isDarkMode ? <Sun /> : <Moon />}</button>
                               </div>
                           </header>
                           <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left Panel: Calendar */}
                                <div className="lg:w-2/3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                   <div className="flex flex-wrap justify-between items-center mb-4 gap-y-2">
                                     <div className="flex items-center gap-2">
                                       <button onClick={() => navigateDate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeft /></button>
                                       <button onClick={() => setCurrentDate(new Date())} className="font-semibold text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Hoje</button>
                                       <button onClick={() => navigateDate(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRight /></button>
                                       <h2 className="text-xl font-bold text-center w-80 ml-4">{viewTitles[view]}</h2>
                                     </div>
                                     <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                                       <button onClick={() => setView('month')} className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'month' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Mês</button>
                                       <button onClick={() => setView('week')} className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'week' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Semana</button>
                                     </div>
                                   </div>
                                   {view === 'month' && renderMonthView()}
                                   {view === 'week' && renderWeekView()}
                                </div>
                                {/* Right Panel: Scheduled Tasks */}
                                <div className="lg:w-1/3">
                                    <ScheduledTasksPanel 
                                        date={selectedDate} 
                                        events={selectedDateEvents} 
                                        onEdit={(event) => openModal('eventForm', event)} 
                                        onDelete={handleDeleteEvent} 
                                        onAdd={() => openModal('eventForm', {date: formatDateToYYYYMMDD(selectedDate)})} 
                                        decks={decks} 
                                        onStartStudySession={onStartStudySession}
                                    />
                                </div>
                           </div>
                      </div>
                      {modal.type && <Modal onClose={closeModal} size={'lg'}>{renderModalContent()}</Modal>}
                      {alarm && <Modal onClose={() => setAlarm(null)} size="sm"><AlertModal title={alarm.title} message={`Seu evento agendado para ${alarm.time} está a começar agora!`} onClose={() => setAlarm(null)}/></Modal>}
                 </div>
            )
        }

        function AppWrapper() {
                const [user, setUser] = useState(() => {
    // Lê os dados do usuário que nosso script de login salvou
                const savedUserData = localStorage.getItem('userData');
        return savedUserData ? JSON.parse(savedUserData) : null;
        });
            const [view, setView] = useLocalStorage('medrecall-view', 'dashboard');
            const [isDarkMode, setIsDarkMode] = useDarkMode();
            const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
            const [isLoading, setIsLoading] = useState(false); 
            const [toast, setToast] = useState(null);
            const [deckProgress, setDeckProgress] = useLocalStorage('medrecall-deckProgress', {});
            const [modal, setModal] = useState({ type: null, data: null });
            
            const [studyTrigger, setStudyTrigger] = useState(null);
            const [showTutorial, setShowTutorial] = useState(false);
            const [isFirstVisit, setIsFirstVisit] = useLocalStorage('medrecall-first-visit', true);
            const [recentDecks, setRecentDecks] = useLocalStorage('medrecall-recentDecks', []); // Array of deck IDs
            const [pomodoroSettings, setPomodoroSettings] = useLocalStorage('medrecall-pomodoro-settings', { study: 25, short: 5, long: 15 });


            const [flashcardDecks, setFlashcardDecks] = useState([]);
            const [questionDecks, setQuestionDecks] = useState([]);
            const [flashcardFolders, setFlashcardFolders] = useState([]);
            const [questionFolders, setQuestionFolders] = useState([]);
            const [events, setEvents] = useState([]);

            // 🔹 Carregar dados do banco logo após login
// 🔹 Carregar dados do banco logo após login
// 🔹 Carregar dados do banco logo após login
useEffect(() => {
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ Nenhum token encontrado — usuário não logado.');
        return;
      }

      console.log("📦 Carregando dados do banco...");
      const response = await fetch('http://localhost:3000/api/initial-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('❌ Erro ao carregar dados do banco.');
        return;
      }

      const data = await response.json();
      console.log('✅ Dados carregados do banco:', data);

      // --- Garantia de segurança contra undefined ---
      const rawDecks = Array.isArray(data.decks) ? data.decks
        : Array.isArray(data.flashcards) ? data.flashcards
        : [];

      const rawFolders = Array.isArray(data.folders) ? data.folders : [];
      const planners = Array.isArray(data.planners) ? data.planners : [];

      // --- Normaliza decks vindos do backend ---
      const normalizedDecks = rawDecks.map(d => {
        const cards = Array.isArray(d.cards) ? d.cards : [];

        // Força o tipo (caso não venha do banco)
        const normalizedType = (d.type || d.subject || '').toLowerCase();
        const deckType =
          normalizedType.includes('question') ? 'questions'
          : normalizedType.includes('flash') ? 'flashcards'
          : 'flashcards'; // padrão

        return {
          id: d.id,
          title: d.title || d.name || 'Sem título',
          subject: deckType,
          folderId: d.folder_id ?? d.folderId ?? null,
          cards: cards.map(c => ({
            id: c.id,
            question: c.front || c.question || '',
            answer: c.back || c.answer || '',
            commentary: c.commentary || '',
            srsLevel: c.srs_level ?? c.srsLevel ?? 0,
            nextReviewDate: c.next_review_date ?? c.nextReviewDate ?? null,
            reviewHistory: c.reviewHistory ?? []
          }))
        };
      });

      // --- Filtra decks por tipo detectado ---
      const flashcardDecksOnly = normalizedDecks.filter(d => d.subject === 'flashcards');
      const questionDecksOnly = normalizedDecks.filter(d => d.subject === 'questions');

      setFlashcardDecks(flashcardDecksOnly);
      setQuestionDecks(questionDecksOnly);

      // --- Folders também normalizadas ---
      setFlashcardFolders(rawFolders.filter(f => (f.type || 'flashcards') === 'flashcards'));
      setQuestionFolders(rawFolders.filter(f => f.type === 'questions'));

      setEvents(planners);

      console.log(`📘 Flashcards carregados: ${flashcardDecksOnly.length}`);
      console.log(`❓ Questões carregadas: ${questionDecksOnly.length}`);
      if (flashcardDecksOnly.length > 0) console.log("🧩 Exemplo Flashcard Deck:", flashcardDecksOnly[0]);
      if (questionDecksOnly.length > 0) console.log("🧠 Exemplo Questões Deck:", questionDecksOnly[0]);

    } catch (err) {
      console.error('❌ Erro ao buscar dados do banco:', err);
    }
  };

  loadUserData();
}, []);







            const allDecks = useMemo(() => [
                ...flashcardDecks.map(d => ({ ...d, type: 'flashcards' })),
                ...questionDecks.map(d => ({ ...d, type: 'questions' }))
            ], [flashcardDecks, questionDecks]);

            const openModal = (type, data = null) => setModal({ type, data });
            const closeModal = () => setModal({ type: null, data: null });

            useEffect(() => {
                if (view === 'dashboard' && isFirstVisit) {
                    setShowTutorial(true);
                    setIsFirstVisit(false);
                }
            }, [view, isFirstVisit]);

            const showToast = (message, type = 'info') => {
                setToast({ message, type });
            };

            const handleFullscreenChange = useCallback(() => { setIsFullscreen(!!document.fullscreenElement); }, []);
            useEffect(() => {
                document.addEventListener('fullscreenchange', handleFullscreenChange);
                return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
            }, [handleFullscreenChange]);
            // ===================================================================
    // ▼▼▼ COLOQUE O NOVO CÓDIGO EXATAMENTE AQUI ▼▼▼
    // ===================================================================
    
        useEffect(() => {
        // A função selectView que você já tem no seu código
        // const { setView } = { setView: selectView }; // Esta linha pode ser simplificada

        // Cria a ponte para o script do dashboard se comunicar com o React
                window.navigateToView = (viewName) => {
                        console.log(`React recebendo comando para navegar para: ${viewName}`);
                        selectView(viewName); // Usa a sua função `selectView` diretamente
                };
    
        // Limpa a função global quando o componente é desmontado
                return () => {
                        delete window.navigateToView;
                };
        }, [selectView]); // Adicione 'selectView' como dependência

    // ===================================================================
    // ▲▲▲ O CÓDIGO NOVO TERMINA AQUI ▲▲▲
    // ===================================================================

            const toggleFullscreen = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.error(`Erro: ${err.message}`));
                } else if (document.exitFullscreen) { document.exitFullscreen(); }
            };
            
            const updateRecentDecks = (deckId) => {
                setRecentDecks(prev => {
                    const newRecents = [deckId, ...prev.filter(id => id !== deckId)];
                    return newRecents.slice(0, 4); // Keep only the 4 most recent
                });
            };

            const handleStartStudyFromDashboard = (deckType, deckId) => {
                updateRecentDecks(deckId);
                setView(deckType);
                setStudyTrigger({
                    deckId: String(deckId),
                    onComplete: () => setStudyTrigger(null)
                });
            };
            
            const handleStartStudySession = (linkedDeck) => {
                if (!linkedDeck) return;
                const [type, id] = linkedDeck.split('-');
                const viewToGo = type === 'flashcards' ? 'flashcards' : 'questions';
                setView(viewToGo);
                // Set a trigger to open the study modal once the DecksApp component mounts/updates
                setStudyTrigger({
                    deckId: id,
                    onComplete: () => setStudyTrigger(null) // Function to reset the trigger
                });
            };

            const handleLogin = (name) => {
                setUser({ name });
                setView('dashboard');
                showToast(`Bem-vindo, ${name}!`, 'success');
            };

            const handleLogout = () => {
                //logout global
                performGlobalLogout();
            };

            const selectView = (selectedView) => setView(selectedView);
            const backToDashboard = () => setView('dashboard');
            
            const commonProps = { user, onBackToDashboard: backToDashboard, isDarkMode, setIsDarkMode, isFullscreen, toggleFullscreen, showToast };

            if (isLoading) {
                return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><Loader /></div>;
            }

            const getModalSize = (type) => {
                switch(type) {
                    case 'study': return '5xl'; case 'deckManager': return '4xl'; case 'cardManager': return '4xl';
                    case 'jsonImport': return 'lg'; case 'textImporter': return '2xl'; case 'newDeck': return 'md'; case 'editDeck': return 'md';
                    case 'confirm': return 'sm'; case 'statistics': return '2xl'; case 'textConverter': return '4xl'; default: return 'lg';
                }
            };
            
            const renderModalContent = () => {
                const { type, data } = modal;
                if (!type) return null;
                switch(type) {
                    case 'confirm': return <ConfirmModal message={data.message} onConfirm={data.onConfirm} onCancel={closeModal} />;
                    default: return null;
                }
            };
//LOGINAQUI
            // DEPOIS (Renderiza o app diretamente, sem a tela de login)
                return (
    <>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        {showTutorial && <Modal onClose={() => setShowTutorial(false)} size="xl"><TutorialModal onClose={() => setShowTutorial(false)} /></Modal>}
        {modal.type && <Modal onClose={closeModal} size={getModalSize(modal.type)}>{renderModalContent()}</Modal>}

        {(() => {
            switch(view) {
                case 'flashcards':
                    return <DecksApp view="flashcards" {...commonProps} decks={flashcardDecks} setDecks={setFlashcardDecks} allDecks={allDecks} folders={flashcardFolders} setFolders={setFlashcardFolders} deckProgress={deckProgress} setDeckProgress={setDeckProgress} studyTrigger={studyTrigger} updateRecentDecks={updateRecentDecks} pomodoroSettings={pomodoroSettings} setPomodoroSettings={setPomodoroSettings} />;
                case 'questions':
                    return <DecksApp view="questions" {...commonProps} decks={questionDecks} setDecks={setQuestionDecks} allDecks={allDecks} folders={questionFolders} setFolders={setQuestionFolders} deckProgress={deckProgress} setDeckProgress={setDeckProgress} studyTrigger={studyTrigger} updateRecentDecks={updateRecentDecks} pomodoroSettings={pomodoroSettings} setPomodoroSettings={setPomodoroSettings} />;
                case 'planner':
                    return <PlannerApp {...commonProps} onStartStudySession={handleStartStudySession} decks={{ flashcards: flashcardDecks, questions: questionDecks }} events={events} setEvents={setEvents} />;
                case 'dashboard':
                default:
                    return <DashboardChoice {...commonProps} onSelectView={selectView} onLogout={handleLogout} allDecks={allDecks} onShowTutorial={() => setShowTutorial(true)} recentDecks={recentDecks} onStartStudy={handleStartStudyFromDashboard} />;
            }
        })()}
    </>
                );
        }

        // --- RENDERIZAÇÃO INICIAL ---
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<AppWrapper />);