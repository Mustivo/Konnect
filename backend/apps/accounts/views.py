from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import TeacherProfile, LearnerProfile, AuditLog
from .serializers import (
    UserRegistrationSerializer, UserSerializer,
    TeacherProfileSerializer, LearnerProfileSerializer,
    TeacherVerificationActionSerializer, AuditLogSerializer,
    ChangePasswordSerializer
)
from .permissions import IsAdminUserRole, IsTeacherRole, IsLearnerRole

User = get_user_model()


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        AuditLog.objects.create(
            actor=user,
            action="USER_REGISTERED",
            target_model="User",
            target_id=str(user.id),
            ip_address=get_client_ip(self.request),
            details={"email": user.email, "role": user.role}
        )


class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class TeacherProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]

    def get_object(self):
        profile, _ = TeacherProfile.objects.get_or_create(user=self.request.user)
        return profile


class LearnerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = LearnerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def get_object(self):
        profile, _ = LearnerProfile.objects.get_or_create(user=self.request.user)
        return profile


class AdminTeacherVerificationListView(generics.ListAPIView):
    """
    Admin user flow: Manage Teachers -> Teacher verification
    """
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get_queryset(self):
        status_param = self.request.query_params.get('status', None)
        qs = TeacherProfile.objects.select_related('user', 'verified_by').all()
        if status_param:
            qs = qs.filter(verification_status=status_param.upper())
        return qs.order_by('-created_at')


class AdminTeacherVerifyActionView(APIView):
    """
    Admin user flow: Approve or Reject a teacher's verification
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def post(self, request, pk):
        try:
            profile = TeacherProfile.objects.get(pk=pk)
        except TeacherProfile.DoesNotExist:
            return Response({"detail": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TeacherVerificationActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('verification_notes', '')

        profile.verification_status = new_status
        profile.verification_notes = notes
        profile.verified_at = timezone.now()
        profile.verified_by = request.user
        profile.save()

        # Update user is_verified status
        user = profile.user
        user.is_verified = (new_status == TeacherProfile.VerificationStatus.APPROVED)
        user.save()

        AuditLog.objects.create(
            actor=request.user,
            action=f"TEACHER_VERIFICATION_{new_status}",
            target_model="TeacherProfile",
            target_id=str(profile.id),
            ip_address=get_client_ip(request),
            details={"teacher_email": user.email, "notes": notes}
        )

        return Response(TeacherProfileSerializer(profile).data, status=status.HTTP_200_OK)


class AdminAuditLogListView(generics.ListAPIView):
    """
    Admin user flow: Admin Dashboard -> Audit logs
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = AuditLog.objects.all()


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from drf_spectacular.utils import extend_schema, OpenApiResponse


class LogoutView(APIView):
    """
    Invalidates and blacklists the user's refresh token upon logout.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="User Logout & Token Revocation",
        description="Blacklists the provided refresh token so it can never be used again.",
        request={"application/json": {"type": "object", "properties": {"refresh": {"type": "string"}}, "required": ["refresh"]}},
        responses={200: OpenApiResponse(description="Successfully logged out and token blacklisted.")}
    )
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            AuditLog.objects.create(
                actor=request.user,
                action="USER_LOGGED_OUT",
                target_model="User",
                target_id=str(request.user.id),
                ip_address=get_client_ip(request),
                details={"email": request.user.email}
            )
            return Response({"detail": "Successfully logged out. Token revoked."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

