import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <h1>Analíticas Empresariales</h1>
        <div class="period-selector">
          <select class="form-control">
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
        </div>
      </div>

      <div class="analytics-content">
        <div class="analytics-grid">
          <!-- Gráfico principal -->
          <div class="chart-card main-chart">
            <h2>Ingresos vs Gastos</h2>
            <div class="chart-placeholder">
              <p>Gráfico de líneas: Ingresos vs Gastos</p>
            </div>
          </div>

          <!-- Métricas de rendimiento -->
          <div class="metrics-card">
            <h2>Métricas Clave</h2>
            <div class="metrics-list">
              <div class="metric">
                <span class="metric-label">ROI</span>
                <span class="metric-value">24.5%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Conversión</span>
                <span class="metric-value">3.2%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Valor Promedio</span>
                <span class="metric-value">$1,250</span>
              </div>
            </div>
          </div>

          <!-- Gráfico de barras -->
          <div class="chart-card">
            <h2>Ventas por Categoría</h2>
            <div class="chart-placeholder">
              <p>Gráfico de barras</p>
            </div>
          </div>

          <!-- Gráfico circular -->
          <div class="chart-card">
            <h2>Distribución de Clientes</h2>
            <div class="chart-placeholder">
              <p>Gráfico circular</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto auto;
      gap: 20px;
    }

    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .main-chart {
      grid-column: 1 / 2;
      grid-row: 1 / 3;
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

    .metrics-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .metrics-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .metric-label {
      color: #666;
      font-size: 14px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    @media (max-width: 768px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
      
      .main-chart {
        grid-column: 1;
        grid-row: auto;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  
  ngOnInit(): void {
    // Initialize analytics data
  }
} 