import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clients-container">
      <div class="clients-header">
        <h1>Gestión de Clientes</h1>
        <button class="btn btn-primary">Nuevo Cliente</button>
      </div>

      <div class="clients-filters">
        <div class="filter-group">
          <label>Buscar:</label>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Nombre, empresa..." 
            class="form-control">
        </div>
        
        <div class="filter-group">
          <label>Ordenar por:</label>
          <select [(ngModel)]="sortBy" class="form-control">
            <option value="name">Nombre</option>
            <option value="company">Empresa</option>
            <option value="totalInvoiced">Total Facturado</option>
            <option value="lastInvoice">Última Factura</option>
          </select>
        </div>
      </div>

      <div class="clients-grid">
        <div *ngFor="let client of filteredClients" class="client-card">
          <div class="client-header">
            <div class="client-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="client-info">
              <h3>{{ client.name }}</h3>
              <p>{{ client.company }}</p>
              <small>{{ client.email }}</small>
            </div>
          </div>
          
          <div class="client-stats">
            <div class="stat">
              <span class="stat-label">Total Facturado</span>
              <span class="stat-value">\${{ client.totalInvoiced }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Facturas</span>
              <span class="stat-value">{{ client.invoiceCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Última Factura</span>
              <span class="stat-value">{{ client.lastInvoice | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          
          <div class="client-actions">
            <button class="btn btn-sm">Ver Perfil</button>
            <button class="btn btn-sm">Nueva Factura</button>
            <button class="btn btn-sm">Contactar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clients-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .clients-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .clients-filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: 500;
      color: #333;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .clients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .client-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      transition: transform 0.2s;
    }

    .client-card:hover {
      transform: translateY(-2px);
    }

    .client-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .client-avatar {
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .client-info h3 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .client-info p {
      margin: 0 0 5px 0;
      color: #666;
      font-weight: 500;
    }

    .client-info small {
      color: #999;
    }

    .client-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .stat-value {
      font-weight: 500;
      color: #333;
    }

    .client-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-sm {
      background: #f8f9fa;
      border: 1px solid #ddd;
      color: #333;
    }

    @media (max-width: 768px) {
      .clients-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientsComponent implements OnInit {
  searchTerm = '';
  sortBy = 'name';
  
  clients = [
    {
      id: 1,
      name: 'Juan Pérez',
      company: 'Empresa ABC',
      email: 'juan@empresa-abc.com',
      totalInvoiced: 5250,
      invoiceCount: 8,
      lastInvoice: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'María González',
      company: 'Empresa XYZ',
      email: 'maria@empresa-xyz.com',
      totalInvoiced: 3200,
      invoiceCount: 5,
      lastInvoice: new Date('2024-01-12')
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      company: 'Empresa 123',
      email: 'carlos@empresa-123.com',
      totalInvoiced: 1890,
      invoiceCount: 3,
      lastInvoice: new Date('2024-01-10')
    }
  ];

  get filteredClients() {
    let filtered = this.clients.filter(client => {
      const matchesSearch = !this.searchTerm || 
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort clients
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'totalInvoiced':
          return b.totalInvoiced - a.totalInvoiced;
        case 'lastInvoice':
          return b.lastInvoice.getTime() - a.lastInvoice.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }

  ngOnInit(): void {
    // Initialize clients data
  }
} 