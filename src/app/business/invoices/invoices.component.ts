import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  selectedStatus = '';
  searchTerm = '';
  
  invoices = [
    {
      id: 1,
      number: 'INV-001',
      clientName: 'Empresa ABC',
      date: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      total: 1250,
      status: 'paid'
    },
    {
      id: 2,
      number: 'INV-002',
      clientName: 'Empresa XYZ',
      date: new Date('2024-01-14'),
      dueDate: new Date('2024-02-14'),
      total: 2100,
      status: 'sent'
    },
    {
      id: 3,
      number: 'INV-003',
      clientName: 'Empresa 123',
      date: new Date('2024-01-13'),
      dueDate: new Date('2024-02-13'),
      total: 890,
      status: 'overdue'
    }
  ];

  get filteredInvoices() {
    return this.invoices.filter(invoice => {
      const matchesStatus = !this.selectedStatus || invoice.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        invoice.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.number.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  ngOnInit(): void {
    // Initialize invoices data
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'sent': 'Enviada',
      'paid': 'Pagada',
      'overdue': 'Vencida'
    };
    return statusMap[status] || status;
  }
} 