import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Clock, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: number;
  type: string;
  status: 'pending' | 'uploaded' | 'approved';
  name: string;
  path: string;
}

const REQUIRED_DOCUMENTS = [
  { type: 'cedula', label: 'Cédula' },
  { type: 'acta_bachiller', label: 'Acta de Bachiller' },
  { type: 'diploma_bachiller', label: 'Diploma de Bachiller' },
  { type: 'eps', label: 'Certificado EPS' },
  { type: 'icfes', label: 'Resultados ICFES' },
  { type: 'acta_titulo', label: 'Acta Último Título' },
  { type: 'diploma_titulo', label: 'Diploma Último Título' },
  { type: 'sabana_notas', label: 'Sabana de Notas' },
];

export function DocumentList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const { data: documents = [], refetch } = useQuery<Document[]>({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/documents/${user?.id}`);
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const res = await apiRequest('POST', '/api/documents/upload', formData);
      if (!res.ok) throw new Error('Error al subir el documento');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha subido correctamente",
      });
      refetch();
      setSelectedFile(null);
      setSelectedType('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.type === type);
    return doc ? doc.status : 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'uploaded':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const handleFileUpload = async (type: string) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({ file: selectedFile, type });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Documentos Requeridos</h2>
      
      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map(({ type, label }) => {
          const status = getDocumentStatus(type);
          
          return (
            <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {getStatusIcon(status)}
                <span>{label}</span>
              </div>
              
              {status !== 'approved' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setSelectedType(type);
                      }
                    }}
                    className="hidden"
                    id={`file-${type}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor={`file-${type}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Subir</span>
                  </label>
                  {selectedFile && selectedType === type && (
                    <button
                      onClick={() => handleFileUpload(type)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 