import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard Empresarial</h1>
        <div class="header-actions">
          <button class="btn btn-primary">Nueva Factura</button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Métricas principales -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="metric-info">
              <h3>Ingresos del Mes</h3>
              <p class="metric-value">$15,420</p>
              <span class="metric-change positive">+12.5%</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-file-invoice"></i>
            </div>
            <div class="metric-info">
              <h3>Facturas Emitidas</h3>
              <p class="metric-value">24</p>
              <span class="metric-change positive">+8</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-info">
              <h3>Clientes Activos</h3>
              <p class="metric-value">156</p>
              <span class="metric-change positive">+5</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-info">
              <h3>Crecimiento</h3>
              <p class="metric-value">+18%</p>
              <span class="metric-change positive">vs mes anterior</span>
            </div>
          </div>
        </div>

        <!-- Gráficos y contenido principal -->
        <div class="dashboard-content">
          <div class="chart-section">
            <h2>Ingresos por Mes</h2>
            <div class="chart-placeholder">
              <p>Gráfico de ingresos mensuales</p>
            </div>
          </div>

          <div class="recent-invoices">
            <h2>Facturas Recientes</h2>
            <div class="invoice-list">
              <div class="invoice-item">
                <div class="invoice-info">
                  <h4>Factura #001</h4>
                  <p>Cliente: Empresa ABC</p>
                  <small>Fecha: 15/01/2024</small>
                </div>
                <div class="invoice-amount">
                  <span class="amount">$1,250</span>
                  <span class="status paid">Pagada</span>
                </div>
              </div>

              <div class="invoice-item">
                <div class="invoice-info">
                  <h4>Factura #002</h4>
                  <p>Cliente: Empresa XYZ</p>
                  <small>Fecha: 14/01/2024</small>
                </div>
                <div class="invoice-amount">
                  <span class="amount">$2,100</span>
                  <span class="status pending">Pendiente</span>
                </div>
              </div>

              <div class="invoice-item">
                <div class="invoice-info">
                  <h4>Factura #003</h4>
                  <p>Cliente: Empresa 123</p>
                  <small>Fecha: 13/01/2024</small>
                </div>
                <div class="invoice-amount">
                  <span class="amount">$890</span>
                  <span class="status paid">Pagada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .metric-icon {
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

    .metric-info h3 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #666;
    }

    .metric-value {
      margin: 0 0 5px 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .metric-change {
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .metric-change.positive {
      background: #d4edda;
      color: #155724;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .chart-section, .recent-invoices {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chart-section h2, .recent-invoices h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }

    .chart-placeholder {
      height: 300px;
      background: #f8f9fa;
      border: 2px dashed #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      border-radius: 4px;
    }

    .invoice-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .invoice-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .invoice-info h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .invoice-info p {
      margin: 0 0 5px 0;
      color: #666;
    }

    .invoice-info small {
      color: #999;
    }

    .invoice-amount {
      text-align: right;
    }

    .amount {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.paid {
      background: #d4edda;
      color: #155724;
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
      
      .metrics-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  
  ngOnInit(): void {
    // Initialize dashboard data
  }
} 