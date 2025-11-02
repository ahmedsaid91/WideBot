import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';

import { ConfirmationService, MessageService } from 'primeng/api';

import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
import { User, UserFilter } from '../../../core/user.model';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    TooltipModule,
    CalendarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;

  // Table state
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Search and filters
  globalSearchTerm = '';
  selectedRole: string | null = null;
  selectedStatus: string | null = null;
  selectedDepartment: string | null = null;

  // Dropdowns data
  roles = [
    { label: 'All Roles', value: null },
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  statuses = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  departments: { label: string; value: string | null }[] = [];

  // Dialog state
  showUserDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedUser: User | null = null;
  userForm!: FormGroup;
  submittingForm = false;

  // Form dropdown options
  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  departmentOptions: { label: string; value: string }[] = [];

  // Helper for template
  maxDate = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.loadDepartments();
  }

  /**
   * Initialize the user form with validators
   */
  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      role: ['user', Validators.required],
      status: ['active', Validators.required],
      department: ['', Validators.required],
      phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      address: [''],
      dateOfBirth: [null],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads all users from service
   */
  private loadUsers(): void {
    this.loading = true;
    
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users'
          });
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Loads departments for filter dropdown
   */
  private loadDepartments(): void {
    this.userService.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = [
            { label: 'All Departments', value: null },
            ...departments.map(d => ({ label: d, value: d }))
          ];
          this.departmentOptions = departments.map(d => ({ label: d, value: d }));
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Applies all filters to the user list
   */
  applyFilters(): void {
    const filter: UserFilter = {
      searchTerm: this.globalSearchTerm,
      role: this.selectedRole as any,
      status: this.selectedStatus as any,
      department: this.selectedDepartment || undefined
    };

    this.filteredUsers = this.userService.filterUsers(filter);
    this.totalRecords = this.filteredUsers.length;
    this.cdr.markForCheck();
  }

  /**
   * Handles global search input
   */
  onGlobalSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalSearchTerm = value;
    this.applyFilters();
  }

  /**
   * Clears all filters
   */
  clearFilters(): void {
    this.globalSearchTerm = '';
    this.selectedRole = null;
    this.selectedStatus = null;
    this.selectedDepartment = null;
    this.applyFilters();
  }

  /**
   * Opens add user dialog
   */
  addUser(): void {
    this.dialogMode = 'add';
    this.selectedUser = null;
    this.userForm.reset({
      role: 'user',
      status: 'active'
    });
    this.showUserDialog = true;
    this.cdr.markForCheck();
  }

  /**
   * Opens edit user dialog
   */
  editUser(user: User): void {
    this.dialogMode = 'edit';
    this.selectedUser = user;
    
    // Populate form with user data
    this.userForm.patchValue({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      department: user.department || '',
      phone: user.phone || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      bio: ''
    });
    
    this.showUserDialog = true;
    this.cdr.markForCheck();
  }

  /**
   * Deletes a user with confirmation
   */
  deleteUser(user: User): void {
    
      this.userService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'User deleted successfully',
              life: 5000,
              sticky: false,
              closable: true,
              key: 'undo',
              data: { userId: user.id }
            });
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user'
            });
            this.cdr.markForCheck();
          }
        });
  }

  /**
   * Undoes the last delete operation
   */
  undoDelete(): void {
    const undoResult = this.userService.undoDelete();
    if (undoResult) {
      undoResult.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Restored',
              detail: 'User has been restored'
            });
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to restore user'
            });
            this.cdr.markForCheck();
          }
        });
    }
  }

  /**
   * Saves user (add or edit)
   */
  saveUser(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.submittingForm = true;
    const formValue = this.userForm.value;

    // Convert date to ISO string if present
    if (formValue.dateOfBirth) {
      formValue.dateOfBirth = new Date(formValue.dateOfBirth).toISOString().split('T')[0];
    }

    if (this.dialogMode === 'add') {
      // Create new user
      const newUser: Partial<User> = {
        ...formValue,
        firstName: formValue.name.split(' ')[0],
        lastName: formValue.name.split(' ').slice(1).join(' ') || formValue.name.split(' ')[0],
        avatar: `https://i.pravatar.cc/150?u=${formValue.email}`,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString()
      };

      this.userService.createUser(newUser as User)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User created successfully'
            });
            this.closeDialog();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to create user'
            });
            this.submittingForm = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      // Update existing user
      const updatedUser: Partial<User> = {
        ...formValue,
        firstName: formValue.name.split(' ')[0],
        lastName: formValue.name.split(' ').slice(1).join(' ') || formValue.name.split(' ')[0]
      };

      this.userService.updateUser(this.selectedUser!.id, updatedUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User updated successfully'
            });
            this.closeDialog();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update user'
            });
            this.submittingForm = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  /**
   * Closes the user dialog
   */
  closeDialog(): void {
    this.showUserDialog = false;
    this.submittingForm = false;
    this.selectedUser = null;
    this.userForm.reset({
      role: 'user',
      status: 'active'
    });
    this.cdr.markForCheck();
  }

  /**
   * Marks all fields in a form group as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.markForCheck();
  }

  /**
   * Checks if a form field has an error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Gets the error message for a form field
   */
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['email']) {
      return 'Invalid email address';
    }
    if (field.errors['minlength']) {
      return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    if (field.errors['maxlength']) {
      return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
    }
    if (field.errors['pattern']) {
      return 'Invalid format';
    }

    return 'Invalid value';
  }

  /**
   * Impersonates a user (admin only)
   */
  impersonateUser(user: User): void {
    try {
      this.authService.impersonateUser(user);
      this.messageService.add({
        severity: 'success',
        summary: 'Impersonating',
        detail: `Now viewing as ${user.firstName} ${user.lastName}`
      });
      // Redirect will be handled by router
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to impersonate user'
      });
    }
  }

  /**
   * Gets status tag severity
   */
  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'active' ? 'success' : 'danger';
  }

  /**
   * Gets role tag severity
   */
  getRoleSeverity(role: string): 'danger' | 'info' {
    return role === 'admin' ? 'danger' : 'info';
  }

  /**
   * TrackBy function for performance
   */
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  /**
   * Formats date for display
   */
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
