import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FileText, Upload } from "lucide-react";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    name: "Documento de Identidad",
    description: "Copia del documento de identidad por ambas caras",
    status: "pending" as const,
  },
  {
    id: "2",
    name: "Acta de Grado",
    description: "Copia del acta de grado de bachiller",
    status: "pending" as const,
  },
  {
    id: "3",
    name: "Resultados ICFES",
    description: "Resultados de las pruebas ICFES/Saber 11",
    status: "pending" as const,
  },
  {
    id: "4",
    name: "Foto tipo documento",
    description: "Fotografía 3x4 fondo blanco",
    status: "pending" as const,
  },
  {
    id: "5",
    name: "Certificado EPS",
    description: "Certificado de afiliación a EPS",
    status: "pending" as const,
  },
];

interface Document {
  id: string;
  name: string;
  description: string;
  status: "pending" | "uploaded";
  file?: {
    name: string;
    size: number;
  };
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (documentId: string) => {
    setIsUploading(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Simular carga del documento
          setDocuments(docs => docs.map(doc => 
            doc.id === documentId 
              ? {
                  ...doc,
                  status: "uploaded",
                  file: {
                    name: file.name,
                    size: file.size
                  }
                }
              : doc
          ));
        }
      };

      input.click();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Encabezado */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Mis Documentos</h1>
            <p className="text-muted-foreground">
              Gestiona los documentos requeridos para tu matrícula
            </p>
          </div>

          {/* Lista de documentos */}
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{doc.name}</CardTitle>
                      <CardDescription>
                        {doc.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant={doc.status === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpload(doc.id)}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {doc.status === "pending" ? "Subir" : "Actualizar"}
                    </Button>
                  </div>
                </CardHeader>
                {doc.file && (
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{doc.file.name}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {formatFileSize(doc.file.size)}
                      </span>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
} 