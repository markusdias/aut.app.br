'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Payment {
  id: number;
  createdTime: string;
  invoiceId: string;
  amountPaid: string;
  amountDue: string;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/payments/history?page=${page}&limit=${pagination.limit}`);
      if (!response.ok) throw new Error('Falha ao carregar histórico de pagamentos');
      
      const data = await response.json();
      setPayments(data.payments);
      setPagination(data.pagination);
      setHasLoaded(true);
    } catch (err) {
      setError('Erro ao carregar histórico de pagamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!hasLoaded && !isExpanded) {
      fetchPayments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>Visualize seu histórico completo de pagamentos e faturas</CardDescription>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>ID da Fatura</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(new Date(payment.createdTime))}</TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(payment.amountPaid))}
                        </TableCell>
                        <TableCell>
                          <span className={getStatusColor(payment.status)}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(payment.periodStart))} - {formatDate(new Date(payment.periodEnd))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchPayments(pagination.page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchPayments(pagination.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
} 