'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, X, ClipboardCopy, AlertTriangle, Check } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface WebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  provider: 'stripe' | 'clerk';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_time: string;
  processed_time?: string;
  error?: string;
  user_email?: string;
  user_name?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WebhookEventDetails extends WebhookEvent {
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  retry_count: number;
  processing?: {
    attempts: number;
    last_attempt?: Date;
    error_details?: string;
    duration: number | null;
  };
}

export default function LogsView() {
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventDetails | null>(null);
  const [copyingPayload, setCopyingPayload] = useState(false);
  const [copyingMetadata, setCopyingMetadata] = useState(false);

  // Adiciona um useEffect para controlar as chamadas à API
  useEffect(() => {
    if (isExpanded) {
      console.log('🔄 Iniciando busca com filtros atualizados:', {
        startDate: startDate?.toLocaleDateString(),
        endDate: endDate?.toLocaleDateString(),
        provider: selectedProvider,
        status: selectedStatus,
        search: searchTerm
      });
      fetchEvents(1);
    }
  }, [isExpanded]);

  // Adiciona um useEffect separado para os filtros
  useEffect(() => {
    if (isExpanded) {
      const timeoutId = setTimeout(() => {
        fetchEvents(1);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, selectedProvider, selectedStatus, searchTerm]);

  const fetchEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      
      // Debug: Log dos estados antes de construir os parâmetros
      console.log('🔍 Estados atuais:', {
        page,
        limit: pagination.limit,
        searchTerm,
        selectedProvider,
        selectedStatus,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProvider && selectedProvider !== 'all' && { provider: selectedProvider }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
        ...(startDate && { start_date: startDate.toISOString() }),
        ...(endDate && { end_date: endDate.toISOString() }),
      });

      // Debug: Log da URL completa
      console.log('🌐 URL da requisição:', `/api/logs/webhooks?${params.toString()}`);
      
      const response = await fetch(`/api/logs/webhooks?${params}`);
      if (!response.ok) throw new Error('Falha ao carregar logs de webhooks');
      
      const data = await response.json();

      // Debug: Log da resposta
      console.log('📦 Resposta da API:', {
        totalRegistros: data.pagination.total,
        registrosRetornados: data.events.length,
        pagina: data.pagination.page,
        filtrosAplicados: {
          startDate: startDate ? new Date(startDate).toLocaleDateString() : null,
          endDate: endDate ? new Date(endDate).toLocaleDateString() : null,
          provider: selectedProvider,
          status: selectedStatus,
          search: searchTerm
        }
      });

      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      console.error('❌ Erro ao carregar logs:', err);
      setError('Erro ao carregar logs de webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded) {
      setHasLoaded(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleFilter = () => {
    console.log('🔍 Aplicando filtros:', {
      startDate: startDate?.toLocaleDateString(),
      endDate: endDate?.toLocaleDateString(),
      provider: selectedProvider,
      status: selectedStatus,
      search: searchTerm
    });
    fetchEvents(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedProvider('all');
    setSelectedStatus('all');
    setStartDate(undefined);
    setEndDate(undefined);
    fetchEvents(1);
  };

  const handleEventClick = async (event: WebhookEvent) => {
    try {
      const response = await fetch(`/api/logs/webhooks/${event.id}`);
      if (!response.ok) throw new Error('Falha ao carregar detalhes do evento');
      
      const data = await response.json();
      setSelectedEvent(data);
    } catch (err) {
      console.error('Erro ao carregar detalhes do evento:', err);
    }
  };

  const handleCopyJson = async (json: Record<string, unknown> | undefined, type: 'payload' | 'metadata') => {
    const setCopying = type === 'payload' ? setCopyingPayload : setCopyingMetadata;
    try {
      if (!json) {
        throw new Error(`${type} não disponível`);
      }
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopying(true);
      toast({
        title: "Copiado com sucesso!",
        description: `${type === 'payload' ? 'Payload' : 'Metadados'} copiado para a área de transferência.`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Logs do Sistema</CardTitle>
            <CardDescription>Visualize os logs de webhooks e eventos do sistema</CardDescription>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button onClick={handleFilter} className="flex-1">Filtrar</Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">Limpar</Button>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <DatePicker
                  selected={startDate}
                  onSelect={(date) => {
                    console.log('📅 Data inicial selecionada:', date?.toLocaleDateString());
                    setStartDate(date || undefined);
                  }}
                  placeholderText="Data inicial"
                />
              </div>
              <div className="flex-1">
                <DatePicker
                  selected={endDate}
                  onSelect={(date) => {
                    console.log('📅 Data final selecionada:', date?.toLocaleDateString());
                    setEndDate(date || undefined);
                  }}
                  placeholderText="Data final"
                />
              </div>
            </div>
          </div>

          {/* Existing Table Section */}
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow 
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEventClick(event)}
                    >
                      <TableCell>{formatDate(new Date(event.created_time))}</TableCell>
                      <TableCell>{event.provider}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="font-mono text-sm truncate" title={event.event_type}>
                          {event.event_type.replace(/[^\x20-\x7E]/g, '')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.user_email ? (
                          <div className="flex flex-col">
                            <span className="text-sm">{event.user_name || 'N/A'}</span>
                            <span className="text-xs text-muted-foreground">{event.user_email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não associado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColor(event.status)}>
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.processed_time ? formatDate(new Date(event.processed_time)) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex-1 text-sm text-muted-foreground">
                  Mostrando {events.length} de {pagination.total} registros
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => fetchEvents(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <span className="sr-only">Página anterior</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium">
                      Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => fetchEvents(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <span className="sr-only">Próxima página</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Dialog */}
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[1000px] h-[85vh] p-0">
              <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle>Detalhes do Evento</DialogTitle>
                <DialogDescription>
                  Informações detalhadas do evento de webhook
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {selectedEvent && (
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Informações Básicas</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedEvent.status === 'failed' ? 'bg-red-100 text-red-800' :
                          selectedEvent.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 bg-muted/50 p-4 rounded-lg">
                        <div className="lg:col-span-4">
                          <h4 className="text-sm font-medium text-muted-foreground">ID do Evento</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{selectedEvent.event_id}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEvent.event_id);
                              }}
                            >
                              <ClipboardCopy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="lg:col-span-4">
                          <h4 className="text-sm font-medium text-muted-foreground">Tipo</h4>
                          <div className="mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {selectedEvent.event_type.replace(/[^\x20-\x7E]/g, '')}
                            </code>
                          </div>
                        </div>
                        <div className="lg:col-span-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Provider</h4>
                          <p className="text-sm mt-1 capitalize">{selectedEvent.provider}</p>
                        </div>
                        <div className="lg:col-span-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
                          <p className="text-sm mt-1">{formatDate(new Date(selectedEvent.created_time))}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline de Processamento */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Timeline de Processamento</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Tempo de Processamento</span>
                              <span className="text-sm">{
                                selectedEvent.processing?.duration 
                                  ? `${Math.round(selectedEvent.processing.duration / 1000)}s`
                                  : 'N/A'
                              }</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ 
                                  width: selectedEvent.processing?.duration 
                                    ? `${Math.min(100, (selectedEvent.processing.duration / 5000) * 100)}%`
                                    : '0%'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {selectedEvent.retry_count > 0 && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Tentativas de processamento: {selectedEvent.retry_count}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payload e Metadados com melhor apresentação */}
                    {selectedEvent.payload && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                          <h3 className="text-lg font-semibold">Payload</h3>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyJson(selectedEvent.payload, 'payload')}
                            className="h-7 px-3 text-xs gap-2"
                            disabled={copyingPayload || !selectedEvent.payload}
                          >
                            {copyingPayload ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <ClipboardCopy className="h-3 w-3" />
                            )}
                            {copyingPayload ? 'Copiado!' : 'Copiar JSON'}
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute right-2 top-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                            Scroll horizontal disponível →
                          </div>
                          <div className="p-3 max-h-[200px] overflow-y-auto">
                            <pre className="text-xs font-mono overflow-x-auto whitespace-pre bg-muted/30 p-2 rounded">
                              {JSON.stringify(selectedEvent.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadados com o mesmo estilo do Payload */}
                    {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                          <h3 className="text-lg font-semibold">Metadados</h3>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyJson(selectedEvent.metadata, 'metadata')}
                            className="h-7 px-3 text-xs gap-2"
                            disabled={copyingMetadata || !selectedEvent.metadata}
                          >
                            {copyingMetadata ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <ClipboardCopy className="h-3 w-3" />
                            )}
                            {copyingMetadata ? 'Copiado!' : 'Copiar JSON'}
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute right-2 top-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                            Scroll horizontal disponível →
                          </div>
                          <div className="p-3 max-h-[200px] overflow-y-auto">
                            <pre className="text-xs font-mono overflow-x-auto whitespace-pre bg-muted/30 p-2 rounded">
                              {JSON.stringify(selectedEvent.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
} 