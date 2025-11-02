import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { UserService } from '../../../core/user.service';
import { UserStatistics, User } from '../../../core/user.model';
import { HeaderComponent } from '../../../shared/header/header.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    HeaderComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  statistics: UserStatistics | null = null;
  loading = true;

  // Chart data
  departmentChartData: any;
  roleChartData: any;
  
  // Chart options
  chartOptions: any;

  // Make Object available in template
  Object = Object;

  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads user statistics and updates charts
   */
  private loadStatistics(): void {
    this.userService.getUserStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
          this.updateCharts(stats);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Updates chart data based on statistics
   */
  private updateCharts(stats: UserStatistics): void {
    // Department chart data
    const departments = Object.keys(stats.usersByDepartment);
    const departmentCounts = Object.values(stats.usersByDepartment);
    
    this.departmentChartData = {
      labels: departments,
      datasets: [{
        label: 'Users by Department',
        data: departmentCounts,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4'
        ],
        borderWidth: 0
      }]
    };

    // Role chart data
    const roles = Object.keys(stats.usersByRole);
    const roleCounts = Object.values(stats.usersByRole);
    
    this.roleChartData = {
      labels: roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)),
      datasets: [{
        label: 'Users by Role',
        data: roleCounts,
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 0
      }]
    };
  }

  /**
   * Initializes chart options
   */
  private initializeChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        }
      }
    };
  }

  /**
   * Gets status tag severity for user status
   */
  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'active' ? 'success' : 'danger';
  }

  /**
   * Formats date for display
   */
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Tracks users by ID for ngFor performance
   */
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
