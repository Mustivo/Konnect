from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, TeacherProfile, LearnerProfile, AdminProfile, AuditLog


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'is_verified', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('role', 'phone_number', 'avatar', 'is_verified')}),
    )


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'verification_status', 'expertise_subjects', 'verified_at', 'created_at')
    list_filter = ('verification_status',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'expertise_subjects')


@admin.register(LearnerProfile)
class LearnerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'grade_level', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'grade_level')


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'created_at')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor', 'action', 'target_model', 'target_id', 'ip_address')
    list_filter = ('action', 'target_model')
    search_fields = ('actor__email', 'action', 'target_model', 'target_id')
    readonly_fields = [f.name for f in AuditLog._meta.fields]
